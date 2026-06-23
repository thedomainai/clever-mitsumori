# -*- coding: utf-8 -*-
"""resource/ 配下の CSV 群を統合し SQLite データベース (clever.db) を構築する。

テーブル構成:
  products        紐づけシート（商品マスタ。楽天/Yahoo/Amazon のコード対応表）
  rakuten_prices  楽天の販売価格（現行・2026.5 改定）
  yahoo_prices    Yahoo の販売価格（現行・2026.5 改定）
  amazon_prices   Amazon TSV の販売価格・法人価格・在庫数
  zaiko           在庫ロット（メッシュ/ネトロン/トリカル統合。仕入値を含む）
  unified         上記を商品マスタ起点で結合したフラットビュー

キー正規化: 商品コードは小文字化・前後空白除去で照合する。
zaiko の共通キー (clever-N-2-1000-1-BL) は末尾の色コードを除き
clv- 形式 (clv-n-2-1000-1) に変換して products と照合する。
"""
import csv
import re
import sqlite3
from pathlib import Path

BASE = Path(__file__).parent
DB = BASE / "clever.db"


def norm(code):
    if code is None:
        return None
    c = str(code).strip().lower()
    return c if c else None


def zaiko_key_to_code(key):
    """clever-N-2-1000-1-BL -> clv-n-2-1000-1 （末尾の色コードを除去）"""
    k = norm(key)
    if not k or not k.startswith("clever-"):
        return None
    body = k[len("clever-"):]
    body = re.sub(r"-(bk|bl|gr|wh|sg|gb|ye|rd|cl|br|p)$", "", body)
    return "clv-" + body


def read_csv(name, encoding="utf-8-sig"):
    with open(BASE / name, encoding=encoding) as fp:
        return list(csv.reader(fp))


def to_num(v):
    if v is None:
        return None
    s = str(v).replace("¥", "").replace(",", "").strip()
    if not s:
        return None
    try:
        f = float(s)
        return round(f, 2)
    except ValueError:
        return None


# ---- 除外・品番修正ルール ----
# EC マスタデータレビュー結果に基づき、加工品・EC 対象外商品を除外し、
# 同品番の異なる商品（サラン N-24 / トリカル N-24）は品番を改名して区別する。

_EXCLUDE_HINBAN = {'#5900', '08-1050-SK'}


def _should_exclude(r):
    """紐づけ CSV の行 r を products テーブルから除外するか判定する。

    r のインデックス: [0]=rakuten_code, [2]=yahoo_code, [8]=zaishitsu, [9]=hinban
    """
    h = (r[9] or '').strip()
    if h in _EXCLUDE_HINBAN:
        return True
    if re.match(r'^AR-\d+$', h) and 'ｽﾋﾟｰｶｰﾈｯﾄ' in (r[8] or ''):
        return True
    if (r[2] or '').strip().upper().startswith('CLV-MK-16'):
        return True
    return False


