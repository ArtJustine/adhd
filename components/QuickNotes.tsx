import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  id: string;
  text: string;
  timestamp: string;
}

export default function QuickNotes() {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  
  useEffect(() => {
    loadNotes();
  }, []);
  
  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('quickNotes');
      if (savedNotes !== null) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.log('Error loading notes:', error);
    }
  };
  
  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.log('Error saving notes:', error);
    }
  };
  
  const addNote = () => {
    if (note.trim()) {
      const newNote = {
        id: Date.now().toString(),
        text: note.trim(),
        timestamp: new Date().toISOString(),
      };
      
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setNote('');
    }
  };
  
  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Notes</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a quick note..."
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={200}
        />
        <TouchableOpacity style={styles.addButton} onPress={addNote}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <View style={styles.noteContent}>
              <Text style={styles.noteText}>{item.text}</Text>
              <Text style={styles.noteTime}>{formatDate(item.timestamp)}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteNote(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notes yet. Add one above!</Text>
        }
        style={styles.notesList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    minHeight: 50,
  },
  addButton: {
    backgroundColor: '#6366F1',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesList: {
    maxHeight: 200,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteContent: {
    flex: 1,
    marginRight: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#1F2937',
  },
  noteTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 16,
  },
});