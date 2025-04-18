import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Pressable, Modal, FlatList, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import base64 from 'base64-js';

// Spotify API credentials
const SPOTIFY_CLIENT_ID = '406bcb3be11f42ffaff3cb8f73a90821';
const SPOTIFY_REDIRECT_URI = 'exp://localhost:8081'; // Local development redirect URI

// Interface definitions
interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
  duration_ms?: number;
  uri?: string;
  isSpotify?: boolean;
}

interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export default function MusicPlayer() {
  // Player state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [trackList, setTrackList] = useState<Track[]>([]);
  
  // Spotify specific states
  const [spotifyAuthLoading, setSpotifyAuthLoading] = useState(false);
  const [spotifyTokens, setSpotifyTokens] = useState<SpotifyTokens | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [spotifyEnabled, setSpotifyEnabled] = useState(true); // Toggle to disable Spotify if it's causing issues
  
  // PKCE auth variables
  const codeVerifier = useRef<string>('');
  const codeChallenge = useRef<string>('');
  
  // Sample local tracks
  const localTracks: Track[] = [
    {
      id: '1',
      title: 'Focus Music',
      artist: 'Ambient Sounds',
      artwork: 'https://via.placeholder.com/60',
      url: 'https://example.com/focus.mp3', // Replace with actual audio URL
      isSpotify: false
    },
    {
      id: '2',
      title: 'Deep Concentration',
      artist: 'Study Music',
      artwork: 'https://via.placeholder.com/60',
      url: 'https://example.com/concentration.mp3', // Replace with actual audio URL
      isSpotify: false
    },
    {
      id: '3',
      title: 'Calm Meditation',
      artist: 'Relaxation',
      artwork: 'https://via.placeholder.com/60',
      url: 'https://example.com/meditation.mp3', // Replace with actual audio URL
      isSpotify: false
    },
  ];

  // Initialize the player
  useEffect(() => {
    // Set up audio mode
    setupAudio();
    
    // Load saved state and tracks
    loadPlayerState();
    
    // Only try to load Spotify if enabled
    if (spotifyEnabled) {
      loadSpotifyTokens();
    }
    
    // Cleanup function
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);
  
  // Setup audio mode
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.log('Error setting audio mode:', error);
    }
  };
  
  // Load Spotify playlists when tokens are available
  useEffect(() => {
    if (spotifyEnabled && spotifyTokens?.access_token) {
      fetchUserPlaylists();
    }
  }, [spotifyTokens]);

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
  
  // Save player state
  const savePlayerState = async () => {
    try {
      if (!currentTrack) return;
      
      const playerState = {
        trackId: currentTrack.id,
        position,
        isPlaying,
        expanded,
        playlistId: currentPlaylistId,
        isSpotify: currentTrack.isSpotify
      };
      await AsyncStorage.setItem('musicPlayerState', JSON.stringify(playerState));
    } catch (error) {
      console.log('Error saving player state:', error);
    }
  };
  
  // Load player state
  const loadPlayerState = async () => {
    try {
      // Always start with local tracks to ensure the player works
      setTrackList(localTracks);
      
      const savedState = await AsyncStorage.getItem('musicPlayerState');
      if (savedState) {
        const playerState = JSON.parse(savedState);
        setExpanded(playerState.expanded);
        setCurrentPlaylistId(playerState.playlistId);
        
        // If we have a Spotify track, we'll load it after auth
        if (!playerState.isSpotify) {
          const track = localTracks.find(t => t.id === playerState.trackId) || localTracks[0];
          setCurrentTrack(track);
          setPosition(playerState.position);
        }
      } else {
        // No saved state, initialize with local tracks
        setCurrentTrack(localTracks[0]);
      }
    } catch (error) {
      console.log('Error loading player state:', error);
      // Fallback to first local track
      setCurrentTrack(localTracks[0]);
    }
  };
  
  // CORE PLAYER FUNCTIONS
  
  // Load and play audio
  const loadAudio = async () => {
    try {
      if (!currentTrack) {
        console.log('No track selected');
        return;
      }
      
      console.log('Loading audio for track:', currentTrack.title);
      
      if (sound) {
        console.log('Unloading previous sound');
        await sound.unloadAsync();
      }
      
      // For Spotify tracks with preview URL
      if (currentTrack.isSpotify && currentTrack.url) {
        console.log('Loading Spotify preview URL:', currentTrack.url);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentTrack.url },
          { shouldPlay: true, positionMillis: position },
          onPlaybackStatusUpdate
        );
        
        setSound(newSound);
        setIsPlaying(true);
        setDuration(currentTrack.duration_ms || 0);
      } 
      // For local tracks
      else if (!currentTrack.isSpotify) {
        console.log('Loading local track URL:', currentTrack.url);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentTrack.url },
          { shouldPlay: true, positionMillis: position },
          onPlaybackStatusUpdate
        );
        
        setSound(newSound);
        setIsPlaying(true);
      } 
      // For Spotify tracks without preview URL
      else if (currentTrack.isSpotify && !currentTrack.url) {
        console.log('No preview URL available for this track');
        Alert.alert(
          'Preview Unavailable', 
          'This track does not have a preview available.'
        );
        return;
      }
      
      setExpanded(true);
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('Playback Error', 'There was a problem playing this track.');
    }
  };
  
  // Handle playback status updates
  const onPlaybackStatusUpdate = (status: Audio.PlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || (currentTrack?.duration_ms || 0));
      setIsPlaying(status.isPlaying);
      
      // Auto-play next track when current one finishes
      if (status.didJustFinish) {
        console.log('Track finished, playing next');
        nextTrack();
      }
    } else if (status.error) {
      console.error('Playback error:', status.error);
    }
  };
  
  // Play/pause toggle
  const playPause = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          console.log('Pausing playback');
          await sound.pauseAsync();
        } else {
          console.log('Resuming playback');
          await sound.playAsync();
        }
      } else if (currentTrack) {
        console.log('No sound loaded, loading audio');
        loadAudio();
      }
    } catch (error) {
      console.error('Error in play/pause:', error);
    }
  };
  
  // Play next track
  const nextTrack = () => {
    if (!currentTrack || trackList.length === 0) return;
    
    const currentIndex = trackList.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % trackList.length;
    console.log(`Moving to next track: ${currentIndex} -> ${nextIndex}`);
    setCurrentTrack(trackList[nextIndex]);
    setPosition(0);
    loadAudio();
  };
  
  // Play previous track
  const prevTrack = () => {
    if (!currentTrack || trackList.length === 0) return;
    
    const currentIndex = trackList.findIndex(track => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + trackList.length) % trackList.length;
    console.log(`Moving to previous track: ${currentIndex} -> ${prevIndex}`);
    setCurrentTrack(trackList[prevIndex]);
    setPosition(0);
    loadAudio();
  };
  
  // Seek to position
  const seekAudio = async (value: number) => {
    try {
      if (sound) {
        console.log(`Seeking to position: ${value}ms`);
        await sound.setPositionAsync(value);
        setPosition(value);
      }
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };
  
  // Format time for display
  const formatTime = (millis: number) => {
    if (!millis) return '00:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
  };
  
  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
    savePlayerState();
  };
  
