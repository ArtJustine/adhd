// app/(tabs)/more.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, Switch, Modal, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';

export default function MoreScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { 
    settings, 
    updateSettings, 
    pomodoroSettings, 
    updatePomodoroSettings,
    profile,
    updateProfile
  } = useAppData();
  
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [pomodoroModalVisible, setPomodoroModalVisible] = useState(false);
  
  const [editedName, setEditedName] = useState(profile.name);
  const [editedEmail, setEditedEmail] = useState(profile.email);
  
  const [workDuration, setWorkDuration] = useState(pomodoroSettings.workDuration.toString());
  const [breakDuration, setBreakDuration] = useState(pomodoroSettings.breakDuration.toString());
  const [longBreakDuration, setLongBreakDuration] = useState(pomodoroSettings.longBreakDuration.toString());
  const [longBreakInterval, setLongBreakInterval] = useState(pomodoroSettings.longBreakInterval.toString());
  
  const saveProfile = () => {
    if (editedName.trim() && editedEmail.trim()) {
      updateProfile({
        ...profile,
        name: editedName,
        email: editedEmail,
      });
      setProfileModalVisible(false);
    }
  };
  
  const savePomodoroSettings = () => {
    const settings = {
      workDuration: parseInt(workDuration) || 25,
      breakDuration: parseInt(breakDuration) || 5,
      longBreakDuration: parseInt(longBreakDuration) || 15,
      longBreakInterval: parseInt(longBreakInterval) || 4,
    };
    
    updatePomodoroSettings(settings);
    setPomodoroModalVisible(false);
  };
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              setEditedName(profile.name);
              setEditedEmail(profile.email);
              setProfileModalVisible(true);
            }}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name="person-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <View>
                <Text style={[styles.menuText, isDark && styles.darkText]}>Profile</Text>
                <Text style={[styles.menuSubText, isDark && styles.darkSubText]}>{profile.name}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#D1D5DB' : '#9CA3AF'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="notifications-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#D1D5DB' : '#9CA3AF'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="lock-closed-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#D1D5DB' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Preferences</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="notifications-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>Notifications</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSettings({ notifications: value })}
              trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
              thumbColor={settings.notifications ? '#6366F1' : '#F3F4F6'}
            />
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="moon-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
              thumbColor={isDark ? '#6366F1' : '#F3F4F6'}
            />
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="volume-high-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>Sound Effects</Text>
            </View>
            <Switch
              value={settings.soundEffects}
              onValueChange={(value) => updateSettings({ soundEffects: value })}
              trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
              thumbColor={settings.soundEffects ? '#6366F1' : '#F3F4F6'}
            />
          </View>
        </View>
        
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Pomodoro Settings</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setWorkDuration(pomodoroSettings.workDuration.toString());
              setBreakDuration(pomodoroSettings.breakDuration.toString());
              setLongBreakDuration(pomodoroSettings.longBreakDuration.toString());
              setLongBreakInterval(pomodoroSettings.longBreakInterval.toString());
              setPomodoroModalVisible(true);
            }}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name="time-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>Work Duration</Text>
            </View>
            <Text style={[styles.menuValue, isDark && styles.darkSubText]}>{pomodoroSettings.workDuration} min</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="cafe-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>Break Duration</Text>
            </View>
            <Text style={[styles.menuValue, isDark && styles.darkSubText]}>{pomodoroSettings.breakDuration} min</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="repeat-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>Long Break Interval</Text>
            </View>
            <Text style={[styles.menuValue, isDark && styles.darkSubText]}>{pomodoroSettings.longBreakInterval} cycles</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>About</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="information-circle-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>About App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#D1D5DB' : '#9CA3AF'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="help-circle-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#D1D5DB' : '#9CA3AF'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="star-outline" size={24} color="#6366F1" style={styles.menuIcon} />
              <Text style={[styles.menuText, isDark && styles.darkText]}>Rate App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#D1D5DB' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={[styles.versionText, isDark && styles.darkSubText]}>Version 1.0.0</Text>
      </ScrollView>
      
      {/* Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDark && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>Edit Profile</Text>
            
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: profile.avatar || 'https://via.placeholder.com/100' }} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.inputLabel, isDark && styles.darkText]}>Name</Text>
            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              value={editedName}
              onChangeText={setEditedName}
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            />
            
            <Text style={[styles.inputLabel, isDark && styles.darkText]}>Email</Text>
            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              value={editedEmail}
              onChangeText={setEditedEmail}
              keyboardType="email-address"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={saveProfile}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Pomodoro Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={pomodoroModalVisible}
        onRequestClose={() => setPomodoroModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDark && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>Pomodoro Settings</Text>
            
            <Text style={[styles.inputLabel, isDark && styles.darkText]}>Work Duration (minutes)</Text>
            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              value={workDuration}
              onChangeText={setWorkDuration}
              keyboardType="number-pad"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            />
            
            <Text style={[styles.inputLabel, isDark && styles.darkText]}>Break Duration (minutes)</Text>
            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              value={breakDuration}
              onChangeText={setBreakDuration}
              keyboardType="number-pad"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            />
            
            <Text style={[styles.inputLabel, isDark && styles.darkText]}>Long Break Duration (minutes)</Text>
            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              value={longBreakDuration}
              onChangeText={setLongBreakDuration}
              keyboardType="number-pad"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            />
            
            <Text style={[styles.inputLabel, isDark && styles.darkText]}>Long Break Interval (cycles)</Text>
            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              value={longBreakInterval}
              onChangeText={setLongBreakInterval}
              keyboardType="number-pad"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setPomodoroModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={savePomodoroSettings}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  darkText: {
    color: 'white',
  },
  darkSubText: {
    color: '#D1D5DB',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: '#1F2937',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#1F2937',
  },
  menuSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  menuValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    margin: 16,
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModalContent: {
    backgroundColor: '#1F2937',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1F2937',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#1F2937',
  },
  darkInput: {
    borderColor: '#4B5563',
    color: 'white',
    backgroundColor: '#374151',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#9CA3AF',
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});