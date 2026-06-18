# Refactor Instructions — Clever (EC 見積ツール)

## 1. Objective

CSV 取込パイプラインから unified.json + Firestore オーバーライドへの移行に伴い、旧パイプライン由来の死コード・未使用依存・壊れたテストを除去する。同時に、本番リリースに対するセキュリティリスクとコード品質上の問題を修正する。

対象: くればぁ EC 見積ツール (Next.js 15 + React 19 + TypeScript 5.7 strict + Tailwind 3.4)
デプロイ: Vercel (static export) — https://clever-mitsumori.vercel.app/

## 2. Project Understanding

### 何をするプロダクトか
営業担当者が材質・目開きを入力し、条件に合う商品の EC 販売価格を一覧で確認する見積ツール。

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
- `/dataflow`, `/overview` — 説明ページ

### 外部依存
- Firebase/Firestore (GCP project: `cyreco-management-dashboard`)
- Vercel (static hosting)

## 3. Behaviors To Preserve

1. 検索フィルタ（材質・目開き範囲・品番・EC品番・カラー・フリーテキスト）が正しく動作する
2. 価格計算式 `(shiire_per_m * cut_m + kotei_hi) / (1 - arari_rate)` の結果が変わらない
3. デフォルト値: 粗利率 50%, 固定費 6,000 円
4. ソート（昇順/降順/解除の3状態トグル）が正しく動作する
5. ページネーション（100件/ページ）が正しく動作する
6. インライン編集（仕入値・固定費・粗利率）→ Firestore 保存 → リアルタイム反映
7. CSV 再アップロード時にオーバーライドが失われない（ec_hinban キー）
8. IME（日本語入力）中の Enter キーが確定操作にならない
9. 編集済みセルの青ドットインジケータ表示
10. `next build` (static export) が成功する
11. 69 個の unit test が全て pass する

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

| Command | 分析時点の結果 |
|---|---|
| `git status` | clean (未コミット変更なし) |
| `npx tsc --noEmit` | 0 errors in `src/` / 187 errors in `__tests__/` (旧 e2e テスト) |
| `npx next build` | success (static export, 8 routes) |
| `npx vitest run __tests__/unit` | 5 files, 69 tests passed |
| `npx next lint` | no warnings or errors |

注: `__tests__/` の 187 errors は旧データモデルの e2e テストが原因。これは Debt Map D3 で対処する。

## 7. Debt Map

### D1: 死コード — 旧 CSV パイプライン関連ファイル (優先度: 高)

| 項目 | 内容 |
|---|---|
| 根拠 | `src/lib/constants/csv-columns.ts` (44行), `src/lib/schemas/csv.ts` (50行), `src/lib/schemas/search.ts` (32行), `src/lib/schemas/product.ts` (32行), `src/lib/services/csv-parser.ts` (2行), `src/lib/services/alternative-finder.ts` (2行), `src/lib/stores/inventory-store.ts` (2行) |
| 問題の理由 | unified.json 移行後、これらのファイルは `src/` 内のどこからもインポートされていない。Grep で確認済み。Zod は schemas/ 内でのみ自己参照 |
| 影響範囲 | ファイル削除のみ。バレルエクスポート (`index.ts`) からの参照があれば除去 |
| 変更リスク | 低 — 未使用の確認済み |
| 改善案 | 全ファイルを削除 |
| 検証方法 | `npx tsc --noEmit` (src/ 0 errors 維持), `npx next build` success, `npx vitest run __tests__/unit` 69 tests pass |
| 着手可否 | 今実装してよい |

### D2: 死コード — スタブコンポーネント (優先度: 高)

| 項目 | 内容 |
|---|---|
| 根拠 | `src/components/features/alternatives/` (3ファイル: alternative-card.tsx, alternatives-dialog.tsx, similarity-score.tsx — 各4行 return null), `src/components/features/csv-upload/csv-upload-form.tsx` (4行 return null), `csv-upload-progress.tsx`, `csv-upload-success.tsx`, `csv-validation-errors.tsx`, `inventory-summary.tsx` |
| 問題の理由 | Grep で `src/` 内からのインポートがゼロ。全て return null のプレースホルダーまたは旧 UI の残骸 |
| 影響範囲 | ファイル/ディレクトリ削除のみ |
| 変更リスク | 低 |
| 改善案 | alternatives/ ディレクトリ全体と csv-upload/ ディレクトリ内の未使用ファイルを削除 |
| 検証方法 | `npx tsc --noEmit`, `npx next build`, `npx vitest run __tests__/unit` |
| 着手可否 | 今実装してよい |

