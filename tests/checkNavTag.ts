import { chromium } from '@playwright/test';

async function checkNavTag() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.goto('https://www.wemakedevs.org/', { waitUntil: 'domcontentloaded' });
  const info = await p.evaluate(() => {
    const a = document.querySelector('a[href*="hackathons"]');
    let cur: HTMLElement | null = a as HTMLElement;
    const path: string[] = [];
    while (cur && cur.tagName !== 'BODY') {
      path.push(cur.tagName + (cur.className ? '.' + cur.className.split(' ').slice(0, 2).join('.') : ''));
      cur = cur.parentElement;
    }
    const hasHeaderTag = !!document.querySelector('header');
    const hasNavTag = !!document.querySelector('nav');
    return {
      path: path.join(' < '),
      hasHeaderTag,
      hasNavTag,
      headerHtml: document.querySelector('header')?.outerHTML?.slice(0, 200),
      navHtml: document.querySelector('nav')?.outerHTML?.slice(0, 200),
    };
  });
  console.log(info);
  await b.close();
}

checkNavTag().catch(console.error);
