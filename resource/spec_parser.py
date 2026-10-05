# -*- coding: utf-8 -*-
"""商品名・品番からメッシュの仕様（目開き・メッシュ数・線径）を読み取る。

在庫表と突合できた商品（263 件）以外は仕様の列が空のため、目開きでの検索も
類似品の特定もできない。EC の商品名（Amazon シート）と品番には仕様がそのまま
書かれているので、そこから補う。

優先順位: 在庫表 > Amazon 商品名 > 品番
  - 在庫表の値は実物の管理値なので最優先（上書きしない）
  - 商品名は「目開き（μ）：45」のようにラベル付きで書かれており、品番より確実
  - 品番は「#400φ0.03」「PA45/29」の 2 形式のみ読み取る

目開きを「25400 / メッシュ数 - 線径」で計算するのは平織・綾織だけに限る。
畳織は経糸と緯糸の構造が違い、この式が成り立たないため計算しない。
畳織の細かさは商品名の「粒球子（μ）」＝濾過粒度で表す。

「635/4300」「0.02/0.016」のスラッシュ表記は縦/横の値であり、下限/上限ではない。
縦の値を meopen_um / mesh_count / senkei_um に、横の値を *_yoko 列に入れる。
横の列が空のときは、縦と同じ（正方目）か不明。

商品名は単位を「(μ)」と書きながら mm の値を書いていることがある
（例: 糸径(μ):0.02 は実際は 0.02mm）。メッシュ数から求めた 1 目の幅（ピッチ）に
対して、μ のまま読むと小さすぎる値は mm として読み替える。
"""
import re
import unicodedata

INCH_UM = 25400.0


def nfkc(s):
    return unicodedata.normalize("NFKC", s or "").strip()


def _num(s):
    try:
        return float(s)
    except (TypeError, ValueError):
        return None


def _to_um(value, unit):
    """値と単位（mm / μm / μ / 空）から μm に換算する。単位が無ければ None。"""
    if value is None:
        return None
    u = (unit or "").lower()
    if u == "mm":
        return value * 1000
    if u in ("μm", "μ", "um", "µm", "µ"):
        return value
    return None


_UNIT = r"(μm|μ|mm|um|µm|µ)"
_VAL = r"φ?\s*([\d.]+)(?:\s*/\s*([\d.]+))?"  # 縦[/横]

# 「目開き(μ):45」「目開き（mm）：0.385/0.4」「目開き9.16mm」。「目開き率」は開口率なので除外
_RE_OPEN_LABELED = re.compile(r"目開き(?!率)\s*[\(（]\s*" + _UNIT + r"\s*[\)）]\s*[:：]?\s*" + _VAL)
_RE_OPEN_SUFFIX = re.compile(r"目開き(?!率)\s*[:：]?\s*" + _VAL + r"\s*" + _UNIT)
# 「メッシュ数:305」「メッシュ：635/4300」「2.5メッシュ」
# 横の「2x343」は横糸 2 本引き揃え × 343 メッシュなので、メッシュ数は 343 を採る
_YOKO_MESH = r"(?:\s*/\s*(?:\d+\s*[x×]\s*)?([\d.]+))?"
_RE_MESH_LABELED = re.compile(r"メッシュ数?\s*[:：]\s*([\d.]+)" + _YOKO_MESH)
_RE_MESH_SUFFIX = re.compile(r"(?<![\d.])([\d.]+)" + _YOKO_MESH + r"\s*メッシュ")
# 「線径(mm):φ0.05/0.07」「糸径（μ）：35」「線径1mm」
_RE_WIRE_LABELED = re.compile(r"(?:線径|糸径)\s*[\(（]\s*" + _UNIT + r"\s*[\)）]\s*[:：]?\s*" + _VAL)
_RE_WIRE_SUFFIX = re.compile(r"(?:線径|糸径)\s*[:：]?\s*" + _VAL + r"\s*" + _UNIT)
# 「粒球子（μ）：3」（畳織の濾過粒度）
_RE_FILTER = re.compile(r"粒球子\s*[\(（]\s*" + _UNIT + r"\s*[\)）]\s*[:：]?\s*([\d.]+)")

