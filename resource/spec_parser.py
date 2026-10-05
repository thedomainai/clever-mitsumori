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


# 「目開き(μ):45」「目開き（mm）：0.385」「目開き9.16mm」「目開き(μm):180」
# 「目開き率」は開口率なので除外する
_RE_OPEN_LABELED = re.compile(
    r"目開き(?!率)\s*[\(（]\s*(μm|μ|mm|um|µm|µ)\s*[\)）]\s*[:：]?\s*([\d.]+)")
_RE_OPEN_SUFFIX = re.compile(r"目開き(?!率)\s*[:：]?\s*([\d.]+)\s*(μm|μ|mm|um|µm|µ)")
# 「メッシュ数:305」「メッシュ：305」「2.5メッシュ」
_RE_MESH_LABELED = re.compile(r"メッシュ数?\s*[:：]\s*([\d.]+)")
_RE_MESH_SUFFIX = re.compile(r"(?<![\d.])([\d.]+)\s*メッシュ")
# 「線径(mm):0.25」「糸径（μ）：35」「線径1mm」
_RE_WIRE_LABELED = re.compile(
    r"(?:線径|糸径)\s*[\(（]\s*(μm|μ|mm|um|µm|µ)\s*[\)）]\s*[:：]?\s*([\d.]+)")
_RE_WIRE_SUFFIX = re.compile(r"(?:線径|糸径)\s*[:：]?\s*([\d.]+)\s*(μm|μ|mm|um|µm|µ)")

# 品番: 「#400φ0.03」「#400/3000φ0.03/0.018」（φ は mm）
_RE_HINBAN_SHARP = re.compile(r"#\s*(\d+(?:\.\d+)?)\s*(?:/\s*\d+)?\s*φ\s*([\d.]+)")
# 品番: 「PA45/29」（目開き μm / 開口率 %）
_RE_HINBAN_PA = re.compile(r"^(?:PA|NY)\s*(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)$", re.I)


def parse_title(title):
    """商品名から {meopen_um, mesh_count, senkei_um} を読み取る（見つかったものだけ）。"""
    t = nfkc(title)
    out = {}
    m = _RE_OPEN_LABELED.search(t)
    if m:
        out["meopen_um"] = _to_um(_num(m.group(2)), m.group(1))
    else:
        m = _RE_OPEN_SUFFIX.search(t)
        if m:
            out["meopen_um"] = _to_um(_num(m.group(1)), m.group(2))
    m = _RE_MESH_LABELED.search(t) or _RE_MESH_SUFFIX.search(t)
    if m:
        out["mesh_count"] = _num(m.group(1))
    m = _RE_WIRE_LABELED.search(t)
    if m:
        out["senkei_um"] = _to_um(_num(m.group(2)), m.group(1))
    else:
        m = _RE_WIRE_SUFFIX.search(t)
        if m:
            out["senkei_um"] = _to_um(_num(m.group(1)), m.group(2))
    return {k: v for k, v in out.items() if v is not None and v > 0}


def parse_hinban(hinban):
    """品番から {meopen_um, mesh_count, senkei_um, kaikouritsu} を読み取る。"""
    h = nfkc(hinban)
    m = _RE_HINBAN_SHARP.search(h)
    if m:
        return {"mesh_count": float(m.group(1)), "senkei_um": float(m.group(2)) * 1000}
    m = _RE_HINBAN_PA.match(h)
    if m:
        return {"meopen_um": float(m.group(1)), "kaikouritsu": float(m.group(2))}
    return {}


def is_dutch_weave(zaishitsu, hinban, title=""):
    """畳織（目開きの計算式が成り立たない織り方）か。"""
    s = nfkc(zaishitsu) + " " + nfkc(hinban) + " " + nfkc(title)
    return "畳織" in s


SPEC_KEYS = ("meopen_um", "mesh_count", "senkei_um", "kaikouritsu")


def enrich_specs(row, title):
    """unified の 1 行（dict）の仕様列を補い、spec_source を付ける。

    row は meopen_um / mesh_count / senkei_um / kaikouritsu / zaishitsu / hinban を持つ。
    戻り値は更新後の dict（元の dict は変更しない）。
    """
    r = dict(row)
    have = {k: _num(r.get(k)) for k in SPEC_KEYS}
    source = "在庫表" if have["meopen_um"] is not None or have["mesh_count"] is not None else None

    for label, parsed in (("Amazon商品名", parse_title(title)), ("品番", parse_hinban(r.get("hinban")))):
        added = False
        for k, v in parsed.items():
            if have.get(k) is None:
                have[k] = v
                added = True
        if added and source is None:
            source = label

    mesh, opening, wire = have["mesh_count"], have["meopen_um"], have["senkei_um"]
    dutch = is_dutch_weave(r.get("zaishitsu"), r.get("hinban"), title)
    if mesh and not dutch:
        pitch = INCH_UM / mesh
        if opening is None and wire is not None and pitch - wire > 0:
            opening = pitch - wire
        if wire is None and opening is not None and pitch - opening > 0:
            wire = pitch - opening
        if have["kaikouritsu"] is None and opening is not None and opening < pitch:
            have["kaikouritsu"] = (opening / pitch) ** 2 * 100

    have["meopen_um"], have["senkei_um"] = opening, wire
    for k in SPEC_KEYS:
        v = have[k]
        r[k] = None if v is None else round(v, 1)
    r["spec_source"] = source
    return r
