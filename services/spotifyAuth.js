import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from '@env';
import * as Random from 'expo-random';
import { Buffer } from 'buffer';
import { makeRedirectUri } from 'expo-auth-session';

const CLIENT_ID = SPOTIFY_CLIENT_ID;
const REDIRECT_URI = makeRedirectUri( {useProxy: true} );
const SCOPES = [
    'user-read-recently-played',
    'user=library-read'
]

