# Refactor Instructions — Clever (EC 見積ツール)

## 1. Objective

前回のリファクタリング（commit 9209105〜6d8fa5d）で旧CSVパイプラインの死コード・壊れたテスト・未使用依存を除去済み。本指示書は残存する技術的負債と追加の改善を対象とする。

対象: くればぁ EC 見積ツール (Next.js 15 + React 19 + TypeScript 5.7 strict + Tailwind 3.4)
デプロイ: Vercel (static export) — https://clever-mitsumori.vercel.app/

## 2. Project Understanding

### 何をするプロダクトか
営業担当者が材質・目開き・メッシュ数・線径・開口率・幅で検索し、条件に合う商品の EC 販売価格を一覧で確認する見積ツール。

### データフロー
1. `build_db.py` → SQLite DB → `export_json.py` → `public/data/unified.json`
2. ブラウザ: `unified.json` を fetch → `useInventory` で保持
3. Firestore `product_overrides` コレクション → `useProductOverrides` でリアルタイム同期
4. `mergeOverrides()` で base data + overrides をマージ
5. `searchProducts()` でフィルタ・ソート・ページネーション
6. `calculateEcPrice()` で算出: `(仕入値/m × カット長 + 固定費) ÷ (1 - 粗利率)`

### 主要エントリーポイント
- `/search` — 検索・見積の主画面
- `/` — ホームダッシュボード
- `/dataflow`, `/overview` — 説明ページ（旧アーキテクチャの内容が残存）

### 外部依存
- Firebase/Firestore (GCP project: `cyreco-management-dashboard`)
- Vercel (static hosting)

## 3. Behaviors To Preserve

1. 検索フィルタ（材質・目開き範囲・メッシュ数範囲・線径範囲・開口率範囲・幅範囲・品番・EC品番・カラー・フリーテキスト）が正しく動作する
2. 価格計算式 `(shiire_per_m * cut_m + kotei_hi) / (1 - arari_rate)` の結果が変わらない
3. デフォルト値: 粗利率 50%, 固定費 6,000 円
4. ソート（昇順/降順/解除の3状態トグル）が正しく動作する
5. ページネーション（100件/ページ）が正しく動作する
6. インライン編集（仕入値・固定費・粗利率）→ Firestore 保存 → リアルタイム反映
7. CSV 再アップロード時にオーバーライドが失われない（ec_hinban キー）
8. IME（日本語入力）中の Enter キーが確定操作にならない
9. 編集済みセルの青ドットインジケータ表示
10. `next build` (static export) が成功する
11. 30 個の unit test が全て pass する

## 4. Non-Negotiables

- 最初に `git status` を確認し、既存の未コミット変更と自分の変更を混ぜない
- 編集前に Baseline Commands を実行し、結果を記録する
- 変更は小さく戻しやすい単位にする
- 無関係な整形やついでのリファクタリングをしない
- 既存挙動を勝手に変えない
- 証拠なく大きな削除や全面書き換えをしない
- 各フェーズの完了条件を満たしてから次のフェーズに進む

## 5. Stop And Ask Conditions

以下に該当したら実装を止めて質問する:

- 正しい仕様がコードから判断できない
- テストと実装が矛盾している
- 削除候補のコードが本当に不要かわからない
- 公開API・DB schema・保存済みデータに影響する可能性がある
- 認証・課金・通知・外部連携に影響する可能性がある
- 互換性を壊す可能性がある
- 複数の設計案があり、プロダクト判断が必要
- `BLOCKED-BY` マークが未解決のまま残っている

## 6. Baseline Commands

| Command | 分析時点の結果 (2026-06-23) |
|---|---|
| `npm run build` | success (static export, 8 pages) |
| `npm run lint` | no warnings or errors |
| `npx vitest run` | 2 files, 30 tests passed (837ms) |

## 7. Completed Debt (Previous Session)

以下は commit 9209105〜6d8fa5d で解決済み:

- D1: 死コード（旧CSVパイプライン関連ファイル: schemas/, csv-columns.ts, csv-parser.ts, alternative-finder.ts, stores/, formatting.ts）
- D2: スタブコンポーネント（alternatives/, csv-upload/ ディレクトリ）
- D3: 壊れたE2Eテスト（__tests__/e2e/）
- D4: 未使用npm依存（zod, papaparse, @types/papaparse）
- D6: Firebase API キーの環境変数化（commit 41f9f36, ccf4aeb）

## 8. Remaining Debt Map

### D-R1: 追加の死コード（優先度: 高）

