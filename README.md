# Noseprint Test App

Pet noseprint capture test mockup for @scanberry/pet-noseprint module testing.

## Overview

Simple React Native app with:
- Home screen with capture button and record list
- Camera screen with circular guide overlay
- Local image storage via AsyncStorage

## Tech Stack

- React Native CLI (no Expo)
- TypeScript
- react-native-vision-camera
- @react-navigation/native
- @react-native-async-storage/async-storage

## Setup

```bash
cd /home/ubuntu/projects/noseprint-test-app
npm install
```

## Run

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
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
└── types/
    └── navigation.ts
```

## Notes

- This is a **test mockup** — minimal design, focus on functionality
- Camera testing requires physical device (not emulator)
- No sensitive data in .env
