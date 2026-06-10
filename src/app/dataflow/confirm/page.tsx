'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

export default function DataFlowConfirmPage() {
  return (
    <div className="max-w-4xl mx-auto">

      {/* ===== HEADER ===== */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">確認資料</span>
          <span className="text-sm text-slate-400">6/18 MTG 確認予定</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clever — データの流れと確認事項</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          本ページでは、くればぁ様の在庫CSVデータがツール内でどのように処理され、<br />
          EC販売価格の算出・商品検索に使われるかの全体像をご説明します。
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/dataflow" className="text-xs text-slate-600 hover:text-slate-800 underline underline-offset-2">
            開発者向けデータフロー図を見る
          </Link>
        </div>
      </div>

      {/* ===== TOOL PURPOSE ===== */}
      <Section>
        <SectionHeader num="0" title="このツールでできること" />
        <div className="bg-slate-50/60 border border-slate-200 rounded-lg p-5">
          <p className="text-[15px] text-slate-800 leading-relaxed">
            くればぁ様がスプレッドシートで管理されている<strong>メッシュ・ネトロン・トリカルの在庫データ（CSV）</strong>をツールに取り込み、
            営業担当の方がブラウザ上で<strong>商品検索</strong>・<strong>EC販売価格の確認</strong>・<strong>在庫切れ時の代替品提案</strong>を行えるようにします。
          </p>
          <div className="grid grid-cols-3 gap-4 mt-5">
            <FeatureCard
              icon={<SearchIcon />}
              title="商品検索"
              desc="品番・材質・幅・在庫状態など複数条件で検索。結果は一覧表で表示されます。"
            />
            <FeatureCard
              icon={<CalcIcon />}
              title="EC販売価格の自動計算"
              desc="仕入値からEC販売価格を自動算出。固定費・粗利率を加味した計算式を使用します。"
            />
            <FeatureCard
              icon={<AltIcon />}
              title="代替品の提案"
              desc="在庫切れの商品に対し、スペックが近い在庫あり商品を自動で提案します。"
            />
          </div>
        </div>
      </Section>

      {/* ===== DATA FLOW ===== */}
      <Section>
        <SectionHeader num="1" title="データの流れ" />

        {/* Step 1 */}
        <FlowStep
          num="1"
          title="CSVファイルの取り込み"
          color="blue"
          desc="くればぁ様が管理されているスプレッドシートからCSV出力したファイルを、ブラウザ画面でアップロードします。"
        >
          <p className="text-sm text-slate-600 mb-3">対応している CSV ファイルは以下の3種類です。</p>
          <div className="grid grid-cols-3 gap-3">
            <CsvCard
              name="メッシュ在庫"
              file="zaiko-mesh.csv"
              color="blue"
              items={['品番', '材質', '目開き(μ)', 'メッシュ/線径', '幅', '残り(m)', '仕入値']}
            />
            <CsvCard
              name="ネトロン在庫"
              file="zaiko-netoron.csv"
              color="emerald"
              items={['品番', 'カラー', '幅', '残り(m)', '仕入値', '仕切り単価']}
            />
            <CsvCard
              name="トリカル在庫"
              file="zaiko-torikaru.csv"
              color="violet"
              items={['品番', 'カラー', '幅', '残り(m)', '仕入値', '仕切り単価']}
            />
          </div>
        </FlowStep>

        <FlowConnector />

        {/* Step 2 */}
        <FlowStep
          num="2"
          title="データの整理・変換"
          color="emerald"
          desc="取り込んだCSVデータを、3種類の商品カテゴリで共通に扱える形に自動変換します。"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-sm font-bold text-slate-700 mb-2">自動で行われる処理</p>
              <div className="space-y-2">
                <AutoStep text="CSVファイルの読み込みと行ごとのデータ分解" />
                <AutoStep text="カラム名の表記ゆれを統一（全角→半角など）" />
                <AutoStep text="商品カテゴリに応じたデータ変換" />
                <AutoStep text="必須項目（品番・幅・在庫・仕入値）の確認。不足行は除外" />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-sm font-bold text-slate-700 mb-2">在庫ステータスの自動判定</p>
              <div className="space-y-2.5">
                <StatusRow color="red" label="納期確認" condition="残り = 0m の場合" />
                <StatusRow color="amber" label="余剰在庫" condition="残り 150m 以上（3反以上）" />
                <StatusRow color="emerald" label="在庫あり" condition="上記以外" />
              </div>
              <p className="text-xs text-slate-400 mt-3">※ 150m = 3反（1反 = 50m）を余剰在庫の目安としています</p>
            </div>
          </div>
        </FlowStep>

        <FlowConnector />

        {/* Step 3 */}
        <FlowStep
          num="3"
          title="データの保存"
          color="violet"
          desc="変換されたデータは、お使いのブラウザ内に保存されます。サーバーへの送信やインターネット接続は不要です。"
        >
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              <strong>ご注意:</strong> データはブラウザ内に保存されるため、
              ブラウザのキャッシュを削除すると消えます。
              最新のCSVファイルを再度アップロードすれば復元できます。
            </p>
          </div>
        </FlowStep>

        <FlowConnector />

        {/* Step 4 */}
        <FlowStep
          num="4"
          title="検索・計算・代替品提案"
          color="amber"
          desc="営業担当の方が検索条件を入力すると、以下の3つの処理が自動で行われます。"
        >
          <div className="space-y-3">

            {/* 4-A: Search */}
            <ProcessCard
              letter="A"
              title="商品検索"
              desc="入力された条件（商品カテゴリ・品番・材質・幅・在庫状態など）に該当する商品を絞り込みます。"
            >
              <p className="text-xs text-slate-500">
                複数の条件を同時に指定できます（すべての条件に合致する商品のみ表示）。<br />
                品番・幅・在庫量・仕入値などで並べ替えが可能です。
              </p>
            </ProcessCard>

            {/* 4-B: Price */}
            <ProcessCard
              letter="B"
              title="EC販売価格の計算"
              desc="仕入値をもとに、EC販売価格を自動で計算します。"
              warn
            >
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-xs font-bold text-slate-500 mb-2">現在の仮計算式</p>
                  <p className="text-sm text-slate-700 font-semibold text-center py-1">販売単価 = 仕入値 x 1.5</p>
                  <p className="text-xs text-slate-400 mt-1 text-center">（暫定。正式な計算式に置き換え予定）</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs font-bold text-slate-700">6/9 MTG で合意した計算式</p>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-300">実装待ち</span>
                  </div>
                  <div className="bg-white rounded border border-slate-200 p-2 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      販売価格 = (仕入単価 x カット長 + 固定費) / (1 - 粗利率)
                    </p>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p><strong>仕入単価:</strong> CSVの仕入値 <span className="text-slate-800 font-semibold">→ 確認B</span></p>
                    <p><strong>カット長:</strong> <span className="text-slate-800 font-semibold">データの所在が未定 → 確認D</span></p>
                    <p><strong>固定費:</strong> 6,000円（デフォルト / 商品ごとに変更可）</p>
                    <p><strong>粗利率:</strong> 約50%（デフォルト / 全商品共通）</p>
                  </div>
                </div>
              </div>
            </ProcessCard>

            {/* 4-C: Alternatives */}
            <ProcessCard
              letter="C"
              title="代替品の提案"
              desc="在庫切れの商品に対して、スペックが近い在庫あり商品を自動で最大5件まで提案します。"
            >
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-1.5">類似度の判定基準</p>
                  <div className="space-y-1">
                    <SimilarityRow label="目開き(μ) の近さ" pct={40} note="メッシュのみ" />
                    <SimilarityRow label="幅(mm) の近さ" pct={30} />
                    <SimilarityRow label="在庫量の多さ" pct={20} />
                    <SimilarityRow label="仕入値の近さ" pct={10} />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <p className="text-xs font-bold text-slate-700 mb-1">ご注意（確認E）</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    ネトロン・トリカルには「目開き」データがないため、
                    類似度スコアの40%分が常にゼロになります。
                    代替基準の調整が必要になる可能性があります。
                  </p>
                </div>
              </div>
            </ProcessCard>
          </div>
        </FlowStep>

        <FlowConnector />

        {/* Step 5 */}
        <FlowStep
          num="5"
          title="検索結果の表示"
          color="indigo"
          desc="検索結果が一覧表として画面に表示されます。営業担当の方はこの画面で商品情報・価格・在庫状態を確認できます。"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-sm font-bold text-slate-700 mb-2">表示される情報</p>
              <div className="space-y-1.5">
                <ResultItem label="品番" />
                <ResultItem label="材質（メッシュ）/ カラー（ネトロン・トリカル）" />
                <ResultItem label="目開き（メッシュのみ）" />
                <ResultItem label="幅 (mm)" />
                <ResultItem label="在庫量 (m) + 在庫ステータス" />
                <ResultItem label="仕入値 (m)" />
                <ResultItem label="EC販売単価（税抜・税込）" />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-sm font-bold text-slate-700 mb-2">代替品ダイアログ</p>
              <p className="text-xs text-slate-500 mb-3">在庫切れ商品の行で「類似品を表示」ボタンを押すと表示されます。</p>
              <div className="space-y-1.5">
                <ResultItem label="候補商品の品番・幅・在庫量" />
                <ResultItem label="類似度スコア（0〜100%）" />
                <ResultItem label="元の商品との差分（目開き・幅・価格の差を%表示）" />
                <ResultItem label="「幅が近く在庫が十分あります」等の提案理由" />
              </div>
            </div>
          </div>
        </FlowStep>
      </Section>

      {/* ===== CONFIRMATION ITEMS ===== */}
      <Section>
        <SectionHeader num="2" title="ご確認いただきたい事項" />
        <p className="text-sm text-slate-500 mb-6">
          以下の項目について、6/18 MTG でご確認をお願いいたします。<br />
          ツールの精度・使いやすさに直結する重要な確認事項です。
        </p>

        <div className="space-y-4">
          <ConfirmItem
            id="A"
            title="検索結果のダウンロード機能"
            status="未確認"
            question="検索結果を Excel / CSV でダウンロードする機能は必要ですか？"
            background="現在は画面上の一覧表示のみです。帳票出力やメール添付の用途がある場合は、ダウンロード機能を追加します。"
            who="くればぁ様"
          />
          <ConfirmItem
            id="B"
            title="仕入値として使うカラムの選択"
            status="未確認"
            question="EC販売価格の計算に使う「仕入値」は、CSVのどのカラムですか？"
            background={
              <>
                CSVファイルには複数の価格カラムが存在します。<br />
                <span className="mt-1 block" />
                <strong>メッシュ:</strong> 「仕入値(m)」と「現行仕入値(m)」の2つ<br />
                <strong>ネトロン:</strong> 「仕入値」と「仕切り単価/m」の2つ<br />
                <strong>トリカル:</strong> 「仕入値(m)」と「仕入値(㎡)」の2つ<br />
                <span className="mt-1 block" />
                どのカラムを販売価格計算の入力とするかをご指定ください。
              </>
            }
            who="くればぁ様"
          />
          <ConfirmItem
            id="C"
            title="EC販売価格の計算方向"
            status="部分回答済"
            question="ツール内で計算する方向で合意済み。最終確定は本フロー図のレビューをもって行います。"
            background={
              <>
                6/9 MTG で、EC販売価格は外部から取り込むのではなく、
                ツール内で「仕入値 → 販売価格」を計算する方向で合意しています。<br />
                計算式: <strong>販売価格 = (仕入単価 x カット長 + 固定費) / (1 - 粗利率)</strong>
              </>
            }
            who="くればぁ様"
          />
          <ConfirmItem
            id="D"
            title="「カット長」のデータソース"
            status="未確認"
            question="販売価格の計算に必要な「カット長」のデータは、どこにありますか？"
            background={
              <>
                計算式の中で「カット長」が必要ですが、現在のCSVファイルにはこのデータが含まれていません。<br />
                <span className="mt-1 block" />
                ・ CSVに追加できるか<br />
                ・ 全商品で固定値か、商品ごとに異なるか<br />
                ・ 別のデータソースがあるか<br />
                <span className="mt-1 block" />
                上記のいずれかをご教示ください。
              </>
            }
            who="くればぁ様"
          />
          <ConfirmItem
            id="E"
            title="ネトロン・トリカルの代替品基準"
            status="未確認"
            question="メッシュ以外の商品カテゴリで、代替品を選ぶ際に何を重視しますか？"
            background={
              <>
                メッシュの代替品選定では「目開き(μ)」が最大のマッチング基準（40%）ですが、
                ネトロン・トリカルにはこのデータがありません。<br />
                <span className="mt-1 block" />
                代わりに重視すべき基準があればお教えください。<br />
                例: カラーの一致、幅の近さ、在庫量の多さ など
              </>
            }
            who="中林 → くればぁ様"
          />
          <ConfirmItem
            id="F"
            title="仕入れ先データの紐づけ"
            status="確認中"
            question="各商品に仕入れ先の情報は紐づいていますか？"
            background="商品ごとに固定費が異なる場合、仕入れ先による絞り込みが必要になる可能性があります。紐づけが可能であれば、フィルタ条件に追加できます。"
            who="古川 確認中"
          />
        </div>
      </Section>

      {/* ===== FOOTER ===== */}
      <div className="mt-12 pt-6 border-t border-slate-200 mb-8">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <p>Clever — 在庫連動見積抽出ツール / データフロー確認資料</p>
          <p>作成: サイレコ / 更新: 2026年6月10日</p>
        </div>
      </div>
    </div>
  )
}


/* ================================================================ */
/* SUB-COMPONENTS                                                    */
/* ================================================================ */

function Section({ children }: { children: ReactNode }) {
  return <section className="mb-12">{children}</section>
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded bg-slate-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{num}</div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    </div>
  )
}

