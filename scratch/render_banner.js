import { chromium } from '@playwright/test';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 460 },
    deviceScaleFactor: 2, // High-DPI 2x Retina rendering
  });

  const filePath = 'file://' + path.resolve('scratch/create_banner.html').replace(/\\/g, '/');
  console.log('Navigating to', filePath);
  await page.goto(filePath, { waitUntil: 'networkidle' });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Take screenshot
  const outPng = path.resolve('assets/veriflow_hero_banner.png');
  const outJpg = path.resolve('assets/veriflow_hero_banner.jpg');

  await page.screenshot({ path: outPng });
  await page.screenshot({ path: outJpg, type: 'jpeg', quality: 95 });

  console.log('Successfully saved banners:');
  console.log(' ->', outPng);
  console.log(' ->', outJpg);

  await browser.close();
}

main().catch(console.error);
