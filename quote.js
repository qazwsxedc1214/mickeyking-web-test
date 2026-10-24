"use strict";
// 估價金額以目前部署的 products.js 為基準，忽略購物車中任何價格資料。
const money = n => 'NT$ ' + Number(n).toLocaleString('zh-TW');
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = new Date();
document.getElementById('quoteDate').textContent = new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
let cart = [];
// 優先從 URL 取得清單，適用於 GitHub Pages、靜態主機及直接開啟本機檔案。
// 沒有 URL 參數時才嘗試讀取上一頁的 sessionStorage。
const params = new URLSearchParams(window.location.search);
if (params.has('items')) {
  try { cart = JSON.parse(params.get('items')); } catch (_) {}
} else {
  try { cart = JSON.parse(sessionStorage.getItem('MICKEYKING_QUOTE_CART') || '[]'); } catch (_) {}
}
if (!Array.isArray(cart)) cart = [];
const productsById = new Map(PRODUCTS.map(p=>[String(p.id),p]));
let total = 0;
const specOrder = ['CPU','主機板','顯示卡','記憶體','RAM','SSD','HDD','散熱器','電源供應器','機殼','作業系統','品牌','型號','尺寸','顏色','材質','備註'];
const quoteParts = [];
for (const line of cart) {
  const p = productsById.get(String(line.id));
  const qty = Number(line.qty);
  if(!p || !Number.isSafeInteger(qty) || qty<=0 || qty>999 || !Number.isSafeInteger(Number(p.price)) || p.price < 0) continue;
  const subtotal = Number(p.price)*qty;
  total+=subtotal;
  const specs = p.specs && typeof p.specs === 'object' ? p.specs : {};
  const keys = [...new Set([...specOrder,...Object.keys(specs)])].filter(k=>String(specs[k] ?? '').trim());
  const specRows = keys.map(key=>{
    const value=String(specs[key]);
    const rawPrice=p.specPrices?.[key];
    const price = rawPrice !== undefined && rawPrice !== '' && Number.isSafeInteger(Number(rawPrice)) && Number(rawPrice)>=0 ? money(rawPrice)+'（參考）' : '—';
    return `<tr class="spec-line"><td>${esc(key)}</td><td>${esc(value)}</td><td class="number">—</td><td class="number">${esc(price)}</td><td class="number">—</td></tr>`;
  }).join('');
  quoteParts.push(`<section class="quote-group"><h2>${esc(p.category)}</h2><table><thead><tr><th>項目</th><th>品名／規格</th><th class="number">數量</th><th class="number">單價</th><th class="number">小計</th></tr></thead><tbody><tr class="main-item"><td>${esc(p.category==='電腦配單'?'整機配單':'商品')}</td><td><strong>${esc(p.name)}</strong></td><td class="number">${qty}</td><td class="number">${money(p.price)}</td><td class="number">${money(subtotal)}</td></tr>${specRows || '<tr class="spec-line"><td>規格</td><td colspan="4">詳細規格未填寫，請向商家確認</td></tr>'}</tbody></table></section>`);
}
document.getElementById('quoteBody').innerHTML=quoteParts.length?quoteParts.join(''):'<div class="empty">目前沒有估價商品，請先返回商店加入商品。</div>';
document.getElementById('grandTotal').textContent=money(total);
document.getElementById('printBtn').onclick=()=>window.print();
