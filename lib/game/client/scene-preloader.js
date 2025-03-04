/**
 *
 * Reldens - ScenePreloader
 *
 */

const { Scene, Geom } = require('phaser');
const { MinimapUi } = require('./minimap-ui');
const { InstructionsUi } = require('./instructions-ui');
const { SettingsUi } = require('./settings-ui');
const { Joystick } = require('./joystick');
const { GameConst } = require('../constants');
const { ActionsConst } = require('../../actions/constants');
const { Logger, sc } = require('@reldens/utils');

class ScenePreloader extends Scene
{

    constructor(props)
    {
        super({key: props.name});
        this.relatedSceneKey = props.name.replace(GameConst.SCENE_PRELOADER, '');
        this.progressBar = null;
        this.progressCompleteRect = null;
        this.progressRect = null;
        this.userInterfaces = {};
        this.preloadMapKey = props.map;
        this.preloadImages = props.images;
        this.uiScene = props.uiScene;
        this.elementsUi = {};
        this.gameManager = props.gameManager;
        this.eventsManager = props.gameManager.events;
        this.preloadAssets = props.preloadAssets || {};
        this.directionalAnimations = {};
        this.objectsAnimations = {};
        if(!this.gameManager.createdAnimations){
            this.gameManager.createdAnimations = {};
        }
        let currentScene = this.gameManager.activeRoomEvents.getActiveScene();
        currentScene.objectsAnimationsData = props.objectsAnimationsData;
        this.playerSpriteSize = {
            frameWidth: this.gameManager.config.get('client/players/size/width', 52),
            frameHeight: this.gameManager.config.get('client/players/size/height', 71)
        };
        this.useJoystick = this.gameManager.config.getWithoutLogs('client/ui/controls/useJoystick', false);
        this.joystick = new Joystick({scenePreloader: this});
    }

    preload()
    {
        // @NOTE: this event run ONLY ONE TIME for each scene.
        let eventUiScene = this.uiScene ? this : this.gameManager.gameEngine.uiScene;
        this.eventsManager.emitSync('reldens.beforePreload', this, eventUiScene);
        this.preloadUiScene();
        this.preloadMapJson();
        // @TODO - BETA - CHECK - Test a multiple tiles images case.
        this.preloadMapImages();
        this.preloadValidAssets();
        this.preloadPlayerDefaultSprite();
        this.preloadArrowPointer();
        // @TODO - BETA - Move everything related to player stats into the users pack or create a new pack.
        this.load.image(
            GameConst.ICON_STATS,
            this.gameManager.config.get('client/general/assets/statsIconPath', '/assets/icons/book.png')
        );
        this.load.on('fileprogress', this.onFileProgress, this);
        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
        this.configuredFrameRate = this.gameManager.config.get('client/general/animations/frameRate', 10);
        this.showLoadingProgressBar();
    }

    preloadMapJson()
    {
        if(!this.preloadMapKey){
            return;
        }
        // @TODO - BETA - Refactor to pass the map_filename from the server as a parameter.
        this.load.tilemapTiledJSON(this.preloadMapKey, '/assets/maps/'+this.preloadMapKey+'.json');
    }

    preloadArrowPointer()
    {
        if(!this.gameManager.config.get('client/ui/pointer/show')){
            return;
        }
        let pointerData = {
            frameWidth: this.gameManager.config.getWithoutLogs('client/general/assets/arrowDownFrameWidth', 32),
            frameHeight: this.gameManager.config.getWithoutLogs('client/general/assets/arrowDownFrameHeight', 32)
        };
        this.load.spritesheet(
            GameConst.ARROW_DOWN,
            this.gameManager.config.get('client/general/assets/arrowDownPath', '/assets/sprites/arrow-down.png'),
            pointerData
        );
    }

