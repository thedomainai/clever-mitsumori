# -*- coding: utf-8 -*-
"""unified.csv を Next.js アプリ用の JSON に変換する。

出力先: public/data/unified.json
"""
import csv
import json
from pathlib import Path

BASE = Path(__file__).parent
PROJECT = BASE.parent
CSV_PATH = BASE / "unified.csv"
OUT_DIR = PROJECT / "public" / "data"


def to_num(v):
    if v is None or v == "":
        return None
    try:
        f = float(v)
        if f == int(f):
            return int(f)
        return round(f, 2)
    except (ValueError, TypeError):
        return None


def to_str(v):
    if v is None or v == "":
        return None
    return str(v).strip() or None


# unified.csv のカラム → JSON キーのマッピング
COLUMNS = [
    ("ec_hinban", to_str),
    ("rakuten_code", to_str),
    ("yahoo_code", to_str),
    ("amazon_sku", to_str),
    ("asin", to_str),
    ("zaishitsu", to_str),
    ("hinban", to_str),
    ("color", to_str),
    ("size", to_str),
    ("tehai", to_str),
    ("haba_mm", to_num),
    ("cut_m", to_num),
    ("arari_rate", to_num),
    ("kotei_hi", to_num),
    ("hanbai_kakaku", to_num),
    ("shiire_changed_date", to_str),
    ("rakuten_price", to_num),
    ("rakuten_price_202605", to_num),
    ("yahoo_price", to_num),
    ("yahoo_price_202605", to_num),
    ("amazon_price", to_num),
    ("amazon_price_202605", to_num),
    ("amazon_hojin_price", to_num),
    ("shiire_per_m", to_num),
    ("nokori_m", to_num),
    ("zaiko_source", to_str),
    ("zaiko_haba_mm", to_num),
    ("meopen_um", to_num),
    ("mesh_count", to_num),
    ("senkei_um", to_num),
    ("kaikouritsu", to_num),
    ("zaiko_match", to_str),
    ("zaiko_status", to_str),
]


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(CSV_PATH, encoding="utf-8-sig") as fp:
        reader = csv.reader(fp)
        headers = next(reader)

        products = []
        for row in reader:
            row = (row + [None] * len(COLUMNS))[:len(COLUMNS)]
            obj = {}
            for i, (key, conv) in enumerate(COLUMNS):
                val = conv(row[i])
                if val is not None:
                    obj[key] = val
            if obj.get("ec_hinban"):
                products.append(obj)

    out_path = OUT_DIR / "unified.json"
    with open(out_path, "w", encoding="utf-8") as fp:
        json.dump(products, fp, ensure_ascii=False, separators=(",", ":"))

    size_kb = out_path.stat().st_size / 1024
    print(f"export: {out_path.relative_to(PROJECT)} ({len(products)} rows, {size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