// SPOTIFY INTEGRATION FUNCTIONS
  
// Load Spotify tokens
const loadSpotifyTokens = async () => {
  try {
    const tokensJson = await AsyncStorage.getItem('spotifyTokens');
    if (tokensJson) {
      const tokens = JSON.parse(tokensJson) as SpotifyTokens;
      console.log('Loaded tokens, expires at:', new Date(tokens.expires_at).toLocaleString());
      
      // Check if tokens are expired
      if (Date.now() >= tokens.expires_at - 60000) { // 1 minute buffer
        console.log('Token expired, refreshing...');
        // Refresh the token
        await refreshAccessToken(tokens.refresh_token);
      } else {
        console.log('Token still valid');
        setSpotifyTokens(tokens);
      }
    } else {
      console.log('No saved Spotify tokens found');
    }
  } catch (error) {
    console.error('Error loading Spotify tokens:', error);
    // Don't break the app if Spotify fails
    setSpotifyEnabled(false);
  }
};

// Save Spotify tokens
const saveSpotifyTokens = async (tokens: SpotifyTokens) => {
  try {
    await AsyncStorage.setItem('spotifyTokens', JSON.stringify(tokens));
    setSpotifyTokens(tokens);
    console.log('Spotify tokens saved successfully');
  } catch (error) {
    console.error('Error saving Spotify tokens:', error);
  }
};

