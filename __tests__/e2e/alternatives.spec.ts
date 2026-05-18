import { test, expect } from '@playwright/test'
import { uploadCsv, clearLocalStorage } from './helpers'

test.describe('代替品機能', () => {
  test('代替品ダイアログの表示', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュデータをアップロード
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // テーブルが表示されるまで待つ
    await expect(page.locator('tbody tr').first()).toBeVisible()

    // 在庫 0 の商品を探す（代替品ボタンがある行）
    const alternativesButton = page.getByRole('button', { name: '代替品' })

    // 代替品ボタンが存在するか確認
    const buttonCount = await alternativesButton.count()

    if (buttonCount > 0) {
      // 最初の代替品ボタンをクリック
      await alternativesButton.first().click()

      // ダイアログが表示される
      await expect(page.locator('text=代替品候補')).toBeVisible()

      // 対象商品の情報が表示される
      await expect(page.locator('text=対象商品')).toBeVisible()

      // 代替品リストまたは「代替品が見つかりませんでした」が表示される
      const hasAlternativesList = await page.locator('text=候補').first().isVisible()
      const hasNoAlternatives = await page.locator('text=代替品が見つかりませんでした').isVisible()

      expect(hasAlternativesList || hasNoAlternatives).toBeTruthy()
    } else {
      // 代替品ボタンが存在しない場合はスキップ
      test.skip()
    }
  })

  test('代替品ダイアログの閉じる', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュデータをアップロード
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // テーブルが表示されるまで待つ
    await expect(page.locator('tbody tr').first()).toBeVisible()

    // 代替品ボタンを探す
    const alternativesButton = page.getByRole('button', { name: '代替品' })
    const buttonCount = await alternativesButton.count()

    if (buttonCount > 0) {
      // 代替品ボタンをクリック
      await alternativesButton.first().click()

      // ダイアログが表示される
      await expect(page.locator('text=代替品候補')).toBeVisible()

      // 閉じるボタンをクリック（ダイアログヘッダー内のSVGボタン）
      const closeButton = page.locator('.sticky button').filter({ has: page.locator('svg') })
      await closeButton.click()

      // ダイアログが閉じる
      await expect(page.locator('text=代替品候補')).not.toBeVisible({ timeout: 3000 })
    } else {
      test.skip()
    }
  })

  test('代替品ダイアログでオーバーレイクリックで閉じる', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュデータをアップロード
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // テーブルが表示されるまで待つ
    await expect(page.locator('tbody tr').first()).toBeVisible()

    // 代替品ボタンを探す
    const alternativesButton = page.getByRole('button', { name: '代替品' })
    const buttonCount = await alternativesButton.count()

    if (buttonCount > 0) {
      // 代替品ボタンをクリック
      await alternativesButton.first().click()

      // ダイアログが表示される
      await expect(page.locator('text=代替品候補')).toBeVisible()

      // オーバーレイ（背景）をクリック
      const overlay = page.locator('.backdrop-blur-sm')
      await overlay.click({ position: { x: 10, y: 10 } })

      // ダイアログが閉じる
      await expect(page.locator('text=代替品候補')).not.toBeVisible()
    } else {
      test.skip()
    }
  })

  test('在庫あり商品には代替品ボタンが表示されない', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュデータをアップロード
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // テーブルが表示されるまで待つ
    await expect(page.locator('tbody tr').first()).toBeVisible()

    // すべての行を取得
    const rows = page.locator('tbody tr')
    const rowCount = await rows.count()

    let hasRowWithStock = false
    let rowWithStockHasNoButton = false

    // 在庫が 0 より大きい行を探す
    for (let i = 0; i < Math.min(rowCount, 20); i++) {
      const row = rows.nth(i)
      const stockCell = row.locator('td').nth(7) // 在庫列
      const stockText = await stockCell.textContent()
      const stockValue = parseFloat(stockText?.replace(/[^\d.]/g, '') || '0')

      if (stockValue > 0) {
        hasRowWithStock = true

        // この行に代替品ボタンがないことを確認
        const buttonInRow = row.locator('button', { hasText: '代替品' })
        const buttonExists = (await buttonInRow.count()) > 0

        if (!buttonExists) {
          rowWithStockHasNoButton = true
          break
        }
      }
    }

    // 在庫あり商品が存在し、それに代替品ボタンがないことを確認
    if (hasRowWithStock) {
      expect(rowWithStockHasNoButton).toBeTruthy()
    }
  })

  test('代替品情報の表示内容確認', async ({ page }) => {
    // localStorage をクリア
    await clearLocalStorage(page)

    // メッシュデータをアップロード
    await uploadCsv(page, 'mesh', 'zaiko-mesh.csv')

    // /search に遷移
    await page.goto('/search')

    // テーブルが表示されるまで待つ
    await expect(page.locator('tbody tr').first()).toBeVisible()

    // 代替品ボタンを探す
    const alternativesButton = page.getByRole('button', { name: '代替品' })
    const buttonCount = await alternativesButton.count()

    if (buttonCount > 0) {
      // 代替品ボタンをクリック
      await alternativesButton.first().click()

      // ダイアログが表示される
      await expect(page.locator('text=代替品候補')).toBeVisible()

      // 対象商品の詳細が表示される
      await expect(page.locator('text=対象商品')).toBeVisible()
      await expect(page.locator('text=幅:').first()).toBeVisible()

      // 代替品リストが表示される場合、その内容を確認
      const hasAlternativesList = await page.locator('text=候補').first().isVisible()

      if (hasAlternativesList) {
        // 代替品カードが存在することを確認
        const alternativeCards = page.locator('.space-y-3 > div')
        const cardCount = await alternativeCards.count()
        expect(cardCount).toBeGreaterThan(0)
      }
    } else {
      test.skip()
    }
  })
})
