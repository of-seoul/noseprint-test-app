import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from './src/screens/HomeScreen';
import {RegisterScreen} from './src/screens/RegisterScreen';
import {IdentifyScreen} from './src/screens/IdentifyScreen';
import {CameraScreen} from './src/screens/CameraScreen';
import {CaptureGuideScreen} from './src/screens/CaptureGuideScreen';
import {RegisterResultScreen} from './src/screens/RegisterResultScreen';
import type {RootStackParamList} from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '코 지문 테스트',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: '등록',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Identify"
          component={IdentifyScreen}
          options={{
            title: '확인',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="CaptureGuide"
          component={CaptureGuideScreen}
          options={{
            title: '촬영 가이드',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            title: '',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="RegisterResult"
          component={RegisterResultScreen}
          options={{
            title: '등록 완료',
            headerShown: true,
            headerLeft: () => null, // 뒤로 가기 버튼 제거
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
