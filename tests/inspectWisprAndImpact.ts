import { chromium } from '@playwright/test';

async function inspectWisprAndImpact() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('=== INSPECTING https://www.wemakedevs.org/wispr ===');
  await page.goto('https://www.wemakedevs.org/wispr', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Wispr page title:', await page.title());
  
  const wisprHeadings = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5')).map(h => ({
      tag: h.tagName,
      text: (h as HTMLElement).innerText.trim(),
    }));
  });
  console.log('Wispr page headings:', JSON.stringify(wisprHeadings, null, 2));

  const ideasFound = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all.filter(el => {
      const t = (el as HTMLElement).innerText || '';
      return t.toLowerCase().includes('project idea') || t.toLowerCase().includes('ideas');
    }).slice(0, 5).map(el => ({
      tag: el.tagName,
      text: (el as HTMLElement).innerText.slice(0, 100),
    }));
  });
  console.log('Wispr page Project Ideas elements:', JSON.stringify(ideasFound, null, 2));

  console.log('\n=== INSPECTING IMPACT METRICS ON HOMEPAGE ===');
  await page.goto('https://www.wemakedevs.org/', { waitUntil: 'networkidle', timeout: 30000 });
  const impactStats = await page.evaluate(() => {
    const stats: { label: string; value: string }[] = [];
    const elements = Array.from(document.querySelectorAll('*'));
    elements.forEach(el => {
      const text = (el as HTMLElement).innerText?.trim() || '';
      if (text.match(/^(200K\+|40\+|11|900\+|50K\+)$/i)) {
        stats.push({ label: el.parentElement?.innerText?.replace(/\n/g, ' ') || '', value: text });
      }
    });
    return stats;
  });
  console.log('Impact stats found:', JSON.stringify(impactStats, null, 2));

  await browser.close();
}

inspectWisprAndImpact().catch(console.error);
