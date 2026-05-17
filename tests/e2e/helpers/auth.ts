import { Page } from '@playwright/test'

export const TEST_ACCOUNTS = {
  brother: {
    email: 'brother1@nasib.test',
    password: 'NasibTest2024!',
    name: 'Omar'
  },
  sister: {
    email: 'sister1@nasib.test',
    password: 'NasibTest2024!',
    name: 'Fatima'
  },
  wali: {
    email: 'wali1@nasib.test',
    password: 'NasibTest2024!',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'your-admin@email.com',
    password: process.env.ADMIN_PASSWORD || 'your-admin-password'
  }
}

export async function loginAs(page: Page, role: keyof typeof TEST_ACCOUNTS) {
  const account = TEST_ACCOUNTS[role]
  await page.goto('/auth/login')
  await page.fill('input[type="email"]', account.email)
  await page.fill('input[type="password"]', account.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|admin|wali)/)
}

export async function logout(page: Page) {
  await page.click('[data-testid="signout-button"]')
  await page.waitForURL('/auth/login')
}
