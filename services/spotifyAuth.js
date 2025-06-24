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
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

// SHA256 hash for PKCE, base64url encoded
const sha256 = async (plain) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    plain,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return digest.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

export const authenticateWithSpotify = async () => {
  let codeVerifier;

  try {
    codeVerifier = await generateCodeVerifier();
    await AsyncStorage.setItem('spotify_code_verifier', codeVerifier);
    console.log('Code verifier stored:', codeVerifier);

    const codeChallenge = await sha256(codeVerifier);

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


/**
 * DEBBUGGING NOTE:
 * ERROR DESCRIPTION:
 * Login failed: [Error: The provided authorization grant 
 * (e.g., authorization code, resource owner credentials) 
 * or refresh token is invalid, expired, revoked, does 
 * not match the redirection URI used in the authorization request, 
 * or was issued to another client. More info: code_verifier was incorrect]
 * 
 * The 
 */
const exchangeToken = async code => {

  const codeVerifier = await AsyncStorage.getItem('spotify_code_verifier');
  
  console.log('Code verifier:', codeVerifier);
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