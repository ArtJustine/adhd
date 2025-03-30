// app/(tabs)/index.tsx
import React from 'react';
import { StyleSheet, ScrollView, View, Text, SafeAreaView, StatusBar } from 'react-native';
import PomodoroTimer from '../../components/PomodoroTimer';
import QuickNotes from '../../components/QuickNotes';
import Reminders from '../../components/Reminders';
import MusicPlayer from '../../components/MusicPlayer';
import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const { isDark } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#F9FAFB"} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={[styles.header, isDark && styles.darkHeader]}>
          <Text style={styles.headerTitle}>ADHD Assistant</Text>
        </View>
        
        {/* Pomodoro Timer */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <PomodoroTimer />
        </View>
        
        {/* Quick Notes */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <QuickNotes />
        </View>
        
        {/* Reminders */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Reminders />
        </View>
        
        {/* Extra padding at bottom to ensure content isn't covered by music player */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <View style={[styles.musicPlayerContainer, isDark && styles.darkMusicPlayerContainer]}>
        <MusicPlayer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 80, // Space for music player
  },
  header: {
    padding: 16,
    backgroundColor: '#6366F1',
  },
  darkHeader: {
    backgroundColor: '#4F46E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: '#1F2937',
    shadowColor: '#000',
  },
  bottomPadding: {
    height: 60, // Extra padding at the bottom
  },
  musicPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  darkMusicPlayerContainer: {
    backgroundColor: '#1F2937',
  },
});