/* ---- Feature Card ---- */
function FeatureCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">{icon}</div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}

/* ---- Flow Step ---- */
function FlowStep({ num, title, desc, children }: {
  num: string; title: string; color?: string; desc: string; children: ReactNode
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {num}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

/* ---- Flow Connector ---- */
function FlowConnector() {
  return (
    <div className="flex justify-center py-2">
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-6 bg-slate-300" />
        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-400" />
      </div>
    </div>
  )
}

/* ---- CSV Card ---- */
function CsvCard({ name, file, items }: { name: string; file: string; color?: string; items: string[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600">{name}</span>
      </div>
      <p className="text-xs text-slate-400 font-mono mb-2">{file}</p>
      <div className="flex flex-wrap gap-1">
        {items.map(item => (
          <span key={item} className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{item}</span>
        ))}
      </div>
    </div>
  )
}

/* ---- Auto Step ---- */
function AutoStep({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-slate-600">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" />
      <span>{text}</span>
    </div>
  )
}

/* ---- Status Row ---- */
function StatusRow({ color, label, condition }: { color: string; label: string; condition: string }) {
  const dotColor: Record<string, string> = { red: 'bg-slate-800', amber: 'bg-slate-500', emerald: 'bg-slate-300' }
  const textColor: Record<string, string> = { red: 'text-slate-800', amber: 'text-slate-600', emerald: 'text-slate-500' }
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor[color]}`} />
        <span className={`text-sm font-semibold ${textColor[color]}`}>{label}</span>
      </div>
      <span className="text-xs text-slate-500">{condition}</span>
    </div>
  )
}

/* ---- Process Card ---- */
function ProcessCard({ letter, title, desc, warn, children }: {
  letter: string; title: string; desc: string; warn?: boolean; children: ReactNode
}) {
  return (
    <div className={`bg-white border ${warn ? 'border-slate-300' : 'border-slate-200'} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{letter}</span>
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        {warn && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-300">要確認あり</span>}
      </div>
      <p className="text-xs text-slate-500 mb-2">{desc}</p>
      {children}
    </div>
  )
}

/* ---- Similarity Row ---- */
function SimilarityRow({ label, pct, note }: { label: string; pct: number; note?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-right font-bold text-slate-600 flex-shrink-0">{pct}%</span>
      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full bg-slate-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-600">{label}</span>
      {note && <span className="text-slate-400">({note})</span>}
    </div>
  )
}

/* ---- Result Item ---- */
function ResultItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
      <span>{label}</span>
    </div>
  )
}

/* ---- Confirm Item ---- */
function ConfirmItem({ id, title, status, question, background, who }: {
  id: string; title: string; status: string; question: string; background: ReactNode; who: string
}) {
  const statusStyle = status === '未確認'
    ? 'bg-slate-800 text-white border-slate-800'
    : status === '確認中'
      ? 'bg-slate-100 text-slate-600 border-slate-300'
      : 'bg-white text-slate-500 border-slate-300'

  return (
    <div className="border border-slate-200 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded bg-slate-100 text-slate-700 text-sm font-bold flex items-center justify-center flex-shrink-0">{id}</span>
          <h4 className="text-base font-bold text-slate-900">{title}</h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-400">{who}</span>
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${statusStyle}`}>{status}</span>
        </div>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3">
        <p className="text-sm font-semibold text-slate-800">{question}</p>
      </div>
      <div className="text-xs text-slate-500 leading-relaxed">{background}</div>
    </div>
  )
}

/* ---- Icons ---- */
function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function CalcIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008ZM15 13.5h.008v.008H15V13.5Zm0 2.25h.008v.008H15v-.008ZM3.75 6.75h16.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V7.5a.75.75 0 0 1 .75-.75Z" />
    </svg>
  )
}

function AltIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  )
}
