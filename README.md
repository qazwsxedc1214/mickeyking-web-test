# MICKEYKING — 方案 A 靜態網站

正式預定網域：**https://mickeyking.com/**（僅寫入設定，不代表已購買網域或設定 DNS）

## 檔案用途
- `index.html`：公開首頁（不包含商品編輯入口）
- `styles.css`：原始配色、RWD、下拉選單版型
- `app.js`：商品展示、搜尋、篩選、購物車功能
- `products.js`：公開商品名稱／價格／圖片來源
- `editor.html`、`editor.css`、`editor.js`：僅在自己電腦開啟的商品編輯工具，**不要部署到公開網站**
- `CNAME`：GitHub Pages 的自訂網域宣告
- `robots.txt`、`sitemap.xml`：搜尋引擎輔助設定

## 新增、修改、刪除商品
1. 在電腦上開啟 `editor.html`。
2. 點「＋ 新增商品」，填寫名稱、分類、價格、圖片網址等。
3. 點「下載 products.js」。
4. 用下載的新 `products.js` 覆蓋公開網站目錄中的舊檔。
5. 將公開網站重新部署，並重新整理網頁確認價格已更新。

每次重新開啟編輯器，都從當前 `products.js` 載入資料；如有更新，務必將最新檔案放回編輯器資料夾，避免編輯舊版本。

## GitHub Pages 部署
1. 建立 GitHub Repository。
2. **只上傳** `index.html`、`styles.css`、`app.js`、`products.js`、`CNAME`、`robots.txt`、`sitemap.xml`。
3. Repository → Settings → Pages → Deploy from a branch，選擇主分支的 `/ (root)`。
4. Pages → Custom domain 填入 `mickeyking.com`。
5. 在網域 DNS 提供商設定 GitHub Pages 官方文件指定的 apex A／AAAA 記錄（或使用支援的 ALIAS／ANAME）。DNS 設定請依 GitHub 當時官方文件為準。
6. 解析生效、GitHub 檢查成功後啟用 Enforce HTTPS。
7. 若使用其他主機服務，`CNAME` 不一定適用，請依其文件設定自訂網域與 HTTPS。

## 上線注意
- 這是純前端展示，購物車**不能完成真實付款或訂單**。
- 不提供真正的登入或後台，編輯工具不可部署公開。
- `products.js` 在所有訪客瀏覽器可見，**不要放密碼或私人資料**。
- 聯絡方式、營業地址、保固條款與示範商品仍須補上真實資料。
- 網站程式設定的 mickeyking.com 不會自動綁定網域，需由你控制網域及 DNS。


## 電腦配單規格表（本次新增）
1. 公開首頁的「電腦配單」商品卡會出現「查看完整規格表」，手機、電腦皆可查看。
2. 本機 editor.html 選擇分類「電腦配單」，即可填入 CPU、主機板、顯示卡、記憶體、SSD、散熱器、電源供應器、機殼、作業系統及備註。未填寫的規格不會顯示。
3. 新增或修改後按「下載 products.js」，取代網站舊檔再部署。
4. 舊版 products.js 沒有 specs 欄位也可正常顯示，直到編輯者補齊規格。初始示範配單未填實際型號，避免誤導客人。
5. 規格表內容僅為商家提供的展示資訊，不代表已建立訂單或保固承諾。


## 估價單功能（本次整合）
- 此版本以你上傳的網站原始檔案為基礎，原本圖片、商品及排版均保留。
- 在購物車按「前往估價」，開啟 quote.html，可填入客戶名稱／聯絡方式／備註，再按「列印／另存 PDF」。
- 估價單不產生、也不顯示任何估價單編號。
- 電腦配單、DIY 零件及女裝均能由本機 editor.html 編輯規格，並可選填規格參考價格。
- 同一台整機的內含零件參考價不會重複列入小計；DIY 零件及女裝按商品數量計價。
- 上線請將 quote.html、quote.js、quote.css 一起公開部署，但 editor.* 保持本機使用。
- 本功能只是參考估價，不提供付款及正式訂單簽核；最終價格仍須商家確認。
