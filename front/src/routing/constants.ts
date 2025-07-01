const BASE_URL = '/les';

export const ROUTES = {
    HOME: BASE_URL + '/home',
    AUTH: BASE_URL + '/auth',
    AUTH_DOCS: BASE_URL + '/auth/docs',
    SETTINGS: BASE_URL + '/settings',
    ACCOUNTS: BASE_URL + '/accounts',
    ACCOUNT_SETTINGS: BASE_URL + '/account/settings',
    ACCOUNTS_NEW: BASE_URL + '/accounts/new',
    RANDOM: BASE_URL + '/random',
    //AEC_ENCR: BASE_URL + '/aec_encr',
    CRYPTO: BASE_URL + '/crypto',
    API_KEYS: BASE_URL + '/api-keys',
    CHAT_ROOMS: BASE_URL + '/chat-rooms',
    CHAT_ROOMS_ADD: BASE_URL + '/chat-rooms/add',
    ADD_FRIEND: BASE_URL + '/add-friend',
    ADD_FRIEND_ENCRYPTION: BASE_URL + '/add-friend/encryption',
    ADD_FRIEND_PEER_TO_PEER: BASE_URL + '/add-friend/peer-to-peer', 
    ADD_FRIEND_SSE: BASE_URL + '/add-friend/sse',
    ADD_FRIEND_BY_NAME: BASE_URL + '/add-friend/by-name',
    ADD_PEER: BASE_URL + '/add-peer',
} as const;

export const QUERY_PARAMS = {
    ROOM_ID: 'room_id',

} as const;
