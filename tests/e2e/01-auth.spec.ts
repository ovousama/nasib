import { test, expect } from '@playwright/test'
import { loginAs, TEST_ACCOUNTS } from './helpers/auth'

test.describe('Authentication', () => {

  test('brother can log in successfully', async ({ page }) => {
    await loginAs(page, 'brother')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('text=Assalamu Alaikum')).toBeVisible()
  })

  test('sister can log in successfully', async ({ page }) => {
    await loginAs(page, 'sister')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('text=Assalamu Alaikum')).toBeVisible()
  })

  test('admin can log in and sees admin panel', async ({ page }) => {
    await loginAs(page, 'admin')
    await expect(page).toHaveURL(/\/admin/)
  })

  test('wali can log in and sees wali dashboard', async ({ page }) => {
    await loginAs(page, 'wali')
    await expect(page).toHaveURL(/\/wali/)
  })

  test('wrong password shows error', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', TEST_ACCOUNTS.brother.email)
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="auth-error"]')).toBeVisible()
  })

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await expect(page.locator('text=Reset your password')).toBeVisible()
  })

  test('protected routes redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('authenticated user redirected away from auth pages', async ({ page }) => {
    await loginAs(page, 'brother')
    await page.goto('/auth/login')
    await expect(page).toHaveURL(/\/dashboard/)
  })

})
