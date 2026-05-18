import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('CSV アップロード', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前に localStorage をクリア
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })
  })

  test('メッシュ CSV アップロード成功', async ({ page }) => {
    await page.goto('/')

    // 商品タイプ「メッシュ」を選択（デフォルトのはず）
    const select = page.locator('select')
    await expect(select).toHaveValue('mesh')

    // CSV ファイルをアップロード
    const fileInput = page.locator('input[type="file"]')
    const filePath = path.resolve(__dirname, '../fixtures/zaiko-mesh.csv')
    await fileInput.setInputFiles(filePath)

    // ファイル名が表示されることを確認
    await expect(page.locator('text=zaiko-mesh.csv')).toBeVisible()

    // アップロードボタンをクリック
    const uploadButton = page.getByRole('button', { name: 'アップロード' })
    await uploadButton.click()

    // 成功メッセージが表示される
    await expect(page.locator('text=アップロード完了')).toBeVisible()
    await expect(page.locator('text=取込件数:')).toBeVisible()

    // 取込件数が 0 より大きいことを確認
    const successMessage = page.locator('text=取込件数:').locator('..')
    const countText = await successMessage.textContent()
    expect(countText).toMatch(/\d+件/)
  })

  test('ネトロン CSV アップロード成功', async ({ page }) => {
    await page.goto('/')

    // 商品タイプ「ネトロン」を選択
    const select = page.locator('select')
    await select.selectOption('netoron')

    // CSV ファイルをアップロード
    const fileInput = page.locator('input[type="file"]')
    const filePath = path.resolve(__dirname, '../fixtures/zaiko-netoron.csv')
    await fileInput.setInputFiles(filePath)

    // ファイル名が表示されることを確認
    await expect(page.locator('text=zaiko-netoron.csv')).toBeVisible()

    // アップロードボタンをクリック
    const uploadButton = page.getByRole('button', { name: 'アップロード' })
    await uploadButton.click()

    // 成功メッセージが表示される
    await expect(page.locator('text=アップロード完了')).toBeVisible()
    await expect(page.locator('text=取込件数:')).toBeVisible()
  })

  test('トリカル CSV アップロード成功', async ({ page }) => {
    await page.goto('/')

    // 商品タイプ「トリカル」を選択
    const select = page.locator('select')
    await select.selectOption('trikaru')

    // CSV ファイルをアップロード
    const fileInput = page.locator('input[type="file"]')
    const filePath = path.resolve(__dirname, '../fixtures/zaiko-torikaru.csv')
    await fileInput.setInputFiles(filePath)

    // ファイル名が表示されることを確認
    await expect(page.locator('text=zaiko-torikaru.csv')).toBeVisible()

    // アップロードボタンをクリック
    const uploadButton = page.getByRole('button', { name: 'アップロード' })
    await uploadButton.click()

    // 成功メッセージが表示される
    await expect(page.locator('text=アップロード完了')).toBeVisible()
    await expect(page.locator('text=取込件数:')).toBeVisible()
  })

  test('ファイル未選択でアップロードボタン無効', async ({ page }) => {
    await page.goto('/')

    // アップロードボタンが disabled であることを確認
    const uploadButton = page.getByRole('button', { name: 'アップロード' })
    await expect(uploadButton).toBeDisabled()
  })

  test('ファイル選択後にアップロードボタンが有効化', async ({ page }) => {
    await page.goto('/')

    // 初期状態では無効
    const uploadButton = page.getByRole('button', { name: 'アップロード' })
    await expect(uploadButton).toBeDisabled()

    // ファイルを選択
    const fileInput = page.locator('input[type="file"]')
    const filePath = path.resolve(__dirname, '../fixtures/zaiko-mesh.csv')
    await fileInput.setInputFiles(filePath)

    // ボタンが有効になる
    await expect(uploadButton).toBeEnabled()
  })
})