    preloadUiScene()
    {
        if(!this.uiScene){
            return;
        }
        // @NOTE: the events here run only once over all the game progress.
        this.eventsManager.emitSync('reldens.beforePreloadUiScene', this);
        if(this.gameManager.config.get('client/ui/playerBox/enabled')){
            this.load.html('playerBox', '/assets/html/ui-player-box.html');
        }
        if(this.gameManager.config.get('client/ui/controls/enabled')){
            this.load.html('controls', '/assets/html/ui-controls.html');
        }
        if(this.useJoystick){
            this.load.html('joystick', '/assets/html/ui-joystick.html');
        }
        if(this.gameManager.config.get('client/ui/sceneLabel/enabled')){
            this.load.html('sceneLabel', '/assets/html/ui-scene-label.html');
        }
        if(this.gameManager.config.get('client/ui/instructions/enabled')){
            this.load.html('instructions', '/assets/html/ui-instructions.html');
        }
        if(this.gameManager.config.get('client/ui/minimap/enabled')){
            this.load.html('minimap', '/assets/html/ui-minimap.html');
        }
        if(this.gameManager.config.get('client/ui/settings/enabled')){
            this.load.html('settings', '/assets/html/ui-settings.html');
            this.load.html('settings-content', '/assets/html/ui-settings-content.html');
        }
        if(this.gameManager.config.getWithoutLogs('client/ui/preloadTarget/enabled', true)){
            this.load.html('uiTarget', '/assets/html/ui-target.html');
        }
        if(this.gameManager.config.getWithoutLogs('client/ui/preloadOptionsTemplates/enabled', true)){
            this.load.html('uiOptionButton', '/assets/html/ui-option-button.html');
            this.load.html('uiOptionIcon', '/assets/html/ui-option-icon.html');
            this.load.html('uiOptionsContainer', '/assets/html/ui-options-container.html');
        }
        if(this.gameManager.config.getWithoutLogs('client/ui/preloadLoading/enabled', true)){
            this.load.html('uiLoading', '/assets/html/ui-loading.html');
        }
        this.eventsManager.emitSync('reldens.preloadUiScene', this);
    }

    preloadMapImages()
    {
        if(!this.preloadImages){
            return;
        }
        for(let imageFile of this.preloadImages){
            this.load.image(imageFile, `/assets/maps/${imageFile}`);
            //Logger.debug('Preload map image: "'+imageFile+'".');
        }
    }

    preloadValidAssets()
    {
        if(!sc.isObject(this.preloadAssets)){
            Logger.info('None assets available for preload.');
            return;
        }
        // @TODO - BETA - Remove the hardcoded file extensions.
        let preloadAssetsKeys = Object.keys(this.preloadAssets);
        for(let i of preloadAssetsKeys){
            let asset = this.preloadAssets[i];
            if('spritesheet' !== asset.asset_type){
                continue;
            }
            let assetParams = sc.toJson(asset.extra_params);
            if(!assetParams){
                Logger.error('Missing spritesheet params.', asset);
                continue;
            }
            this.load.spritesheet(asset.asset_key, `/assets/custom/sprites/${asset.asset_file}`, assetParams);
        }
    }

    create()
    {
        // @NOTE: this event run once for each scene.
        let eventUiScene = this.uiScene ? this : this.gameManager.gameEngine.uiScene;
        this.eventsManager.emitSync('reldens.createPreload', this, eventUiScene);
        if(this.uiScene){
            this.createUiScene();
        }
        this.createPlayerAnimations(sc.get(this.gameManager.playerData, 'avatarKey', GameConst.IMAGE_PLAYER));
        this.createArrowAnimation();
    }

    createUiScene()
    {
        // @NOTE: the events here run only once over all the game progress.
        this.eventsManager.emitSync('reldens.beforeCreateUiScene', this);
        // @TODO - BETA - Replace all different DOM references and standardize with the game engine driver.
        this.createPlayerBox();
        this.createTargetUi();
        this.createSceneLabelBox();
        this.createControlsBox();
        this.createInstructionsBox();
        this.createMiniMap();
        this.createSettingsUi();
        this.eventsManager.emitSync('reldens.createUiScene', this);
    }

    createSettingsUi()
    {
        let settingsConfig = this.getUiConfig('settings');
        if(!settingsConfig.enabled){
            return;
        }
        this.settingsUi = new SettingsUi();
        this.settingsUi.createSettings(settingsConfig, this);
    }

    createMiniMap()
    {
        let minimapConfig = this.getUiConfig('minimap');
        if(!minimapConfig.enabled){
            return;
        }
        this.minimapUi = new MinimapUi();
        this.minimapUi.createMinimap(minimapConfig, this);
    }