### D3: 壊れた E2E テスト (優先度: 高)

| 項目 | 内容 |
|---|---|
| 根拠 | `__tests__/e2e/csv-upload.spec.ts` (113行), `search.spec.ts` (167行), `alternatives.spec.ts` (203行), `helpers.ts` (44行) |
| 問題の理由 | 旧 UI (CSV アップロード・代替品ダイアログ・ProductType セレクタ) を参照。`tsc --noEmit` で 187 errors。現在の UI と整合しない |
| 影響範囲 | テストファイル削除のみ。src/ には影響なし |
| 変更リスク | 低 — テストは既に機能していない |
| 改善案 | 全 e2e テストファイルを削除。将来 Playwright で再構築する際は現在の UI に合わせて書き直す |
| 検証方法 | `npx tsc --noEmit` で __tests__/ のエラーが解消 |
| 着手可否 | 今実装してよい |

### D4: 未使用 npm 依存 (優先度: 中)

| 項目 | 内容 |
|---|---|
| 根拠 | `zod` — schemas/ 内のみで自己参照、src/ の実コードからインポートなし。`papaparse` + `@types/papaparse` — src/ 内インポートゼロ |
| 問題の理由 | バンドルサイズの無駄、セキュリティパッチの追跡負荷 |
| 影響範囲 | package.json + lock ファイル |
| 変更リスク | 低 |
| 改善案 | D1 で schemas/ を削除した後に `npm uninstall zod papaparse @types/papaparse` |
| 検証方法 | `npx next build` success |
| 着手可否 | D1 完了後に実施 |

### D5: formatPrice 重複 (優先度: 中)

| 項目 | 内容 |
|---|---|
| 根拠 | `src/lib/utils/formatting.ts` — formatPrice (toLocaleString), formatDate, formatStock。`src/components/features/results/results-row.tsx` — ローカル formatPrice (Intl.NumberFormat), formatPercent |
| 問題の理由 | formatting.ts は src/ 内のどこからもインポートされていない（完全死コード）。results-row.tsx はローカル関数として再定義。仕様が変わると複数箇所を修正する必要がある |
| 影響範囲 | formatting.ts 削除、results-row.tsx のローカル関数はそのまま残す（現状唯一の使用箇所） |
| 変更リスク | 低 — formatting.ts は未使用 |
| 改善案 | formatting.ts を削除する（D2 のスタブ削除と同時）。results-row.tsx のローカル関数は1箇所でしか使われていないため、現時点では移動不要 |
| 検証方法 | `npx tsc --noEmit`, `npx next build` |
| 着手可否 | 今実装してよい |

### D6: Firebase API キーのハードコード (優先度: 高 — 本番リリスクリスク)

| 項目 | 内容 |
|---|---|
| 根拠 | `src/lib/firebase.ts` — apiKey, authDomain, projectId 等がソースコードに直書き |
| 問題の理由 | Firebase Web API キーは公開鍵の性質を持つが、セキュリティのベストプラクティスとして環境変数に分離すべき。Git 履歴に残る。Firestore セキュリティルールと組み合わせた場合のリスク（D7 参照） |
| 影響範囲 | `firebase.ts` + `.env.local` 新規作成 + `.env.example` 新規作成 + `next.config.mjs` (env 公開設定) |
| 変更リスク | 中 — Vercel の環境変数設定が必要 |
| 改善案 | `NEXT_PUBLIC_FIREBASE_*` 環境変数に移行。`.env.example` をテンプレートとして作成 |
| 検証方法 | `npx next build` success, ローカルで `.env.local` 設定後にFirestore接続確認 |
| 着手可否 | 今実装してよい |

### D7: Firestore セキュリティルール — 認証なし全開放 (優先度: 高 — 本番リリスクリスク)

