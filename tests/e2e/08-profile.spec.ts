import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Profile Pages', () => {

  test('brother profile page loads', async ({ page }) => {
    await loginAs(page, 'brother')
    await page.goto('/dashboard/profile')
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible()
  })

  test('sister profile page loads', async ({ page }) => {
    await loginAs(page, 'sister')
    await page.goto('/dashboard/profile')
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible()
  })

  test('brother can navigate to edit basic info', async ({ page }) => {
    await loginAs(page, 'brother')
    await page.goto('/dashboard/profile/edit/basic')
    await expect(page.locator('text=Edit')).toBeVisible()
  })

  test('sister can navigate to edit wali', async ({ page }) => {
    await loginAs(page, 'sister')
    await page.goto('/dashboard/profile/edit/wali')
    await expect(page.locator('text=Edit')).toBeVisible()
  })

})
