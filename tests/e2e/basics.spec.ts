import { test, expect } from '@playwright/test'

test('Home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Welcome to Jubilee Knowledge Library')
})

test('Login page is accessible', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('h2')).toContainText('Sign in')
  await expect(page.locator('input[placeholder="Email"]')).toBeVisible()
  await expect(page.locator('input[placeholder="Password"]')).toBeVisible()
})

test('Books page is accessible', async ({ page }) => {
  await page.goto('/books')
  await expect(page.locator('h2')).toContainText('Books')
})

test('Protected route redirects to login', async ({ page }) => {
  await page.goto('/dashboard')
  // Should redirect to /login since not authenticated
  await expect(page).toHaveURL('/login')
})

test('Book card shows availability status', async ({ page }) => {
  await page.goto('/books')
  // Wait for books to load
  const cards = page.locator('.bg-white.rounded.shadow.p-4')
  await expect(cards.first()).toBeVisible({ timeout: 5000 })
  
  // Check for status badge
  const badge = page.locator('text=/Available|Fully Borrowed/')
  await expect(badge).toBeVisible()
})
