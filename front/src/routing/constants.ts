export const ROUTES = {
    HOME: '/home',
    AUTH: '/auth',
    SETTINGS: '/settings',
    ACCOUNTS: '/accounts',
    ACCOUNT_SETTINGS: '/account/settings',
    ACCOUNTS_NEW: '/accounts/new',
    RANDOM: '/random',
    //AEC_ENCR: '/aec_encr',
    CURVE_25519: '/curve25519',
    API_KEYS: '/api-keys',
    CHAT_ROOMS: '/chat-rooms',
    CHAT_ROOMS_ADD: '/chat-rooms/add',
    ADD_FRIEND: '/add-friend',
} as const;

export const QUERY_PARAMS = {
    ROOM_ID: 'room_id',

} as const;
