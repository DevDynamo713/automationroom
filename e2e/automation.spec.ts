import { test, expect } from '@playwright/test';
test('automationroom loads and creates workflow', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('AutomationRoom: demo');
  await page.locator('.name-input').fill('deploy-prod');
  await page.locator('.trigger-input').selectOption('webhook');
  await page.locator('.action-input').selectOption('http');
  await page.locator('.add-btn').click();
  await expect(page.locator('.workflow-list').locator('div').first()).toBeVisible();
});