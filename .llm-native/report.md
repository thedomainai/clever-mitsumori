# LLM Native 診断レポート — Clever リポジトリ

診断日: 2026-06-10
対象: `/Users/yuta/workspace/projects/cyreco/ec/clever`
スタック: Next.js 15 + React 19 + TypeScript 5.7 + Tailwind CSS

## 総合スコア: 33.0 / 45（73.3%）

## 9軸スコアカード

| # | 評価軸 | スコア | 根拠 |
|---|---|---|---|
| 1 | Discoverability | 4.5 | ファイル名とシンボル名が完全一致、一意性100%、機能別ディレクトリ構造が明確 |
| 2 | Context Efficiency | 4.0 | ファイルサイズ中央値50行、P90=135行で良好。dataflow(860行), overview(713行) が突出 |
| 3 | Self-Documentation | 2.5 | TypeScript型定義・エラーメッセージは充実。README.md なし、定数の意味説明・アーキテクチャ判断の記録が不足 |
| 4 | Structural Consistency | 4.5 | Result<T>型が全サービスで100%統一、命名規則(kebab/Pascal/camel)が一貫、ページ構造も揃っている |
| 5 | Boundary Clarity | 4.5 | Barrel exports で API 境界が明確、循環依存ゼロ、レイヤー間の一方向依存が保たれている |
| 6 | Change Safety | 3.5 | TypeScript strict mode、0 any、テスト比率20%。CI/CD パイプライン未設置、Zod バリデーション活用が限定的 |
| 7 | Navigation Efficiency | 4.5 | @/ パスエイリアス一貫使用、依存追跡3ステップ以内、型駆動設計で参照検索が確定的 |
| 8 | AI Configuration | 1.0 | CLAUDE.md なし、プロジェクト固有ルール・既知の落とし穴・デプロイフロー未記録 |
| 9 | Content Readability | 4.0 | サービス層の関数長・命名・単一責任は優秀(4.0-4.5)。ページファイル2つが700-860行で減点 |

## Phase 1: 静的メトリクス

| メトリクス | 値 |
|---|---|
| ソースファイル数 | 51 |
| 総行数 | 4,496 |
| ファイルサイズ中央値 | ~50行 |
| ファイルサイズ P90 | ~135行 |
| 最大ファイル | dataflow/page.tsx (860行) |
| TypeScript strict | 有効 |
| `any` 使用数 | 0 |
| テストファイル数 | 10 (テスト比率 ~20%) |
| パスエイリアス import | 40 |
| 相対 import | 9 |
| Barrel exports | 6 |
| 命名規則 | kebab-case (27ファイル、一貫) |
| コメント比率 | 0.3% (13行 / 4,496行) |
| 汎用変数名 | 43 |
| README.md | なし |
| CLAUDE.md | なし |
| .env.example | なし |
| CI/CD | なし |

## Phase 2: 意味的分析

### 1. Discoverability（発見可能性）: 4.5/5

**強み:**
- 機能ベースの明確なディレクトリ分離（features/csv-upload, search, results, alternatives）
- ファイル名とエクスポートシンボルが完全一致（price-calculator.ts → calculateEcPrice()）
- エクスポート関数名の重複: 0件（一意性100%）
- barrel export パターンが適切に運用（6ファイル）
- Next.js App Router 規約に完全準拠

**改善余地:**
- コンポーネントファイルの命名規則（kebab-case ファイル名 vs PascalCase エクスポート）は慣習的であり実害なし

### 2. Context Efficiency（コンテキスト効率）: 4.0/5

**強み:**
- ファイルサイズ中央値50行でコンテキストウィンドウに優しい
- サービス層は35-229行の適切な範囲

**改善余地:**
- dataflow/page.tsx (860行) と overview/page.tsx (713行) がコンテキストを圧迫
- これらのファイルはサブコンポーネント分割で改善可能

### 3. Self-Documentation（自己文書化）: 2.5/5

**強み:**
- TypeScript の型定義が充実（UnifiedProduct: 20フィールド、Result<T> 統一エラー型）
- エラーメッセージが日本語で具体的（エラーコード併記）
- ディレクトリ構造が Feature Sliced Design 的に整理

**不足:**
- プロジェクトルートに README.md が存在しない
- 定数の意味が説明されていない（fixedCost: 6000 が何の費用か、150 がなぜ余剰在庫判定か）
- アーキテクチャ判断の根拠が記録されていない（なぜ静的エクスポート、なぜ localStorage）
- CSV カラム名のマッピングに暗黙知が多い

### 4. Structural Consistency（構造一貫性）: 4.5/5

**強み:**
- Result<T> 型による統一エラーハンドリングが全4サービスで100%一致
- エラーコード命名が一貫（UPPER_SNAKE_CASE、動詞_名詞構造）
- 関数命名の一貫性（parse*, calculate*, search*, find*）
- 内部ヘルパーは全て function 宣言、純粋関数、非 export で統一
- UI コンポーネントの設計パターン統一（forwardRef, variant+size props）

**改善余地:**
- 空状態 UI の表記揺れ（search/page.tsx にはあるが他ページにはない）

### 5. Boundary Clarity（境界明確性）: 4.5/5

**強み:**
- Barrel exports で Public API が明確（内部関数は隠蔽）
- 循環依存ゼロ（UI → Hooks → Services → Types の一方向）
- Zod スキーマ定義が境界に配置

**改善余地:**
- Zod バリデーションの実利用箇所が限定的（csv-parser は手動パース）

### 6. Change Safety（変更安全性）: 3.5/5

