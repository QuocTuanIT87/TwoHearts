import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  router,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { AppProvider, useApp } from "../src/context/AppContext";
import { BackupService } from "../src/services/BackupService";
import { GoogleDriveService } from "../src/services/GoogleDriveService";
import { CustomAlertProvider } from "../src/components/CustomAlert";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { users, isLoading } = useApp();
  const [isReady, setIsReady] = useState(false);
  const [startupChecked, setStartupChecked] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (!isLoading && !initialLoadDone) {
      setInitialLoadDone(true);
    }
  }, [isLoading, initialLoadDone]);

  useEffect(() => {
    // Register background backup task and run startup check
    const initBackup = async () => {
      await BackupService.registerBackgroundTask();
      await BackupService.checkAndRunBackup(false);
    };
    initBackup();
  }, []);

  useEffect(() => {
    if (!isLoading && !startupChecked) {
      const checkStatus = async () => {
        if (users.length < 2) {
          const isGoogleConnected = await GoogleDriveService.isLoggedIn();
          if (!isGoogleConnected) {
            router.replace("/google-connect");
          } else {
            router.replace("/onboarding");
          }
        } else {
          setIsReady(true);
        }
        setStartupChecked(true);
      };
      checkStatus();
    } else if (!isLoading && users.length >= 2) {
      setIsReady(true);
    }
  }, [users, isLoading, startupChecked]);

  if (!initialLoadDone) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fbfe",
        }}
      >
        <ActivityIndicator size="large" color="#5596e0" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen
          name="google-connect"
          options={{ gestureEnabled: false }}
        />
      </Stack>
      <CustomAlertProvider />
    </ThemeProvider>
  );
}
