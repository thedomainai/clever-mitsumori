'use client'

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'

type Transform = { x: number; y: number; scale: number }

const MIN_SCALE = 0.15
const MAX_SCALE = 2.5
const ZOOM_STEP = 0.12
const CANVAS_W = 1560
const CANVAS_H = 3200

export default function DataFlowPage() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tf, setTf] = useState<Transform>({ x: 0, y: 0, scale: 0.55 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  /* ---------- fit on mount ---------- */
  useEffect(() => {
    if (!wrapRef.current) return
    const { clientWidth: w, clientHeight: h } = wrapRef.current
    const s = Math.min(w / CANVAS_W, 1) * 0.92
    setTf({ x: (w - CANVAS_W * s) / 2, y: 20, scale: s })
  }, [])

  /* ---------- pan ---------- */
  const onDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
  }, [])
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    setTf((p) => ({ ...p, x: p.x + e.clientX - last.current.x, y: p.y + e.clientY - last.current.y }))
    last.current = { x: e.clientX, y: e.clientY }
  }, [])
  const onUp = useCallback(() => { dragging.current = false }, [])

  /* ---------- wheel: pinch/ctrl+wheel → zoom, two-finger swipe → pan ---------- */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        setTf((p) => {
          const dir = e.deltaY < 0 ? 1 : -1
          const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, p.scale * (1 + dir * ZOOM_STEP)))
          const r = ns / p.scale
          return { scale: ns, x: mx - (mx - p.x) * r, y: my - (my - p.y) * r }
        })
      } else {
        setTf((p) => ({ ...p, x: p.x - e.deltaX, y: p.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const zoom = (dir: 1 | -1) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.width / 2, cy = rect.height / 2
    setTf((p) => {
      const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, p.scale * (1 + dir * ZOOM_STEP)))
      const r = ns / p.scale
      return { scale: ns, x: cx - (cx - p.x) * r, y: cy - (cy - p.y) * r }
    })
  }

  const fitScreen = () => {
    if (!wrapRef.current) return
    const { clientWidth: w, clientHeight: h } = wrapRef.current
    const s = Math.min(w / CANVAS_W, 1) * 0.92
    setTf({ x: (w - CANVAS_W * s) / 2, y: 20, scale: s })
  }

  return (
    <div
      ref={wrapRef}
      className="fixed top-14 left-0 right-0 bottom-0 overflow-hidden select-none"
      style={{ background: '#f5f6f8', backgroundImage: 'radial-gradient(circle, #d8dbe2 0.8px, transparent 0.8px)', backgroundSize: '24px 24px', cursor: dragging.current ? 'grabbing' : 'grab' }}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
    >
      {/* ====== CANVAS ====== */}
      <div style={{ transform: `translate(${tf.x}px, ${tf.y}px) scale(${tf.scale})`, transformOrigin: '0 0', width: CANVAS_W, minHeight: CANVAS_H, padding: 40 }}>

        {/* ========== TITLE ========== */}
        <div className="mb-6">
          <h1 className="text-[26px] font-black text-slate-900 tracking-tight">Clever — データフロー</h1>
          <p className="text-[13px] text-slate-500 mt-1">くればぁ様 EC販売価格一元管理ツール — データがどこから来て、どう加工され、何として出力されるか</p>
        </div>

        {/* ================================================== */}
        {/* STAGE 1: DATA SOURCES                              */}
        {/* ================================================== */}
        <Stage num="1" title="外部データソース" desc="くればぁ様のスプレッドシートから出力された CSV ファイル + 画面からの手動入力" color="blue">
          <div className="grid grid-cols-2 gap-3">
            <SourceCard
              title="zaiko-mesh.csv"
              tag="メッシュ"
              tagColor="blue"
              fields={['品番', '材質', '目開き(μ)', 'ﾒｯｼｭor線径', '幅(mm)', '残り(m)', '仕入値(m)']}
              keyNote="目開き(μ) が類似品マッチングの主キー"
              warns={['現行仕入値(m) との使い分けが未確定 [要確認B]']}
            />
            <SourceCard
              title="zaiko-netoron.csv"
              tag="ネトロン"
              tagColor="emerald"
              fields={['品番', 'カラー', '幅(mm)', '残り(m)', '仕入値', '仕切り単価/m']}
              keyNote="仕切り単価/m = EC販売価格（計算検証用）"
              warns={['カラム名「1」が存在（異常）', '仕入値 vs 仕切り単価の使い分け [要確認B]']}
            />
            <SourceCard
              title="zaiko-torikaru.csv"
              tag="トリカル"
              tagColor="violet"
              fields={['品番', 'カラー', '幅(mm)', '残り(m)', '仕入値(m)', '仕切り単価/m']}
              keyNote="仕切り単価/m = EC販売価格（計算検証用）"
              warns={['仕入値(㎡) の用途が不明 [要確認B]']}
            />
            <SourceCard
              title="手動入力パラメータ"
              tag="画面入力"
              tagColor="amber"
              fields={['固定費（デフォルト ¥6,000 / 商品別に編集可）', '粗利率（デフォルト ≈50%）', 'カット長 [要確認D — データ所在不明]']}
              keyNote="固定費は送料差を吸収する調整変数"
              warns={['カット長のデータソースが未定']}
            />
          </div>
        </Stage>

        {/* ================================================== */}
        {/* FLOW ARROW 1→2                                     */}
        {/* ================================================== */}
        <FlowArrow
          label="CSV ファイルをブラウザでアップロード"
          detail="ユーザーが商品タイプ（mesh / netoron / trikaru）を選択 → File API で読み込み"
        />

        {/* ================================================== */}
        {/* STAGE 2: INGESTION PIPELINE                        */}
        {/* ================================================== */}
        <Stage num="2" title="データ取込パイプライン" desc="CSV の生データを統一フォーマットに変換する5段階の処理" color="emerald">
          <div className="relative">
            {/* Pipeline chain */}
            <div className="flex items-stretch gap-0">
              <PipeStep num="A" title="CSV パース" color="emerald" isFirst>
                <p className="text-[11px] text-slate-600">PapaParse でテキスト → 行オブジェクトに変換</p>
                <code className="text-[10px] font-mono text-slate-500 mt-1 block">header: true, skipEmptyLines: true</code>
              </PipeStep>
              <PipeChevron />
              <PipeStep num="B" title="ヘッダー正規化" color="emerald">
                <div className="space-y-0.5 text-[10px] text-slate-600">
                  <p>全角括弧 → 半角</p>
                  <p>全角m → 半角m</p>
                  <p>㎡ → sqm</p>
                  <p>改行・連続スペース除去</p>
                </div>
              </PipeStep>
              <PipeChevron />
              <PipeStep num="C" title="カテゴリ別パース" color="emerald">
                <p className="text-[11px] text-slate-600">商品タイプに応じたパーサーで CSV 行 → UnifiedProduct にマッピング</p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  <MiniTag>parseMeshRow</MiniTag>
                  <MiniTag>parseNetoronRow</MiniTag>
                  <MiniTag>parseTrikaruRow</MiniTag>
                </div>
              </PipeStep>
              <PipeChevron />
              <PipeStep num="D" title="バリデーション" color="emerald">
                <p className="text-[11px] text-slate-600 mb-1">必須フィールドが欠損 → 行スキップ</p>
                <div className="space-y-0.5">
                  <ReqField>品番（string / 空もスキップ）</ReqField>
                  <ReqField>幅mm（parseNumber 失敗でスキップ）</ReqField>
                  <ReqField>残りm（parseNumber 失敗でスキップ）</ReqField>
                  <ReqField>仕入値（parseNumber 失敗でスキップ）</ReqField>
                </div>
              </PipeStep>
              <PipeChevron />
              <PipeStep num="E" title="在庫ステータス判定" color="emerald" isLast>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-800 flex-shrink-0" />
                    <span className="text-slate-600">残り = 0 →</span>
                    <span className="font-semibold text-slate-800">納期確認</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
                    <span className="text-slate-600">残り ≥ 150m →</span>
                    <span className="font-semibold text-slate-600">余剰在庫</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                    <span className="text-slate-600">上記以外 →</span>
                    <span className="font-semibold text-slate-500">在庫あり</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">150m = 3反（1反=50m）</p>
              </PipeStep>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">処理結果: totalRows / validRows / errorRows をカウントし取込サマリーを表示</p>
          </div>
        </Stage>

        {/* ================================================== */}
        {/* FLOW ARROW 2→3                                     */}
        {/* ================================================== */}
        <FlowArrow
          label="UnifiedProduct[] に正規化して保存"
          detail="全カテゴリを統一型に変換 → JSON シリアライズ → localStorage に永続化"
        />

        {/* ================================================== */}
        {/* STAGE 3: DATA MODEL + STORAGE                      */}
        {/* ================================================== */}
        <Stage num="3" title="統合データモデル & ストレージ" desc="3種のCSVを1つの型に統合し、ブラウザ内に保存" color="violet">
          <div className="grid grid-cols-3 gap-4">
            {/* UnifiedProduct */}
            <div className="col-span-2 bg-slate-50/50 border border-slate-200 rounded-lg p-4">
              <h4 className="text-[14px] font-bold text-slate-900 mb-0.5">UnifiedProduct</h4>
              <p className="text-[10px] text-slate-500 mb-3">1行 = 1商品。全カテゴリ共通の型定義</p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <FieldGroup title="全カテゴリ共通（必須）">
                  <Field name="id" note="UUID 自動生成" />
                  <Field name="productType" note="'mesh' | 'netoron' | 'trikaru'" />
                  <Field name="productCode" note="品番" />
                  <Field name="width" note="幅 mm" />
                  <Field name="stockQuantity" note="在庫 m" />
                  <Field name="purchasePrice" note="仕入値/m" />
                  <Field name="inventoryStatus" note="在庫ステータス（自動判定）" />
                </FieldGroup>
                <FieldGroup title="カテゴリ固有（任意）">
                  <Field name="material" note="材質 — mesh のみ" />
                  <Field name="meshSize" note="目開きμ — mesh のみ" />
                  <Field name="meshCount" note="メッシュ/線径 — mesh のみ" />
                  <Field name="color" note="カラー — netoron/trikaru" />
                  <Field name="unitPrice" note="仕切り単価 — netoron/trikaru" />
                </FieldGroup>
                <FieldGroup title="メタ・日付">
                  <Field name="location / shelfLevel" note="保管場所・棚段" />
                  <Field name="arrivalDate" note="入荷日" />
                  <Field name="lastShipmentDate" note="最終出荷日" />
                  <Field name="createdAt / updatedAt" note="取込時刻" />
                </FieldGroup>
                <FieldGroup title="用途未確定" warn>
                  <Field name="currentPurchasePrice" note="mesh のみ。仕入値との違い？" warn />
                  <Field name="purchasePricePerSqm" note="trikaru のみ。用途不明" warn />
                  <Field name="commonKey" note="紐付け挫折済み。削除可" warn />
                </FieldGroup>
              </div>
            </div>

            {/* localStorage */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-4">
              <h4 className="text-[14px] font-bold text-slate-900 mb-0.5">ブラウザストレージ</h4>
              <p className="text-[10px] font-mono text-slate-400 mb-3">inventory-store.ts</p>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold text-slate-600 mb-1">保存キー</p>
                  <code className="text-[12px] font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 block text-center">&quot;clever-inventory-data&quot;</code>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-600 mb-1">JSON 構造</p>
                  <pre className="text-[10px] font-mono bg-white p-2.5 rounded border border-slate-100 text-slate-600 leading-relaxed">{`{
  products: UnifiedProduct[],
  metadata: {
    lastUpdated,
    version: "1.0.0",
    productCounts: {
      mesh, netoron,
      trikaru, total
    }
  }
}`}</pre>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-600 mb-1">操作</p>
                  <div className="space-y-0.5 text-[11px] text-slate-600">
                    <p><code className="font-mono text-slate-600">loadInventory()</code> 読込</p>
                    <p><code className="font-mono text-slate-600">saveInventory()</code> 上書き保存</p>
                    <p><code className="font-mono text-slate-600">clearInventory()</code> 全削除</p>
                  </div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-[10px] text-slate-700">
                  容量上限 ≈ 5MB（QuotaExceededError 時はエラー表示）
                </div>
              </div>
            </div>
          </div>
        </Stage>

        {/* ================================================== */}
        {/* FLOW ARROW 3→4                                     */}
        {/* ================================================== */}
        <FlowArrow
          label="検索クエリで UnifiedProduct[] をフィルタ・加工"
          detail="ユーザーが条件入力 → 3つの処理エンジンが並行して動作"
        />

        {/* ================================================== */}
        {/* STAGE 4: PROCESSING ENGINES                        */}
        {/* ================================================== */}
        <Stage num="4" title="処理エンジン" desc="フィルタリング・価格計算・類似品マッチングの3系統" color="amber">
          <div className="space-y-4">

            {/* ---- Search Engine ---- */}
            <EngineCard title="A. 検索エンジン" badge="search-engine.ts" desc="全フィルタを AND 条件で適用 → ソート → ページネーション → 価格付きで返却">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 mb-1.5">フィルタ条件</p>
                  <div className="space-y-0.5 text-[11px]">
                    <FilterRow name="productType" method="完全一致" />
                    <FilterRow name="productCode" method="部分一致（NFKC正規化）" />
                    <FilterRow name="material" method="部分一致" note="mesh のみ" />
                    <FilterRow name="meshSize" method="範囲（min/max）" note="mesh のみ" />
                    <FilterRow name="width" method="範囲（min/max）" />
                    <FilterRow name="color" method="部分一致" note="netoron/trikaru" />
                    <FilterRow name="inventoryStatus" method="完全一致" />
                    <FilterRow name="minStock" method="≥ 閾値" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 mb-1.5">処理パイプライン</p>
                  <div className="space-y-2">
                    <ProcStep step="1" text="全商品にフィルタ適用（AND条件）" />
                    <ProcStep step="2" text="指定カラムでソート（asc/desc）" />
                    <ProcStep step="3" text="ページネーション（50件/ページ）" />
                    <ProcStep step="4" text="各商品に価格計算を付与" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 mb-1.5">文字列正規化</p>
                  <div className="p-2 bg-slate-50 rounded-lg text-[10px] font-mono text-slate-600 space-y-0.5">
                    <p>1. toLowerCase()</p>
                    <p>2. 全角スペース除去</p>
                    <p>3. NFKC 正規化</p>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 mt-3 mb-1.5">ソート可能</p>
                  <div className="flex gap-1 flex-wrap">
                    {['品番', '幅', '在庫', '仕入値', '目開き'].map(f => (
                      <span key={f} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </EngineCard>

            {/* ---- Price Calculator ---- */}
            <EngineCard title="B. 価格計算エンジン" badge="price-calculator.ts" desc="仕入値から EC 販売価格を算出" warn>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[11px] font-bold text-slate-500">現在の実装</p>
                    <span className="px-1.5 py-0.5 bg-slate-800 text-white text-[9px] font-bold rounded border border-slate-800">要改修</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 text-center">
                    <p className="text-[13px] font-mono font-bold text-slate-700">販売単価 = 仕入値 × 1.5</p>
                    <p className="text-[13px] font-mono font-bold text-slate-700">税込 = 販売単価 × 1.1</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">fixedCost(6000), processingCostPerCut(500) は定義済みだが計算に未使用</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[11px] font-bold text-slate-700">改修後（6/9 MTG 合意）</p>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded border border-slate-300">実装待ち</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 text-center">
                    <p className="text-[14px] font-mono font-bold text-slate-900">販売価格 = (仕入単価 × カット長 + 固定費) / (1 − 粗利率)</p>
                  </div>
                  <div className="mt-2 space-y-0.5 text-[10px] text-slate-600">
                    <p><strong>仕入単価</strong>: CSV の purchasePrice [要確認B: どのカラムか]</p>
                    <p><strong>カット長</strong>: <span className="text-slate-800 font-semibold">未定 [要確認D]</span></p>
                    <p><strong>固定費</strong>: ¥6,000（デフォルト / 商品ごとに編集可）</p>
                    <p><strong>粗利率</strong>: ≈50%（デフォルト / 全商品共通）</p>
                  </div>
                </div>
              </div>
            </EngineCard>

            {/* ---- Alternative Finder ---- */}
            <EngineCard title="C. 類似品マッチングエンジン" badge="alternative-finder.ts" desc="在庫切れ商品に対し、同カテゴリの在庫あり商品を類似度スコアで提案">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 mb-1.5">発動条件</p>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <p>1. 対象商品の在庫 = 0</p>
                    <p>2. 同じ productType のみ候補</p>
                    <p>3. 候補は在庫 {'>'} 0 の商品</p>
                    <p>4. 自分自身は除外</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 mb-1.5">類似度スコア（加重平均 0〜1）</p>
                  <div className="space-y-1.5">
                    <ScoreRow label="目開き(μ) の近さ" pct={40} note="mesh のみ" warn />
                    <ScoreRow label="幅(mm) の近さ" pct={30} />
                    <ScoreRow label="在庫量" pct={20} note="min(stock/100, 1)" />
                    <ScoreRow label="仕入値の近さ" pct={10} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">計算: max(0, 1 - |差分| / max(対象, 候補))</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 mb-1.5">出力ルール</p>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <p>スコア ≥ <strong>0.3</strong> のみ採用</p>
                    <p>最大 <strong>5件</strong>（スコア降順）</p>
                    <p>差分（目開き・幅・価格）を%表示</p>
                    <p>日本語の提案理由を自動生成</p>
                  </div>
                  <div className="mt-3 p-2 border border-dashed border-slate-400 rounded-lg bg-slate-50/50 text-[10px] text-slate-700">
                    <strong>注意:</strong> netoron/trikaru は meshSize なし → 40%が常に0 → 候補不足の可能性 [要確認E]
                  </div>
                </div>
              </div>
            </EngineCard>
          </div>
        </Stage>

        {/* ================================================== */}
        {/* FLOW ARROW 4→5                                     */}
        {/* ================================================== */}
        <FlowArrow
          label="SearchResult[] として統合して画面に表示"
          detail="商品データ + 計算価格 + 在庫ステータス + 類似品有無 をまとめて返却"
        />

        {/* ================================================== */}
        {/* STAGE 5: OUTPUT                                    */}
        {/* ================================================== */}
        <Stage num="5" title="アウトプット" desc="営業担当者が操作する検索結果画面" color="indigo">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 bg-slate-50/50 border border-slate-200 rounded-lg p-4">
              <h4 className="text-[14px] font-bold text-slate-900 mb-0.5">検索結果テーブル</h4>
              <p className="text-[10px] text-slate-500 mb-3">/search ページ — フィルタ結果を一覧表示</p>

              <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 text-[11px]">
                <div className="font-semibold text-slate-500 text-[10px] mb-1">基本情報</div>
                <div className="font-semibold text-slate-500 text-[10px] mb-1">在庫・仕入</div>
                <div className="font-semibold text-slate-500 text-[10px] mb-1">計算結果</div>
                <div className="text-slate-600">品番</div>
                <div className="text-slate-600">在庫(m) + ステータスバッジ</div>
                <div className="text-slate-600">販売単価（税抜）<WarnDot /></div>
                <div className="text-slate-600">材質 <span className="text-slate-400">mesh</span></div>
                <div className="text-slate-600">仕入値(m)</div>
                <div className="text-slate-600">販売単価（税込）<WarnDot /></div>
                <div className="text-slate-600">目開き(μ) <span className="text-slate-400">mesh</span></div>
                <div className="text-slate-600" />
                <div className="text-slate-600" />
                <div className="text-slate-600">カラー <span className="text-slate-400">net/tri</span></div>
                <div className="text-slate-600" />
                <div className="text-slate-600" />
                <div className="text-slate-600">幅(mm)</div>
                <div className="text-slate-600" />
                <div className="text-slate-600" />
              </div>
              <p className="text-[10px] text-slate-400 mt-3">在庫0の行に「類似品を表示」ボタン → ダイアログで最大5件</p>
            </div>

            <div className="col-span-2 bg-slate-50/50 border border-slate-200 rounded-lg p-4">
              <h4 className="text-[14px] font-bold text-slate-900 mb-0.5">代替品ダイアログ</h4>
              <p className="text-[10px] text-slate-500 mb-3">在庫切れ商品の類似品を提示</p>
              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <span>候補商品の基本情報（品番・幅・在庫）</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <span>類似度スコア（0.0〜1.0）</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <span>差分（目開き・幅・価格の差を%表示）</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold flex items-center justify-center flex-shrink-0">4</span>
                  <span>日本語の提案理由テキスト</span>
                </div>
              </div>
            </div>
          </div>
        </Stage>

        {/* ================================================== */}
        {/* STAGE 6: OPEN ITEMS                                */}
        {/* ================================================== */}
        <div className="mt-12" />
        <Stage num="6" title="要確認事項" desc="データフローの中で未確定のポイント（6/18 MTG で確認予定）" color="rose">
          <div className="grid grid-cols-3 gap-3">
            <OpenItem id="A" title="Excel/CSV ダウンロード" desc="検索結果のダウンロード機能が必要か" who="くればぁ様" status="未確認" />
            <OpenItem id="B" title="仕入値カラムの選択" desc="mesh: 仕入値 vs 現行仕入値 / netoron: 仕入値 vs 仕切り単価 / trikaru: 仕入値(㎡) vs 仕入値(m)" who="くればぁ様" status="未確認" />
            <OpenItem id="C" title="EC販売価格の計算方向" desc="ツール内で計算する方向で合意済。最終確定は 6/18 フロー図レビュー" who="くればぁ様" status="部分回答済" />
            <OpenItem id="D" title="カット長のデータソース" desc="計算式に必要。データの所在・固定値か可変かが未定" who="くればぁ様" status="未確認" />
            <OpenItem id="E" title="ネトロン/トリカルの類似品基準" desc="meshSize がないカテゴリでの代替基準" who="中林→くればぁ" status="未確認" />
            <OpenItem id="F" title="仕入れ先データの紐づけ" desc="商品に仕入れ先が紐づいているか（固定費フィルタ条件として使用）" who="古川確認中" status="確認中" />
          </div>
        </Stage>

        <div className="h-20" />
      </div>

      {/* ====== CONTROLS ====== */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur border border-slate-200 rounded-xl shadow-lg px-2 py-1.5 z-10">
        <CtrlBtn onClick={() => zoom(1)} label="+" />
        <span className="text-[11px] font-mono text-slate-500 w-12 text-center">{Math.round(tf.scale * 100)}%</span>
        <CtrlBtn onClick={() => zoom(-1)} label="−" />
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <CtrlBtn onClick={fitScreen} label="Fit" wide />
      </div>

      <div className="absolute top-3 right-4 text-[10px] text-slate-400 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 z-10">
        ドラッグで移動 / スクロールでパン / ピンチでズーム
      </div>
    </div>
  )
}


/* ================================================================ */
/* SUB-COMPONENTS                                                    */
/* ================================================================ */

/* ---- Stage wrapper ---- */
function Stage({ num, title, desc, children }: {
  num: string; title: string; desc: string; color?: string; children: ReactNode
}) {
  return (
    <div className="rounded-lg bg-white/70 backdrop-blur p-5 mt-4 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0">{num}</div>
        <div>
          <h2 className="text-[16px] font-bold text-slate-900">{title}</h2>
          <p className="text-[11px] text-slate-500">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

/* ---- Flow Arrow between stages ---- */
function FlowArrow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex flex-col items-center py-3">
      <div className="w-0.5 h-4 bg-slate-300" />
      <div className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm max-w-lg">
        <p className="text-[13px] text-slate-700 font-semibold text-center">{label}</p>
        <p className="text-[10px] text-slate-400 text-center mt-0.5">{detail}</p>
      </div>
      <div className="w-0.5 h-3 bg-slate-300" />
      <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[10px] border-l-transparent border-r-transparent border-t-slate-400" />
    </div>
  )
}

/* ---- Data Source Card ---- */
function SourceCard({ title, tag, fields, keyNote, warns }: {
  title: string; tag: string; tagColor?: string; fields: string[]; keyNote: string; warns?: string[]
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-[13px] font-bold text-slate-900">{title}</h4>
        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-600">{tag}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {fields.map(f => (
          <span key={f} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{f}</span>
        ))}
      </div>
      <p className="text-[10px] text-slate-500">{keyNote}</p>
      {warns && warns.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {warns.map((w, i) => (
            <p key={i} className="text-[9px] text-slate-500">⚠ {w}</p>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- Pipeline Step ---- */
function PipeStep({ num, title, children, isFirst, isLast }: {
  num: string; title: string; color?: string; children: ReactNode; isFirst?: boolean; isLast?: boolean
}) {
  return (
    <div className={`flex-1 bg-white border border-slate-200 ${isFirst ? 'rounded-l-lg' : ''} ${isLast ? 'rounded-r-lg' : ''} p-3`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-5 h-5 rounded bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">{num}</span>
        <span className="text-[12px] font-bold text-slate-800">{title}</span>
      </div>
      {children}
    </div>
  )
}

/* ---- Chevron between pipeline steps ---- */
function PipeChevron() {
  return (
    <div className="flex items-center flex-shrink-0 -mx-px z-10">
      <div className="w-0 h-0 border-t-[16px] border-b-[16px] border-l-[12px] border-t-transparent border-b-transparent border-l-slate-300" />
    </div>
  )
}

/* ---- Engine Card ---- */
function EngineCard({ title, badge, desc, warn, children }: {
  title: string; badge: string; desc: string; warn?: boolean; children: ReactNode
}) {
  return (
    <div className={`bg-white border ${warn ? 'border-slate-300 ring-1 ring-slate-100' : 'border-slate-200'} rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h4 className="text-[14px] font-bold text-slate-900">{title}</h4>
          <p className="text-[10px] font-mono text-slate-400">{badge}</p>
        </div>
        {warn && <span className="px-1.5 py-0.5 bg-slate-800 text-white text-[9px] font-bold rounded border border-slate-800 flex-shrink-0">要改修</span>}
      </div>
      <p className="text-[11px] text-slate-500 mb-3">{desc}</p>
      {children}
    </div>
  )
}

/* ---- Small helpers ---- */
function MiniTag({ children }: { children: ReactNode }) {
  return <span className="text-[9px] font-mono bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">{children}</span>
}

function ReqField({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
      <span className="text-slate-600">{children}</span>
    </div>
  )
}

function FieldGroup({ title, children, warn }: { title: string; children: ReactNode; warn?: boolean }) {
  return (
    <div>
      <p className={`text-[10px] font-bold mb-1 ${warn ? 'text-slate-700' : 'text-slate-500'}`}>{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function Field({ name, note, warn }: { name: string; note: string; warn?: boolean }) {
  return (
    <div className={`flex items-baseline gap-1.5 text-[10px] ${warn ? 'text-slate-700' : 'text-slate-600'}`}>
      <span className="font-mono font-semibold flex-shrink-0">{name}</span>
      <span className="text-slate-400">— {note}</span>
    </div>
  )
}

function FilterRow({ name, method, note }: { name: string; method: string; note?: string }) {
  return (
    <div className="flex items-baseline gap-1.5 text-[10px]">
      <span className="font-mono font-semibold text-slate-700 w-28 flex-shrink-0">{name}</span>
      <span className="text-slate-500">{method}</span>
      {note && <span className="text-slate-400">({note})</span>}
    </div>
  )
}

function ProcStep({ step, text }: { step: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-bold flex items-center justify-center flex-shrink-0">{step}</span>
      <span className="text-slate-600">{text}</span>
    </div>
  )
}

function ScoreRow({ label, pct, note, warn }: { label: string; pct: number; note?: string; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-7 text-right font-bold font-mono text-slate-600 flex-shrink-0">{pct}%</span>
      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${warn ? 'bg-slate-500' : 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`${warn ? 'text-slate-800 font-semibold' : 'text-slate-600'}`}>{label}</span>
      {note && <span className="text-slate-400">({note})</span>}
    </div>
  )
}

function WarnDot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-600 ml-1" title="要改修" />
}

/* ---- Open Item ---- */
function OpenItem({ id, title, desc, who, status }: { id: string; title: string; desc: string; who: string; status: string }) {
  const statusColor = status === '未確認' ? 'bg-slate-800 text-white border-slate-800'
    : status === '確認中' ? 'bg-slate-100 text-slate-600 border-slate-300'
    : 'bg-white text-slate-500 border-slate-300'
  return (
    <div className="p-3 bg-white border border-slate-200 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">{id}</span>
        <h4 className="text-[12px] font-bold text-slate-800">{title}</h4>
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[9px] text-slate-400">{who}</span>
        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${statusColor}`}>{status}</span>
      </div>
    </div>
  )
}

/* ---- Control Button ---- */
function CtrlBtn({ onClick, label, wide }: { onClick: () => void; label: string; wide?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`${wide ? 'px-3' : 'w-8'} h-8 flex items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors`}
    >
      {label}
    </button>
  )
}
