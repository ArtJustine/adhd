// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Audio } from 'expo-av';
import { AppDataProvider } from '../context/AppDataContext';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  // Set up audio session on app start
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.log('Error setting up audio:', error);
      }
    };
    
    setupAudio();
  }, []);

  return (
    <AppDataProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </AppDataProvider>
  );
}