| 項目 | 内容 |
|---|---|
| 根拠 | `src/lib/store/index.ts` (1行コメントのみ), `src/lib/store/inventory-store.ts` (1行コメントのみ), `src/hooks/use-local-storage.ts` (42行, 未使用), `src/components/features/search/product-type-selector.tsx` (4行, return null), `src/components/ui/file-upload.tsx` (102行, 未使用), `src/components/features/results/price-display.tsx` (17行, 未使用), `src/components/features/results/inventory-status-badge.tsx` (12行, 未使用) |
| 問題の理由 | いずれも `src/` 内のどこからもインポートされていない。Grep で確認済み |
| 影響範囲 | ファイル/ディレクトリ削除のみ |
| 変更リスク | 低 |
| 改善案 | 全ファイルを削除。`src/lib/store/` ディレクトリも削除 |
| 検証方法 | `npm run build`, `npx vitest run` |
| 着手可否 | 今実装してよい |

### D-R2: 旧アーキテクチャのドキュメントページ（優先度: 中）

| 項目 | 内容 |
|---|---|
| 根拠 | `src/app/dataflow/page.tsx` (733行), `src/app/dataflow/confirm/page.tsx` |
| 問題の理由 | CSV直アップロード + localStorage + PapaParse + per-category parsers + alternative-finder を前提とした旧アーキテクチャの図解。現在の `build_db.py → unified.json → Firestore overlay` パイプラインとは完全に乖離。ユーザーに誤った情報を提供する |
| 影響範囲 | 2ページの削除。ナビゲーションリンクの更新が必要な場合あり |
| 変更リスク | 低 — 機能ページではなくドキュメントページ |
| 改善案 | 両ファイルを削除。必要なら現在のアーキテクチャに基づいて再作成 |
| 検証方法 | `npm run build` |
| 着手可否 | 今実装してよい |

### D-R3: `overview` ページの旧情報（優先度: 低）

| 項目 | 内容 |
|---|---|
| 根拠 | `src/app/overview/page.tsx` — alternative-finder, 3カテゴリ別パース等の旧コンセプトへの言及 |
| 問題の理由 | 現在のコードベースに存在しない機能が記載されている |
| 変更リスク | 中 — 内容の正確な更新にはプロダクト判断が必要 |
| 改善案 | 旧コンセプトの記述を削除、または現在の実装に合わせて更新 |
| 着手可否 | 更新内容を確認後に実施 |

### D-R4: `haba_mm` フィールドの残骸（優先度: 高）

| 項目 | 内容 |
|---|---|
| 根拠 | `src/lib/types/index.ts:30` — `UnifiedProduct` に `haba_mm?: number` が残存。`unified.json` にはこのフィールドは出力されない（export_json.py に含まれない）。`SearchFilter` は `haba_mm_min/max` 名だが実際のフィルタは `zaiko_haba_mm` を参照 |
| 問題の理由 | 型定義と実データの不整合。将来の開発者が `haba_mm` を使おうとして混乱する |
| 改善案 | (a) `UnifiedProduct.haba_mm` を削除。(b) `SearchFilter.haba_mm_min/max` を `zaiko_haba_mm_min/max` にリネーム。関連する search-engine.ts と search-form.tsx を更新 |
| 検証方法 | `npm run build`, `npx vitest run` |
| 着手可否 | 今実装してよい |

### D-R5: ページサイズの不整合（優先度: 低）

| 項目 | 内容 |
|---|---|
| 根拠 | `src/hooks/use-search.ts:12,29,43` — ハードコード `100`。`src/lib/services/search-engine.ts:151` — デフォルトパラメータ `50` |
| 問題の理由 | use-search.ts が常に 100 を渡すので search-engine.ts のデフォルト 50 は実質無意味だが、ライブラリとして使われた場合に混乱する |
| 改善案 | 定数 `SEARCH_CONFIG.defaultPageSize = 100` を作成し、両方から参照 |
| 着手可否 | 今実装してよい |

### D-R6: ホームページの「未実装」プレースホルダー（優先度: 低）

| 項目 | 内容 |
|---|---|
| 根拠 | `src/app/page.tsx:67-81` — ネトロン/トリカル欄が「未実装」表示。`src/app/search/page.tsx:11-15,58-78` — CATEGORIES タブで同様に「未実装」表示 |
| 問題の理由 | 現在の `unified.json` は全カテゴリ混合。`zaiko_source` で分類可能。「未実装」表示はユーザーに不正確な印象を与える |
| 改善案 | (a) カテゴリ表示を削除する、または (b) `zaiko_source` で集計して正しい数値を表示する |
| 着手可否 | プロダクト判断が必要 — カテゴリ分類がユーザーにとって意味があるか確認 |

### D-R7: Firestore セキュリティルール — 認証なし全開放（優先度: 高 — 本番リスク）

