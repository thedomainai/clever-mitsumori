# -*- coding: utf-8 -*-
"""耐薬品性の判定表（Excel）を、アプリが読む JSON に変換する。

使い方:
  python3 resource/import_chemical_table.py <耐薬品性_判定確認シート.xlsx>

出力先: src/lib/constants/chemical-resistance.json

判定表は v0（くればぁ社の確認前の仮の値）。確認済みの版を受け取ったら、
このスクリプトを再実行して JSON を差し替える。
"""
import json
import sys
from pathlib import Path

import openpyxl

PROJECT = Path(__file__).parent.parent
OUT = PROJECT / "src" / "lib" / "constants" / "chemical-resistance.json"
GRADES = {"◎", "○", "△", "×"}

# 当社判断の修正。判定表の値が "from" のままのときだけ "to" に置き換える。
# くればぁ社の確認で値が変わっていれば（"from" と違えば）先方の値を優先し、修正は当てない。
CORRECTIONS = [
    {
        "name": "塩酸", "condition": "10%・室温", "material": "SUS316メッシュ",
        "from": "×", "to": "△",
        "reason": "SUS316 は Mo 添加で SUS304 より耐食性が高い。SUS304 が △ なのに SUS316 が × は逆転しているため、SUS304 と同じ △ にそろえた（2026-10-05 当社判断）",
    },
]


def main(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb["判定表"]
    rows = [list(r) for r in ws.iter_rows(values_only=True)]
    header = rows[0]
    first_mat = header.index("条件（濃度・温度）") + 2  # 「別名」の次の列から素材
    materials = [h for h in header[first_mat:] if h and h != "ご指摘・コメント"]

    chemicals = []
    for r in rows[1:]:
        if not isinstance(r[0], int) or not r[2]:
            continue
        grades = {}
        for i, mat in enumerate(materials):
            g = r[first_mat + i]
            if g in GRADES:
                grades[mat] = g
        chemicals.append({
            "id": r[0],
            "category": r[1],
            "name": r[2],
            "condition": r[3],
            "alias": r[4],
            "grades": grades,
        })

    applied = []
    for fix in CORRECTIONS:
        target = next((c for c in chemicals
                       if c["name"] == fix["name"] and c["condition"] == fix["condition"]), None)
        current = target["grades"].get(fix["material"]) if target else None
        if current == fix["from"]:
            target["grades"][fix["material"]] = fix["to"]
            applied.append(fix)
            print(f"修正: {fix['name']}（{fix['condition']}）× {fix['material']}: {fix['from']} → {fix['to']}")
        else:
            print(f"修正をスキップ: {fix['name']}（{fix['condition']}）× {fix['material']} は現在 {current}（判定表の側で既に修正済み、または先方の確認値。判定表の値を使う）")

    data = {
        "source": Path(path).name,
        "note": "記号は仮の初期値（素材メーカー技術資料・一般技術文献ベース）。くればぁ社の確認前。",
        "materials": materials,
        "chemicals": chemicals,
        "corrections": applied,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"export: {OUT.relative_to(PROJECT)} ({len(materials)} 素材 × {len(chemicals)} 薬品)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python3 resource/import_chemical_table.py <xlsx>")
    main(sys.argv[1])