    createInstructionsBox()
    {
        let instConfig = this.getUiConfig('instructions');
        if(!instConfig.enabled){
            return;
        }
        this.instructionsUi = new InstructionsUi();
        this.instructionsUi.createInstructions(instConfig, this);
    }

    createControlsBox()
    {
        let controlsUi = this.getUiConfig('controls');
        if(!controlsUi.enabled){
            return;
        }
        if(this.useJoystick){
            this.elementsUi['controls'] = this.createUi('joystick', controlsUi);
            return this.joystick.registerJoystickController();
        }
        this.elementsUi['controls'] = this.createUi('controls', controlsUi);
        return this.registerControllers(this.elementsUi['controls']);
    }

    createUi(key, uiConfig)
    {
        return this.createContent(key, uiConfig.uiX, uiConfig.uiY);
    }

    createContent(key, x, y)
    {
        return this.add.dom(x, y).createFromCache(key);
    }

    createSceneLabelBox()
    {
        let sceneLabelUi = this.getUiConfig('sceneLabel');
        if(!sceneLabelUi.enabled){
            return;
        }
        this.elementsUi['sceneLabel'] = this.createUi('sceneLabel', sceneLabelUi);
    }

    createTargetUi()
    {
        let targetUi = this.getUiConfig('uiTarget');
        if(!targetUi.enabled){
            return;
        }
        this.uiTarget = this.createUi('uiTarget', targetUi);
        let closeButton = this.uiTarget.getChildByProperty('className', 'close-target');
        closeButton.addEventListener('click', () => {
            this.gameManager.gameEngine.clearTarget();
        });
    }

    createPlayerBox()
    {
        let playerBox = this.getUiConfig('playerBox');
        if(!playerBox.enabled){
            return;
        }
        this.elementsUi['playerBox'] = this.createUi('playerBox', playerBox);
        let logoutButton = this.elementsUi['playerBox'].getChildByProperty('id', 'logout');
        logoutButton?.addEventListener('click', () => {
            this.gameManager.forcedDisconnection = true;
            // @TODO - BETA - Move this into an event on the firebase plugin.
            if(this.gameManager.firebase.isActive){
                this.gameManager.firebase.app.auth().signOut();
            }
            this.gameManager.gameDom.getWindow().location.reload();
        });
    }

    getUiConfig(uiName, newWidth, newHeight)
    {
        let {uiX, uiY} = this.getUiPosition(uiName, newWidth, newHeight);
        return {enabled: this.gameManager.config.getWithoutLogs('client/ui/'+uiName+'/enabled'), uiX, uiY}
    }

    getUiPosition(uiName, newWidth, newHeight)
    {
        if('' === uiName){
            uiName = 'default';
        }
        let uiConfig = this.gameManager.config.getWithoutLogs('client/ui/'+uiName, {});
        let uiX = sc.get(uiConfig, 'x', 0);
        let uiY = sc.get(uiConfig, 'y', 0);
        if(this.gameManager.config.get('client/ui/screen/responsive')){
            let rX = sc.get(uiConfig, 'responsiveX', false);
            let rY = sc.get(uiConfig, 'responsiveY', false);
            let gameContainer = this.gameManager.gameDom.getElement(GameConst.SELECTORS.GAME_CONTAINER);
            if(!newWidth){
                newWidth = gameContainer.offsetWidth;
            }
            if(!newHeight){
                newHeight = gameContainer.offsetHeight;
            }
            uiX = false !== rX ? rX * newWidth / 100 : 0;
            uiY = false !== rY ? rY * newHeight / 100 : 0;
        }
        return {uiX, uiY};
    }

    preloadPlayerDefaultSprite()
    {
        let fallbackImage = this.gameManager.config.get('client/players/animations/fallbackImage', 'player-base.png');
        this.load.spritesheet(GameConst.IMAGE_PLAYER, '/assets/custom/sprites/'+fallbackImage, this.playerSpriteSize);
    }

