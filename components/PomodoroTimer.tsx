// components/PomodoroTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';

export default function PomodoroTimer() {
  const { isDark } = useTheme();
  const { pomodoroSettings, settings } = useAppData();
  
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<'work' | 'break' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [lastActiveTime, setLastActiveTime] = useState<number | null>(null);
  const [cycleCount, setCycleCount] = useState(0);
  
  const workTime = pomodoroSettings.workDuration * 60;
  const breakTime = pomodoroSettings.breakDuration * 60;
  const longBreakTime = pomodoroSettings.longBreakDuration * 60;
  const longBreakInterval = pomodoroSettings.longBreakInterval;
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load saved timer state on component mount
  useEffect(() => {
    loadTimerState();
  }, []);
  
  // Update timer when settings change
  useEffect(() => {
    if (!isActive) {
      if (mode === 'work') {
        setTimeLeft(pomodoroSettings.workDuration * 60);
      } else if (mode === 'break') {
        setTimeLeft(pomodoroSettings.breakDuration * 60);
      } else if (mode === 'longBreak') {
        setTimeLeft(pomodoroSettings.longBreakDuration * 60);
      }
    }
  }, [pomodoroSettings, mode, isActive]);
  
  // Save timer state when it changes
  useEffect(() => {
    saveTimerState();
  }, [isActive, isPaused, mode, timeLeft, cycleCount]);
  
  // Handle timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      // Save the current timestamp when timer is active
      setLastActiveTime(Date.now());
      
      intervalRef.current = setInterval(() => {
        setTimeLeft((timeLeft) => {
          if (timeLeft <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            
            // Play sound if enabled
            if (settings.soundEffects) {
              Vibration.vibrate([500, 500, 500]);
            }
            
            // Switch modes
            if (mode === 'work') {
              // Increment cycle count
              const newCycleCount = cycleCount + 1;
              setCycleCount(newCycleCount);
              
              // Check if it's time for a long break
              if (newCycleCount % longBreakInterval === 0) {
                setMode('longBreak');
                return longBreakTime;
              } else {
                setMode('break');
                return breakTime;
              }
            } else {
              setMode('work');
              return workTime;
            }
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout);
      
      // If we're pausing, save the current time
      if (isPaused && isActive) {
        setLastActiveTime(Date.now());
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, mode, cycleCount, settings.soundEffects]);
  
  const saveTimerState = async () => {
    try {
      const timerState = {
        isActive,
        isPaused,
        mode,
        timeLeft,
        lastActiveTime: lastActiveTime || Date.now(),
        cycleCount
      };
      await AsyncStorage.setItem('pomodoroTimerState', JSON.stringify(timerState));
    } catch (error) {
      console.log('Error saving timer state:', error);
    }
  };
  
  const loadTimerState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('pomodoroTimerState');
      if (savedState) {
        const timerState = JSON.parse(savedState);
        
        // Calculate elapsed time since last active
        if (timerState.isActive && !timerState.isPaused && timerState.lastActiveTime) {
          const now = Date.now();
          const elapsed = Math.floor((now - timerState.lastActiveTime) / 1000);
          
          // If the timer should have completed while app was closed
          if (elapsed >= timerState.timeLeft) {
            // Switch to the next mode
            if (timerState.mode === 'work') {
              const newCycleCount = timerState.cycleCount + 1;
              setCycleCount(newCycleCount);
              
              if (newCycleCount % longBreakInterval === 0) {
                setMode('longBreak');
                setTimeLeft(longBreakTime);
              } else {
                setMode('break');
                setTimeLeft(breakTime);
              }
            } else {
              setMode('work');
              setTimeLeft(workTime);
            }
            setIsActive(false);
            setIsPaused(false);
          } else {
            // Resume with adjusted time
            setTimeLeft(timerState.timeLeft - elapsed);
            setMode(timerState.mode);
            setIsActive(timerState.isActive);
            setIsPaused(timerState.isPaused);
            setCycleCount(timerState.cycleCount);
          }
        } else {
          // Just restore the saved state
          setTimeLeft(timerState.timeLeft);
          setMode(timerState.mode);
          setIsActive(timerState.isActive);
          setIsPaused(timerState.isPaused);
          setCycleCount(timerState.cycleCount);
        }
        
        setLastActiveTime(timerState.lastActiveTime);
      }
    } catch (error) {
      console.log('Error loading timer state:', error);
    }
  };
  
  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setLastActiveTime(Date.now());
  };
  
  const handlePause = () => {
    setIsPaused(true);
    setLastActiveTime(Date.now());
  };
  
  const handleResume = () => {
    setIsPaused(false);
    setLastActiveTime(Date.now());
  };
  
  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setMode('work');
    setTimeLeft(workTime);
    setLastActiveTime(null);
    setCycleCount(0);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getModeColor = () => {
    if (mode === 'work') return '#6366F1';
    if (mode === 'break') return '#10B981';
    return '#8B5CF6'; // longBreak
  };
  
  const getModeText = () => {
    if (mode === 'work') return 'FOCUS TIME';
    if (mode === 'break') return 'SHORT BREAK';
    return 'LONG BREAK';
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>Pomodoro Timer</Text>
        <Text style={[styles.modeText, { color: getModeColor() }]}>
          {getModeText()}
        </Text>
      </View>
      
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, isDark && styles.darkText]}>{formatTime(timeLeft)}</Text>
        <Text style={[styles.cycleText, isDark && styles.darkSubText]}>
          Cycle: {cycleCount} / {longBreakInterval}
        </Text>
      </View>
      
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : isPaused ? (
          <TouchableOpacity style={styles.button} onPress={handleResume}>
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePause}>
            <Ionicons name="pause" size={24} color="white" />
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Ionicons name="refresh" size={24} color="white" />
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  darkText: {
    color: 'white',
  },
  darkSubText: {
    color: '#D1D5DB',
  },
  modeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cycleText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
  },
  resetButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});