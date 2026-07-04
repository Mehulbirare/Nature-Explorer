/**
 * Nature Explorer — a camera treasure-hunt for kids (ages 3–8).
 * NavigationContainer + native stack with fade-slide transitions (never hard cuts).
 */
import React from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import {RootStackParamList} from './navigation';
import {WelcomeScreen} from './screens/WelcomeScreen';
import {PickScreen} from './screens/PickScreen';
import {JournalScreen} from './screens/JournalScreen';
import {DayScreen} from './screens/DayScreen';
import {HuntScreen} from './screens/HuntScreen';
import {WinScreen} from './screens/WinScreen';
import {colors} from './theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: 320,
  contentStyle: {backgroundColor: colors.primaryDark},
};

const navTheme = {
  ...DefaultTheme,
  colors: {...DefaultTheme.colors, background: colors.primaryDark},
};

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator initialRouteName="Welcome" screenOptions={screenOptions}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen
              name="Pick"
              component={PickScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="Journal"
              component={JournalScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="Day"
              component={DayScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="Hunt"
              component={HuntScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="Win"
              component={WinScreen}
              options={{animation: 'fade', gestureEnabled: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
