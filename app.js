/*
  MICKEYKING 前端互動
  1. 商品資料：products.js
  2. 商品與購物車：本檔案
  3. 網頁樣式：styles.css
  商品資料為唯讀展示，請使用本機 editor.html 匯出 products.js 後部署。
*/

const $ = (id) => document.getElementById(id);
const money = (value) => `NT$ ${Number(value).toLocaleString('zh-TW')}`;
let lastSpecTrigger = null;
const CART_KEY = 'MICKEYKING-select-local-cart-v2';

// 保護商品字串不會被當作 HTML 指令解析。
function escapeHTML(input) {
  return String(input).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}

const products = PRODUCTS.map((product) => ({ ...product }));
let cart = readStorage(CART_KEY, {});
let selectedCategory = 'all';
let searchKeyword = '';


function matchesCategory(product) {
  if (selectedCategory === 'all') return true;
  if (selectedCategory === 'all-fashion') return product.category === '女裝區';
  if (selectedCategory === 'all-tech') return ['電腦配單', 'DIY價格零件'].includes(product.category);
  return product.category === selectedCategory;
}

function renderProducts() {
  const keyword = searchKeyword.toLocaleLowerCase();
  const items = products.filter((item) => matchesCategory(item) &&
    `${item.name} ${item.category}`.toLocaleLowerCase().includes(keyword));

  if ($('sort').value === 'asc') items.sort((a, b) => a.price - b.price);
  if ($('sort').value === 'desc') items.sort((a, b) => b.price - a.price);

  $('productGrid').innerHTML = items.length ? items.map((product) => {
    const picture = product.img
      ? `<img src="${escapeHTML(product.img)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">` : '';
    const fallbackStyle = product.img ? 'display:none' : 'display:block';
    return `<article class="product">
      <div class="photo">
        ${picture}<span class="fallback" style="${fallbackStyle}">${escapeHTML(product.emoji)}</span>
        <span class="tag">${escapeHTML(product.tag)}</span>
      </div>
      <div class="product-body">
        <span class="product-type">${escapeHTML(product.category)}</span>
        <h3>${escapeHTML(product.name)}</h3>
        <div class="price">${money(product.price)}</div>
        ${product.specs && Object.values(product.specs).some(v=>String(v??'').trim()) ? `<button type="button" class="spec-btn" data-spec="${product.id}">查看規格與價格 ↗</button>` : ''}
        <button type="button" class="add-btn" data-add="${product.id}">＋ 加入購物車</button>
      </div>
    </article>`;
  }).join('') : '<div class="empty">找不到符合條件的商品，請試試其他關鍵字或分類。</div>';
}

function selectCategory(category) {
  selectedCategory = category;
  const names = {
    all: '人氣精選商品',
    'all-tech': '電腦商品精選',
    'all-fashion': '女裝區',
    '電腦配單': '電腦配單',
    'DIY價格零件': 'DIY價格零件'
  };
  $('listTitle').textContent = names[category] || '精選商品';
  document.querySelectorAll('.chip').forEach((button) => {
    button.classList.toggle('active', button.dataset.category === category);
  });
  renderProducts();
  $('products').scrollIntoView({ behavior: 'smooth' });
  closeMobileMenu();
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const entries = products.filter((item) => Number(cart[item.id]) > 0);
  const count = entries.reduce((sum, item) => sum + cart[item.id], 0);
  $('cartCount').textContent = count;
  $('drawerCount').textContent = `(${count})`;
  $('cartItems').innerHTML = entries.length ? entries.map((item) => `
    <div class="cart-item"><div class="cart-thumb">${escapeHTML(item.emoji)}</div>
      <div class="cart-info"><strong>${escapeHTML(item.name)}</strong>
        <span>${money(item.price)}</span>
        <div class="cart-qty">
          <button data-qty="${item.id}" data-change="-1" aria-label="減少數量">−</button>
          <span>${cart[item.id]}</span>
          <button data-qty="${item.id}" data-change="1" aria-label="增加數量">＋</button>
        </div>
      </div>
    </div>`).join('') :
    '<p class="muted" style="text-align:center;margin-top:65px">購物車目前是空的 🛍️<br>快去挑選喜歡的商品吧！</p>';
  $('total').textContent = money(entries.reduce((sum, item) => sum + item.price * cart[item.id], 0));
}

let toastTimeout;
function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('toast').classList.remove('show'), 2200);
}

function showCart(open) {
  $('drawer').classList.toggle('open', open);
  $('overlay').classList.toggle('show', open);
  $('drawer').setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
}