    createPlayerAnimations(avatarKey)
    {
        let avatarFrames = this.gameManager.config.getWithoutLogs(
            'client/players/animations/'+avatarKey+'Frames',
            this.gameManager.config.get('client/players/animations/defaultFrames')
        );
        let availableAnimations = [{
                k: avatarKey + '_' + GameConst.LEFT,
                img: avatarKey,
                start: avatarFrames.left.start || 3,
                end: avatarFrames.left.end || 5,
                repeat: -1,
                hide: false
            }, {
                k: avatarKey + '_' + GameConst.RIGHT,
                img: avatarKey,
                start: avatarFrames.right.start || 6,
                end: avatarFrames.right.end || 8,
                repeat: -1,
                hide: false
            }, {
                k: avatarKey + '_' + GameConst.UP,
                img: avatarKey,
                start: avatarFrames.up.start || 9,
                end: avatarFrames.up.end || 11,
                repeat: -1,
                hide: false
            }, {
                k: avatarKey + '_' + GameConst.DOWN,
                img: avatarKey,
                start: avatarFrames.down.start || 0,
                end: avatarFrames.down.end || 2,
                repeat: -1,
                hide: false
            }
        ];
        for(let anim of availableAnimations){
            this.createAnimationWith(anim);
        }
        this.eventsManager.emitSync('reldens.createPlayerAnimations', this, avatarKey);
    }

    createArrowAnimation()
    {
        if(!this.gameManager.config.get('client/ui/pointer/show')){
            return;
        }
        let arrowAnim = {
            k: GameConst.ARROW_DOWN,
            img: GameConst.ARROW_DOWN, // this is the loaded image key
            start: 0,
            end: 2,
            repeat: 3,
            rate: 6
        };
        this.createAnimationWith(arrowAnim);
    }

    createAnimationWith(anim)
    {
        if(this.gameManager.createdAnimations[anim.k]){
            return;
        }
        let animationConfig = {
            key: anim.k,
            frames: this.anims.generateFrameNumbers(anim.img, {start: anim.start, end: anim.end}),
            frameRate: sc.get(anim, 'frameRate', this.configuredFrameRate),
            repeat: anim.repeat,
            hideOnComplete: sc.get(anim, 'hide', true),
        };
        //Logger.debug('Creating animation: '+anim.k, animationConfig);
        this.gameManager.createdAnimations[anim.k] = this.anims.create(animationConfig);
        return this.gameManager.createdAnimations[anim.k];
    }

    registerControllers(controllersBox)
    {
        // @TODO - BETA - Controllers will be part of the configuration in the database.
        this.setupDirButtonInBox(GameConst.UP, controllersBox);
        this.setupDirButtonInBox(GameConst.DOWN, controllersBox);
        this.setupDirButtonInBox(GameConst.LEFT, controllersBox);
        this.setupDirButtonInBox(GameConst.RIGHT, controllersBox);
        this.setupDefaultActionKey(controllersBox);
    }

    setupDefaultActionKey(controllersBox)
    {
        // if the default action is not specified we won't show the button:
        let defaultActionKey = this.gameManager.config.get('client/ui/controls/defaultActionKey');
        if(!defaultActionKey){
            return;
        }
        let actionBox = this.createActionBox(defaultActionKey);
        this.gameManager.gameDom.appendToElement('.action-buttons', actionBox);
        this.setupActionButtonInBox(defaultActionKey, controllersBox);
    }

    createActionBox(actionKey)
    {
        let skillTemplate = this.cache.html.get('actionBox');
        return this.gameManager.gameEngine.parseTemplate(skillTemplate, {
            key: actionKey,
            actionName: actionKey
        });
    }

    setupDirButtonInBox(dir, box)
    {
        let btn = box.getChildByProperty('id', dir);
        if(btn){
            this.hold(btn, {dir: dir});
        }
    }

    setupActionButtonInBox(action, box)
    {
        let actionButton = box.getChildByProperty('id', action);
        if(!actionButton){
            return;
        }
        if(this.gameManager.config.get('client/general/controls/action_button_hold')){
            this.hold(actionButton, action);
            return;
        }
        actionButton?.addEventListener('click', () => {
            let currentScene = this.gameManager.activeRoomEvents.getActiveScene();
            let dataSend = {
                act: ActionsConst.ACTION,
                target: currentScene.player.currentTarget,
                type: action
            };
            this.gameManager.activeRoomEvents.send(dataSend);
        });
    }

