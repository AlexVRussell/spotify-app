import React, { useEffect, useState } from 'react';
import { Dimensions, View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authenticateWithSpotify } from '../services/spotifyAuth';
import { useSpotifyAuth } from '../context/spotifyAuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { accessToken, setAccessToken } = useSpotifyAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // Button press animation
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const tokenData = await authenticateWithSpotify();
      setAccessToken(tokenData.accessToken);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f5f3e7', '#e9e7cd']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Logo and Title Section */}
          <View style={styles.logoSection}>
            <Text style={styles.title}>syfty</Text>
            <Text style={styles.subtitle}>swipe. curate. perfect playlists.</Text>
            
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/syfty-logo-final.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Login Section */}
          <View style={styles.loginSection}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonLoading]} 
                onPress={handleLogin} 
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#60be8fff', '#5dc08eff'] : ['#266F4C', '#2a7a52']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Connecting...' : 'Connect with Spotify'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {accessToken && (
              <Animated.View 
                style={styles.successContainer}
                entering={() => ({
                  opacity: 0,
                  scale: 0.8,
                })}
              >
                <View style={styles.successBadge}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.successText}>Connected successfully!</Text>
                </View>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Crafted with {'<3'} by Alex Russell
          </Text>
          <Text style={styles.footerSubtext}>
            Dalhousie University
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  // imma throw in some circles 
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(154, 202, 144, 0.15)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: height * 0.1,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: height * 0.2,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    left: width * 0.2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 64,
    fontWeight: '800',
    color: '#266F4C',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(38, 111, 76, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#266F4CB3',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  logoContainer: {
    padding: 20,
  },
  logo: {
    width: 180,
    height: 120,
  },
  loginSection: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#266F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  loginButtonLoading: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#e9e7cd',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  successContainer: {
    marginTop: 20,
  },
  successBadge: {
    backgroundColor: 'rgba(154, 202, 144, 0.2)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(154, 202, 144, 0.4)',
  },
  successIcon: {
    color: '#266F4C',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  successText: {
    color: '#266F4C',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#266F4C',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  footerSubtext: {
    color: '#266F4CB3',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});