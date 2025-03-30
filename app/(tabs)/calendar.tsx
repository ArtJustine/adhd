// app/(tabs)/calendar.tsx
import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, FlatList, Modal, TextInput, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';

// Color options for events
const EVENT_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
];

export default function CalendarScreen() {
  const { isDark } = useTheme();
  const { reminders, goals, events, addEvent, deleteEvent } = useAppData();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [eventTime, setEventTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(EVENT_COLORS[0]);
  
  // Prepare marked dates for the calendar
  const markedDates = useMemo(() => {
    const dates: { [date: string]: any } = {};
    
    // Add events
    events.forEach(event => {
      const dateStr = event.date.split('T')[0];
      if (!dates[dateStr]) {
        dates[dateStr] = { dots: [] };
      }
      
      if (!dates[dateStr].dots.some((dot: any) => dot.color === event.color)) {
        dates[dateStr].dots.push({ color: event.color });
      }
    });
    
    // Add reminders
    reminders.forEach(reminder => {
      const dateStr = new Date(reminder.date).toISOString().split('T')[0];
      if (!dates[dateStr]) {
        dates[dateStr] = { dots: [] };
      }
      
      if (!dates[dateStr].dots.some((dot: any) => dot.color === '#6366F1')) {
        dates[dateStr].dots.push({ color: '#6366F1' });
      }
    });
    
    // Add goals with dates
    goals.forEach(goal => {
      if (goal.date) {
        const dateStr = new Date(goal.date).toISOString().split('T')[0];
        if (!dates[dateStr]) {
          dates[dateStr] = { dots: [] };
        }
        
        if (!dates[dateStr].dots.some((dot: any) => dot.color === '#F59E0B')) {
          dates[dateStr].dots.push({ color: '#F59E0B' });
        }
      }
    });
    
    // Highlight selected date
    if (selectedDate) {
      if (!dates[selectedDate]) {
        dates[selectedDate] = {};
      }
      dates[selectedDate].selected = true;
      dates[selectedDate].selectedColor = '#6366F1';
    }
    
    return dates;
  }, [events, reminders, goals, selectedDate]);
  
  // Get events for the selected date
  const selectedDateEvents = useMemo(() => {
    return events.filter(event => event.date.startsWith(selectedDate));
  }, [events, selectedDate]);
  
  // Get reminders for the selected date
  const selectedDateReminders = useMemo(() => {
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.date).toISOString().split('T')[0];
      return reminderDate === selectedDate;
    });
  }, [reminders, selectedDate]);
  
  // Get goals for the selected date
  const selectedDateGoals = useMemo(() => {
    return goals.filter(goal => {
      if (!goal.date) return false;
      const goalDate = new Date(goal.date).toISOString().split('T')[0];
      return goalDate === selectedDate;
    });
  }, [goals, selectedDate]);
  
  const handleDateSelect = (date: DateData) => {
    setSelectedDate(date.dateString);
  };
  
  const handleAddEvent = () => {
    if (eventTitle.trim()) {
      const formattedTime = eventTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      addEvent({
        title: eventTitle,
        date: selectedDate,
        time: formattedTime,
        notes: eventNotes.trim() || undefined,
        color: selectedColor,
      });
      
      // Reset form
      setEventTitle('');
      setEventNotes('');
      setEventTime(new Date());
      setSelectedColor(EVENT_COLORS[0]);
      setModalVisible(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Calendar</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        <View style={[styles.calendarContainer, isDark && styles.darkCalendarContainer]}>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDateSelect}
            markingType="multi-dot"
            theme={{
              calendarBackground: isDark ? '#1F2937' : 'white',
              textSectionTitleColor: isDark ? '#D1D5DB' : '#6B7280',
              selectedDayBackgroundColor: '#6366F1',
              selectedDayTextColor: 'white',
              todayTextColor: '#6366F1',
              dayTextColor: isDark ? 'white' : '#1F2937',
              textDisabledColor: isDark ? '#4B5563' : '#D1D5DB',
              dotColor: '#6366F1',
              monthTextColor: isDark ? 'white' : '#1F2937',
              arrowColor: '#6366F1',
            }}
          />
        </View>
        
        <View style={[styles.upcomingContainer, isDark && styles.darkUpcomingContainer]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            {formatDate(selectedDate)}
          </Text>
          
          {selectedDateEvents.length === 0 && 
           selectedDateReminders.length === 0 && 
           selectedDateGoals.length === 0 ? (
            <Text style={[styles.emptyText, isDark && styles.darkEmptyText]}>
              No events scheduled for this day
            </Text>
          ) : (
            <FlatList
              data={[
                ...selectedDateEvents.map(event => ({ ...event, type: 'event' })),
                ...selectedDateReminders.map(reminder => ({ ...reminder, type: 'reminder' })),
                ...selectedDateGoals.map(goal => ({ ...goal, type: 'goal' }))
              ]}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              renderItem={({ item }) => {
                if (item.type === 'event') {
                  return (
                    <View style={styles.eventItem}>
                      <View style={[styles.eventDot, {backgroundColor: item.color}]} />
                      <View style={styles.eventContent}>
                        <Text style={[styles.eventTitle, isDark && styles.darkText]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.eventTime, isDark && styles.darkSubText]}>
                          {item.time || 'All Day'}
                        </Text>
                        {item.notes && (
                          <Text style={[styles.eventNotes, isDark && styles.darkSubText]}>
                            {item.notes}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => deleteEvent(item.id)}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  );
                } else if (item.type === 'reminder') {
                  return (
                    <View style={styles.eventItem}>
                      <View style={[styles.eventDot, {backgroundColor: '#6366F1'}]} />
                      <View style={styles.eventContent}>
                        <Text style={[styles.eventTitle, isDark && styles.darkText]}>
                          {item.text} {item.completed ? '(Completed)' : ''}
                        </Text>
                        <Text style={[styles.eventTime, isDark && styles.darkSubText]}>
                          {new Date(item.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </Text>
                        <Text style={[styles.eventType, isDark && styles.darkSubText]}>
                          Reminder
                        </Text>
                      </View>
                    </View>
                  );
                } else if (item.type === 'goal') {
                  return (
                    <View style={styles.eventItem}>
                      <View style={[styles.eventDot, {backgroundColor: '#F59E0B'}]} />
                      <View style={styles.eventContent}>
                        <Text style={[styles.eventTitle, isDark && styles.darkText]}>
                          {item.title} ({item.progress}% Complete)
                        </Text>
                        <Text style={[styles.eventType, isDark && styles.darkSubText]}>
                          Goal
                        </Text>
                      </View>
                    </View>
                  );
                }
                return null;
              }}
              style={styles.eventsList}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDark && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>
              Add Event for {formatDate(selectedDate)}
            </Text>
            
            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              placeholder="Event title"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={eventTitle}
              onChangeText={setEventTitle}
            />
            
            <TouchableOpacity 
              style={[styles.timeSelector, isDark && styles.darkTimeSelector]} 
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.timeSelectorText, isDark && styles.darkText]}>
                Time: {eventTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </Text>
              <Ionicons name="time-outline" size={20} color={isDark ? 'white' : '#6B7280'} />
            </TouchableOpacity>
            
            {showTimePicker && (
              <DateTimePicker
                value={eventTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    setEventTime(selectedTime);
                  }
                }}
              />
            )}
            
            <TextInput
              style={[styles.textArea, isDark && styles.darkInput]}
              placeholder="Notes (optional)"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={eventNotes}
              onChangeText={setEventNotes}
              multiline
              numberOfLines={3}
            />
            
            <Text style={[styles.colorLabel, isDark && styles.darkText]}>Event Color:</Text>
            <View style={styles.colorOptions}>
              {EVENT_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleAddEvent}
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
  calendarContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkCalendarContainer: {
    backgroundColor: '#1F2937',
    shadowColor: '#000',
  },
  upcomingContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 100, // Extra space for bottom tabs
  },
  darkUpcomingContainer: {
    backgroundColor: '#1F2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  eventsList: {
    maxHeight: 300,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  eventContent: {
    flex: 1,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  eventTime: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  eventNotes: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  eventType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
    marginBottom: 20,
  },
  darkEmptyText: {
    color: '#9CA3AF',
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
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  darkTimeSelector: {
    borderColor: '#4B5563',
    backgroundColor: '#374151',
  },
  timeSelectorText: {
    color: '#1F2937',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
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