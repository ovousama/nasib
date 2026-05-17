import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Brother Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'brother')
  })

  test('dashboard loads with greeting', async ({ page }) => {
    await expect(page.locator('text=Assalamu Alaikum')).toBeVisible()
  })

  test('matches section is visible', async ({ page }) => {
    const matchesSection = page.locator('[data-testid="matches-section"]')
    await expect(matchesSection).toBeVisible()
  })

  test('connections section is visible', async ({ page }) => {
    const connectionsSection = page.locator('[data-testid="connections-section"]')
    await expect(connectionsSection).toBeVisible()
  })

  test('notifications section is visible', async ({ page }) => {
    const notificationsSection = page.locator('[data-testid="notifications-section"]')
    await expect(notificationsSection).toBeVisible()
  })

  test('bottom navigation has all 5 tabs', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-home"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-matches"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-connections"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-notifications"]')).toBeVisible()
  })

})

test.describe('Sister Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'sister')
  })

  test('dashboard loads with greeting', async ({ page }) => {
    await expect(page.locator('text=Assalamu Alaikum')).toBeVisible()
  })

  test('active connections counter visible', async ({ page }) => {
    await expect(page.locator('[data-testid="connections-counter"]')).toBeVisible()
  })

  test('wali status indicator visible', async ({ page }) => {
    await expect(page.locator('[data-testid="wali-status"]')).toBeVisible()
  })

})
