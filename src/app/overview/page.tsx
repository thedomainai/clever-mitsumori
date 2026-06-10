'use client'

import { useState } from 'react'

export default function OverviewPage() {
  const [expandedUnknowns, setExpandedUnknowns] = useState<Record<string, boolean>>({})

  const toggleUnknown = (id: string) => {
    setExpandedUnknowns((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-12 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clever プロダクト全体像</h1>
        <p className="mt-1 text-sm text-slate-500">
          くればぁ様 EC運用の業務課題を解決するデータフロー・ロジック・アウトプットの全体設計
        </p>
        <p className="mt-2 text-xs text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-1 align-middle" />
          赤マーク = 未確定・要確認の項目
        </p>
      </div>

      {/* ============================================================ */}
      {/* Section 0: Pain Points */}
      {/* ============================================================ */}
      <section>
        <SectionHeader number="0" title="解決したい業務課題" subtitle="現状の Pain Point → だからこのツールが必要" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PainCard
            title="見積もり作成が遅い"
            who="営業担当者"
            scene="会社に直接来る問い合わせ（EC経由ではない）に対して見積もりを作る業務"
            pain="各ECサイト（楽天/Yahoo/Amazon）を個別に確認し、現在の出し値を手動で調べている。在庫表も別で確認が必要"
            goal="問い合わせ → すぐに価格・在庫を確認して回答（キーエンス的な営業速度）"
          />
          <PainCard
            title="価格情報が散在"
            who="EC運用担当"
            scene="仕入価格が変わったとき、各ECサイトの販売価格を更新する業務"
            pain="各サイトの価格設定は戦略的に分けておらず実質同一価格だが、更新は個別に行っている"
            goal="1箇所で仕入値を変えたら販売価格が自動計算 → CSV出力 → 各ECに手動反映"
          />
          <PainCard
            title="余剰在庫が見えない"
            who="営業担当者"
            scene="問い合わせ対応時・日常の営業活動"
            pain="在庫が余っている商品を営業が把握できず、提案機会を逃している"
            goal="余剰在庫を色分け表示 + 類似品の「ついで提案」をサポート"
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 1: MVP Data Flow */}
      {/* ============================================================ */}
      <section>
        <SectionHeader
          number="1"
          title="MVP データフロー詳細図"
          subtitle="見積もり単価リスト: 何のデータが・どこにあり・どう加工されて・何が出るか"
        />
        <p className="mt-2 text-xs text-slate-500">
          MVP =「営業が問い合わせを受けたら、すぐに商品の単価・在庫・代替品を確認できるツール」
        </p>

        <div className="mt-6 space-y-8">

          {/* ===== ROW 1: DATA SOURCES ===== */}
          <div>
            <RowLabel label="1. データソース（どこにある何のデータか）" />
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-4 gap-4">

              <DataSourceDetailCard
                title="在庫表 CSV: メッシュ"
                file="zaiko-mesh.csv"
                origin="くればぁ様 スプレッドシート → CSV出力"
                hasUnknown
                fields={[
                  { name: '品番', note: 'PET-180T 等' },
                  { name: '目開き(μ)', note: '類似品マッチングに使用' },
                  { name: '幅(mm)' },
                  { name: 'ﾒｯｼｭor線径', note: 'テキスト。数値分離が必要？' },
                  { name: '材質', note: 'PET, SUS 等' },
                  { name: '残り(m)', note: '在庫数 = メートル単位' },
                  { name: '仕入値(m)', note: '1mあたりの仕入単価 → 計算式の入力' },
                  { name: '現行仕入値(m)', unknown: true, note: '仕入値と何が違う？どちらを計算に使う？' },
                ]}
                footnote="共通キー列あり → 紐付け挫折済み、使用しない"
              />

              <DataSourceDetailCard
                title="在庫表 CSV: ネトロン"
                file="zaiko-netoron.csv"
                origin="くればぁ様 スプレッドシート → CSV出力"
                fields={[
                  { name: '品番', note: 'C-WF9 等' },
                  { name: 'カラー' },
                  { name: '幅(mm)' },
                  { name: '仕切り単価/m', note: '= EC販売価格（計算式の出力結果）' },
                  { name: '残り(m)' },
                  { name: '仕入値', note: '計算式の入力' },
                ]}
                footnote="共通キー列あり → 紐付け挫折済み、使用しない"
              />

              <DataSourceDetailCard
                title="在庫表 CSV: トリカルネット"
                file="zaiko-torikaru.csv"
                origin="くればぁ様 スプレッドシート → CSV出力"
                fields={[
                  { name: '品番', note: 'N-2 等' },
                  { name: 'カラー' },
                  { name: '幅(mm)' },
                  { name: '仕切り単価/m', note: '= EC販売価格（計算式の出力結果）' },
                  { name: '残り(m)' },
                  { name: '仕入値(㎡)' },
                  { name: '仕入値(m)', note: '計算式の入力' },
                ]}
                footnote="共通キー列あり → 紐付け挫折済み、使用しない"
              />

              <DataSourceDetailCard
                title="在庫表 CSV: 端材"
                file="zaiko-hazai.csv"
                origin="くればぁ様 スプレッドシート → CSV出力"
                excluded
                fields={[
                  { name: '品番' },
                  { name: '目開きμ' },
                  { name: '巾(mm)' },
                  { name: 'ﾒｯｼｭor線径' },
                ]}
                footnote="端材は販売対象外（サンプル出し用の在庫管理のみ）→ 対象外確定"
              />
            </div>

            <div className="mt-4 p-3 border border-slate-200 rounded-xl bg-white">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Q&amp;Aで確定した事項</p>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li>• <strong>仕切り単価/m = EC販売価格</strong>（計算式の出力結果がCSVに記録されている）</li>
                <li>• <strong>共通キー → 不使用</strong>（社内で紐付けを試みたが挫折。削除して構わない）</li>
                <li>• <strong>端材 → 対象外</strong>（販売しない。サンプル出し用の在庫管理のみ）</li>
                <li>• <strong>カット品の定義</strong> = 生地幅×m数でカットしただけのもの。加工品（2次加工）は対象外</li>
                <li>• <strong>類似品の基準</strong> = 目開きまたはメッシュ数が同じ/近いもの（実装と一致）</li>
                <li>• <strong>余剰在庫</strong> = 3反(150m)以上（実装と一致）</li>
              </ul>
            </div>
          </div>

          <FlowArrowDown label="CSV取り込み（手動アップロード） → PapaParse でパース → UnifiedProduct に正規化" />

          {/* ===== ROW 2: UNIFIED DATA MODEL ===== */}
          <div>
            <RowLabel label="2. 統合データモデル（中間データ構造）" />
            <div className="mt-3 p-5 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-bold text-slate-900">UnifiedProduct</h4>
                <span className="text-[11px] text-slate-400">実装済み / localStorage に保存</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
                <FieldChip name="id" type="UUID" />
                <FieldChip name="productType" type="mesh|netoron|trikaru" />
                <FieldChip name="productCode" type="品番" />
                <FieldChip name="commonKey" type="共通キー" note="不使用（削除可）" />
                <FieldChip name="location" type="エリア/場所" />
                <FieldChip name="shelfLevel" type="棚段" />
                <FieldChip name="material" type="材質" note="meshのみ" />
                <FieldChip name="meshSize" type="目開き(μ)" note="meshのみ" />
                <FieldChip name="meshCount" type="ﾒｯｼｭor線径" note="meshのみ" />
                <FieldChip name="width" type="幅(mm)" />
                <FieldChip name="color" type="カラー" note="netoron/trikaruのみ" />
                <FieldChip name="stockQuantity" type="残り(m)" />
                <FieldChip name="inventoryStatus" type="判定結果" />
                <FieldChip name="purchasePrice" type="仕入値(m)" />
                <FieldChip name="currentPurchasePrice" type="現行仕入値" unknown note="使用箇所なし" />
                <FieldChip name="unitPrice" type="仕切り単価/m" note="= EC販売価格" />
                <FieldChip name="purchasePricePerSqm" type="仕入値(㎡)" unknown note="使用箇所なし" />
                <FieldChip name="arrivalDate" type="入荷日" />
                <FieldChip name="lastShipmentDate" type="最終出荷日" />
              </div>
              <UnknownInline className="mt-3" text="unitPrice（仕切り単価）= EC販売価格であることが判明。計算結果の検証に使える。currentPurchasePrice / purchasePricePerSqm の用途は引き続き不明" />
            </div>
          </div>

          <FlowArrowDown label="検索クエリ入力 → フィルタリング → 各ロジックを適用" />

          {/* ===== ROW 3: PROCESSING LOGIC ===== */}
          <div>
            <RowLabel label="3. 加工ロジック（3つの処理エンジン）" />
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Logic A: Price Calculation */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-bold text-slate-900">A. 価格計算エンジン</h4>
                  <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded border border-rose-200">要件と乖離</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 border border-slate-200 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">要件の計算式（Q&amp;Aで確認済み）</p>
                    <p className="mt-1.5 text-xs font-mono text-slate-800">
                      販売価格 = 固定費 + 仕入単価 ÷ (1 − 利益率) × カット長
                    </p>
                    <div className="mt-2 space-y-1">
                      <ParamRow name="固定費" value="6,000円" note="全商品一律（Q&Aで確定）" />
                      <ParamRow name="仕入単価" value="仕入値(m)" note="CSVから取得" />
                      <ParamRow name="利益率" value="?" unknown note="何%？商品/カテゴリ/一律？" />
                      <ParamRow name="カット長" value="?" unknown note="注文時指定？固定値？何m？" />
                    </div>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">現在の実装</p>
                    <p className="mt-1.5 text-xs font-mono text-slate-800">
                      unitPrice = 仕入値 × 1.5（markupRate）
                    </p>
                    <p className="text-xs font-mono text-slate-800">
                      税込 = unitPrice × 1.1（taxRate）
                    </p>
                    <div className="mt-2 space-y-1">
                      <ParamRow name="fixedCost" value="6000" note="定義済み・値は正しいが計算に未使用" />
                      <ParamRow name="processingCost" value="500" unknown note="定義済みだが計算に未使用" />
                      <ParamRow name="markupRate" value="1.5" unknown note="要件の利益率と対応？" />
                      <ParamRow name="taxRate" value="1.1" note="消費税10%" />
                    </div>
                  </div>

                  <UnknownInline text="計算式と固定費(6,000円)は確定。残り「利益率」「カット長」の2パラメータが未確定。現在の実装（仕入値×1.5）を要件の計算式に置き換える必要あり。仕切り単価/m（= EC販売価格）との突合で計算結果を検証可能" />
                </div>
              </div>

              {/* Logic B: Inventory Status */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-bold text-slate-900">B. 在庫ステータス判定</h4>
                  <span className="text-[11px] text-slate-400">実装済み</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 border border-slate-200 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">判定ロジック</p>
                    <div className="mt-2 space-y-2">
                      <StatusRule condition="残り(m) = 0" result="納期確認" resultNote="DELIVERY_INQUIRY" />
                      <StatusRule condition="残り(m) ≥ 150" result="余剰在庫" resultNote="EXCESS — 150m = 3反 (1反=50m)" />
                      <StatusRule condition="上記以外" result="在庫あり" resultNote="IN_STOCK" />
                    </div>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">要件との整合</p>
                    <ul className="mt-1.5 space-y-1 text-[11px] text-slate-700">
                      <li>• 在庫0 → 納期回答 — 一致</li>
                      <li>• 3反以上 → 余剰 (150m で実装) — 一致</li>
                    </ul>
                  </div>

                  <UnknownInline text="要件では余剰在庫の「背景色を赤く」だが実装では黄色。表示色を確認" />
                </div>
              </div>

              {/* Logic C: Alternative Finder */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-bold text-slate-900">C. 類似品マッチング</h4>
                  <span className="text-[11px] text-slate-400">実装済み</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 border border-slate-200 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">スコアリング（加重平均）</p>
                    <div className="mt-2 space-y-1.5">
                      <ScoreWeight label="目開き(μ)の近さ" weight="40%" note="meshのみ有効" />
                      <ScoreWeight label="幅(mm)の近さ" weight="30%" note="全カテゴリ" />
                      <ScoreWeight label="在庫量" weight="20%" note="多いほど高スコア" />
                      <ScoreWeight label="仕入値の近さ" weight="10%" note="価格帯が近い" />
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400">閾値: スコア ≥ 0.3 のみ表示 / 最大5件</p>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">フィルタ条件</p>
                    <ul className="mt-1.5 space-y-1 text-[11px] text-slate-700">
                      <li>• 同じ productType（mesh→mesh のみ）</li>
                      <li>• 在庫あり（stockQuantity &gt; 0）</li>
                      <li>• 自分自身を除外</li>
                    </ul>
                  </div>

                  <UnknownInline text="ネトロン/トリカルには目開き(meshSize)がないため、スコアの40%が常に0になる。これらのカテゴリでは何を類似の基準にするか？" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <UnknownCard
                id="u3"
                title="利益率・カット長の2パラメータが未確定"
                expanded={expandedUnknowns['u3']}
                onToggle={() => toggleUnknown('u3')}
                detail="計算式と固定費(6,000円)は確定済み。残り2つ: (1) 利益率 — 何%か、商品ごと/カテゴリごと/一律か。(2) カット長 — 注文時に顧客が指定するm数か、商品マスタの固定値か。CSVの仕切り単価/m（= EC販売価格）と突合すれば、既存データから逆算できる可能性がある"
                impact="この2つが決まれば価格計算エンジンの実装を要件の計算式に置き換えられる"
              />
            </div>
          </div>

          <FlowArrowDown label="ロジック適用結果を統合 → 検索結果として表示" />

          {/* ===== ROW 4: OUTPUTS ===== */}
          <div>
            <RowLabel label="4. アウトプット（画面に何が出るか）" />
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Output A: MVP */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-base font-bold text-slate-900">見積もり単価リスト</h4>
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded">MVP</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  営業が商品名/規格を入力 → 単価・在庫・代替品を即座に確認。見積書システム（トラックス）とは非連携。リスト表示。
                </p>

                <div className="space-y-1">
                  <OutputField label="品番" source="productCode" />
                  <OutputField label="材質" source="material" note="meshのみ" />
                  <OutputField label="目開き(μ)" source="meshSize" note="meshのみ" />
                  <OutputField label="メッシュ/線径" source="meshCount" note="meshのみ" />
                  <OutputField label="カラー" source="color" note="netoron/trikaruのみ" />
                  <OutputField label="幅(mm)" source="width" />
                  <OutputField label="在庫(m)" source="stockQuantity" />
                  <OutputField label="在庫ステータス" source="inventoryStatus" note="在庫あり/納期確認/余剰在庫" />
                  <OutputField label="仕入値(m)" source="purchasePrice" />
                  <OutputField label="販売単価(税抜)" source="計算結果" unknown note="計算式が未確定" />
                  <OutputField label="販売単価(税込)" source="計算結果" unknown note="計算式が未確定" />
                  <OutputField label="代替品リスト" source="alternative-finder" note="在庫0の場合に表示" />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">表示先</p>
                  <p className="text-xs text-slate-600 mt-0.5">本ツール（Clever）の商品検索画面 — /search</p>
                </div>
              </div>

              {/* Output B: Future */}
              <div className="space-y-5">
                <div className="p-5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-bold text-slate-900">EC価格一元管理マスタ</h4>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">Phase 2</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li>• 全ECサイト（楽天/Yahoo/Amazon）の価格を1シートに集約</li>
                    <li>• 仕入変更 → 販売価格自動計算</li>
                    <li>• 価格変更履歴の保持</li>
                    <li>• Excel/CSVダウンロード → 各ECに手動反映</li>
                  </ul>
                  <UnknownInline className="mt-3" text="EC価格データの取り込み方法（各サイトのCSV出力？手入力？）が未定のため、Phase 2に分類" />
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-bold text-slate-900">営業アシスト表示</h4>
                    <span className="text-[11px] text-slate-400">MVP内・実装済み</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li>• 余剰在庫の色分け表示（≥150m）</li>
                    <li>• 在庫0品の「納期確認」フラグ</li>
                    <li>• 代替品の類似度スコア付き表示</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 2: All Unknowns Summary */}
      {/* ============================================================ */}
      <section>
        <SectionHeader number="2" title="未確定事項の一覧" subtitle="MVPを完成させるために確認が必要な項目" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-700 rounded-tl-lg w-8">#</th>
                <th className="px-4 py-3 font-semibold text-slate-700">未確定事項</th>
                <th className="px-4 py-3 font-semibold text-slate-700">カテゴリ</th>
                <th className="px-4 py-3 font-semibold text-slate-700">影響度</th>
                <th className="px-4 py-3 font-semibold text-slate-700 rounded-tr-lg">確認先</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <UnknownRow n={1} item="「利益率」の値と適用単位" category="パラメータ" impact="critical" who="くればぁ様" detail="何%か？商品ごと/カテゴリごと/一律か？ CSVの仕切り単価から逆算して検証可能" />
              <UnknownRow n={2} item="「カット長」の定義" category="パラメータ" impact="critical" who="くればぁ様" detail="注文時に顧客が指定するm数？商品マスタに固定値？1mあたりの単価ならカット長=1で固定？" />
              <UnknownRow n={3} item="「仕入値」と「現行仕入値」の違い" category="データ" impact="high" who="くればぁ様" detail="meshのCSVに両方存在。どちらを計算式の入力に使うか" />
              <UnknownRow n={4} item="ネトロン/トリカルの類似品基準" category="ロジック" impact="medium" who="サイレコ内部" detail="目開き(meshSize)がないカテゴリでは現在の類似品スコアの40%が常に0になる。何を基準にするか" />
              <UnknownRow n={5} item="余剰在庫の表示色" category="UI" impact="low" who="くればぁ様" detail="要件では「赤」、実装では「黄」。どちらが正しいか" />
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 3: Scope */}
      {/* ============================================================ */}
      <section>
        <SectionHeader number="3" title="スコープの線引き" subtitle="今やること vs 将来やること" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <ScopeCard
            title="MVP（今回）"
            items={[
              { text: 'CSV在庫表の取り込み（mesh/netoron/trikaru）', done: true },
              { text: '統合データモデルへの正規化', done: true },
              { text: '商品検索（品番/規格/材質等でフィルタ）', done: true },
              { text: '在庫ステータス判定（0→納期確認/≥150→余剰）', done: true },
              { text: '類似品マッチング（スコアリング）', done: true },
              { text: '販売価格の自動計算', done: false },
              { text: '余剰在庫の色分け表示', done: true },
            ]}
          />
          <ScopeCard
            title="Phase 2"
            items={[
              { text: 'ECサイト価格データの取り込み', done: false },
              { text: '価格一元管理マスタ画面', done: false },
              { text: '価格変更履歴の保持', done: false },
              { text: 'Excel/CSVダウンロード', done: false },
            ]}
          />
          <ScopeCard
            title="スコープ外"
            items={[
              { text: '端材（サンプル出し用、販売対象外）', done: false },
              { text: '加工品の価格計算（2次加工品）', done: false },
              { text: 'ECサイトへの価格自動反映（API連携）', done: false },
              { text: '見積書システム（トラックス）との連携', done: false },
              { text: '顧客向けHP上での価格確認機能', done: false },
              { text: 'リアルタイム在庫同期', done: false },
            ]}
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 4: Data Risk */}
      {/* ============================================================ */}
      <section>
        <SectionHeader number="4" title="データ整備リスク" subtitle="プロジェクト最大のリスク = データの状態" />
        <div className="mt-4 p-5 bg-white border border-slate-200 rounded-xl">
          <p className="text-sm font-bold text-slate-900">MTG（5/13）での発言:</p>
          <blockquote className="mt-2 pl-3 border-l-2 border-slate-300 text-sm text-slate-600 italic">
            「データベースが完成された状態であればロジックの実装は簡単。データベース自体に入力不備がある場合は、実装以外のオペレーション（データ整備）が必要になり、くればぁ様側にも負荷がかかる。これがこのプロジェクトが失敗する唯一のリスク」
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 border border-slate-200 rounded-lg">
              <p className="text-xs font-bold text-slate-800">カラム不整合</p>
              <p className="mt-1 text-xs text-slate-500">各シートでカラム名・順序・数が異なる可能性 → 現時点で3カテゴリ分のパーサーは個別実装済み</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <p className="text-xs font-bold text-slate-800">SKU表記揺れ</p>
              <p className="mt-1 text-xs text-slate-500">同一商品が異なる品番で登録されている可能性 → ECデータとの紐付けに影響</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <p className="text-xs font-bold text-slate-800">空セル・欠損</p>
              <p className="mt-1 text-xs text-slate-500">必須フィールド（仕入値・幅・残り）が空の場合、その行はスキップされる（現在の実装）</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ================================================================ */
/* Sub Components */
/* ================================================================ */

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{number}</span>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

function RowLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

function PainCard({ title, who, scene, pain, goal }: { title: string; who: string; scene: string; pain: string; goal: string }) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <div className="text-[11px] space-y-1.5">
        <p><span className="font-semibold text-slate-400">誰:</span> <span className="text-slate-700">{who}</span></p>
        <p><span className="font-semibold text-slate-400">場面:</span> <span className="text-slate-700">{scene}</span></p>
        <p><span className="font-semibold text-slate-400">困りごと:</span> <span className="text-slate-700">{pain}</span></p>
        <p className="pt-1 border-t border-slate-100"><span className="font-semibold text-slate-400">ゴール:</span> <span className="text-slate-800 font-medium">{goal}</span></p>
      </div>
    </div>
  )
}