| 項目 | 内容 |
|---|---|
| 根拠 | Firestore rules で `product_overrides` コレクションが `allow read, write: if true` |
| 問題の理由 | 認証なしで誰でもデータを読み書きできる |
| 改善案 | 短期: Firebase App Check。中期: Firebase Authentication |
| 着手可否 | BLOCKED-BY: Q1 — 認証要件の確認が必要 |

### D-R8: use-search.ts の useEffect 設計（優先度: 低）

| 項目 | 内容 |
|---|---|
| 根拠 | `src/hooks/use-search.ts` — 2つの useEffect が `eslint-disable-next-line react-hooks/exhaustive-deps` で依存配列を不完全にしている |
| 問題の理由 | 古い値で検索される可能性がある（実害は限定的） |
| 着手可否 | 提案に留める |

## 9. Implementation Phases

### Phase 1: 追加の死コード除去

**対象 Debt:** D-R1

**作業内容:**
1. 以下のファイルを削除:
   - `src/lib/store/index.ts`
   - `src/lib/store/inventory-store.ts`
   - `src/hooks/use-local-storage.ts`
   - `src/components/features/search/product-type-selector.tsx`
   - `src/components/ui/file-upload.tsx`
   - `src/components/features/results/price-display.tsx`
   - `src/components/features/results/inventory-status-badge.tsx`
2. `src/lib/store/` ディレクトリを削除

**完了条件:**
- `npm run build` — success
- `npx vitest run` — 30 tests pass
- 削除したファイルが `src/` 内からインポートされていないことを Grep で確認済み

### Phase 2: 型定義の整合性修正

**対象 Debt:** D-R4

**作業内容:**
1. `src/lib/types/index.ts` から `haba_mm?: number` を削除
2. `SearchFilter` の `haba_mm_min/max` を `zaiko_haba_mm_min/max` にリネーム
3. `src/lib/services/search-engine.ts` のフィルタ条件を `filters.zaiko_haba_mm_min/max` に更新
4. `src/components/features/search/search-form.tsx` のフィルタ構築を `zaiko_haba_mm_min/max` に更新
5. テストファイルに `haba_mm` 参照があれば更新

**完了条件:**
- `npm run build` — success
- `npx vitest run` — 30 tests pass
- `grep -r "haba_mm" src/` で `zaiko_haba_mm` 以外の参照がゼロ

### Phase 3: 旧ドキュメントページの除去

**対象 Debt:** D-R2

**作業内容:**
1. `src/app/dataflow/page.tsx` を削除
2. `src/app/dataflow/confirm/page.tsx` を削除
3. `src/app/dataflow/` ディレクトリを削除
4. ナビゲーション内に `/dataflow` へのリンクがあれば除去

**完了条件:**
- `npm run build` — success
- `/dataflow` へのリンクが残っていないことを Grep で確認

### Phase 4: ページサイズ定数化（任意）

**対象 Debt:** D-R5

**作業内容:**
1. `src/lib/constants/` に `SEARCH_CONFIG.defaultPageSize = 100` を追加
2. `use-search.ts` と `search-engine.ts` から参照

**完了条件:**
- `npm run build` — success
- `npx vitest run` — 30 tests pass

## 10. Verification Requirements

| Phase | Baseline Command | 期待結果 |
|---|---|---|
| Phase 1 | `npm run build` | success |
| Phase 1 | `npx vitest run` | 30 tests pass |
| Phase 2 | `npm run build` | success |
| Phase 2 | `npx vitest run` | 30 tests pass |
| Phase 2 | `grep -r "haba_mm" src/` | zaiko_haba_mm 以外 0 |
| Phase 3 | `npm run build` | success |
| Phase 4 | `npm run build` | success |
| Phase 4 | `npx vitest run` | 30 tests pass |

## 11. Out-of-scope Items

- **D-R7: Firestore セキュリティルール強化** — 認証方式の決定が必要 (BLOCKED-BY: Q1)
- **D-R8: use-search.ts の useEffect リファクタ** — 実害が確認されていないため提案に留める
- **D-R3: overview ページの更新** — プロダクト判断が必要
- **D-R6: カテゴリ表示の修正** — プロダクト判断が必要
- **E2E テストの再構築** — 現在の UI に合わせた Playwright テストは別タスク
- **CI/CD パイプライン構築** — GitHub Actions による lint/test/build 自動化は別タスク

## 12. 実装前に確認すべき質問

### Q1: Firestore の認証方式

product_overrides コレクションへのアクセス制御をどうするか。選択肢:

- A) Firebase App Check（デバイスアテステーション）— 認証 UI 不要、ドメイン制限で十分な場合
- B) Firebase Authentication（メール/パスワード or Google ログイン）— ユーザー管理が必要な場合
- C) 当面は現状維持（社内ツールとして限定利用、IP 制限は Vercel 側で設定）

BLOCKED-BY: Q1 → D-R7 の実装
