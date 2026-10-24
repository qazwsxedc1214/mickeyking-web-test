"use strict";
// 這是獨立的本機編輯器，網站公開頁面不載入此檔。
const initial = structuredClone(PRODUCTS);
let items = structuredClone(PRODUCTS);
const specificationFields = ["CPU", "主機板", "顯示卡", "記憶體", "RAM", "SSD", "HDD", "散熱器", "電源供應器", "機殼", "作業系統", "品牌", "型號", "尺寸", "顏色", "材質", "備註"];
const categories = ["電腦配單", "DIY價格零件", "女裝區"];
const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const msg = (s) => $('status').textContent = s;
function render() {
  $('items').innerHTML = items.map((p, i) => `<article class="item" data-index="${i}">
    <div class="item-head"><h2>商品 #${esc(p.id)}</h2><button type="button" class="delete" data-delete="${i}">刪除商品</button></div>
    <div class="fields"><label>商品名稱<input data-field="name" value="${esc(p.name)}"></label>
    <label>商品分類<select data-field="category">${categories.map(c=>`<option value="${esc(c)}" ${p.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></label>
    <label>價格（新台幣）<input type="number" min="0" step="1" data-field="price" value="${esc(p.price)}"></label>
    <label>商品標籤<input data-field="tag" value="${esc(p.tag)}"></label>
    <label>預設圖示 Emoji<input data-field="emoji" value="${esc(p.emoji)}"></label>
    <label>商品圖片網址<input type="text" data-field="img" value="${esc(p.img)}" placeholder="images/pc/1.png 或 https://..."></label></div>
    <div class="spec-editor">
      <h3>商品規格與參考單價</h3><p>三類商品都可以填寫規格。參考單價非必填，已含於商品售價、不重複加總。</p>
      <div class="fields">${specificationFields.map(key=>`<label>${esc(key)}<input data-spec-field="${esc(key)}" value="${esc((p.specs||{})[key]||'')}" placeholder="請填入規格或型號"><small>參考單價（可留空）</small><input type="number" min="0" step="1" data-spec-price="${esc(key)}" value="${esc((p.specPrices||{})[key] ?? '')}" placeholder="例如 3500"></label>`).join('')}</div>
    </div></article>`).join('');
}
$('items').addEventListener('input', event => {
 const specPriceEl = event.target.closest('[data-spec-price]');
 if (specPriceEl) {
   const i = Number(specPriceEl.closest('[data-index]').dataset.index);
   items[i].specPrices ||= {};
   if (specPriceEl.value === '') delete items[i].specPrices[specPriceEl.dataset.specPrice];
   else items[i].specPrices[specPriceEl.dataset.specPrice] = specPriceEl.value;
   return;
 }
 const specEl = event.target.closest('[data-spec-field]');
 if (specEl) {
   const i = Number(specEl.closest('[data-index]').dataset.index);
   items[i].specs ||= {};
   items[i].specs[specEl.dataset.specField] = specEl.value;
   return;
 }

 const el=event.target.closest('[data-field]'); if(!el)return;
 const i=Number(el.closest('[data-index]').dataset.index);
 items[i][el.dataset.field] = el.dataset.field==='price' ? el.value : el.value;
});
$('items').addEventListener('click', e => {
 const btn=e.target.closest('[data-delete]'); if(!btn)return;
 if(confirm('確定刪除此商品？')){items.splice(Number(btn.dataset.delete),1);render();msg('商品已移除，請匯出檔案才會更新網站。')}
});
$('add').onclick=()=>{items.push({id:Math.max(0,...items.map(p=>Number(p.id)||0))+1,name:'新商品',category:'DIY價格零件',price:0,tag:'新品',emoji:'📦',img:'',specs:{}});render();msg('已新增商品，請編輯資料並匯出。')};
$('reset').onclick=()=>{if(confirm('確定還原開啟編輯器時的商品資料？')){items=structuredClone(initial);render();msg('已還原初始商品。')}};

function validate() {
    const ids = new Set();

    for (const p of items) {
        p.id = Number(p.id);
        p.name = String(p.name).trim();
        p.price = Number(p.price);
        p.img = String(p.img || '').trim().replace(/\\/g, '/');

        // 商品 ID 檢查
        if (!Number.isSafeInteger(p.id) || p.id < 1 || ids.has(p.id)) {
            throw Error('商品 ID 重複或不合法');
        }
        ids.add(p.id);

        // 商品名稱檢查
        if (!p.name) {
            throw Error('商品名稱不能空白');
        }

        // 商品分類檢查
        if (!categories.includes(p.category)) {
            throw Error(`分類無效：${p.category}`);
        }

        // 商品價格檢查
        if (!Number.isSafeInteger(p.price) || p.price < 0) {
            throw Error(`價格無效：${p.name}`);
        }

        // 電腦規格表檢查
        if (
            p.specs !== undefined &&
            (typeof p.specs !== 'object' ||
             p.specs === null ||
             Array.isArray(p.specs))
        ) {
            throw Error(`規格表資料不合法：${p.name}`);
        }

        if (p.specs) {
            for (const [k, v] of Object.entries(p.specs)) {
                if (typeof v !== 'string') {
                    p.specs[k] = String(v ?? '');
                }
            }
        }

        // 可選擇性設定規格參考價格；只接受非負整數
        if (p.specPrices) {
            for (const [key, raw] of Object.entries(p.specPrices)) {
                const amount = Number(raw);
                if (raw === '' || !Number.isSafeInteger(amount) || amount < 0) {
                    throw Error(`參考單價不合法：${p.name} / ${key}`);
                }
                p.specPrices[key] = amount;
            }
        }

        // 圖片路徑檢查：支援 HTTPS、本機 images 資料夾與空白
        if (p.img) {
            const isHttps = /^https:\/\/\S+$/i.test(p.img);

            const isLocal =
                /^images\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp|gif)$/i.test(p.img) &&
                !p.img.split('/').includes('..');

            if (!isHttps && !isLocal) {
                throw Error(`圖片路徑格式不正確：${p.name}`);
            }
        }
    }
}
function download(name,content){const url=URL.createObjectURL(new Blob([content],{type:'text/javascript;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
$('export').onclick=()=>{try{validate();download('products.js','// MICKEYKING 商品資料；由本機 editor.html 匯出。\nconst PRODUCTS = '+JSON.stringify(items,null,2)+';\n');msg('已下載 products.js。請取代公開網站同名檔案並重新部署。')}catch(e){alert(e.message)}};
$('importBtn').onclick=()=>$('importInput').click();
$('importInput').onchange=async e=>{const file=e.target.files[0];if(!file)return;
 try{const raw=await file.text(); const match=raw.match(/(?:const|let|var)\s+PRODUCTS\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
 const data=JSON.parse(match ? match[1] : raw);
 if(!Array.isArray(data))throw Error('檔案不是商品陣列');
 const previous=items;items=data;try{validate()}catch(err){items=previous;throw err};render();msg('已匯入商品資料。')
 }catch(err){alert('匯入失敗：'+err.message)}finally{e.target.value=''}};
render();