// Refresh access token
const refreshAccessToken = async (refreshToken: string) => {
  try {
    console.log('Refreshing access token...');
    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const payload = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
    });
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });
    
    const data = await response.json();
    
    if (data.access_token) {
      console.log('Token refresh successful');
      const newTokens: SpotifyTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken, // Use old refresh token if not provided
        expires_at: Date.now() + (data.expires_in * 1000),
      };
      
      await saveSpotifyTokens(newTokens);
      return true;
    } else {
      console.error('Failed to refresh token:', data);
      // If refresh fails, clear tokens and require new login
      await AsyncStorage.removeItem('spotifyTokens');
      setSpotifyTokens(null);
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    await AsyncStorage.removeItem('spotifyTokens');
    setSpotifyTokens(null);
    return false;
  }
};

// Replace your existing PKCE-related functions with these:

// Authenticate with Spotify using PKCE
const authenticateSpotify = async () => {
  try {
    setSpotifyAuthLoading(true);
    console.log('Starting Spotify authentication...');
    
    // Generate a code verifier (random string between 43-128 characters)
    const generateCodeVerifier = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      let result = '';
      const length = 64; // Using a fixed length of 64 characters
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    const codeVerifier = generateCodeVerifier();
    console.log('Generated code verifier:', codeVerifier);
    
    // Store the code verifier in AsyncStorage for later use
    await AsyncStorage.setItem('spotify_code_verifier', codeVerifier);
    
    // Generate code challenge from verifier
    const generateCodeChallenge = async (verifier) => {
      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);
      
      // Hash the verifier with SHA-256
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        verifier
      );
      
      // Convert hash to Base64URL
      const hashArray = new Uint8Array(hash);
      const base64 = btoa(String.fromCharCode(...hashArray));
      const base64Url = base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      return base64Url;
    };
    
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    console.log('Generated code challenge:', codeChallenge);
    
    // Create the authorization URL
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${SPOTIFY_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${codeChallenge}` +
      `&scope=${encodeURIComponent('user-read-private user-read-email playlist-read-private user-library-read')}`;
    
    console.log('Auth URL:', authUrl);
    
    // Open the authorization URL in a browser
    const result = await WebBrowser.openAuthSessionAsync(authUrl, SPOTIFY_REDIRECT_URI);
    
    if (result.type === 'success') {
      // Extract the authorization code from the redirect URL
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      
      if (code) {
        console.log('Received authorization code:', code);
        
        // Retrieve the stored code verifier
        const storedVerifier = await AsyncStorage.getItem('spotify_code_verifier');
        console.log('Retrieved stored code verifier:', storedVerifier);
        
        if (storedVerifier) {
          // Exchange the authorization code for an access token
          await exchangeCodeForToken(code, storedVerifier);
        } else {
          console.error('Code verifier not found in storage');
          Alert.alert('Authentication Error', 'Code verifier not found in storage');
        }
      } else {
        console.error('No code parameter in redirect URL');
        Alert.alert('Authentication Error', 'No authorization code received');
      }
    } else {
      console.log('Authentication cancelled or failed:', result.type);
    }
  } catch (error) {
    console.error('Error during Spotify authentication:', error);
    Alert.alert('Authentication Error', 'An error occurred during authentication');
  } finally {
    setSpotifyAuthLoading(false);
  }
};

// Exchange authorization code for access token
const exchangeCodeForToken = async (code, codeVerifier) => {
  try {
    console.log('Exchanging code for token with verifier:', codeVerifier);
    
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const body = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      code_verifier: codeVerifier
    });
    
    console.log('Token request body:', body.toString());
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });
    
    const responseText = await response.text();
    console.log('Token response:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('Received access token');
      
      // Save the tokens
      const tokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000)
      };
      
      await saveSpotifyTokens(tokens);
      
      // Clean up the stored code verifier
      await AsyncStorage.removeItem('spotify_code_verifier');
    } else {
      console.error('Failed to exchange code for token:', responseText);
      Alert.alert('Authentication Error', `Failed to get access token: ${responseText}`);
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    Alert.alert('Authentication Error', 'Error exchanging code for token');
  }
};
  
  // Fetch user playlists
  const fetchUserPlaylists = async () => {
    try {
      if (!spotifyTokens) {
        console.log('No Spotify tokens available');
        return;
      }
      
      console.log('Fetching user playlists...');
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: {
          'Authorization': `Bearer ${spotifyTokens.access_token}`,
        },
      });
      
      console.log('Playlists response status:', response.status);
      
      if (response.status === 401) {
        console.log('Token expired, refreshing...');
        // Token expired, refresh
        if (spotifyTokens.refresh_token) {
          const refreshSuccess = await refreshAccessToken(spotifyTokens.refresh_token);
          if (refreshSuccess) {
            return fetchUserPlaylists(); // Retry after refresh
          }
        }
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching playlists:', response.status, errorText);
        return;
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.items?.length || 0} playlists`);
      setUserPlaylists(data.items || []);
      
      // If we have a saved playlist ID, load it
      if (currentPlaylistId) {
        console.log('Loading saved playlist:', currentPlaylistId);
        fetchPlaylistTracks(currentPlaylistId);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };
  
  // Fetch tracks from a playlist
  const fetchPlaylistTracks = async (playlistId: string) => {
    try {
      if (!spotifyTokens) {
        console.log('No Spotify tokens available');
        return;
      }
      
      console.log('Fetching tracks for playlist:', playlistId);
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          'Authorization': `Bearer ${spotifyTokens.access_token}`,
        },
      });
      
      console.log('Playlist tracks response status:', response.status);
      
      if (response.status === 401) {
        console.log('Token expired, refreshing...');
        // Token expired, refresh
        if (spotifyTokens.refresh_token) {
          const refreshSuccess = await refreshAccessToken(spotifyTokens.refresh_token);
          if (refreshSuccess) {
            return fetchPlaylistTracks(playlistId); // Retry after refresh
          }
        }
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching playlist tracks:', response.status, errorText);
        return;
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.items?.length || 0} tracks from playlist`);
      
      // Map Spotify tracks to our Track interface
      const spotifyTracks: Track[] = data.items
        .filter((item: any) => item.track) // Filter out null tracks
        .map((item: any) => ({
          id: item.track.id,
          title: item.track.name,
          artist: item.track.artists.map((artist: any) => artist.name).join(', '),
          artwork: item.track.album.images[0]?.url || 'https://via.placeholder.com/60',
          url: item.track.preview_url || '', // Preview URL for 30-second clip
          uri: item.track.uri, // Full Spotify URI
          duration_ms: item.track.duration_ms,
          isSpotify: true
        }));
      
      setTrackList(spotifyTracks);
      setCurrentPlaylistId(playlistId);
      
      // Set current track to first track if none selected
      if (!currentTrack || currentTrack.isSpotify === false) {
        if (spotifyTracks.length > 0) {
          setCurrentTrack(spotifyTracks[0]);
          setPosition(0);
        }
      } else {
        // Try to find the current track in the new playlist
        const savedTrack = spotifyTracks.find(t => t.id === currentTrack.id);
        if (savedTrack) {
          setCurrentTrack(savedTrack);
        } else if (spotifyTracks.length > 0) {
          setCurrentTrack(spotifyTracks[0]);
          setPosition(0);
        }
      }
      
      setPlaylistModalVisible(false);
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
    }
  };
  
  // Select a playlist
  const selectPlaylist = (playlistId: string) => {
    fetchPlaylistTracks(playlistId);
  };
  
  // Reset Spotify connection
  const resetSpotifyConnection = async () => {
    try {
      await AsyncStorage.removeItem('spotifyTokens');
      await AsyncStorage.removeItem('spotify_code_verifier'); // Clear stored verifier too
      setSpotifyTokens(null);
      setUserPlaylists([]);
      Alert.alert('Spotify Connection Reset', 'You can now reconnect to Spotify.');
    } catch (error) {
      console.error('Error resetting Spotify connection:', error);
    }
  };
  
  // Toggle Spotify integration
  const toggleSpotifyIntegration = () => {
    setSpotifyEnabled(!spotifyEnabled);
    if (!spotifyEnabled) {
      // If re-enabling, try to load tokens
      loadSpotifyTokens();
    }
  };
  
  // Render playlist item
  const renderPlaylistItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.playlistItem} 
      onPress={() => selectPlaylist(item.id)}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/60' }} 
        style={styles.playlistImage} 
      />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.playlistSubtitle} numberOfLines={1}>
          {item.tracks.total} tracks
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  // RENDER UI
  
  return (
    <View style={[styles.container, !expanded && styles.collapsedContainer]}>
      {/* Spotify connect button - only show if Spotify is enabled */}
      {expanded && spotifyEnabled && (
        <View style={styles.spotifyContainer}>
          {!spotifyTokens ? (
            <TouchableOpacity 
              style={styles.spotifyConnectButton} 
              onPress={authenticateSpotify}
              disabled={spotifyAuthLoading}
            >
              {spotifyAuthLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.spotifyButtonText}>Connect Spotify</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.spotifyControls}>
              <TouchableOpacity 
                style={styles.playlistsButton} 
                onPress={() => setPlaylistModalVisible(true)}
              >
                <Text style={styles.spotifyButtonText}>My Playlists</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.resetButton, { marginLeft: 8 }]} 
                onPress={resetSpotifyConnection}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {/* Toggle Spotify integration button */}
      {expanded && (
        <TouchableOpacity 
          style={[styles.toggleButton, { marginBottom: 8 }]} 
          onPress={toggleSpotifyIntegration}
        >
          <Text style={styles.toggleButtonText}>
            {spotifyEnabled ? 'Disable Spotify' : 'Enable Spotify'}
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Track info */}
      <Pressable onPress={toggleExpanded} style={styles.trackInfo}>
        <Image 
          source={{ uri: currentTrack?.artwork || 'https://via.placeholder.com/60' }} 
          style={styles.artwork} 
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack?.title || 'No Track Selected'}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack?.artist || ''}</Text>
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

      {/* Controls */}
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
      
      {/* Playlist modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={playlistModalVisible}
        onRequestClose={() => setPlaylistModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Playlists</Text>
            <TouchableOpacity onPress={() => setPlaylistModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          {userPlaylists.length > 0 ? (
            <FlatList
              data={userPlaylists}
              renderItem={renderPlaylistItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.playlistList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No playlists found</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  spotifyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  spotifyConnectButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playlistsButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    backgroundColor: '#9CA3AF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center',
  },
  spotifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 12,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  playlistList: {
    padding: 16,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  playlistImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  playlistSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  }
});
