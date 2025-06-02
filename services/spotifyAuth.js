import { SPOTIFY_CLIENT_ID } from '@env';
import * as Random from 'expo-random';
import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { makeRedirectUri } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

const CLIENT_ID = SPOTIFY_CLIENT_ID;
const REDIRECT_URI = makeRedirectUri( {useProxy: true} );
const SCOPES = [
    'user-read-recently-played',
    'user=library-read'
]
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

// Encoding for PKCE with Base64URL
const base64URLEncode = (buffer) => {
    return Buffer.from(buffer)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

// Hash PKCE using SHA256
const sha256 = async (buffer) => {
    const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    new TextDecoder().decode(buffer),
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );

  return Uint8Array.from(Buffer.from(hash, 'base64'));
}

export async function authenticateWithSpotify() {
  const codeVerifier = base64URLEncode(await Random.getRandomBytesAsync(32));
  const hashed = await sha256(new TextEncoder().encode(codeVerifier));
  const codeChallenge = base64URLEncode(hashed);

  const authUrl = `${AUTH_ENDPOINT}?response_type=code&client_id=${CLIENT_ID}&scope=${SCOPES.join(
    '%20'
  )}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

  const result = await AuthSession.startAsync({ authUrl });

  if (result.type === 'success') {
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(`${CLIENT_ID}:`, 'utf8').toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: result.params.code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();
    return tokenData;
  } else {
    throw new Error('Authentication failed');
  }
}