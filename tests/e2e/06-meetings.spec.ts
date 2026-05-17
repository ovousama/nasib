import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Meeting Requests', () => {

  test('brother can access meeting request from chat', async ({ page }) => {
    await loginAs(page, 'brother')
    const connections = page.locator('[data-testid="connection-card"]')
    const count = await connections.count()

    if (count > 0) {
      await connections.first().locator('[data-testid="open-chat-btn"]').click()
      await expect(page.locator('[data-testid="request-meeting-btn"]')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('meeting request form shows format options', async ({ page }) => {
    await loginAs(page, 'brother')
    const connections = page.locator('[data-testid="connection-card"]')
    const count = await connections.count()

    if (count > 0) {
      await connections.first().locator('[data-testid="open-chat-btn"]').click()
      await page.click('[data-testid="request-meeting-btn"]')
      await expect(page.locator('[data-testid="format-virtual"]')).toBeVisible()
      await expect(page.locator('[data-testid="format-in-person"]')).toBeVisible()
    } else {
      test.skip()
    }
  })

})
