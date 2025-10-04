# 修復：Maximum Call Stack Size Exceeded

## 🐛 問題描述

在搜尋頁面出現 `RangeError: Maximum call stack size exceeded` 錯誤，導致頁面無法載入。

## 🔍 問題根源

### 錯誤代碼
```typescript
// ❌ 有問題的代碼
useEffect(() => {
    setCurrentPage(1);
}, [searchQuery, selectedCollege, selectedCredits, selectedTimeSlots]);
```

### 問題分析

1. **陣列參照問題**
   - `selectedTimeSlots` 是一個物件陣列：`TimeSlot[]`
   - 每次組件重新渲染時，即使內容相同，陣列的參照（reference）也會改變
   - React 使用 `Object.is()` 來比較依賴陣列的值

2. **無限循環**
   ```
   useEffect 觸發
   → setCurrentPage(1) 
   → 組件重新渲染
   → selectedTimeSlots 獲得新的參照
   → useEffect 檢測到依賴改變
   → 再次觸發 useEffect
   → ♾️ 無限循環
   ```

3. **堆疊溢出**
   - 無限循環導致函數調用堆疊不斷累積
   - 最終超過 JavaScript 引擎的最大堆疊大小
   - 拋出 `RangeError: Maximum call stack size exceeded`

## ✅ 解決方案

### 方案 1：只追蹤陣列長度（已採用）

```typescript
// ✅ 修復後的代碼
const prevFiltersRef = useRef({
    searchQuery,
    selectedCollege,
    selectedCredits,
    timeSlotsLength: selectedTimeSlots.length  // 只追蹤長度
});

useEffect(() => {
    const prev = prevFiltersRef.current;
    const hasChanged = 
        prev.searchQuery !== searchQuery ||
        prev.selectedCollege !== selectedCollege ||
        prev.selectedCredits !== selectedCredits ||
        prev.timeSlotsLength !== selectedTimeSlots.length;  // 比較長度而非陣列

    if (hasChanged) {
        setCurrentPage(1);
        prevFiltersRef.current = {
            searchQuery,
            selectedCollege,
            selectedCredits,
            timeSlotsLength: selectedTimeSlots.length
        };
    }
}, [searchQuery, selectedCollege, selectedCredits, selectedTimeSlots.length]);
```

### 為什麼這樣有效？

1. **使用 `useRef` 儲存上一次的值**
   - `ref` 的值在渲染之間保持穩定
   - 不會觸發重新渲染

2. **手動比較變化**
   - 明確檢查每個篩選條件是否真的改變
   - 只在真正改變時才更新狀態

3. **只追蹤陣列長度**
   - `selectedTimeSlots.length` 是基本型別（number）
   - 數字比較不會有參照問題
   - 對於這個使用場景已經足夠（選擇/取消選擇時段會改變長度）

### 方案 2：使用 useMemo 穩定化陣列（備選）

```typescript
// 另一種方案（未採用，但也可行）
const timeSlotsKey = useMemo(
    () => selectedTimeSlots.map(s => `${s.day}-${s.period}`).sort().join(','),
    [selectedTimeSlots]
);

useEffect(() => {
    setCurrentPage(1);
}, [searchQuery, selectedCollege, selectedCredits, timeSlotsKey]);
```

### 方案 3：使用 JSON.stringify（不推薦）

```typescript
// ⚠️ 可行但效能較差
useEffect(() => {
    setCurrentPage(1);
}, [searchQuery, selectedCollege, selectedCredits, JSON.stringify(selectedTimeSlots)]);
```

**為什麼不推薦：**
- 每次渲染都要序列化整個陣列
- 效能較差
- ESLint 會警告（違反 React Hooks 規則）

## 📚 技術要點

### React 依賴陣列的比較機制

React 使用 `Object.is()` 來比較依賴：

```javascript
// 基本型別：比較值
Object.is(1, 1)           // true
Object.is('abc', 'abc')   // true

// 物件/陣列：比較參照
Object.is([], [])         // false ❌
Object.is({}, {})         // false ❌

const arr1 = [1, 2, 3];
const arr2 = [1, 2, 3];
Object.is(arr1, arr2)     // false ❌

const arr3 = arr1;
Object.is(arr1, arr3)     // true ✅
```

### 何時會出現這個問題？

在 `useEffect` 依賴陣列中使用：
- ❌ 物件陣列
- ❌ 物件
- ❌ 函數（未經 useCallback 包裝）
- ✅ 基本型別（string, number, boolean）
- ✅ 經 useCallback/useMemo 穩定化的值

### 最佳實踐

1. **盡量使用基本型別作為依賴**
   ```typescript
   // ✅ 好
   useEffect(() => {
       // ...
   }, [userId, isActive, count]);

   // ⚠️ 可能有問題
   useEffect(() => {
       // ...
   }, [user, settings, items]);
   ```

2. **使用 useRef 來追蹤複雜狀態**
   ```typescript
   const prevValueRef = useRef(complexValue);
   
   useEffect(() => {
       if (hasReallyChanged(prevValueRef.current, complexValue)) {
           // 做些什麼
           prevValueRef.current = complexValue;
       }
   }, [/* 只依賴能觸發檢查的值 */]);
   ```

3. **使用 useMemo 穩定化複雜值**
   ```typescript
   const stableValue = useMemo(() => ({
       key: complexValue.key,
       id: complexValue.id
   }), [complexValue.key, complexValue.id]);
   ```

## 🧪 測試驗證

### 修復前
```
瀏覽器控制台：
RangeError: Maximum call stack size exceeded

頁面狀態：
- 頁面凍結
- 無法互動
- 開發者工具顯示大量渲染
```

### 修復後
```
瀏覽器控制台：
✅ 無錯誤

頁面狀態：
✅ 正常載入
✅ 可以選擇時間段
✅ 分頁正常運作
✅ 篩選條件改變時正確重置到第一頁
```

## 🎓 學習要點

1. **理解 React 的依賴比較機制**
   - 基本型別用值比較
   - 物件/陣列用參照比較

2. **識別無限循環的徵兆**
   - 頁面凍結
   - Call stack exceeded 錯誤
   - React DevTools 顯示大量重新渲染

3. **選擇合適的解決方案**
   - 簡單場景：追蹤陣列長度或關鍵屬性
   - 複雜場景：使用 useMemo/useCallback
   - 最後手段：深度比較（效能較差）

4. **預防性編程**
   - 在 useEffect 中使用複雜依賴時要特別小心
   - 優先使用基本型別
   - 使用 ESLint 規則幫助檢測問題

## 📝 相關資源

- [React useEffect 文檔](https://react.dev/reference/react/useEffect)
- [Object.is() MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
- [React Hooks 規則](https://react.dev/warnings/invalid-hook-call-warning)