# 品番: 「#400φ0.03」「#400/3000φ0.03/0.018」（縦/横。φ は mm）
_RE_HINBAN_SHARP = re.compile(
    r"#\s*(\d+(?:\.\d+)?)\s*(?:/\s*(\d+(?:\.\d+)?))?\s*φ\s*([\d.]+)(?:\s*/\s*([\d.]+))?")
# 品番: 「PA45/29」（目開き μm / 開口率 %）
_RE_HINBAN_PA = re.compile(r"^(?:PA|NY)\s*(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)$", re.I)


def _put(out, key, value_unit_pairs):
    """[(値, 単位), ...] を縦・横の順に out へ入れる。単位が μ のものは印を付ける。"""
    keys = (key, key.replace("_um", "") + "_yoko_um" if key.endswith("_um") else key + "_yoko")
    for k, (v, unit) in zip(keys, value_unit_pairs):
        um = _to_um(_num(v), unit)
        if um is not None and um > 0:
            out[k] = um
            if (unit or "").lower() in ("μ", "μm", "um", "µ", "µm"):
                out.setdefault("_micro_keys", set()).add(k)


def _pairs(m, val_idx, unit_idx):
    unit = m.group(unit_idx)
    return [(m.group(val_idx), unit), (m.group(val_idx + 1), unit)]


def parse_title(title):
    """商品名から仕様を読み取る（見つかったものだけ）。

    戻り値のキー: meopen_um / meopen_yoko_um / mesh_count / mesh_count_yoko /
    senkei_um / senkei_yoko_um / roka_ryudo_um、および単位が μ と書かれていたキーの集合 _micro_keys
    """
    t = nfkc(title)
    out = {}
    m = _RE_OPEN_LABELED.search(t)
    if m:
        _put(out, "meopen_um", _pairs(m, 2, 1))
    else:
        m = _RE_OPEN_SUFFIX.search(t)
        if m:
            _put(out, "meopen_um", _pairs(m, 1, 3))
    m = _RE_MESH_LABELED.search(t) or _RE_MESH_SUFFIX.search(t)
    if m:
        for k, v in (("mesh_count", m.group(1)), ("mesh_count_yoko", m.group(2))):
            if _num(v):
                out[k] = _num(v)
    m = _RE_WIRE_LABELED.search(t)
    if m:
        _put(out, "senkei_um", _pairs(m, 2, 1))
    else:
        m = _RE_WIRE_SUFFIX.search(t)
        if m:
            _put(out, "senkei_um", _pairs(m, 1, 3))
    m = _RE_FILTER.search(t)
    if m:
        v = _to_um(_num(m.group(2)), m.group(1))
        if v:
            out["roka_ryudo_um"] = v
    return out


def parse_hinban(hinban):
    """品番から仕様を読み取る。「#縦/横φ縦線径/横線径」と「PA45/29」の 2 形式のみ。"""
    h = nfkc(hinban)
    m = _RE_HINBAN_SHARP.search(h)
    if m:
        out = {"mesh_count": float(m.group(1)), "senkei_um": float(m.group(3)) * 1000}
        if m.group(2):
            out["mesh_count_yoko"] = float(m.group(2))
        if m.group(4):
            out["senkei_yoko_um"] = float(m.group(4)) * 1000
        return out
    m = _RE_HINBAN_PA.match(h)
    if m:
        return {"meopen_um": float(m.group(1)), "kaikouritsu": float(m.group(2))}
    return {}


def is_dutch_weave(zaishitsu, hinban, title=""):
    """畳織（目開きの計算式が成り立たない織り方）か。"""
    s = nfkc(zaishitsu) + " " + nfkc(hinban) + " " + nfkc(title)
    return "畳織" in s


SPEC_KEYS = ("meopen_um", "mesh_count", "senkei_um", "kaikouritsu")
YOKO_KEYS = ("meopen_yoko_um", "mesh_count_yoko", "senkei_yoko_um", "roka_ryudo_um")
ALL_KEYS = SPEC_KEYS + YOKO_KEYS
# 縦/横のそれぞれについて、長さの列とその基準になるメッシュ数の列
_LENGTH_BY_MESH = (("meopen_um", "mesh_count"), ("senkei_um", "mesh_count"),
                   ("meopen_yoko_um", "mesh_count_yoko"), ("senkei_yoko_um", "mesh_count_yoko"))


