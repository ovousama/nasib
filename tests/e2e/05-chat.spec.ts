import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Chat', () => {

  test('active connection has open chat button', async ({ page }) => {
    await loginAs(page, 'brother')
    const connections = page.locator('[data-testid="connection-card"]')
    const count = await connections.count()

    if (count > 0) {
      await expect(connections.first().locator('[data-testid="open-chat-btn"]')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('chat page loads with message input', async ({ page }) => {
    await loginAs(page, 'brother')
    const connections = page.locator('[data-testid="connection-card"]')
    const count = await connections.count()

    if (count > 0) {
      await connections.first().locator('[data-testid="open-chat-btn"]').click()
      await expect(page).toHaveURL(/\/dashboard\/chat\//)
      await expect(page.locator('[data-testid="message-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="send-btn"]')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('brother can send a message', async ({ page }) => {
    await loginAs(page, 'brother')
    const connections = page.locator('[data-testid="connection-card"]')
    const count = await connections.count()

    if (count > 0) {
      await connections.first().locator('[data-testid="open-chat-btn"]').click()
      await page.fill('[data-testid="message-input"]', 'Assalamu Alaikum, how are you?')
      await page.click('[data-testid="send-btn"]')
      await expect(page.locator('text=Assalamu Alaikum, how are you?')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('suggested questions are visible in chat', async ({ page }) => {
    await loginAs(page, 'brother')
    const connections = page.locator('[data-testid="connection-card"]')
    const count = await connections.count()

    if (count > 0) {
      await connections.first().locator('[data-testid="open-chat-btn"]').click()
      await expect(page.locator('[data-testid="suggested-questions"]')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('wali chat is read only — no message input', async ({ page }) => {
    await loginAs(page, 'wali')
    await page.goto('/wali/dashboard')
    const chatLinks = page.locator('[data-testid="wali-view-chat-btn"]')
    const count = await chatLinks.count()

    if (count > 0) {
      await chatLinks.first().click()
      await expect(page.locator('[data-testid="message-input"]')).not.toBeVisible()
      await expect(page.locator('text=Read-only')).toBeVisible()
    } else {
      test.skip()
    }
  })

})
