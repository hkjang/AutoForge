import { test, expect } from '@playwright/test';

async function login(page){
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'워크스페이스 로그인'})).toBeVisible();
  await page.getByLabel('이메일').fill('lead@autoforge.local');
  await page.getByLabel('비밀번호').fill('browser-e2e-password');
  await page.getByRole('button',{name:'안전하게 로그인'}).click();
  await expect(page.getByRole('heading',{name:'프로젝트 스튜디오'})).toBeVisible();
}

test('authenticated visual design journey supports keyboard architecture editing',async({page})=>{
  await login(page);
  await page.getByRole('button',{name:'콘셉트 랩'}).click();
  await expect(page.getByText('Urban Flow',{exact:true}).first()).toBeVisible();
  const range=page.getByLabel('전장');
  await range.fill('4000');
  await expect(page.getByText('4000 mm',{exact:true}).first()).toBeVisible();
  await page.getByRole('button',{name:'차량 아키텍처'}).click();
  const node=page.getByRole('button',{name:/E-Axle, 160 kW/});
  const before=await node.getAttribute('style');
  await node.focus();await page.keyboard.press('ArrowRight');
  await expect(node).not.toHaveAttribute('style',before);
});

test('command palette is keyboard accessible and has no horizontal viewport overflow',async({page})=>{
  await login(page);
  await page.keyboard.press(process.platform==='darwin'?'Meta+K':'Control+K');
  await expect(page.getByRole('dialog',{name:'빠른 이동'})).toBeVisible();
  await page.getByLabel('메뉴, 프로젝트, 설계 버전 검색').fill('디지털 트윈');
  await page.getByRole('button',{name:/디지털 트윈/}).click();
  await expect(page.getByRole('heading',{name:'디지털 트윈'})).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
