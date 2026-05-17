import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Notifications', () => {

  test('notifications page loads', async ({ page }) => {
    await loginAs(page, 'brother')
    await page.goto('/dashboard/notifications')
    await expect(page).toHaveURL('/dashboard/notifications')
  })

  test('mark all read button is visible', async ({ page }) => {
    await loginAs(page, 'brother')
    await page.goto('/dashboard/notifications')
    await expect(page.locator('[data-testid="mark-all-read-btn"]')).toBeVisible()
  })

  test('notification bell is visible in nav', async ({ page }) => {
    await loginAs(page, 'brother')
    await expect(page.locator('[data-testid="nav-notifications"]')).toBeVisible()
  })

})
