import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Wali Access', () => {

  test('wali dashboard loads', async ({ page }) => {
    await loginAs(page, 'wali')
    await expect(page).toHaveURL(/\/wali/)
    await expect(page.locator('text=Read-only')).toBeVisible()
  })

  test('wali sees sister name in header', async ({ page }) => {
    await loginAs(page, 'wali')
    await expect(page.locator('[data-testid="wali-sister-name"]')).toBeVisible()
  })

  test('wali cannot access regular dashboard', async ({ page }) => {
    await loginAs(page, 'wali')
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/wali/)
  })

})
