# Noseprint Test App

Pet noseprint capture test mockup for @scanberry/pet-noseprint module testing.

## Overview

Simple React Native app with:
- Home screen with capture button and record list
- Camera screen with circular guide overlay
- Local image storage via AsyncStorage

## Tech Stack

- React Native CLI (0.84.1)
- TypeScript
- react-native-vision-camera
- @react-navigation/native
- @react-native-async-storage/async-storage

## Setup

### Clone Repository

```bash
git clone https://github.com/of-seoul/noseprint-test-app.git
cd noseprint-test-app
npm install --legacy-peer-deps
```

### iOS Setup

```bash
cd ios
pod install
cd ..
```

**Xcode에서 빌드하기:**

1. `ios/NoseprintTestApp.xcworkspace` 파일을 Xcode로 엽니다 (⚠️ `.xcodeproj`가 아닌 `.xcworkspace` 파일을 열어야 합니다)
2. Xcode 상단 메뉴: **Signing & Capabilities** 탭 선택
3. **Team** 항목에서 본인의 Apple Developer 계정 선택
4. iPhone을 Mac에 연결
5. 상단 타겟 장치에서 연결된 iPhone 선택
6. ▶️ Run 버튼 클릭 또는 `Cmd + R`

**Bundle ID:** `com.ofseoul.test`  
**Display Name:** NoseprintTest  
**Deployment Target:** iOS 15.0+

### Android Setup

```bash
npm run android
```

## Run

### iOS
```bash
# Terminal에서 Metro 서버 실행
npm start

# Xcode에서 Run 또는
npx react-native run-ios
```

### Android
```bash
npm run android
```

## Features

### Home Screen
- "코 지문 촬영 테스트" title
- [촬영하기] button → navigate to Camera
- Previous capture records list (from AsyncStorage)

### Camera Screen
- VisionCamera integration
- Circular guide overlay (60% of screen width)
- "코를 이 안에 맞추세요" instruction text
- [촬영] button at bottom
- Capture → save to local storage → save path to AsyncStorage → return to Home

## Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx
│   └── CameraScreen.tsx
├── types/
│   └── navigation.ts
└── config.ts
```

## Configuration

### API Server
서버 URL은 `src/config.ts`에 설정되어 있습니다:
```typescript
export const API_BASE_URL = 'http://3.37.8.223:8000';
```

### iOS HTTP 허용 설정
iOS에서 HTTP 통신을 위해 `Info.plist`에 ATS(App Transport Security) 설정이 포함되어 있습니다.

## Notes

- This is a **test mockup** — minimal design, focus on functionality
- Camera testing requires physical device (not emulator)
- iOS 빌드 시 `--legacy-peer-deps` 옵션 필요
- Pod 설치는 Mac에서 수행해야 합니다 (CocoaPods 필요)
