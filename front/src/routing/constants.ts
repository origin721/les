const BASE_URL = '/les';

export const ROUTES = {
    HOME: '/home',
    AUTH: '/auth',
    DOCS: '/docs',
    SETTINGS: '/settings',
    ACCOUNTS: '/accounts',
    ACCOUNT_SETTINGS: '/account/settings',
    ACCOUNTS_NEW: '/accounts/new',
    RANDOM: '/random',
    //AEC_ENCR: '/aec_encr',
    CRYPTO: '/crypto',
    API_KEYS: '/api-keys',
    CHAT_ROOMS: '/chat-rooms',
    CHAT_ROOMS_SETTINGS: '/chat-rooms/settings',
    CHAT_ROOMS_ADD: '/chat-rooms/add',
    ADD_FRIEND: '/add-friend',
    ADD_PEER: '/add-peer',
    FRIENDS: '/friends',
    NOT_FOUND: '/404',
    SELECT_LANG: `/select-lang`,
} as const;

export const QUERY_PARAMS = {
    ROOM_ID: 'room_id',

} as const;
