import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Admin Panel', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('admin dashboard loads with stats', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.locator('[data-testid="admin-stats"]')).toBeVisible()
  })

  test('admin can view users list', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible()
  })

  test('admin can view matches', async ({ page }) => {
    await page.goto('/admin/matches')
    await expect(page.locator('[data-testid="matches-table"]')).toBeVisible()
  })

  test('regular user cannot access admin', async ({ page }) => {
    await loginAs(page, 'brother')
    await page.goto('/admin')
    await expect(page).not.toHaveURL(/\/admin/)
  })

})
