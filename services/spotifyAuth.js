import { SPOTIFY_CLIENT_ID } from '@env';
import { AuthRequest } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

const clientId = SPOTIFY_CLIENT_ID;
const redirectUri = 'siftify://callback';
const scopes = ['user-read-recently-played', 'user-library-read'];

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Generate a secure random PKCE code verifier
const generateCodeVerifier = async () => {
  const bytes = await Crypto.getRandomBytesAsync(32);
  const verifier = Buffer.from(bytes)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return verifier;
};

// Generate the code challenge by hashing the verifier with SHA-256
const sha256 = async (plain) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    plain,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  const challenge = digest
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return challenge;
};

// Begin the Spotify OAuth flow with PKCE
export const authenticateWithSpotify = async () => {
  try {
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await sha256(codeVerifier);

    console.log('[Auth] Starting auth request');

    const authRequest = new AuthRequest({
      clientId,
      scopes,
      redirectUri,
      responseType: 'code',
      usePKCE: true,
      codeChallenge,
      codeChallengeMethod: 'S256',
    });

    const result = await authRequest.promptAsync(discovery);

    if (result.type === 'success') {
      const code = result.params.code;
      const verifier = authRequest.codeVerifier;
      console.log('[Auth] Got authorization code');
      return await exchangeToken(code, verifier);
    } else {
      throw new Error(`[Auth] Failed with type: ${result.type}`);
    }
  } catch (err) {
    console.error('[Auth] Error:', err);
    throw err;
  }
};

// Exchange the authorization code for access and refresh tokens
const exchangeToken = async (code, verifier) => {
  console.log('[Token] Exchanging code for token');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: verifier,
    }).toString(),
  });

  const data = await response.json();
  console.log('[Token] Token response received');

  if (data.access_token) {
    await AsyncStorage.setItem('spotify_access_token', data.access_token);
    console.log('[Token] Access token stored');
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  } else {
    throw new Error(`[Token] Exchange failed: ${data.error_description || data.error}`);
  }
};