function DataSourceDetailCard({ title, file, origin, hasUnknown, excluded, fields, footnote }: {
  title: string
  file: string
  origin: string
  hasUnknown?: boolean
  excluded?: boolean
  fields: Array<{ name: string; unknown?: boolean; note?: string }>
  footnote?: string
}) {
  return (
    <div className={`p-4 border rounded-xl ${excluded ? 'bg-slate-50/50 border-dashed border-slate-300' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className={`text-sm font-bold ${excluded ? 'text-slate-400' : 'text-slate-900'}`}>{title}</h4>
        {excluded && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-bold rounded">対象外</span>}
      </div>
      <p className={`mt-1 text-[10px] font-mono ${excluded ? 'text-slate-300' : 'text-slate-400'}`}>{file}</p>
      <p className={`text-[10px] ${excluded ? 'text-slate-300' : 'text-slate-400'}`}>{origin}</p>

      <div className="mt-3 space-y-0.5">
        {fields.map((f) => (
          <div key={f.name} className="flex items-start gap-1.5 text-[11px] px-1.5 py-0.5 rounded">
            {f.unknown
              ? <span className="text-rose-400 mt-px font-bold text-[10px]">?</span>
              : <span className={`mt-px ${excluded ? 'text-slate-200' : 'text-slate-300'}`}>·</span>
            }
            <span className={`font-mono ${excluded ? 'text-slate-400' : f.unknown ? 'text-slate-800' : 'text-slate-600'}`}>{f.name}</span>
            {f.note && <span className="text-slate-400">— {f.note}</span>}
          </div>
        ))}
      </div>

      {footnote && (
        <p className="mt-3 text-[10px] text-slate-400 italic">{footnote}</p>
      )}
    </div>
  )
}

function FieldChip({ name, type, unknown, note }: { name: string; type: string; unknown?: boolean; note?: string }) {
  return (
    <div className={`px-2 py-1.5 border rounded-lg ${unknown ? 'border-rose-200 bg-rose-50/40' : 'border-slate-150 bg-slate-50/50'}`} title={note}>
      <p className={`text-[11px] font-mono font-semibold ${unknown ? 'text-slate-800' : 'text-slate-700'}`}>
        {unknown && <span className="text-rose-400 mr-1">?</span>}
        {name}
      </p>
      <p className="text-[9px] text-slate-400">{type}</p>
      {note && <p className="text-[9px] text-slate-400 mt-0.5">{note}</p>}
    </div>
  )
}

function UnknownCard({ id, title, expanded, onToggle, detail, impact }: {
  id: string; title: string; expanded?: boolean; onToggle: () => void; detail: string; impact: string
}) {
  return (
    <div className="p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" onClick={onToggle}>
      <div className="flex items-start gap-2">
        <span className="text-slate-400 text-sm mt-0.5">{expanded ? '▼' : '▶'}</span>
        <div className="flex-1">
          <h5 className="text-xs font-bold text-slate-800">
            <span className="text-rose-400 mr-1">?</span>
            {title}
          </h5>
          {expanded && (
            <div className="mt-2 space-y-2 text-[11px]">
              <p className="text-slate-600">{detail}</p>
              <p className="text-slate-500 font-medium">影響: {impact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UnknownInline({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`flex items-start gap-1.5 p-2 border border-dashed border-slate-300 rounded text-[10px] text-slate-500 ${className}`}>
      <span className="font-bold text-rose-400 flex-shrink-0">?</span>
      {text}
    </div>
  )
}

function ParamRow({ name, value, unknown, note }: { name: string; value: string; unknown?: boolean; note: string }) {
  return (
    <div className="flex items-baseline gap-2 text-[11px]">
      <span className="font-mono font-semibold text-slate-600 w-24 flex-shrink-0">{name}</span>
      <span className={`font-mono font-bold ${unknown ? 'text-rose-500' : 'text-slate-800'}`}>{value}</span>
      <span className="text-slate-400">{note}</span>
    </div>
  )
}

function StatusRule({ condition, result, resultNote }: { condition: string; result: string; resultNote: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="font-mono text-slate-700 flex-1">{condition}</span>
      <span className="text-slate-300">→</span>
      <span className="px-1.5 py-0.5 bg-slate-100 rounded font-semibold text-slate-700">{result}</span>
      <span className="text-[9px] text-slate-400">{resultNote}</span>
    </div>
  )
}

function ScoreWeight({ label, weight, note }: { label: string; weight: string; note: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-10 text-right font-bold text-slate-600 font-mono">{weight}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-slate-400 rounded-full" style={{ width: weight }} />
      </div>
      <span className="text-slate-700 flex-shrink-0">{label}</span>
      <span className="text-[9px] text-slate-400">{note}</span>
    </div>
  )
}

function OutputField({ label, source, unknown, note }: { label: string; source: string; unknown?: boolean; note?: string }) {
  return (
    <div className={`flex items-baseline gap-2 px-2 py-1 rounded text-[11px] ${unknown ? 'bg-rose-50/40' : ''}`}>
      {unknown
        ? <span className="text-rose-400 font-bold text-[10px]">?</span>
        : <span className="text-slate-300">·</span>
      }
      <span className="font-semibold text-slate-700 w-28 flex-shrink-0">{label}</span>
      <span className="text-slate-400 font-mono text-[10px]">← {source}</span>
      {note && <span className="text-slate-400 text-[10px]">{note}</span>}
    </div>
  )
}

function FlowArrowDown({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="w-px h-6 bg-slate-200" />
      <div className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
        <p className="text-[10px] text-slate-500 text-center">{label}</p>
      </div>
      <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
      </svg>
    </div>
  )
}

function UnknownRow({ n, item, category, impact, who, detail }: {
  n: number; item: string; category: string; impact: string; who: string; detail: string
}) {
  const impactLabel: Record<string, string> = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  }
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{n}</td>
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900 text-sm">{item}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{detail}</p>
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs">{category}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          impact === 'critical' ? 'bg-rose-50 text-rose-600 border border-rose-200'
          : impact === 'high' ? 'bg-slate-100 text-slate-700'
          : 'bg-slate-50 text-slate-500'
        }`}>{impactLabel[impact]}</span>
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs">{who}</td>
    </tr>
  )
}

function ScopeCard({ title, items }: {
  title: string; items: Array<{ text: string; done: boolean }>
}) {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-xs flex items-start gap-2">
            {item.done
              ? <span className="text-slate-400 flex-shrink-0">✓</span>
              : <span className="text-slate-300 flex-shrink-0">○</span>
            }
            <span className={item.done ? 'text-slate-700' : 'text-slate-400'}>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
