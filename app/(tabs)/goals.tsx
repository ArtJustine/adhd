// app/(tabs)/goals.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, FlatList, Modal, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';

export default function GoalsScreen() {
  const { isDark } = useTheme();
  const { goals, addGoal, updateGoal, deleteGoal } = useAppData();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [hasDate, setHasDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const addNewGoal = () => {
    if (newGoal.trim()) {
      const goal = {
        title: newGoal,
        progress: 0,
        date: hasDate ? selectedDate.toISOString() : undefined,
      };
      
      addGoal(goal);
      setNewGoal('');
      setHasDate(false);
      setSelectedDate(new Date());
      setModalVisible(false);
    }
  };
  
  const updateProgress = (id: string, increment: number) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      const newProgress = Math.min(Math.max(goal.progress + increment, 0), 100);
      updateGoal({ ...goal, progress: newProgress });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <Text style={styles.headerTitle}>Goals</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.goalItem, isDark && styles.darkGoalItem]}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalTitle, isDark && styles.darkText]}>{item.title}</Text>
              <TouchableOpacity onPress={() => deleteGoal(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
            
            {item.date && (
              <Text style={[styles.goalDate, isDark && styles.darkSubText]}>
                Due: {formatDate(item.date)}
              </Text>
            )}
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${item.progress}%` },
                    item.progress === 100 && styles.progressComplete
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, isDark && styles.darkSubText]}>{item.progress}%</Text>
            </View>
            
            <View style={styles.goalControls}>
              <TouchableOpacity 
                style={[styles.controlButton, styles.decrementButton]}
                onPress={() => updateProgress(item.id, -25)}
              >
                <Ionicons name="remove" size={20} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.incrementButton]}
                onPress={() => updateProgress(item.id, 25)}
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDark && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>Add New Goal</Text>
            
            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              placeholder="What's your goal?"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={newGoal}
              onChangeText={setNewGoal}
            />
            
            <View style={styles.dateToggleContainer}>
              <Text style={[styles.dateToggleLabel, isDark && styles.darkText]}>Set a due date</Text>
              <Switch
                value={hasDate}
                onValueChange={setHasDate}
                trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
                thumbColor={hasDate ? '#6366F1' : '#F3F4F6'}
              />
            </View>
            
            {hasDate && (
              <TouchableOpacity 
                style={[styles.dateSelector, isDark && styles.darkDateSelector]} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateSelectorText, isDark && styles.darkText]}>
                  {selectedDate.toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={isDark ? 'white' : '#6B7280'} />
              </TouchableOpacity>
            )}
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setSelectedDate(selectedDate);
                  }
                }}
              />
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={addNewGoal}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for bottom tabs
  },
  goalItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkGoalItem: {
    backgroundColor: '#1F2937',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  goalDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  progressComplete: {
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    width: 40,
    textAlign: 'right',
  },
  goalControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  decrementButton: {
    backgroundColor: '#9CA3AF',
  },
  incrementButton: {
    backgroundColor: '#6366F1',
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
  dateToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateToggleLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  darkDateSelector: {
    borderColor: '#4B5563',
    backgroundColor: '#374151',
  },
  dateSelectorText: {
    color: '#1F2937',
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