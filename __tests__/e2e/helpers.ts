import { Page } from '@playwright/test'
import path from 'path'

/**
 * CSV ファイルをアップロードする共通ヘルパー関数
 */
export async function uploadCsv(page: Page, productType: string, csvFileName: string) {
  await page.goto('/')

  // 商品タイプを選択
  const select = page.locator('select')
  await select.selectOption(productType)

  // ファイルをアップロード
  const fileInput = page.locator('input[type="file"]')
  const filePath = path.resolve(__dirname, '../fixtures', csvFileName)
  await fileInput.setInputFiles(filePath)

  // アップロードボタンをクリック
  const uploadButton = page.getByRole('button', { name: 'アップロード' })
  await uploadButton.click()

  // 成功メッセージを待つ（大きいCSVのパース時間を考慮してタイムアウト延長）
  await page.waitForSelector('text=アップロード完了', { timeout: 15000 })
  await page.waitForSelector('text=取込件数:', { timeout: 5000 })
}

/**
 * localStorage をクリアする
 * ページに遷移してから localStorage をクリアし、再読込する
 */
export async function clearLocalStorage(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
}

/**
 * テーブル内の行数を取得する
 */
export async function getTableRowCount(page: Page): Promise<number> {
  const rows = page.locator('tbody tr')
  return await rows.count()
}