function closeMobileMenu() {
  $('mobileNav').classList.remove('show');
  $('menuToggle').setAttribute('aria-expanded', 'false');
}

// 事件委派：新增商品不需要再寫一次按鈕事件。
document.addEventListener('click', (event) => {
  const categoryButton = event.target.closest('[data-category]');
  if (categoryButton) {
    event.preventDefault();
    selectCategory(categoryButton.dataset.category);
  }
  const specButton = event.target.closest('[data-spec]');
  if (specButton) {
    const product = products.find(p => String(p.id) === String(specButton.dataset.spec));
    if (product) openSpecs(product, specButton);
    return;
  }
  const addButton = event.target.closest('[data-add]');
  if (addButton) {
    const id = addButton.dataset.add;
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    toast('已加入購物車 ✓');
  }
  const qtyButton = event.target.closest('[data-qty]');
  if (qtyButton) {
    const id = qtyButton.dataset.qty;
    cart[id] = Math.max(0, (cart[id] || 0) + Number(qtyButton.dataset.change));
    if (!cart[id]) delete cart[id];
    saveCart();
  }
});

const specKeys = ['CPU','主機板','顯示卡','記憶體','RAM','SSD','HDD','散熱器','電源供應器','機殼','作業系統','品牌','型號','尺寸','顏色','材質','備註'];
function openSpecs(product, trigger) {
  lastSpecTrigger = trigger;
  $('specTitle').textContent = product.name + '｜規格表';
  $('specPrice').textContent = money(product.price);
  const specs = product.specs && typeof product.specs === 'object' ? product.specs : {};
  const keys = [...new Set([...specKeys, ...Object.keys(specs)])];
  const rows = keys.filter(key => String(specs[key] ?? '').trim());
  $('specContent').innerHTML = rows.length
    ? `<div class="spec-table">${rows.map(key => `<div class="spec-row"><div class="spec-label">${escapeHTML(key)}</div><div class="spec-value">${escapeHTML(specs[key])}${product.specPrices?.[key] !== undefined && Number.isSafeInteger(Number(product.specPrices[key])) ? `<small class="spec-unit-price">參考單價：${money(product.specPrices[key])}（已含整機／商品售價）</small>` : ''}</div></div>`).join('')}</div>`
    : '<p class="spec-empty">此配單的詳細規格尚未公布，請聯絡商家確認。</p>';
  $('specOverlay').classList.add('open');
  $('specOverlay').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('specClose').focus();
}
function closeSpecs() {
  $('specOverlay').classList.remove('open');
  $('specOverlay').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastSpecTrigger) lastSpecTrigger.focus();
}
$('specClose').onclick = closeSpecs;
$('specDone').onclick = closeSpecs;
$('specOverlay').addEventListener('click', e => {if (e.target === $('specOverlay')) closeSpecs();});

$('sort').addEventListener('change', renderProducts);
['search', 'mobileSearch'].forEach((id) => {
  $(id).addEventListener('input', (event) => {
    searchKeyword = event.target.value;
    $('search').value = searchKeyword;
    $('mobileSearch').value = searchKeyword;
    renderProducts();
  });
});
$('cartOpen').onclick = () => showCart(true);
$('cartClose').onclick = () => showCart(false);
$('overlay').onclick = () => showCart(false);
$('menuToggle').onclick = () => {
  const open = $('mobileNav').classList.toggle('show');
  $('menuToggle').setAttribute('aria-expanded', String(open));
};
$('mobileNav').querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if ($('specOverlay').classList.contains('open')) closeSpecs(); else showCart(false); }
});
$('checkout').onclick = () => {
  const lines = products.filter(p => Number(cart[p.id]) > 0).map(p => ({id:p.id,qty:Number(cart[p.id])}));
  if (!lines.length) { toast('請先加入商品再產生估價單'); return; }
  // URL 同時帶入商品 ID / 數量：避免 file:// 模式或瀏覽器阻擋 sessionStorage 時估價單空白。
  // 不傳送客戶資訊及前端售價，估價頁只依 products.js 計價。
  const url = new URL('quote.html', window.location.href);
  url.searchParams.set('items', JSON.stringify(lines));
  try { sessionStorage.setItem('MICKEYKING_QUOTE_CART', JSON.stringify(lines)); } catch (_) {}
  window.location.assign(url.href);
};

// 桌機下拉選單也可點擊開合（觸控筆電適用）
document.querySelectorAll('.desktop-nav .nav-item > button.nav-link').forEach((button) => {
  button.addEventListener('click', () => {
    const open = button.parentElement.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
});

renderProducts();
renderCart();