| 項目 | 内容 |
|---|---|
| 根拠 | Firestore rules で `product_overrides` コレクションが `allow read, write: if true` |
| 問題の理由 | 認証なしで誰でもデータを読み書きできる。本番環境で悪意ある書き込みや大量読み取りが可能 |
| 影響範囲 | Firestore セキュリティルール。クライアントコードへの変更は認証を入れない限り不要 |
| 変更リスク | 高 — 認証を導入すると UI/フローへの影響が大きい |
| 改善案 | 短期: IP制限またはリファラー制限を Firebase App Check で導入。中期: Firebase Authentication + ルール改善 |
| 検証方法 | Firestore コンソールでルール確認、ブラウザからの読み書きテスト |
| 着手可否 | BLOCKED-BY: Q1 — 認証要件の確認が必要 |

### D8: use-search.ts の useEffect 設計 (優先度: 低)

| 項目 | 内容 |
|---|---|
| 根拠 | `src/hooks/use-search.ts` 行 51-61, 64-69 — 2つの useEffect が類似の条件で発火 |
| 問題の理由 | `eslint-disable-next-line react-hooks/exhaustive-deps` で依存配列を意図的に不完全にしている。merged/overriddenKeys の変更で再検索が走るが、currentFilters と pagination.page が deps に含まれないため、古い値で検索される可能性がある。実害は限定的（検索直後に override が変わるケースのみ） |
| 影響範囲 | use-search.ts のみ |
| 変更リスク | 中 — 無限ループの可能性があるため慎重に |
| 改善案 | ref で currentFilters/pagination を保持し、useEffect の deps を正確にする。ただし現状で実害は報告されていないため、提案に留める |
| 検証方法 | ブラウザで検索→編集→検索結果が正しく更新されることを手動確認 |
| 着手可否 | 提案に留める |

## 8. Implementation Phases

### Phase 1: 死コード除去

**対象 Debt:** D1, D2, D5

**作業内容:**
1. 以下のファイルを削除:
   - `src/lib/constants/csv-columns.ts`
   - `src/lib/schemas/csv.ts`
   - `src/lib/schemas/search.ts`
   - `src/lib/schemas/product.ts`
   - `src/lib/services/csv-parser.ts`
   - `src/lib/services/alternative-finder.ts`
   - `src/lib/stores/inventory-store.ts`
   - `src/lib/utils/formatting.ts`
   - `src/components/features/alternatives/` (ディレクトリ全体)
   - `src/components/features/csv-upload/csv-upload-form.tsx`
   - `src/components/features/csv-upload/csv-upload-progress.tsx`
   - `src/components/features/csv-upload/csv-upload-success.tsx`
   - `src/components/features/csv-upload/csv-validation-errors.tsx`
   - `src/components/features/csv-upload/inventory-summary.tsx`
2. schemas/ ディレクトリが空なら削除
3. csv-upload/ ディレクトリが空なら削除
4. バレルエクスポート (index.ts) から削除したモジュールの re-export を除去

**完了条件:**
- `npx tsc --noEmit` — src/ エラー 0 維持
- `npx next build` — success
- `npx vitest run __tests__/unit` — 69 tests pass
- 削除したファイルが `src/` 内からインポートされていないことを Grep で確認済み

### Phase 2: 壊れた E2E テスト除去 + 未使用依存削除

**対象 Debt:** D3, D4

**作業内容:**
1. 以下のファイルを削除:
   - `__tests__/e2e/csv-upload.spec.ts`
   - `__tests__/e2e/search.spec.ts`
   - `__tests__/e2e/alternatives.spec.ts`
   - `__tests__/e2e/helpers.ts`
2. e2e ディレクトリが空なら削除
3. `npm uninstall zod papaparse @types/papaparse`
4. fixtures ディレクトリに旧テスト専用のファイルがあれば削除を検討（ただし他で使われていれば残す）

**完了条件:**
- `npx tsc --noEmit` — __tests__/ のエラーが大幅に減少（0 が理想）
- `npx next build` — success
- `npx vitest run __tests__/unit` — 69 tests pass
- `npm ls zod papaparse` — not found

### Phase 3: Firebase 設定の環境変数化

**対象 Debt:** D6

