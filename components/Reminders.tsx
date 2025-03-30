// components/Reminders.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';

export default function Reminders() {
  const { isDark } = useTheme();
  const { reminders, addReminder, updateReminder, deleteReminder } = useAppData();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newReminder, setNewReminder] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const handleAddReminder = () => {
    if (newReminder.trim()) {
      addReminder({
        text: newReminder,
        date: selectedDate.toISOString(),
        completed: false,
      });
      
      setNewReminder('');
      setSelectedDate(new Date());
      setModalVisible(false);
    }
  };
  
  const toggleComplete = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      updateReminder({ ...reminder, completed: !reminder.completed });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>Reminders</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={isDark ? 'white' : 'white'} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.reminderItem, isDark && styles.darkReminderItem]}>
            <TouchableOpacity 
              style={styles.checkbox} 
              onPress={() => toggleComplete(item.id)}
            >
              {item.completed ? (
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              ) : (
                <Ionicons name="ellipse-outline" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              )}
            </TouchableOpacity>
            <View style={styles.reminderContent}>
              <Text style={[
                styles.reminderText,
                isDark && styles.darkText,
                item.completed && styles.completedText,
                item.completed && isDark && styles.darkCompletedText
              ]}>
                {item.text}
              </Text>
              <Text style={[styles.reminderDate, isDark && styles.darkSubText]}>
                {formatDate(item.date)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteReminder(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, isDark && styles.darkSubText]}>
            No reminders yet. Add one with the + button!
          </Text>
        }
        style={styles.remindersList}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDark && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>Add Reminder</Text>
            
            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              placeholder="What do you need to remember?"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={newReminder}
              onChangeText={setNewReminder}
            />
            
            <Text style={[styles.dateLabel, isDark && styles.darkText]}>Date & Time:</Text>
            <TouchableOpacity 
              style={[styles.dateSelector, isDark && styles.darkDateSelector]} 
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateSelectorText, isDark && styles.darkText]}>
                {selectedDate.toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={isDark ? 'white' : '#6B7280'} />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="datetime"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setSelectedDate(date);
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
                onPress={handleAddReminder}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: '#6366F1',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remindersList: {
    maxHeight: 250,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  darkReminderItem: {
    backgroundColor: '#374151',
  },
  checkbox: {
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
    marginRight: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#1F2937',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  darkCompletedText: {
    color: '#6B7280',
  },
  reminderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 16,
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
  dateLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
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