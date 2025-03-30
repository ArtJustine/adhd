// context/AppDataContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for our data
export interface Reminder {
  id: string;
  text: string;
  date: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  date?: string; // Optional date for goals
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  notes?: string;
  color: string;
}

export interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // number of cycles
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  soundEffects: boolean;
}

interface AppDataContextType {
  // Data
  reminders: Reminder[];
  goals: Goal[];
  events: CalendarEvent[];
  pomodoroSettings: PomodoroSettings;
  profile: UserProfile;
  settings: AppSettings;
  
  // Methods
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  
  updatePomodoroSettings: (settings: PomodoroSettings) => void;
  updateProfile: (profile: UserProfile) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider = ({ children }: AppDataProviderProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  });
  const [profile, setProfile] = useState<UserProfile>({
    name: 'User',
    email: 'user@example.com',
  });
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    notifications: true,
    soundEffects: true,
  });
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load app settings first to ensure dark mode is applied immediately
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        
        // Load reminders
        const savedReminders = await AsyncStorage.getItem('reminders');
        if (savedReminders) {
          setReminders(JSON.parse(savedReminders));
        }
        
        // Load goals
        const savedGoals = await AsyncStorage.getItem('goals');
        if (savedGoals) {
          setGoals(JSON.parse(savedGoals));
        }
        
        // Load events
        const savedEvents = await AsyncStorage.getItem('calendarEvents');
        if (savedEvents) {
          setEvents(JSON.parse(savedEvents));
        }
        
        // Load pomodoro settings
        const savedPomodoroSettings = await AsyncStorage.getItem('pomodoroSettings');
        if (savedPomodoroSettings) {
          setPomodoroSettings(JSON.parse(savedPomodoroSettings));
        }
        
        // Load profile
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
        
        setIsDataLoaded(true);
      } catch (error) {
        console.log('Error loading data:', error);
        setIsDataLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // Save reminders when they change
  useEffect(() => {
    if (!isDataLoaded) return;
    
    const saveReminders = async () => {
      try {
        await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
      } catch (error) {
        console.log('Error saving reminders:', error);
      }
    };
    
    saveReminders();
  }, [reminders, isDataLoaded]);

  // Save goals when they change
  useEffect(() => {
    if (!isDataLoaded) return;
    
    const saveGoals = async () => {
      try {
        await AsyncStorage.setItem('goals', JSON.stringify(goals));
      } catch (error) {
        console.log('Error saving goals:', error);
      }
    };
    
    saveGoals();
  }, [goals, isDataLoaded]);

  // Save events when they change
  useEffect(() => {
    if (!isDataLoaded) return;
    
    const saveEvents = async () => {
      try {
        await AsyncStorage.setItem('calendarEvents', JSON.stringify(events));
      } catch (error) {
        console.log('Error saving events:', error);
      }
    };
    
    saveEvents();
  }, [events, isDataLoaded]);

  // Save pomodoro settings when they change
  useEffect(() => {
    if (!isDataLoaded) return;
    
    const savePomodoroSettings = async () => {
      try {
        await AsyncStorage.setItem('pomodoroSettings', JSON.stringify(pomodoroSettings));
      } catch (error) {
        console.log('Error saving pomodoro settings:', error);
      }
    };
    
    savePomodoroSettings();
  }, [pomodoroSettings, isDataLoaded]);

  // Save profile when it changes
  useEffect(() => {
    if (!isDataLoaded) return;
    
    const saveProfile = async () => {
      try {
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      } catch (error) {
        console.log('Error saving profile:', error);
      }
    };
    
    saveProfile();
  }, [profile, isDataLoaded]);

  // Save settings when they change - CRITICAL for dark mode persistence
  useEffect(() => {
    if (!isDataLoaded) return;
    
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      } catch (error) {
        console.log('Error saving settings:', error);
      }
    };
    
    saveSettings();
  }, [settings, isDataLoaded]);

  // Reminder methods
  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    setReminders([...reminders, newReminder]);
  };

  const updateReminder = (reminder: Reminder) => {
    setReminders(reminders.map(r => r.id === reminder.id ? reminder : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  // Goal methods
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (goal: Goal) => {
    setGoals(goals.map(g => g.id === goal.id ? goal : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  // Event methods
  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
    };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (event: CalendarEvent) => {
    setEvents(events.map(e => e.id === event.id ? event : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  // Settings methods
  const updatePomodoroSettings = (newSettings: PomodoroSettings) => {
    setPomodoroSettings(newSettings);
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const value = {
    reminders,
    goals,
    events,
    pomodoroSettings,
    profile,
    settings,
    
    addReminder,
    updateReminder,
    deleteReminder,
    
    addGoal,
    updateGoal,
    deleteGoal,
    
    addEvent,
    updateEvent,
    deleteEvent,
    
    updatePomodoroSettings,
    updateProfile,
    updateSettings,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};