    hold(button, action)
    {
        button.addEventListener('mousedown', (event) => {
            this.startHold(event, button, action);
        });
        button.addEventListener('mouseup', (event) => {
            this.endHold(event, button);
        });
        button.addEventListener('mouseout', (event) => {
            this.endHold(event, button);
        });
        button.addEventListener('touchstart', (event) => {
            this.startHold(event, button, action);
        });
        button.addEventListener('touchend', (event) => {
            this.endHold(event, button);
        });
    }

    startHold(event, button, action)
    {
        event.preventDefault();
        if(this.gameManager.config.get('client/ui/controls/opacityEffect')){
            button.classList.add('button-opacity-off');
        }
        let currentScene = this.gameManager.activeRoomEvents.getActiveScene();
        let dataSend = action;
        // @TODO - BETA - Controllers will be part of the configuration in the database.
        if(!sc.hasOwn(action, 'dir')){
            dataSend = {
                act: ActionsConst.ACTION,
                target: currentScene.player.currentTarget,
                type: action.type
            };
        }
        this.gameManager.activeRoomEvents.send(dataSend);
    }

    endHold(event, button)
    {
        event.preventDefault();
        if(this.gameManager.config.get('client/ui/controls/opacityEffect')){
            button.classList.remove('button-opacity-off');
        }
        this.gameManager.activeRoomEvents.send({act: GameConst.STOP});
    }

    showLoadingProgressBar()
    {
        if(!this.gameManager.config.getWithoutLogs('client/ui/loading/show', true)){
            return;
        }
        let Rectangle = Geom.Rectangle;
        let main = Rectangle.Clone(this.cameras.main);
        this.progressRect = new Rectangle(0, 0, main.width / 2, 50);
        Rectangle.CenterOn(this.progressRect, main.centerX, main.centerY);
        this.progressCompleteRect = Geom.Rectangle.Clone(this.progressRect);
        this.progressBar = this.createGraphics();
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;
        let fontFamily = this.gameManager.config.get('client/ui/loading/font');
        let loadingFontSize = this.gameManager.config.get('client/ui/loading/fontSize');
        let loadingAssetsSize = this.gameManager.config.get('client/ui/loading/assetsSize');
        this.loadingText = this.createText(
            width / 2,
            height / 2 - 50,
            'Loading...',
            {fontFamily, fontSize: loadingFontSize}
        );
        this.loadingText.setOrigin(0.5, 0.5);
        this.loadingText.setFill(this.gameManager.config.get('client/ui/loading/loadingColor'));
        this.percentText = this.createText(width / 2, height / 2 - 5, '0%', {fontFamily, fontSize: loadingAssetsSize});
        this.percentText.setOrigin(0.5, 0.5);
        this.percentText.setFill(this.gameManager.config.get('client/ui/loading/percentColor'));
        this.assetText = this.createText(width / 2, height / 2 + 50, '', {fontFamily, fontSize: loadingAssetsSize});
        this.assetText.setFill(this.gameManager.config.get('client/ui/loading/assetsColor'));
        this.assetText.setOrigin(0.5, 0.5);
    }

    createText(width, height, text, styles)
    {
        return this.add.text(width, height, text, styles);
    }

    createGraphics()
    {
        return this.add.graphics();
    }

    onLoadComplete()
    {
        for(let child of this.children.list){
            child.destroy();
        }
        this.loadingText.destroy();
        this.assetText.destroy();
        this.percentText.destroy();
        this.scene.shutdown();
    }

    onFileProgress(file)
    {
        if(!this.gameManager.config.get('client/ui/loading/showAssets')){
            return;
        }
        // @TODO - WIP - TRANSLATIONS.
        this.assetText.setText('Loading '+file.key);
    }

    onLoadProgress(progress)
    {
        let progressText = parseInt(progress * 100) + '%';
        this.percentText.setText(progressText);
        let color = (0xffffff);
        let fillColor = (0x222222);
        this.progressRect.width = progress * this.progressCompleteRect.width;
        this.progressBar
            .clear()
            .fillStyle(fillColor)
            .fillRectShape(this.progressCompleteRect)
            .fillStyle(color)
            .fillRectShape(this.progressRect);
    }

    getUiElement(uiName, logError = true)
    {
        if(sc.hasOwn(this.elementsUi, uiName)){
            return this.elementsUi[uiName];
        }
        if(logError){
            Logger.error('UI not found.', {uiName});
        }
        return false;
    }

}

module.exports.ScenePreloader = ScenePreloader;