def main():
    if DB.exists():
        DB.unlink()
    con = sqlite3.connect(DB)
    cur = con.cursor()

    # ---- products（紐づけ） ----
    cur.execute("""CREATE TABLE products (
        rakuten_code TEXT, price_common TEXT, yahoo_code TEXT,
        amazon_sku TEXT, asin TEXT, amazon_url TEXT,
        tehai TEXT, area TEXT, zaishitsu TEXT, hinban TEXT,
        color TEXT, size TEXT, system_jou TEXT, system_ge TEXT,
        rakuten_key TEXT, yahoo_key TEXT, amazon_key TEXT)""")
    rows = read_csv("ec-hanbai-kanrihyou_紐づけ.csv")
    for r in rows[2:]:
        r = (r + [None] * 14)[:14]
        if not any(r):
            continue
        if _should_exclude(r):
            continue
        # サランネット N-24 → saran-N-24（トリカル N-24 と区別）
        if (r[8] or '').strip() == 'ｻﾗﾝﾈｯﾄ' and (r[9] or '').strip() == 'N-24':
            r[9] = 'saran-N-24'
        cur.execute("INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    r + [norm(r[0]), norm(r[2]), norm(r[3])])

    # ---- rakuten_prices（商品名行と SKU 価格行の2段構造をマージ） ----
    cur.execute("""CREATE TABLE rakuten_prices (
        code TEXT, name TEXT, price REAL, price_202605 REAL, key TEXT)""")
    rows = read_csv("ec-hanbai-kanrihyou_楽天CSV.csv")
    items = {}
    for r in rows[1:]:
        r = (r + [None] * 8)[:8]
        code = norm(r[0])
        if not code:
            continue
        item = items.setdefault(code, {"name": None, "price": None, "p2605": None})
        if r[2]:
            item["name"] = re.sub(r"^<br>\s*", "", r[2])
        if to_num(r[4]) is not None:
            item["price"] = to_num(r[4])
            item["p2605"] = to_num(r[5])
    for code, it in items.items():
        cur.execute("INSERT INTO rakuten_prices VALUES (?,?,?,?,?)",
                    (code, it["name"], it["price"], it["p2605"], code))

    # ---- yahoo_prices ----
    cur.execute("""CREATE TABLE yahoo_prices (
        code TEXT, name TEXT, price REAL, price_202605 REAL, key TEXT)""")
    for r in read_csv("ec-hanbai-kanrihyou_YahooCSV.csv")[1:]:
        r = (r + [None] * 4)[:4]
        if not norm(r[1]):
            continue
        cur.execute("INSERT INTO yahoo_prices VALUES (?,?,?,?,?)",
                    (r[1], r[0], to_num(r[2]), to_num(r[3]), norm(r[1])))

    # ---- amazon_prices（TSV シート） ----
    cur.execute("""CREATE TABLE amazon_prices (
        sku TEXT, asin TEXT, name TEXT, price REAL, price_202605 REAL,
        quantity REAL, stock REAL, hojin_price REAL, key TEXT)""")
    for r in read_csv("ec-hanbai-kanrihyou_AmazonTSV.csv")[1:]:
        r = (r + [None] * 10)[:10]
        if not norm(r[0]):
            continue
        cur.execute("INSERT INTO amazon_prices VALUES (?,?,?,?,?,?,?,?,?)",
                    (r[0], r[1], r[2], to_num(r[4]), to_num(r[5]),
                     to_num(r[6]), to_num(r[8]), to_num(r[9]), norm(r[0])))

    # ---- zaiko（3ファイル統合） ----
    cur.execute("""CREATE TABLE zaiko (
        source TEXT, area TEXT, tana TEXT, zaishitsu TEXT, hinban TEXT,
        kyotsu_key TEXT, color TEXT, haba_mm TEXT, meopen_um REAL,
        mesh_count REAL,
        nyuka_date TEXT, last_shukka TEXT, nokori_m REAL,
        shiire_per_m REAL, biko TEXT, key TEXT)""")

    def add_zaiko(source, area, tana, zaishitsu, hinban, kyotsu, color,
                  haba, meopen, nyuka, shukka, nokori, shiire, biko=None,
                  mesh_count=None):
        cur.execute("INSERT INTO zaiko VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    (source, area, tana, zaishitsu, hinban, kyotsu, color, haba,
                     to_num(meopen), to_num(mesh_count),
                     nyuka, shukka, to_num(nokori), to_num(shiire),
                     biko, zaiko_key_to_code(kyotsu)))

    for r in read_csv("zaiko-mesh.csv")[1:]:
        r = (r + [None] * 19)[:19]
        if not (r[3] or r[4]):
            continue
        # サラン N-24 → saran-N-24（products 側の品番と一致させる）
        if (r[2] or '').strip() == 'ｻﾗﾝ' and (r[3] or '').strip() == 'N-24':
            r[3] = 'saran-N-24'
        # r[7] = "ﾒｯｼｭor 線径" 列。"156/200" のような複合値は先頭を採用
        mesh_raw = (r[7] or '').strip()
        if '/' in mesh_raw:
            mesh_raw = mesh_raw.split('/')[0].strip()
        add_zaiko("mesh", r[0], r[1], r[2], r[3], r[4], None, r[6],
                  r[5], r[8], r[9], r[10], r[11], r[15],
                  mesh_count=mesh_raw)
    for r in read_csv("zaiko-netoron.csv")[1:]:
        r = (r + [None] * 12)[:12]
        if not (r[2] or r[3]):
            continue
        add_zaiko("netoron", r[0], r[1], None, r[2], r[3], r[4], r[5],
                  None, r[7], r[8], r[9], r[10])
    for r in read_csv("zaiko-torikaru.csv")[1:]:
        r = (r + [None] * 13)[:13]
        if not (r[2] or r[3]):
            continue
        add_zaiko("torikaru", r[0], r[1], None, r[2], r[3], r[4], r[5],
                  None, r[7], r[8], r[9], r[11])  # 仕入値（ｍ）を採用

    # ---- products に幅(mm)・カット長(m) を付与（サイズ "1400mm*1ｍ" から抽出） ----
    # サイズ欄が空欄の行はシステム下段カラム（同形式）をフォールバックに使う。
    # 「50ｍ」のような長さのみの表記は cut_m だけ取り、幅は取らない。
    cur.execute("ALTER TABLE products ADD COLUMN haba_mm TEXT")
    cur.execute("ALTER TABLE products ADD COLUMN cut_m REAL")
    for rowid, size, sys_ge in cur.execute(
            "SELECT rowid, size, system_ge FROM products").fetchall():
        s = str(size).strip() if size else ""
        if not s and sys_ge:
            s = str(sys_ge).strip()
        if not s:
            continue
        haba = cut = None
        m = re.match(r"\s*(\d+)\s*mm", s)
        if m:
            haba = m.group(1)
        m = re.search(r"[*×]\s*([\d.]+)\s*[ｍm](?![ｍm])", s)
        if m:
            cut = float(m.group(1))
        elif haba is None:
            m = re.match(r"\s*([\d.]+)\s*[ｍm]\b", s)  # 長さのみ（例: 50ｍ）
            if m:
                cut = float(m.group(1))
        if haba or cut is not None:
            cur.execute("UPDATE products SET haba_mm=?, cut_m=? WHERE rowid=?",
                        (haba, cut, rowid))

    # ---- 価格計算パラメータ（6/9 MTG 確定のデフォルト値。商品別に上書き可） ----
    DEFAULT_ARARI = 0.5    # 粗利率
    DEFAULT_KOTEIHI = 6000  # 固定費（円）

    # ---- 統合ビュー ----
    # 仕入値の照合は2段階: (1)共通キー一致 (2)品番+幅一致
    cur.execute("""CREATE VIEW zaiko_agg AS
        SELECT key, UPPER(TRIM(hinban)) AS hinban_u, haba_mm,
               MAX(shiire_per_m) AS shiire_per_m,
               SUM(nokori_m) AS nokori_m, MIN(source) AS source,
               MAX(meopen_um) AS meopen_um,
               MAX(mesh_count) AS mesh_count
        FROM zaiko GROUP BY key, UPPER(TRIM(hinban)), haba_mm""")
    cur.execute(f"""CREATE VIEW unified AS
        SELECT
            COALESCE(p.yahoo_code, p.amazon_sku, p.rakuten_code) AS ec_hinban,
            p.rakuten_code, p.yahoo_code, p.amazon_sku, p.asin,
            p.zaishitsu, p.hinban, p.color, p.size, p.tehai,
            CAST(p.haba_mm AS REAL) AS haba_mm,
            p.cut_m,
            {DEFAULT_ARARI} AS arari_rate,
            {DEFAULT_KOTEIHI} AS kotei_hi,
            CASE WHEN COALESCE(zk.shiire_per_m, zh.shiire_per_m) IS NOT NULL
                      AND p.cut_m IS NOT NULL
                 THEN ROUND((COALESCE(zk.shiire_per_m, zh.shiire_per_m) * p.cut_m
                             + {DEFAULT_KOTEIHI}) / (1 - {DEFAULT_ARARI}))
            END AS hanbai_kakaku,
            NULL AS shiire_changed_date,
            r.price  AS rakuten_price,  r.price_202605 AS rakuten_price_202605,
            y.price  AS yahoo_price,    y.price_202605 AS yahoo_price_202605,
            a.price  AS amazon_price,   a.price_202605 AS amazon_price_202605,
            a.hojin_price AS amazon_hojin_price,
            COALESCE(zk.shiire_per_m, zh.shiire_per_m, zs.shiire_per_m) AS shiire_per_m,
            COALESCE(zk.nokori_m,     zh.nokori_m,     zs.nokori_m)     AS nokori_m,
            COALESCE(zk.source,       zh.source,       zs.source)       AS zaiko_source,
            COALESCE(zk.zaiko_haba_mm, CAST(zh.haba_mm AS REAL), zs.zaiko_haba_mm) AS zaiko_haba_mm,
            COALESCE(zk.meopen_um,    zh.meopen_um,    zs.meopen_um)    AS meopen_um,
            COALESCE(zk.mesh_count,  zh.mesh_count,  zs.mesh_count)  AS mesh_count,
            CASE WHEN COALESCE(zk.mesh_count, zh.mesh_count, zs.mesh_count) IS NOT NULL
                      AND COALESCE(zk.meopen_um, zh.meopen_um, zs.meopen_um) IS NOT NULL
                      AND COALESCE(zk.mesh_count, zh.mesh_count, zs.mesh_count) > 0
                 THEN ROUND(25400.0 / COALESCE(zk.mesh_count, zh.mesh_count, zs.mesh_count)
                            - COALESCE(zk.meopen_um, zh.meopen_um, zs.meopen_um), 1)
            END AS senkei_um,
            CASE WHEN COALESCE(zk.mesh_count, zh.mesh_count, zs.mesh_count) IS NOT NULL
                      AND COALESCE(zk.meopen_um, zh.meopen_um, zs.meopen_um) IS NOT NULL
                      AND COALESCE(zk.mesh_count, zh.mesh_count, zs.mesh_count) > 0
                 THEN ROUND(
                    POWER(COALESCE(zk.meopen_um, zh.meopen_um, zs.meopen_um)
                          / (25400.0 / COALESCE(zk.mesh_count, zh.mesh_count, zs.mesh_count)),
                          2) * 100, 1)
            END AS kaikouritsu,
            CASE WHEN zk.key IS NOT NULL THEN 'key'
                 WHEN zh.hinban_u IS NOT NULL THEN 'hinban+haba'
                 WHEN zs.hinban_u IS NOT NULL THEN 'hinban(単一幅)' END AS zaiko_match,
            CASE
                WHEN zk.key IS NOT NULL OR zh.hinban_u IS NOT NULL
                     OR zs.hinban_u IS NOT NULL THEN '突合OK'
                WHEN p.hinban IS NULL OR TRIM(p.hinban) = '' THEN '品番空欄'
                WHEN EXISTS(SELECT 1 FROM zaiko z3
                            WHERE UPPER(TRIM(z3.hinban)) = UPPER(TRIM(p.hinban)))
                THEN CASE WHEN p.haba_mm IS NULL
                          THEN '幅不一致(マスタにサイズ情報なし)'
                          ELSE '幅不一致' END
                WHEN TRIM(COALESCE(p.tehai, '')) = '在庫' THEN '在庫表に品番なし'
                ELSE '在庫表対象外(EC専売等)'
            END AS zaiko_status
        FROM products p
        LEFT JOIN rakuten_prices r ON r.key = p.rakuten_key
        LEFT JOIN yahoo_prices   y ON y.key = p.yahoo_key
        LEFT JOIN amazon_prices  a ON a.key = p.amazon_key
        LEFT JOIN (SELECT key, MAX(shiire_per_m) AS shiire_per_m,
                          SUM(nokori_m) AS nokori_m, MIN(source) AS source,
                          MAX(meopen_um) AS meopen_um,
                          MAX(mesh_count) AS mesh_count,
                          MAX(CAST(haba_mm AS REAL)) AS zaiko_haba_mm
                   FROM zaiko WHERE key IS NOT NULL GROUP BY key
        ) zk ON zk.key = p.rakuten_key
        LEFT JOIN (SELECT UPPER(TRIM(hinban)) AS hinban_u, haba_mm,
                          MAX(shiire_per_m) AS shiire_per_m,
                          SUM(nokori_m) AS nokori_m, MIN(source) AS source,
                          MAX(meopen_um) AS meopen_um,
                          MAX(mesh_count) AS mesh_count
                   FROM zaiko WHERE hinban IS NOT NULL GROUP BY 1, 2
        ) zh ON zh.hinban_u = UPPER(TRIM(p.hinban))
            AND zh.haba_mm = p.haba_mm AND zk.key IS NULL
        LEFT JOIN (SELECT UPPER(TRIM(hinban)) AS hinban_u,
                          MAX(shiire_per_m) AS shiire_per_m,
                          SUM(nokori_m) AS nokori_m, MIN(source) AS source,
                          MAX(meopen_um) AS meopen_um,
                          MAX(mesh_count) AS mesh_count,
                          MAX(CAST(haba_mm AS REAL)) AS zaiko_haba_mm
                   FROM zaiko WHERE hinban IS NOT NULL GROUP BY 1
                   HAVING COUNT(DISTINCT haba_mm) = 1
        ) zs ON zs.hinban_u = UPPER(TRIM(p.hinban))
            AND p.haba_mm IS NULL AND zk.key IS NULL""")

    con.commit()

    # ---- 結合率レポートと CSV エクスポート ----
    stats = {}
    for t in ["products", "rakuten_prices", "yahoo_prices", "amazon_prices", "zaiko"]:
        stats[t] = cur.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
    for col, label in [("rakuten_price", "楽天価格"), ("yahoo_price", "Yahoo価格"),
                       ("amazon_price", "Amazon価格"), ("shiire_per_m", "仕入値")]:
        n = cur.execute(f"SELECT COUNT(*) FROM unified WHERE {col} IS NOT NULL").fetchone()[0]
        stats[f"unified.{label}"] = n
    for k, v in stats.items():
        print(f"{k}: {v}")

    out = BASE / "unified.csv"
    cur.execute("SELECT * FROM unified")
    cols = [d[0] for d in cur.description]
    with open(out, "w", newline="", encoding="utf-8-sig") as fp:
        w = csv.writer(fp)
        w.writerow(cols)
        w.writerows(cur.fetchall())
    print(f"export: {out.name}")
    con.close()


if __name__ == "__main__":
    main()
