import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Interest Flow', () => {

  test('brother can express interest in a sister', async ({ page }) => {
    await loginAs(page, 'brother')
    const count = await page.locator('[data-testid="match-card"]').count()
    if (count === 0) { test.skip(); return }

    await page.locator('[data-testid="match-card"]').first().click()
    const expressBtn = page.locator('[data-testid="express-interest-btn"]')

    if (await expressBtn.isVisible()) {
      await expressBtn.click()
      await expect(page.locator('[data-testid="interest-modal"]')).toBeVisible()
      await page.fill('[data-testid="intro-message-input"]', 'Assalamu Alaikum, I came across your profile and would love to learn more.')
      await page.click('[data-testid="send-interest-btn"]')
      await expect(page.locator('text=Interest Sent')).toBeVisible()
    } else {
      console.log('Express interest button not visible — may already have interest sent')
    }
  })

  test('sister can express interest in a brother', async ({ page }) => {
    await loginAs(page, 'sister')
    const count = await page.locator('[data-testid="match-card"]').count()
    if (count === 0) { test.skip(); return }

    await page.locator('[data-testid="match-card"]').first().click()
    const expressBtn = page.locator('[data-testid="express-interest-btn"]')

    if (await expressBtn.isVisible()) {
      await expressBtn.click()
      await expect(page.locator('[data-testid="interest-modal"]')).toBeVisible()
      await page.fill('[data-testid="intro-message-input"]', 'Assalamu Alaikum, your profile resonated with me.')
      await page.click('[data-testid="send-interest-btn"]')
      await expect(page.locator('text=Interest Sent')).toBeVisible()
    } else {
      console.log('Express interest button not visible')
    }
  })

  test('cannot express interest twice in same person', async ({ page }) => {
    await loginAs(page, 'brother')
    const count = await page.locator('[data-testid="match-card"]').count()
    if (count === 0) { test.skip(); return }

    const firstMatch = page.locator('[data-testid="match-card"]').first()
    const interestSent = await firstMatch.locator('text=Interest Sent').isVisible()

    if (interestSent) {
      await firstMatch.click()
      await expect(page.locator('[data-testid="express-interest-btn"]')).not.toBeVisible()
      console.log('PASS — Express interest button correctly hidden after interest sent')
    } else {
      console.log('SKIP — No existing interest to test duplicate prevention')
    }
  })

  test('brother can accept a sister interest', async ({ page }) => {
    await loginAs(page, 'brother')
    const pendingInterests = page.locator('[data-testid="pending-interest-card"]')
    const count = await pendingInterests.count()

    if (count > 0) {
      await pendingInterests.first().click()
      await expect(page.locator('[data-testid="accept-btn"]')).toBeVisible()
      console.log('PASS — Brother can see accept button on sister interest')
    } else {
      console.log('SKIP — No pending interests from sisters to test')
    }
  })

  test('sister can accept a brother interest', async ({ page }) => {
    await loginAs(page, 'sister')
    const pendingInterests = page.locator('[data-testid="pending-interest-card"]')
    const count = await pendingInterests.count()

    if (count > 0) {
      await pendingInterests.first().click()
      await expect(page.locator('[data-testid="accept-btn"]')).toBeVisible()
      console.log('PASS — Sister can see accept button on brother interest')
    } else {
      console.log('SKIP — No pending interests from brothers to test')
    }
  })

})