**強み:**
- TypeScript strict mode + 0 any
- テスト比率 ~20%（10テストファイル / 51ソースファイル）
- ESLint 設定あり

**不足:**
- CI/CD パイプラインなし（ビルド・テスト・型チェックの自動実行がない）
- Prettier 設定なし
- Zod バリデーション活用が限定的

### 7. Navigation Efficiency（ナビゲーション効率）: 4.5/5

**強み:**
- @/ パスエイリアス 100% 一貫使用
- 依存関係追跡が3ステップ以内で完結
- 型駆動設計により IDE の「参照を検索」が確定的
- レイヤー間の境界が明確

### 8. AI Configuration（AI設定）: 1.0/5

**強み:**
- TypeScript strict mode（型安全なコード生成が可能）
- パスエイリアス設定済み

**不足:**
- CLAUDE.md / .cursorrules が存在しない
- プロジェクト固有の制約が暗黙知のまま:
  - なぜ静的エクスポートを選択したか
  - localStorage を使う設計判断
  - CSV フォーマットのバリエーション
  - 価格計算式の根拠
  - 在庫ステータス判定閾値の根拠
- 既知の落とし穴が記録されていない（React 19 IME 問題、localStorage クォータ）
- テスト戦略・デプロイフローが記録されていない

### 9. Content Readability（コンテンツ可読性）: 4.0/5

**ファイル別スコア:**

| ファイル | 行数 | スコア | 主な評価 |
|---|---|---|---|
| csv-parser.ts | 212 | 4.5 | 関数長適切、命名明確、ガードクローズ適切。150 の定数化が望ましい |
| search-engine.ts | 229 | 4.0 | matchesFilter が106行とやや長いが構造は単純。パイプライン構造で読みやすい |
| alternative-finder.ts | 131 | 4.5 | スコアリングロジック明確。重み・閾値の定数化が望ましい |
| overview/page.tsx | 713 | 3.5 | ファイルが大きい。サブコンポーネント分割が必要 |
| dataflow/page.tsx | 860 | 3.0 | 非常に大きい。ズーム/パンロジックとUIが混在。カスタムフック分離が必要 |
| csv-upload-form.tsx | 135 | 4.5 | 適切な長さ、明確な命名、単一責任 |
| use-search.ts | 99 | 4.5 | 標準的な React フックパターン。pageSize: 100 の定数化が望ましい |

## Phase 4: 改善計画

### Priority 1: AI Configuration（1.0 → 4.0 目標: +3.0pt）

最大インパクト。コード変更不要。

**1-1. CLAUDE.md をプロジェクトルートに作成**
- プロジェクトの目的・ドメイン知識（くればぁ社、メッシュ/ネット製品 EC 販売価格管理）
- アーキテクチャ制約（静的エクスポート、localStorage、認証なし）
- CSV フォーマットの違いとパース時の注意点
- 価格計算式の根拠（販売価格 = (仕入単価 x カット長 + 固定費) / (1 - 粗利率)）
- 在庫ステータス判定閾値の根拠（150m = 3反 = 倉庫容量圧迫）
- テスト戦略（Vitest: 単体、Playwright: E2E）
- 既知の落とし穴（React 19 IME 問題、localStorage 5MB 制限）

**1-2. .env.example を作成**
- 環境変数不要である旨を明記（静的サイトの設計判断として記録）

### Priority 2: Self-Documentation（2.5 → 4.0 目標: +1.5pt）

**2-1. 定数にコメント追加**
- `price-config.ts`: 各定数の業務上の意味
- `csv-parser.ts`: `150` → `EXCESS_THRESHOLD_METERS = 150` に定数化 + コメント
- `alternative-finder.ts`: スコア重み・閾値を定数化 + コメント

**2-2. README.md を作成（英語）**
- Overview, Tech Stack, Getting Started, Build, Architecture, Commands

### Priority 3: Content Readability（4.0 → 4.5 目標: +0.5pt）

**3-1. dataflow/page.tsx の分割**
- ズーム/パン処理 → `hooks/use-canvas-transform.ts`
- サブコンポーネント → `components/dataflow/`

**3-2. overview/page.tsx の分割**
- セクション単位でコンポーネント化
- サブコンポーネント → `components/overview/`

### Priority 4: Change Safety（3.5 → 4.0 目標: +0.5pt）

**4-1. CI パイプラインの追加**
- GitHub Actions: `type-check` + `test:unit` + `build` 自動実行

### 改善後の目標スコア

| 改善策 | 現在 | 目標 | 差分 |
|---|---|---|---|
| AI Configuration | 1.0 | 4.0 | +3.0 |
| Self-Documentation | 2.5 | 4.0 | +1.5 |
| Content Readability | 4.0 | 4.5 | +0.5 |
| Change Safety | 3.5 | 4.0 | +0.5 |
| **合計** | **33.0** | **38.5** | **+5.5** |

**目標総合スコア: 38.5 / 45（85.6%）**

## 所見

コード品質そのもの（構造一貫性、境界明確性、ナビゲーション効率）は 4.5/5 と高水準。Result<T> 型の全面採用、barrel exports、一方向依存、命名規則の一貫性など、LLM が読み書きしやすい設計パターンが確立されている。

最大のボトルネックは AI Configuration（1.0）。CLAUDE.md が存在せず、プロジェクト固有のドメイン知識・アーキテクチャ判断・既知の落とし穴がコードベース上に記録されていないため、新しい LLM セッションが毎回「くればぁ社とは何か」「なぜ静的エクスポートなのか」「150m はなぜ余剰在庫なのか」を推測する必要がある。CLAUDE.md の作成だけで +3.0pt の改善が見込める。
