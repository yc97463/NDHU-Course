# 時間段篩選功能

## 功能概述

時間段篩選功能允許使用者在課程搜尋頁面選擇特定的時間段，系統會自動篩選出所有上課時間都在選定時段內的課程。

## 使用方式

### 1. 開啟篩選面板
在搜尋頁面 (`/search/[semester]`) 點擊「篩選條件」按鈕，展開篩選面板。

### 2. 選擇時間段
在「可用時間段」區域，您可以：

#### 單點選擇
- 點擊任意時間格子來選擇/取消選擇該時段
- 已選擇的時段會顯示為藍色並帶有勾選圖示

#### 拖曳選擇
- 按住滑鼠左鍵並拖曳，可以快速選擇多個連續時段
- 拖曳起始格是已選中的，則拖曳路徑上的格子都會被取消選擇
- 拖曳起始格是未選中的，則拖曳路徑上的格子都會被選中

#### 快速選擇
- **點擊週次標題**（週一、週二等）：選擇/取消該天的所有時段
- **點擊時段標題**（1-16節）：選擇/取消所有天的該節次
- **上午按鈕**：快速選擇週一到週五的 3-6 節
- **下午按鈕**：快速選擇週一到週五的 8-11 節
- **晚上按鈕**：快速選擇週一到週五的 13-16 節

### 3. 篩選邏輯
選擇時間段後，系統會：
- 只顯示**所有上課時間都在**選定時段內的課程
- 如果一門課程有任何一節課不在選定時段內，該課程將被過濾掉
- 這確保了搜尋結果的課程不會與您的空閒時間衝突

### 4. 清除篩選
- 點擊「清除」按鈕可以清除所有已選時段
- 點擊「清除所有篩選」按鈕可以清除包括時間段在內的所有篩選條件

## 技術實現

### 元件結構
```
src/components/Search/
├── TimeSlotSelector.tsx    # 時間表選擇器組件
└── SearchClient.tsx         # 搜尋主頁面（包含時間篩選邏輯）
```

### 資料格式

#### class_time 解析
API 返回的 `class_time` 格式為字串：`/二4/二5/二6`

解析邏輯：
```typescript
// 分割字串並過濾空值
const timeSlots = course.class_time.split('/').filter(Boolean);
// ["二4", "二5", "二6"]

// 提取星期和節次
parsedClassTime = timeSlots.map((slot: string) => {
    const day = slot.charAt(0);      // "二"
    const period = slot.substring(1); // "4"
    return { day, period };
});
```

#### TimeSlot 介面
```typescript
interface TimeSlot {
    day: string;    // "一", "二", "三", "四", "五"
    period: number; // 1-16
}
```

### 篩選邏輯
```typescript
// 檢查課程是否在選定的時間段內
result = result.filter(course => {
    // 課程的所有時段都必須在選定範圍內
    return course.class_time.every(classTime => {
        return selectedTimeSlots.some(slot => 
            slot.day === classTime.day && 
            slot.period === parseInt(classTime.period)
        );
    });
});
```

## UI/UX 特色

### 視覺回饋
- ✅ 已選時段：藍色背景 + 白色勾選圖示
- 🔵 未選時段：白色背景 + 懸停變藍
- 🎯 拖曳中：即時視覺反饋
- 📊 選擇統計：即時顯示已選時段數量

### 互動體驗
- 🖱️ 支援點擊、拖曳操作
- ⚡ 快速選擇功能（整天/整節/時段範圍）
- 🔄 即時篩選更新
- 📱 響應式設計（支援手機、平板、桌面）

### 動畫效果
- Framer Motion 提供流暢的動畫過渡
- 格子選中/取消的縮放動畫
- 勾選圖示的淡入淡出
- 面板展開/收合動畫

## 使用場景

### 場景 1：只想上早課
1. 點擊「上午 (3-6節)」快速選擇按鈕
2. 系統顯示所有課程都在早上的課程

### 場景 2：週三下午有社團活動
1. 取消選擇週三的 8-11 節
2. 系統自動排除週三下午有課的課程

### 場景 3：想避開午休時間
1. 選擇所有時段，但取消選擇第 7 節（12:10~13:00）
2. 系統顯示不會佔用午休時間的課程

## 資料來源

課程資料來自：`https://yc97463.github.io/ndhu-course-crawler/{semester}/main.json`

資料結構：
```json
{
  "CSIE5160AC": {
    "course_id": "CSIE5160AC",
    "course_name": "人工智慧AC",
    "class_time": "/二4/二5/二6",
    "teacher": "/顏士淨",
    "classroom": "/理工二館E403/理工二館E403/理工二館E403",
    "credits": "3/3",
    "college": "理工學院::COLLEGE OF SCIENCE AND ENGINEERING",
    "offering_department": "資訊工程學系::DEPARTMENT OF COMPUTER SCIENCE AND INFORMATION ENGINEERING"
  }
}
```

## 未來改進方向

- [ ] 新增「排除時段」模式（顯示至少有一節不在選定時段內的課程）
- [ ] 支援儲存常用的時間段配置
- [ ] 新增「與我的課表不衝突」篩選選項
- [ ] 時間段視覺化熱力圖（顯示各時段的課程數量）
- [ ] 支援鍵盤快捷鍵操作