**作業内容:**
1. `.env.local` を作成（.gitignore 済み）:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBCVMOHS3kd06CP1SZnOrMtVFmC-iAw6dA
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cyreco-management-dashboard.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=cyreco-management-dashboard
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cyreco-management-dashboard.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=121765511211
   NEXT_PUBLIC_FIREBASE_APP_ID=1:121765511211:web:cb0f2ad5b0e2030cc82a6e
   ```
2. `.env.example` を作成（値を空にしたテンプレート）
3. `src/lib/firebase.ts` を環境変数参照に書き換え
4. Vercel に環境変数を設定する手順を `.env.example` にコメントで記載

**完了条件:**
- `npx next build` — success
- `src/lib/firebase.ts` にハードコードされた値がないことを Grep で確認
- `.env.example` が存在する
- ローカルで `.env.local` 設定後、Firestore への読み書きが正常に動作する

## 9. Verification Requirements

| Phase | Baseline Command | 期待結果 |
|---|---|---|
| Phase 1 | `npx tsc --noEmit` (src/) | 0 errors |
| Phase 1 | `npx next build` | success |
| Phase 1 | `npx vitest run __tests__/unit` | 69 tests pass |
| Phase 2 | `npx tsc --noEmit` | errors 大幅減少 |
| Phase 2 | `npx next build` | success |
| Phase 2 | `npx vitest run __tests__/unit` | 69 tests pass |
| Phase 3 | `npx next build` | success |
| Phase 3 | Grep hardcoded keys in firebase.ts | 0 matches |

## 10. Reporting Format

各フェーズ完了時および最終報告で以下を記載する:

- 変更したファイルの一覧と変更内容の要約
- 実行した Baseline Commands と結果
- 完了条件の充足状況
- 未解決の質問・BLOCKED 箇所

## 11. Out-of-scope Items

- **D7: Firestore セキュリティルール強化** — 認証方式の決定が必要 (BLOCKED-BY: Q1)
- **D8: use-search.ts の useEffect リファクタ** — 実害が確認されていないため提案に留める
- **E2E テストの再構築** — 現在の UI に合わせた Playwright テストは別タスク
- **CI/CD パイプライン構築** — GitHub Actions による lint/test/build 自動化は別タスク
- **Pagination の indigo カラー** — スレートパレットとの不一致は軽微

## 12. 本番リリースに対するリスク評価

### リスク 1: Firestore 全開放 (重大度: 高)

`product_overrides` コレクションが `allow read, write: if true` で認証なし。本番環境では:
- 第三者が価格データを書き換え可能
- 大量の読み取りリクエストで Firestore 課金が膨張する可能性
- 対策: Firebase App Check（短期）+ Firebase Authentication（中期）

### リスク 2: Firebase API キーの Git 履歴残留 (重大度: 中)

Phase 3 で環境変数に移行しても、Git 履歴に API キーが残る。Firebase Web API キーは公開鍵の性質を持つため即座の危険度は低いが、D7 の全開放ルールと組み合わさると悪用可能。

対策: API キーのローテーション（Firebase Console → Project settings → API keys）

### リスク 3: エラーバウンダリの不在 (重大度: 中)

React Error Boundary が実装されていない。Firestore 接続エラーやデータ不整合でコンポーネントツリー全体がクラッシュする可能性がある。`useProductOverrides` にフォールバック機構はあるが、レンダリング中のエラーは捕捉できない。

### リスク 4: 本番データの検証不足 (重大度: 中)

`unified.json` のスキーマ検証がランタイムで行われない。Python パイプラインの出力が不正な場合、フロントエンドが黙って壊れる。

### リスク 5: CI/CD パイプラインなし (重大度: 中)

lint/test/build がデプロイ前に自動実行されない。手動で `git push` するだけで Vercel にデプロイされる。壊れたコードが本番に到達するリスクがある。

## 13. 実装前に確認すべき質問

### Q1: Firestore の認証方式

product_overrides コレクションへのアクセス制御をどうするか。選択肢:

- A) Firebase App Check（デバイスアテステーション）— 認証 UI 不要、ドメイン制限で十分な場合
- B) Firebase Authentication（メール/パスワード or Google ログイン）— ユーザー管理が必要な場合
- C) 当面は現状維持（社内ツールとして限定利用、IP 制限は Vercel 側で設定）

BLOCKED-BY: Q1 → D7 の実装
