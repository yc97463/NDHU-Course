# 學期格式雙支援修復

## 🐛 問題描述

使用 `output: export` 配置時，Next.js 要求所有動態路由都必須在 `generateStaticParams()` 中預先定義。

### 錯誤訊息
```
Error: Page "/course/[semester]/[id]/page" is missing param "/course/1141/TCAI10060" 
in "generateStaticParams()", which is required with "output: export" config.
```

### 根本原因
- API 返回的學期格式：`114-1`（帶連字號）
- 使用者訪問的 URL：`/course/1141/TCAI10060`（無連字號）
- `generateStaticParams()` 只生成了帶連字號的路徑
- 導致無連字號的 URL 無法匹配

## ✅ 解決方案

### 策略
為每個學期生成**兩種格式**的靜態路徑：
1. 原始格式：`114-1`（帶連字號）
2. 簡化格式：`1141`（無連字號）

### 實作步驟

#### 1. 更新 `generateStaticParams()`
為每個學期/課程組合生成兩個路徑：

```typescript
export async function generateStaticParams() {
    const params = [];
    
    for (const semester of semesters) {
        for (const courseId of courseIds) {
            // 原始格式 (114-1)
            params.push({ semester, id: courseId });
            
            // 無連字號格式 (1141)
            params.push({ 
                semester: semester.replace('-', ''), 
                id: courseId 
            });
        }
    }
    
    return params;
}
```

#### 2. 標準化學期格式
在所有獲取資料的地方，統一轉換為 API 格式：

```typescript
// 標準化學期格式：如果是 1141 格式，轉換為 114-1
let normalizedSemester = semester;
if (!semester.includes('-') && semester.length === 4) {
    normalizedSemester = `${semester.slice(0, 3)}-${semester.slice(3)}`;
}

// 使用標準化後的格式呼叫 API
const response = await fetch(
    `https://.../${normalizedSemester}/course/${id}.json`
);
```

## 📝 修復的檔案

### 1. `/src/app/search/[semester]/page.tsx`
**修改內容：**
- ✅ `generateStaticParams()` 生成雙格式
- ✅ `getCourses()` 標準化學期格式

**支援的 URL：**
- `/search/114-1` ✅
- `/search/1141` ✅

### 2. `/src/app/course/[semester]/[id]/page.tsx`
**修改內容：**
- ✅ `generateStaticParams()` 生成雙格式
- ✅ `generateMetadata()` 標準化學期格式
- ✅ `CourseDetail` 組件標準化學期格式

**支援的 URL：**
- `/course/114-1/CSIE5160AC` ✅
- `/course/1141/CSIE5160AC` ✅

### 3. `/src/app/course/[semester]/[id]/syllabus/page.tsx`
**修改內容：**
- ✅ `generateStaticParams()` 生成雙格式
- ✅ `generateMetadata()` 標準化學期格式
- ✅ `SyllabusPage` 組件標準化學期格式

**支援的 URL：**
- `/course/114-1/CSIE5160AC/syllabus` ✅
- `/course/1141/CSIE5160AC/syllabus` ✅

## 🎯 修復前後對比

### 修復前
```typescript
// ❌ 只生成帶連字號格式
for (const courseId of courseIds) {
    params.push({ semester, id: courseId }); // 只有 114-1
}
```

**結果：**
- ✅ `/course/114-1/XXX` - 正常
- ❌ `/course/1141/XXX` - 500 錯誤

### 修復後
```typescript
// ✅ 生成兩種格式
for (const courseId of courseIds) {
    params.push({ semester, id: courseId });              // 114-1
    params.push({ semester: semester.replace('-', ''), id: courseId }); // 1141
}
```

**結果：**
- ✅ `/course/114-1/XXX` - 正常
- ✅ `/course/1141/XXX` - 正常

## 📊 影響範圍

### 生成的路徑數量
假設有 3 個學期，每個學期 1000 門課程：

**修復前：**
- 路徑數量：3 × 1000 = 3,000

**修復後：**
- 路徑數量：3 × 1000 × 2 = 6,000

**增加量：** +100%（每個路徑多生成一個變體）

### Build 時間影響
- 預計增加約 10-20% 的 build 時間
- 但換來更好的使用者體驗（兩種 URL 格式都支援）

## 🔍 為什麼需要兩種格式？

### 使用情境

#### 格式 1：帶連字號 `114-1`
- 📚 **官方標準格式**
- 📖 可讀性更好
- 🔗 API 使用的格式

#### 格式 2：無連字號 `1141`
- ⌨️ **輸入方便**（不需要輸入連字號）
- 🔗 URL 更短
- 📱 手機輸入更容易

### 實際範例
使用者可能會：
1. 從搜尋頁面點擊課程 → 使用 `114-1` 格式
2. 直接在網址列輸入 → 可能輸入 `1141` 格式
3. 分享連結給朋友 → 兩種格式都應該能用

## ⚠️ 注意事項

### 1. API 格式固定
API 只接受帶連字號的格式 `114-1`，因此：
- 必須在獲取資料前進行格式轉換
- 三個位置都需要轉換：
  - `generateMetadata()`
  - `getCourses()` / 主組件
  - 所有 fetch 呼叫

### 2. 內部連結建議
在應用內部生成連結時，建議統一使用帶連字號格式：

```typescript
// ✅ 推薦
<Link href={`/course/${semester}/${courseId}`}>

// ⚠️ 避免（雖然也能用）
<Link href={`/course/${semester.replace('-', '')}/${courseId}`}>
```

### 3. SEO 考量
兩種格式指向相同內容，建議：
- 使用 canonical URL 指定主要格式
- 或在一種格式重定向到另一種

## 🧪 測試確認

### 測試案例

#### 1. 搜尋頁面
```bash
✅ GET /search/114-1
✅ GET /search/1141
```

#### 2. 課程詳情頁
```bash
✅ GET /course/114-1/CSIE5160AC
✅ GET /course/1141/CSIE5160AC
```

#### 3. 課程大綱頁
```bash
✅ GET /course/114-1/CSIE5160AC/syllabus
✅ GET /course/1141/CSIE5160AC/syllabus
```

### 驗證方式
1. 啟動開發伺服器：`pnpm run dev`
2. 測試兩種 URL 格式都能正常訪問
3. 檢查 API 呼叫是否使用正確格式
4. 確認沒有 500 錯誤

## 🎉 總結

### 修復完成
✅ 所有動態 `[semester]` 路由現在都支援兩種格式
✅ 無編譯錯誤
✅ 向後相容（舊連結仍然有效）
✅ 使用者體驗改善

### 技術債務
- 考慮未來統一使用單一格式
- 添加格式重定向邏輯
- 在文件中明確建議的 URL 格式

### 學習要點
1. `output: export` 需要完整的 `generateStaticParams()`
2. 動態路由的所有可能路徑都必須預先生成
3. URL 格式應該考慮使用者輸入習慣
4. 內部資料格式和外部 URL 格式可以不同
