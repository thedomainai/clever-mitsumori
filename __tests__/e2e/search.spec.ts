import { test, expect } from '@playwright/test'
import { uploadCsv, clearLocalStorage } from './helpers'

test.describe('検索画面', () => {
  test('データなしで検索画面にアクセス', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // /search にアクセス
    await page.goto('/search')

    // 「在庫データがありません」メッセージが表示される
    await expect(page.locator('text=在庫データがありません')).toBeVisible()
  })

  test('CSV アップロード後に検索画面で全データ表示', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュ CSV をアップロード
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // テーブルに検索結果が表示される
    await expect(page.locator('text=検索結果:')).toBeVisible()

    // テーブルの行数を確認
    const rows = page.locator('tbody tr')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)
  })

  test('品番で検索', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュデータをアップロード
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // 品番フィールドに入力
    // 実際の CSV に含まれる品番を使用（例: 最初のデータ行の品番）
    const firstRowProductCode = await page
      .locator('tbody tr')
      .first()
      .locator('td')
      .first()
      .textContent()

    if (firstRowProductCode) {
      // 品番の一部を抽出（例: 最初の5文字）
      const searchTerm = firstRowProductCode.trim().substring(0, 5)

      // 検索フォームに入力
      // 「品番」ラベルを含む div 内の input を探す
      await page.locator('div:has(label:has-text("品番")) input').first().fill(searchTerm)

      // 検索ボタンをクリック
      const searchButton = page.getByRole('button', { name: '検索' })
      await searchButton.click()

      // 結果が表示される
      await expect(page.locator('text=検索結果:')).toBeVisible()

      // 表示された結果の品番が検索条件を含むことを確認
      const resultRows = page.locator('tbody tr')
      const firstResultProductCode = await resultRows.first().locator('td').first().textContent()
      expect(firstResultProductCode?.toLowerCase()).toContain(searchTerm.toLowerCase())
    }
  })

  test('在庫ステータスの表示確認', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュデータをアップロード
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // テーブルが表示されるまで待つ
    await expect(page.locator('tbody tr').first()).toBeVisible()

    // 在庫ステータス列の存在を確認（在庫あり/納期確認/余剰在庫のいずれか）
    const statusBadges = page.locator('tbody tr td').filter({ hasText: /在庫あり|納期確認|余剰在庫/ })
    const statusCount = await statusBadges.count()
    expect(statusCount).toBeGreaterThan(0)
  })

  test('EC参考単価の表示確認', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュデータをアップロード
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // テーブルが表示されるまで待つ
    await expect(page.locator('tbody tr').first()).toBeVisible()

    // EC参考単価列（9列目）の値を確認
    // "¥" または "￥" が含まれることを確認
    const priceCell = page.locator('tbody tr').first().locator('td').nth(9)
    const priceText = await priceCell.textContent()
    expect(priceText).toMatch(/[¥￥]/)
  })

  test('ページネーション', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュデータをアップロード（100件以上のデータがある場合）
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // 検索結果の件数を確認
    const resultsText = await page.locator('text=検索結果:').textContent()
    const match = resultsText?.match(/(\d+)件/)
    const totalResults = match ? parseInt(match[1]) : 0

    if (totalResults > 100) {
      // ページネーションが表示される（pageSize=100）
      const nextButton = page.getByRole('button', { name: '次へ' })
      await expect(nextButton).toBeVisible()

      // 次のページボタンをクリック
      await nextButton.click()

      // テーブルが再描画されることを確認
      await page.waitForTimeout(500)
      await expect(page.locator('tbody tr').first()).toBeVisible()
    }
  })

  test('検索結果の並び替え', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュデータをアップロード
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // テーブルヘッダーをクリックして並び替え
    const productCodeHeader = page.locator('th').filter({ hasText: '品番' })
    await productCodeHeader.click()

    // テーブルが再描画されることを確認
    await page.waitForTimeout(300)
    await expect(page.locator('tbody tr').first()).toBeVisible()

    // もう一度クリックして降順に
    await productCodeHeader.click()
    await page.waitForTimeout(300)
    await expect(page.locator('tbody tr').first()).toBeVisible()
  })
})