def _fix_micro_mm(parsed, mesh, mesh_yoko):
    """「(μ)」と書かれているが値が mm の項目を μm に直す。

    粗い側のメッシュ数から求めた 1 目のピッチ（25400 / メッシュ数）に対して、
    μ のまま読むと 1/1000 以下になる値は、実在しない細さなので mm の書き間違いとみなす。
    畳織の横線は横ピッチより太いため、縦・横とも粗い側のピッチを基準にする。
    """
    micro = parsed.pop("_micro_keys", set())
    meshes = [m for m in (mesh, mesh_yoko) if m]
    if not meshes:
        return parsed
    pitch = INCH_UM / min(meshes)
    for k, _ in _LENGTH_BY_MESH:
        v = parsed.get(k)
        if k in micro and v is not None and v * 1000 <= pitch:
            parsed[k] = v * 1000
    return parsed


def enrich_specs(row, title):
    """unified の 1 行（dict）の仕様列を補い、spec_source を付ける。

    row は meopen_um / mesh_count / senkei_um / kaikouritsu / zaishitsu / hinban を持つ。
    戻り値は更新後の dict（元の dict は変更しない）。
    """
    r = dict(row)
    have = {k: _num(r.get(k)) for k in ALL_KEYS}
    source = "在庫表" if have["meopen_um"] is not None or have["mesh_count"] is not None else None

    from_title = parse_title(title)
    from_hinban = parse_hinban(r.get("hinban"))
    mesh = have["mesh_count"] or from_title.get("mesh_count") or from_hinban.get("mesh_count")
    mesh_yoko = (have["mesh_count_yoko"] or from_title.get("mesh_count_yoko")
                 or from_hinban.get("mesh_count_yoko"))
    from_title = _fix_micro_mm(from_title, mesh, mesh_yoko)

    origin = {k: "既存" for k in ALL_KEYS if have[k] is not None}
    for label, parsed in (("Amazon商品名", from_title), ("品番", from_hinban)):
        added = False
        for k, v in parsed.items():
            # 横の値は、縦の値と同じ出どころからだけ取る（品番の φ が目開きの商品があるため）
            base = {"mesh_count_yoko": "mesh_count", "senkei_yoko_um": "senkei_um",
                    "meopen_yoko_um": "meopen_um"}.get(k)
            if base and origin.get(base) not in (None, label):
                continue
            if have.get(k) is None:
                origin[k] = label
                have[k] = v
                added = True
        if added and source is None:
            source = label

    dutch = is_dutch_weave(r.get("zaishitsu"), r.get("hinban"), title)
    # 縦横でメッシュ数が違う織物は、記載の目開きが縦横どちらの値かが決まらないため、
    # 式で補わず記載値だけを使う（例: 109/127 メッシュ・目開き 140μ は横ピッチとしか合わない）
    uneven = (have["mesh_count_yoko"] is not None and have["mesh_count"] is not None
              and abs(have["mesh_count_yoko"] - have["mesh_count"]) > 0.5)
    if not dutch and not uneven:
        for open_k, wire_k, mesh_k in (("meopen_um", "senkei_um", "mesh_count"),
                                       ("meopen_yoko_um", "senkei_yoko_um", "mesh_count_yoko")):
            m = have[mesh_k]
            if not m:
                continue
            pitch = INCH_UM / m
            opening, wire = have[open_k], have[wire_k]
            if opening is None and wire is not None and pitch - wire > 0:
                have[open_k] = pitch - wire
            if wire is None and opening is not None and pitch - opening > 0:
                have[wire_k] = pitch - opening
        m, opening = have["mesh_count"], have["meopen_um"]
        if m and have["kaikouritsu"] is None and opening is not None and opening < INCH_UM / m:
            have["kaikouritsu"] = (opening / (INCH_UM / m)) ** 2 * 100

    for k in ALL_KEYS:
        v = have[k]
        r[k] = None if v is None else round(v, 1)
    r["spec_source"] = source
    return r
