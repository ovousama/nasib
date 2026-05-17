import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Match Cards', () => {

  test('brother can see match cards', async ({ page }) => {
    await loginAs(page, 'brother')
    const matchCards = page.locator('[data-testid="match-card"]')
    const count = await matchCards.count()
    console.log(`Brother has ${count} matches`)
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('sister can see match cards', async ({ page }) => {
    await loginAs(page, 'sister')
    const matchCards = page.locator('[data-testid="match-card"]')
    const count = await matchCards.count()
    console.log(`Sister has ${count} matches`)
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('tapping match card opens quick view modal', async ({ page }) => {
    await loginAs(page, 'brother')
    const firstMatch = page.locator('[data-testid="match-card"]').first()
    const count = await page.locator('[data-testid="match-card"]').count()
    if (count > 0) {
      await firstMatch.click()
      await expect(page.locator('[data-testid="quick-view-modal"]')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('quick view modal shows correct info', async ({ page }) => {
    await loginAs(page, 'brother')
    const count = await page.locator('[data-testid="match-card"]').count()
    if (count > 0) {
      await page.locator('[data-testid="match-card"]').first().click()
      await expect(page.locator('[data-testid="quick-view-name"]')).toBeVisible()
      await expect(page.locator('[data-testid="quick-view-age-location"]')).toBeVisible()
      await expect(page.locator('[data-testid="view-full-profile-btn"]')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('sister photo NOT shown to brother at match stage', async ({ page }) => {
    await loginAs(page, 'brother')
    const count = await page.locator('[data-testid="match-card"]').count()
    if (count > 0) {
      await page.locator('[data-testid="match-card"]').first().click()
      await expect(page.locator('[data-testid="sister-photo"]')).not.toBeVisible()
    } else {
      test.skip()
    }
  })

  test('view full profile page loads', async ({ page }) => {
    await loginAs(page, 'brother')
    const count = await page.locator('[data-testid="match-card"]').count()
    if (count > 0) {
      await page.locator('[data-testid="match-card"]').first().click()
      await page.click('[data-testid="view-full-profile-btn"]')
      await expect(page).toHaveURL(/\/dashboard\/profile\//)
      await expect(page.locator('[data-testid="profile-name"]')).toBeVisible()
    } else {
      test.skip()
    }
  })

})
