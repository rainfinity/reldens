/**
 *
 * Reldens - GameConst
 *
 */

module.exports.GameConst = {
    // @TODO - BETA - Move all the actions like "START_GAME" into ACTIONS property.
    START_GAME: 's',
    ACTION_KEY: 'act',
    CREATE_PLAYER: 'cp',
    CREATE_PLAYER_RESULT: 'cps',
    CHANGING_SCENE: 'cgs',
    CHANGED_SCENE: 'cs',
    RECONNECT: 'r',
    // @TODO - BETA - Move into "rooms" plugin.
    ROOM_GAME: 'room_game',
    ROOM_NAME_MAP: 'Map',
    SCENE_PRELOADER: 'ScenePreloader',
    PLAYER_STATS: 'ps',
    ICON_STATS: 'player-stats',
    CLIENT_JOINED: 'cj',
    UI: 'ui',
    CLOSE_UI_ACTION: 'closeUi',
    TYPE_PLAYER: 'pj',
    GAME_OVER: 'go',
    REVIVED: 'rv',
    BUTTON_OPTION: 'btn-opt',
    UI_BOX: 'box',
    UI_CLOSE: '-close',
    UI_OPEN: '-open',
    // @TODO - BETA - Move into DIRECTIONS property.
    UP: 'up',
    LEFT: 'left',
    DOWN: 'down',
    RIGHT: 'right',
    STOP: 'stop',
    POINTER: 'mp',
    ARROW_DOWN: 'ard',
    IMAGE_PLAYER: 'player',
    ACTIONS: {
        LOGIN_UPDATE_ERROR: 'luer'
    },
    STATUS: {
        ACTIVE: 1,
        DISABLED: 2,
        DEATH: 3,
        AVOID_INTERPOLATION: 4
    },
    STRUCTURE: {
        DEFAULT: 'default',
        ASSETS: 'assets',
        CSS: 'css',
        DIST: 'dist',
        THEME: 'theme',
        LIB: 'lib',
        SERVER: 'server',
        CLIENT: 'client',
        PLUGINS: 'plugins',
        INDEX: 'index.html',
        SCSS_FILE: 'styles.scss',
        CSS_FILE: 'styles.css',
        ADMIN: 'admin',
        TEMPLATES: 'templates',
        ADMIN_JS_FILE: 'reldens-admin-client.js',
        ADMIN_SCSS_FILE: 'reldens-admin-client.scss',
        ADMIN_CSS_FILE: 'reldens-admin-client.css',
        INSTALLER_FOLDER: 'install',
        INSTALL_LOCK: 'install.lock'
    },
    ROUTE_PATHS: {
        DISCONNECT_USER: '/reldens-disconnect-user',
        TERMS_AND_CONDITIONS: '/terms-and-conditions',
        MAILER: '/reldens-mailer-enabled',
        FIREBASE: '/reldens-firebase'
    },
    SELECTORS: {
        BODY: 'body',
        CANVAS: 'CANVAS',
        INPUT: 'input',
        FORMS_CONTAINER: '.forms-container',
        REGISTER_FORM: '#register-form',
        GUEST_FORM: '#guest-form',
        LOGIN_FORM: '#login-form',
        FORGOT_PASSWORD_FORM: '#forgot-form',
        PLAYER_CREATE_FORM: '.player-create-form',
        PLAYER_SELECTION: '#player-selection',
        PLAYER_SELECTION_FORM: '#player-selector-form',
        PLAYER_SELECT_ELEMENT: '#player-select-element',
        PLAYER_SELECTION_ADDITIONAL_INFO: '.player-selection-additional-info',
        FULL_SCREEN_BUTTON: '.full-screen-btn',
        RESPONSE_ERROR: '.response-error',
        LOADING_CONTAINER: '.loading-container',
        REGISTRATION: {
            PASSWORD: '#reg-password',
            RE_PASSWORD: '#reg-re-password',
            EMAIL: '#reg-email',
            USERNAME: '#reg-username'
        },
        GUEST: {
            USERNAME: '#guest-username'
        },
        LOGIN: {
            USERNAME: '#username',
            PASSWORD: '#password',
        },
        FORGOT_PASSWORD: {
            EMAIL: '#forgot-email',
            CONTAINER: '.forgot-password-container',
        },
        TERMS: {
            BOX: '#terms-and-conditions',
            CONTAINER: '.terms-and-conditions-container',
            LINK_CONTAINER: '.terms-and-conditions-link-container',
            LINK: '.terms-and-conditions-link',
            ACCEPT: '#accept-terms-and-conditions',
            ACCEPT_LABEL: '.accept-terms-and-conditions-label',
            HEADING: '.terms-heading',
            BODY: '.terms-body',
            CLOSE: '#terms-and-conditions-close'
        },
        GAME_CONTAINER: '.game-container',
        BUTTONS_CLOSE: '.box-close'
    },
    CLASSES: {
        HIDDEN: 'hidden',
        GAME_STARTED: 'game-started',
        GAME_ERROR: 'game-error',
        GAME_ENGINE_STARTED: 'game-engine-started',
        FULL_SCREEN_ON: 'full-screen-on'
    },
    MESSAGE: {
        DATA_VALUES: {
            NAMESPACE: 'game'
        }
    },
    LABELS: {
        YES: 'Yes',
        NO: 'No'
    },
    ANIMATIONS_TYPE: {
        SPRITESHEET: 'spritesheet'
    },
    FILES: {
        EXTENSIONS: {
            PNG: '.png'
        }
    },
    GRAPHICS: {
        FRAME_WIDTH: 32,
        FRAME_HEIGHT: 32
    },
    SHOW_PLAYER_TIME: {
        NONE: -1,
        ONLY_OWN_PLAYER: 0,
        ALL_PLAYERS: 2
    }
};
