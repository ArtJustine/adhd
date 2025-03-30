import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sample tracks - in a real app, you would load these from a service or local files
interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
}

const tracks: Track[] = [
  {
    id: '1',
    title: 'Focus Music',
    artist: 'Ambient Sounds',
    artwork: 'https://via.placeholder.com/60',
    url: 'https://example.com/focus.mp3', // Replace with actual audio URL
  },
  {
    id: '2',
    title: 'Deep Concentration',
    artist: 'Study Music',
    artwork: 'https://via.placeholder.com/60',
    url: 'https://example.com/concentration.mp3', // Replace with actual audio URL
  },
  {
    id: '3',
    title: 'Calm Meditation',
    artist: 'Relaxation',
    artwork: 'https://via.placeholder.com/60',
    url: 'https://example.com/meditation.mp3', // Replace with actual audio URL
  },
];

export default function MusicPlayer() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0]);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  
  // Load saved state on component mount
  useEffect(() => {
    loadPlayerState();
    return sound
      ? () => {
          // Save position before unloading
          if (isPlaying) {
            savePlayerState();
          }
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Save player state periodically if playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        savePlayerState();
      }, 5000); // Save every 5 seconds while playing
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack, position]);
  
  const savePlayerState = async () => {
    try {
      const playerState = {
        trackId: currentTrack.id,
        position,
        isPlaying,
        expanded
      };
      await AsyncStorage.setItem('musicPlayerState', JSON.stringify(playerState));
    } catch (error) {
      console.log('Error saving player state:', error);
    }
  };
  
  const loadPlayerState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('musicPlayerState');
      if (savedState) {
        const playerState = JSON.parse(savedState);
        // Find the track
        const track = tracks.find(t => t.id === playerState.trackId) || tracks[0];
        setCurrentTrack(track);
        setPosition(playerState.position);
        setExpanded(playerState.expanded);
        
        // If it was playing, we should expand the player but not auto-play
        // (auto-play requires user interaction on mobile)
        if (playerState.isPlaying) {
          setExpanded(true);
        }
      }
    } catch (error) {
      console.log('Error loading player state:', error);
    }
  };
  
  const loadAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      // In a real app, you would use the actual audio file URL
      // For this example, we're using a dummy URL that won't actually play
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentTrack.url },
        { shouldPlay: true, positionMillis: position },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      setIsPlaying(true);
      setExpanded(true);
    } catch (error) {
      console.log('Error loading audio:', error);
    }
  };
  
  const onPlaybackStatusUpdate = (status: Audio.PlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };
  
  const playPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } else {
      loadAudio();
    }
  };
  
  const nextTrack = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setPosition(0);
    loadAudio();
  };
  
  const prevTrack = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
    setPosition(0);
    loadAudio();
  };
  
  const seekAudio = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };
  
  const formatTime = (millis: number) => {
    if (!millis) return '00:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
    savePlayerState();
  };
  
  return (
    <View style={[styles.container, !expanded && styles.collapsedContainer]}>
      <Pressable onPress={toggleExpanded} style={styles.trackInfo}>
        <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
        
        {!expanded ? (
          <TouchableOpacity style={styles.miniPlayButton} onPress={(e) => {
            e.stopPropagation();
            playPause();
          }}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        ) : (
          <Ionicons 
            name={expanded ? "chevron-down" : "chevron-up"} 
            size={20} 
            color="#6B7280" 
          />
        )}
      </Pressable>
      
      {expanded && (
        <>
          <View style={styles.controls}>
            <TouchableOpacity onPress={prevTrack}>
              <Ionicons name="play-skip-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.playButton} onPress={playPause}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={nextTrack}>
              <Ionicons name="play-skip-forward" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.time}>{formatTime(position)}</Text>
            <Slider
              style={styles.progressBar}
              minimumValue={0}
              maximumValue={duration || 1}
              value={position}
              onSlidingComplete={seekAudio}
              minimumTrackTintColor="#6366F1"
              maximumTrackTintColor="#D1D5DB"
              thumbTintColor="#6366F1"
            />
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  collapsedContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  artist: {
    fontSize: 12,
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  playButton: {
    backgroundColor: '#6366F1',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
  },
  miniPlayButton: {
    backgroundColor: '#6366F1',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 40,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
    width: 40,
    textAlign: 'center',
  },
});