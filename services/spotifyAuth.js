import { SPOTIFY_CLIENT_ID } from '@env';
import { makeRedirectUri, startAsync } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

const clientId = SPOTIFY_CLIENT_ID;
const redirectUri = makeRedirectUri({ useProxy: true });

const scopes = [
  'user-read-recently-played',
  'user-library-read',
].join(' ');

// Generate code verifier (random string)
const generateCodeVerifier = async () => {
  const bytes = await Crypto.getRandomBytesAsync(64);
  return Buffer.from(bytes).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

// SHA256 hash
const sha256 = async (verifier) => {
  const hashed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return hashed.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

export const authenticateWithSpotify = async () => {
  try {
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await sha256(codeVerifier);

    await AsyncStorage.setItem('spotify_code_verifier', codeVerifier);

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code_challenge_method=S256&` +
      `code_challenge=${codeChallenge}`;

    const result = await startAsync({ authUrl });

    if (result.type === 'success' && result.params.code) {
      const code = result.params.code;
      return await exchangeToken(code);
    } else {
      throw new Error('Authentication failed or was canceled');
    }

  } catch (err) {
    console.error('Auth error:', err);
    throw err;
  }
};

const exchangeToken = async (code) => {
  const codeVerifier = await AsyncStorage.getItem('spotify_code_verifier');

  const payload = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload.toString(),
  });

  const tokenData = await response.json();

  if (tokenData.access_token) {
    await AsyncStorage.setItem('spotify_access_token', tokenData.access_token);
    return tokenData;
  } else {
    throw new Error('Token exchange failed');
  }
};