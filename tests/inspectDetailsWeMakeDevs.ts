import { chromium } from '@playwright/test';

async function inspectDetails() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.wemakedevs.org/', { waitUntil: 'networkidle', timeout: 30000 });

  console.log('=== HEADER LINKS ===');
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('header a, nav a')).map(a => ({
      text: (a as HTMLElement).innerText.trim(),
      href: (a as HTMLAnchorElement).href,
      html: a.outerHTML.slice(0, 100),
    }));
  });
  console.log(JSON.stringify(links, null, 2));

  console.log('\n=== ALL LINKS ON HOMEPAGE MATCHING HACKATHON, EVENT, WISPR, CHALLENGE ===');
  const relevantLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).filter(a => {
      const t = a.innerText.toLowerCase() + ' ' + (a.href || '').toLowerCase();
      return t.includes('hackathon') || t.includes('wispr') || t.includes('no hands') || t.includes('event') || t.includes('impact');
    }).map(a => ({
      text: a.innerText.trim(),
      href: a.href,
    }));
  });
  console.log(JSON.stringify(relevantLinks, null, 2));

  console.log('\n=== ALL H2 / H3 HEADINGS ON HOMEPAGE ===');
  const headings = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      tag: h.tagName,
      text: (h as HTMLElement).innerText.trim(),
    }));
  });
  console.log(JSON.stringify(headings, null, 2));

  console.log('\n=== SEARCHING FOR PROVEN IMPACT SECTION ===');
  const impactInfo = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('*'));
    const impactEls = allElements.filter(el => (el as HTMLElement).innerText?.includes('Impact'));
    return impactEls.slice(0, 5).map(el => ({
      tag: el.tagName,
      className: (el as HTMLElement).className,
      text: (el as HTMLElement).innerText.slice(0, 200),
    }));
  });
  console.log(JSON.stringify(impactInfo, null, 2));

  await browser.close();
}

inspectDetails().catch(console.error);
