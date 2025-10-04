# 修復：課程詳情頁面的無限循環問題

## 🐛 問題描述

在課程詳情頁面（`/course/1141/SE__11150`）出現 `RangeError: Maximum call stack size exceeded` 錯誤。

### 錯誤訊息
```
⨯ [RangeError: Maximum call stack size exceeded] {
  type: 'RangeError',
  page: '/course/1141/SE__11150'
}
GET /course/1141/SE__11150 500 in 9574ms
```

## 🔍 問題根源

### 錯誤代碼

```typescript
// ❌ 有問題的代碼
export default function CourseDetailClient({ course }: CourseProps) {
    const params = useParams();  // 🚨 問題所在
    const router = useRouter();
    const semester = params.semester as string;

    useEffect(() => {
        if (semester && course.course_id) {
            const inSchedule = ScheduleStorage.isCourseInSchedule(semester, course.course_id);
            setIsInSchedule(inSchedule);
        }
    }, [semester, course.course_id]);
    // ...
}
```

### 問題分析

1. **useParams() 的行為**
   - `useParams()` 是一個 React Hook，會在每次渲染時返回當前的路由參數
   - 雖然參數值相同，但每次返回的**物件參照（reference）**都不同
   - 這類似於 `{}` !== `{}` 的情況

2. **無限循環的形成**
   ```
   組件渲染
   → useParams() 返回新的 params 物件
   → semester 取得新的參照
   → useEffect 檢測到 semester 改變
   → 觸發 setIsInSchedule
   → 組件重新渲染
   → ♾️ 無限循環
   ```

3. **為什麼會堆疊溢出？**
   - Next.js Server Component 將 `params` 作為 props 傳給 Client Component
   - Client Component 又使用 `useParams()` 重新獲取 params
   - 兩者之間產生不一致，觸發無限更新循環
   - 每次循環都會增加函數調用堆疊
   - 最終超過 JavaScript 引擎限制

## ✅ 解決方案

### 從 props 接收參數而非使用 useParams()

```typescript
// ✅ 修復後的代碼

// 1. 更新 interface 添加必要的 props
interface CourseProps {
    course: {
        // ...
    };
    semester: string;   // 新增
    courseId: string;   // 新增
}

// 2. 從 props 接收參數
export default function CourseDetailClient({ 
    course, 
    semester,    // ✅ 從 props 接收
    courseId     // ✅ 從 props 接收
}: CourseProps) {
    const router = useRouter();
    // ❌ 移除 const params = useParams();
    // ❌ 移除 const semester = params.semester as string;

    useEffect(() => {
        if (semester && course.course_id) {
            const inSchedule = ScheduleStorage.isCourseInSchedule(semester, course.course_id);
            setIsInSchedule(inSchedule);
        }
    }, [semester, course.course_id]);

    // 3. 使用 props 而非 params
    return (
        <Link href={`/course/${semester}/${courseId}/syllabus`}>
            {/* ... */}
        </Link>
    );
}
```

### 在 Server Component 中傳遞參數

```typescript
// page.tsx (Server Component)
export default async function CourseDetail({ params }: PageProps) {
    const { semester, id } = await params;
    // ...
    
    return (
        <CourseDetailClient 
            course={course} 
            semester={semester}  // ✅ 傳遞 semester
            courseId={id}        // ✅ 傳遞 courseId
        />
    );
}
```

## 🎯 為什麼這樣有效？

### 1. **Props 的穩定性**
```typescript
// Server Component 傳下來的 props 是穩定的
semester = "1141"  // 同一個字串值，同一個參照

// useParams() 每次都返回新物件
params1 = { semester: "1141" }
params2 = { semester: "1141" }
params1 !== params2  // ❌ 不同的參照
```

### 2. **避免重複數據源**
```typescript
// ❌ 有問題：兩個數據源
Server Component props → semester (穩定)
useParams()          → params.semester (不穩定)

// ✅ 正確：單一數據源
Server Component props → semester (穩定)
```

### 3. **符合 Next.js 架構**
- Server Component 負責獲取數據和路由參數
- Client Component 只負責互動邏輯
- 數據單向流動：Server → Client

## 📚 技術要點

### Next.js App Router 中的參數傳遞

#### Server Component (推薦)
```typescript
// ✅ Server Component 中使用 params prop
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ClientComponent id={id} />;
}
```

#### Client Component (小心使用)
```typescript
// ⚠️ Client Component 中使用 useParams()
'use client';
export default function ClientComponent() {
    const params = useParams();
    // 注意：params 每次渲染都是新物件
}
```

### 何時使用 useParams()?

**適合使用：**
- ✅ 純 Client Component 頁面（沒有 Server Component 父組件）
- ✅ 需要在深層子組件中訪問路由參數
- ✅ 路由參數只用於顯示，不用於 useEffect 依賴

**不適合使用：**
- ❌ 在 useEffect 依賴陣列中使用 `params` 物件
- ❌ Server Component 已經提供了 params 的情況
- ❌ 需要穩定參照的場景

### 最佳實踐

1. **優先使用 props 傳遞**
   ```typescript
   // ✅ 好
   <ClientComponent semester={semester} />
   
   // ⚠️ 避免
   // Client Component 內部使用 useParams()
   ```

2. **在 useEffect 中使用基本型別**
   ```typescript
   // ✅ 好 - 使用字串
   useEffect(() => {
       // ...
   }, [semester, courseId]);  // string 類型
   
   // ❌ 差 - 使用物件
   useEffect(() => {
       // ...
   }, [params]);  // object 類型，參照不穩定
   ```

3. **需要 params 時解構出基本型別**
   ```typescript
   // ✅ 好
   const params = useParams();
   const semester = params.semester as string;
   useEffect(() => {
       // ...
   }, [semester]);  // 使用解構出來的字串
   
   // ❌ 差
   const params = useParams();
   useEffect(() => {
       // ...
   }, [params]);  // 使用整個 params 物件
   ```

## 🧪 測試驗證

### 修復前
```
Browser Console:
RangeError: Maximum call stack size exceeded

Network:
GET /course/1141/SE__11150 - 500 Error (9574ms)

React DevTools:
顯示大量重複渲染
```

### 修復後
```
Browser Console:
✅ 無錯誤

Network:
✅ GET /course/1141/SE__11150 - 200 OK

React DevTools:
✅ 正常渲染次數
```

## 🔄 相關修復

這個問題的解決方案也適用於其他類似場景：

1. **SyllabusViewerClient** - 也可能需要類似修復
2. **ScheduleClient** - 檢查是否有類似問題
3. **所有使用 useParams() 的 Client Components**

## 📝 總結

### 問題
- 在 Client Component 中使用 `useParams()` 導致無限循環
- `useParams()` 每次返回新物件參照
- useEffect 依賴檢測到變化，觸發無限更新

### 解決
- 從 Server Component 的 props 接收參數
- 移除 `useParams()` 的使用
- 使用穩定的字串參數而非物件

### 經驗
- 優先使用 props 傳遞數據
- 避免在 useEffect 依賴中使用不穩定的參照
- 理解 Server Component 和 Client Component 的數據流向

## 🎓 學習資源

- [Next.js useParams 文檔](https://nextjs.org/docs/app/api-reference/functions/use-params)
- [React useEffect 依賴陣列](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)
- [Next.js Server & Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
