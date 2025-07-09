import { SPOTIFY_CLIENT_ID } from '@env';
import { makeRedirectUri, exchangeCodeAsync, AuthRequest} from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

const clientId = SPOTIFY_CLIENT_ID;

const redirectUri = 'siftify://callback';
console.log('Using custom redirect URI:', redirectUri);
const scopes = ['user-read-recently-played', 'user-library-read'];

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Generate code verifier (random string)
const generateCodeVerifier = async () => {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return Buffer.from(bytes)
  .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .substring(0, 128);
};

// SHA256 hash for PKCE, base64url encoded
const sha256 = async (plain) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    plain,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  // Convert base64 to base64url format
  const base64 = Buffer.from(digest, 'hex').toString('base64');
  return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export const authenticateWithSpotify = async () => {
  let codeVerifier;

  try {
    codeVerifier = await generateCodeVerifier();
    console.log('Generated code verifier:', codeVerifier);
    console.log('Code verifier length:', codeVerifier.length);
    
    await AsyncStorage.setItem('spotify_code_verifier', codeVerifier);
    
    const codeChallenge = await sha256(codeVerifier);
    console.log('Generated code challenge:', codeChallenge);

    const authRequest = new AuthRequest({
      clientId,
      scopes,
      redirectUri,
      codeChallenge,
      codeChallengeMethod: 'S256',
      responseType: 'code',
      usePKCE: true,
    });
    
    await authRequest.makeAuthUrlAsync(discovery);
    
    // Don't use proxy with custom scheme
    const result = await authRequest.promptAsync(discovery);

    console.log('Auth result:', result);
    
    if (result.type === 'success' && result.params.code) {
      console.log('Got auth code:', result.params.code);
      return await exchangeToken(result.params.code);
    } else if (result.type === 'error') {
      console.error('Auth error details:', result.error);
      throw new Error(`Authentication error: ${result.error}`);
    } else {
      console.log('Auth result type:', result.type);
      throw new Error('Authentication failed or was canceled');
    }
  } catch (err) {
    console.error('Auth error:', err);
    throw err;
  }
};

const exchangeToken = async code => {
  try {
    const codeVerifier = await AsyncStorage.getItem('spotify_code_verifier');
    console.log('Code verifier from storage:', codeVerifier);
    console.log('Code verifier length from storage:', codeVerifier?.length);
    console.log('Using redirect URI for exchange:', redirectUri);
    
    if (!codeVerifier) {
      throw new Error('No code verifier found in storage');
    }
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData);

    if (tokenData.access_token) {
      await AsyncStorage.setItem('spotify_access_token', tokenData.access_token);
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
      };
    } else {
      throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
    }
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};