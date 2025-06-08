import { SPOTIFY_CLIENT_ID } from '@env';
import { makeRedirectUri, exchangeCodeAsync, AuthRequest } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

const clientId = SPOTIFY_CLIENT_ID;
const redirectUri = makeRedirectUri({ useProxy: true });
const scopes = ['user-read-recently-played', 'user-library-read'];

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Generate code verifier (random string)
const generateCodeVerifier = async () => {
  const bytes = await Crypto.getRandomBytesAsync(64);
  return Buffer.from(bytes).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

// SHA256 hash for PKCE
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

    // Build the auth request
    const authRequest = new AuthRequest({
      clientId,
      scopes,
      redirectUri,
      codeChallenge,
      codeChallengeMethod: 'S256',
      responseType: 'code',
      usePKCE: true,
    });

    // Load and prompt
    await authRequest.makeAuthUrlAsync(discovery);
    const result = await authRequest.promptAsync(discovery, { useProxy: true });

    if (result.type === 'success' && result.params.code) {
      return await exchangeToken(result.params.code, codeVerifier);
    } else {
      throw new Error('Authentication failed or was canceled');
    }

  } catch (err) {
    console.error('Auth error:', err);
    throw err;
  }
};

const exchangeToken = async (code, codeVerifier) => {
  const tokenResponse = await exchangeCodeAsync(
    {
      clientId,
      code,
      redirectUri,
      extraParams: { code_verifier: codeVerifier },
    },
    discovery
  );

  if (tokenResponse.accessToken) {
    await AsyncStorage.setItem('spotify_access_token', tokenResponse.accessToken);
    return tokenResponse;
  } else {
    throw new Error('Token exchange failed');
  }
};