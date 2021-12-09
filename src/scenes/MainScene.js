import Lantern from "../components/Lantern.js";
import NPC from "../components/NPC.js";
import Player from "../components/Player.js";
import DataController from "../controller/DataController.js";
import InputController from "../controller/InputController.js";
import MathGame from "./MathGameScene.js";

//Get controller
var inputController;

//
var point = 0;
var score_text;

//init variable map and layer
var map;
var items;
var underground;
var background;
var midground;
var coin;
var trapLayer;


//DayLight Variable
var skyState;

//depth layer
const depthLayer = {
    background: -20,
    midground: -10,
    trapLayer: -9,
    underground: -8,
    player: 20, 
}

//tweens
var cameraTween;
export default class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MAINSCENE",
        });
    }

    preload() { 
        Player.preload(this);

        this.load.image("tiles", "assets/images/RPG Nature Tileset.png");
        // this.load.tilemapTiledJSON("map", "assets/map_1.json");
        this.load.tilemapTiledJSON("map", "assets/images/map.json");

        this.load.image("coin", "assets/images/Liem si.png");
        this.load.image("mask", "assets/images/mask1.png");
        this.load.spritesheet(
            "lantern",
            "assets/images/Lantern Spritesheet.png",
            {
                frameWidth: 32,
                frameHeight: 32,
                startFrame: 0,
                endFrame: 6,
            }
        );
        this.load.pack("player-asset", "assets/Player Asset.json");
        this.load.audio("backgroundSound", "assets/Mad_Hatter_Tea_Party.mp3");
        this.load.audio("collectCoinSound", "assets/couin.mp3");
        this.load.audio(
            "deathSound",
            "assets/lego-yoda-death-sound-effect.mp3",
        );
        this.load.audio(
            "revivalSound",
            "assets/gta-san-andreas-ah-shit-here-we-go-again.mp3",
        );

        //load font
        this.load.bitmapFont('bigFont', 'assets/font/bigFont.png', 'assets/font/bigFont.xml');
        
        this.load.video("aLam_video", "assets/video/Cypher Lam.mp4");
        this.load.image("aLam_image", "assets/images/a Lam.png");
        this.load.video("highBackground", "assets/video/hightbackground.mp4");
        this.load.audio("headache", "assets/audio/dau dau qua.mp3");
        this.load.audio("balloonDeflating", "assets/audio/balloon-deflating.mp3");
        this.load.audio("balloonPop", "assets/audio/bubble-pop.mp3");

        this.load.audio("cheemsBonk_audio", "assets/audio/bonkmeme.mp3");
        this.load.image("cheemsBonk_image", "assets/images/cheems_bonk.png");
        
        this.load.video("chold", "assets/video/chold.mp4");
        this.load.image("heart", "assets/images/heart.png");
        
        this.load.video("hieuchimo", "assets/video/a hieu.mp4");
        
        this.load.image("peach", "assets/images/peach.png");
        this.load.image("key", "assets/images/key.png");
    }
    create() {
    //load font
        // this.add.bitmapText(100, 100, 'bigFont', 'Z123456789').setDepth(100);
    //Load data
        var dataController = new DataController(this);
        skyState = dataController.sceneData.skyState;
    //Load map
        this.loadMap();
    
        //Get input
        inputController = new InputController(this);
        this.inputKeys = inputController.getInputKeysDown();

    //load npc
    this.loadObjectNPC();
        
    //Init player
        this.player = new Player({
            scene: this,
            // x: 97,
            // y: 100,
            x: 1874.385986840413,
            y: 215.53530989584996,
        });
        this.player.inputKeys = this.inputKeys;

    //text score
        // score_text = this.add.text(10, 10, "Liêm sỉ: " + point, {
        //     fontFamily: "MainFont"
        // }).setShadowFill(true).setResolution(4);

    //check Collision
        this.checkCollision();
    //init Lantern
        this.lantern = new Lantern({
            scene: this,
            x: this.player.x,
            y: this.player.y,
            key: "lantern",
        }).setDepth(depthLayer.player);
        this.lantern.create(this.scene);
        this.lantern.setPipeline("Light2D");
        //Day night system
        this.skyState = skyState.night;
        this.lights.ambientColor = skyState.night;

    //Create tweens Timeline
        var timeline = dataController.sceneData.createTimelineSkyState();

    //Last config
        this.lights.enable();

        //set depth
        underground.setDepth(depthLayer.underground);
        background.setDepth(depthLayer.background);
        midground.setDepth(depthLayer.midground);
        trapLayer.setDepth(depthLayer.trapLayer);
        this.player.setDepth(depthLayer.player);

        //Set pipiline "Light 2D"
        underground.setPipeline("Light2D");
        background.setPipeline("Light2D");
        this.player.setPipeline("Light2D");
        trapLayer.setPipeline("Light2D");
        coin.setPipeline("Light2D");
        midground.setPipeline("Light2D");

    //Cameras
        this.cameras.main.setScene(this);
        this.cameras.main.setBounds(0, 0,map.widthInPixels, map.heightInPixels, true);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05,)
        this.cameras.main.setZoom(1.5, 1.5)
        this.swapDepth();

        //Const category collision
        const CATEGORY_PLAYER = 0b0001
        const CATEGORY_MIDGROUND = 0b0010

        this.player.setCollisionCategory(CATEGORY_PLAYER);
        this.player.setOnCollideWith(CATEGORY_MIDGROUND);
        
        // midground.setCollisionCategory(CATEGORY_MIDGROUND);
        // midground.setOnCollideWith(CATEGORY_PLAYER);

        this.player.collisionFilter = { group: CATEGORY_MIDGROUND }
        
        this.input.on('pointerdown', (pointer) => {
            this.player.setX(this.input.mousePointer.worldX);
            this.player.setY(this.input.mousePointer.worldY);
            console.log("mouse: " + this.input.mousePointer.worldX + ' ' + this.input.mousePointer.worldY);
        }, this);
        
        this.input.keyboard.on('keydown-' + 'R', () => {
            this.scene.restart();
        })

    }
    
    update(time, delta) {
        this.inputKeys = inputController.getInputKeysDown();
        this.player.update();
        if (this.player.state != "dead"){
            this.lantern.update(this.player.x, this.player.y - 30);
        }
    }

//================================================ANOTHER FUNCTION==================================================================
    loadMap(){
        this.add.text(30, 30, "text").setText
        //create map
        map = this.make.tilemap({ key: "map" });

        //get tileset ground
        const tileset = map.addTilesetImage(
            "RPG Nature Tileset",
            "tiles",
            32,
            32,
            0,
            0
        );
        //var collide object
        var collidesObject = map.getObjectLayer("collides");
        collidesObject.objects.forEach(object => {
            
            var body = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                isSensor: false,
                isStatic: true,
            })
        })
        //get tileset items
        items = map.addTilesetImage("Liem si", "coin", 32, 32, 0, 0);
        //create underground
        underground = map.createLayer("underground", tileset, 0, 0);
        underground.forEachTile(function (tile) {
            tile.setAlpha(0)
        });
        this.matter.world.convertTilemapLayer(underground);
        
        //create background
        background = map.createLayer("background", tileset, 0, 0);
        this.matter.world.convertTilemapLayer(background);

        //create midground
        midground = map.createLayer("midground", tileset, 0, 0);
        midground.setCollisionByProperty({ collides: true });
        midground.setCollisionBetween(21, 24, true);
        midground.setCollisionByProperty()
        this.matter.world.convertTilemapLayer(midground);
        //set label is "midground" for tile in trap layer
        midground.forEachTile(function (tile) {
            if (tile.collideDown) {
                
                tile.physics.matterBody.setCollisionGroup(0b0010);
                // tile.physics.matterBody.collisionFilter.category = 0b0010;
                tile.physics.matterBody.body.label = "midground";
            }
        });

        //create trap layer
        trapLayer = map.createLayer("trapsLayer", tileset, 0, 0);
        trapLayer.setCollisionByProperty({ collides: true });
        trapLayer.setCollisionBetween(2, 6, true);
        this.matter.world.convertTilemapLayer(trapLayer);

        //set label is "trap" for tile in trap layer
        trapLayer.forEachTile(function (tile) {
            if (tile.collideDown) {
                tile.physics.matterBody.body.label = "trap";
                tile.physics.matterBody.body.isSensor = true;
            }
        });
        trapLayer.setOrigin(0);

        //create items layer
        coin = map.createLayer("itemsLayer", items, 0, 0);
        coin.setCollisionByProperty({ collides: true });
        coin.setCollisionBetween(0, 10000, true);
        this.matter.world.convertTilemapLayer(coin);

        //set label is "coin" for coin tile in items layer
        coin.forEachTile(function (tile) {
            if (tile.collideDown) {
                tile.physics.matterBody.body.label = "coin";
                tile.physics.matterBody.body.isSensor = true;
            }
        });

        //load trap
        this.loadDeadBouces();
        this.loadTrapDrop();
        this.loadDeadArea();
        this.loadTrapAB();
        this.loadChangeSafeLayer();
        this.loadTrapDelayDisappear();
        this.loadTrapStatic();
        this.loadTrapFakeTexture();
        this.loadTrapGradient();
        this.loadTrapWalls();
    }

    loadDeadArea(){
        var respawn_collide = map.getObjectLayer("respawnCollide");
        respawn_collide.objects.forEach(object => {
            if (object.name == "chau"){
                var bodies = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                    isSensor: true,
                    isStatic: true,
                    label: "respawn_collide_chau",
                    onCollideCallback: (pair) => {
                        if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                            this.player.deadBySimp();
                        }
                    }
                })
            }
            if (object.name == "default"){
                var bodies = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                    isSensor: true,
                    isStatic: true,
                    label: "respawn_collide_default",
                    onCollideCallback: (pair) => {
                        if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                            this.player.dead();
                        }
                    }
                })
            }
            if (object.name == "chimo"){
                var bodies = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                    isSensor: true,
                    isStatic: true,
                    label: "respawn_collide_default",
                    onCollideCallback: (pair) => {
                        if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                            this.player.deadByChimo();
                        }
                    }
                })
            }
            if (object.name == "cheems"){
                var bodies = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                    isSensor: true,
                    isStatic: true,
                    label: "respawn_collide_default",
                    onCollideCallback: (pair) => {
                        if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                            this.player.deadByCheemsBonk();
                        }
                    }
                })
            }
        })
    }

    loadDeadBouces(){
        var dead_bounces = map.getObjectLayer("trapBounce");
        dead_bounces.objects.forEach(object => {
            var bodies = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                isSensor: true,
                isStatic: true,
                label: "trapBounce",
                onCollideCallback: (pair) => {
                    if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                        var tilesBounce = [];
                        for (let i = object.x; i < object.x + object.width; i += 3){
                            for(let j = object.y; j < object.y + object.height; j += 3){
                                var isDuplicate = false;
                                var tile = map.getTileAtWorldXY(i, j, true)
                                tilesBounce.forEach(tileBounce => {
                                    if (tileBounce.x == tile.x && tileBounce.y == tile.y){
                                        isDuplicate = true;
                                    }
                                })
                                if (!isDuplicate){
                                    tilesBounce.push(map.getTileAt(tile.x, tile.y, true, "background"));
                                }
                            }
                        }
                        console.log(tilesBounce)
                        this.tweens.add({
                            targets: tilesBounce,
                            pixelY: function(target, targetKey, value, targetIndex, totalTargets, tween) { 
                                return value - 16;
                            },
                            yoyo: true,
                            ease: "Linear",
                            duration: 300
                        })
                        this.player.deadBounce();
                    }
                },
            })
        })
        
    }

    loadObjectNPC(){
        var npcs = map.getObjectLayer("npc");
        var npc_grammar;
        npcs.objects.forEach(object => {
            if (object.name = "npc_grammar"){
                npc_grammar = new NPC({
                    scene: this,
                    x: object.x + object.width / 2,
                    y: object.y + object.height / 2,
                })
            }
        })
    }

    checkCollision(){
    //Check collision with coin
        this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
            var p;
            var tmp = bodyA;
            bodyA = bodyA.label == "coin" ? bodyA : bodyB;
            bodyB = bodyB.label == "playerCollider" ? bodyB : tmp;
            if (bodyA.label == "coin" && bodyB.label == "playerCollider") {
                point++;
                // score_text.text = "Liêm sỉ: " + point;
                this.sound.play("collectCoinSound");
                p = map.worldToTileXY(bodyA.position.x, bodyA.position.y, true);
                map.getTileAt(p.x, p.y, true, coin).physics.matterBody.destroy();
                map.removeTileAt(p.x, p.y, true, false, coin);
            }
        });
    
    //Check conllision player with trap
        this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
            if (
                (bodyA.label == "trap" && bodyB.label == "playerCollider") ||
                (bodyB.label == "trap" && bodyA.label == "playerCollider")
            ) {
                
                this.player.deadByLam();
            }
        });
    }

    loadTrapDrop(){
        var trapDrop = map.getObjectLayer("trapDrop");
        var number = 1;
        var char = 65;
        for (let i = 0; i < 10; i++){
            trapDrop.objects.forEach(object => {
                if (object.name == ("active" + String(number))){
                    var activeCollide = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                        isSensor: true,
                        isStatic: true,
                        label: "active",
                        onCollideCallback: (pair) => {
                            if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                for (char = 60; char < 65; char++){
                                    console.log(char)
                                    this.time.delayedCall(1000 * (char - 60), () => {
                                        trapDrop.objects.forEach(pointer => {
                                            console.log("drop" + object.name.substring(6) + String.fromCharCode(char))
                                            if (pointer.name == ("drop" + object.name.substring(6) + String.fromCharCode(char))){
                                                this.matter.add.image(pointer.x + pointer.width / 2, pointer.y + pointer.height / 2, "aLam_image", {}, {
                                                    isSensor: true,
                                                    label: "trapDrop",
                                                    ignoreGravity: false,
                                                    onCollideCallback: (pair) => {
                                                        if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                                            this.player.deadByLam();
                                                        }
                                                    }
                                                }).setScale(0.2)
                                            }
                                        })
                                        char++;
                                    })
                                }
                                this.matter.world.remove(activeCollide)
                            }
                        },
                    })
                    number++;
                }
            })
        }
    }

    loadTrapAB(){
        var trapAB = map.getObjectLayer("trapAB");
        for (let i = 1; i <= 10; i++){
            trapAB.objects.forEach(object => {
                if (object.name == ("active" + String(i))){
                    var activeCollide = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                        isSensor: true,
                        isStatic: true,
                        label: "active",
                        onCollideActiveCallback: (pair) => {
                            if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                var pointA;
                                var pointB;
                                trapAB.objects.forEach(collide => {
                                    if (collide.name == (object.name.substring(6) + "A")){
                                        pointA = this.matter.add.image(collide.x, collide.y + collide.height / 2, "aLam_image", {}, {
                                            isSensor: true,
                                            ignoreGravity: true,
                                            onCollideCallback: (pair) => {
                                                if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                                    this.player.deadByLam();
                                                }
                                            }
                                        }).setScale(0.2).setDepth(depthLayer.player - 1)
                                        var x1 = collide.x;
                                        var y1 = collide.y + collide.height / 2;
                                        x1 = x1 + collide.width * Math.cos(collide.rotation * ( Math.PI / 180));
                                        y1 = y1 + collide.width * Math.sin(collide.rotation * ( Math.PI / 180))
                                        this.tweens.add({
                                            targets: pointA,
                                            x: x1,
                                            y: y1,
                                            duration: collide.properties[0].value,
                                            ease: "Linear",
                                            onComplete: () => {
                                                pointA.destroy();
                                            }
                                        })
                                    }
                                })

                                this.matter.world.remove(activeCollide)
                            }
                        }
                    })
                }
            })
        }
    }

    loadChangeSafeLayer(){
        var safeLayer = map.getObjectLayer("changeSafeLayer");
        safeLayer.objects.forEach(object => {
            if (object.name == "active"){
                var bodies = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                    isSensor: true,
                    isStatic: true,
                    label: "active",
                    onCollideCallback: (pair) => {
                        if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                            var tilesBackground = [];
                            var tilesUnderground = [];
                            for (let i = object.x; i < object.x + object.width; i += 3){
                                for(let j = object.y; j < object.y + object.height; j += 3){
                                    var isDuplicate = false;
                                    var tile = map.getTileAtWorldXY(i, j, true)
                                    tilesBackground.forEach(tileBounce => {
                                        if (tileBounce.x == tile.x && tileBounce.y == tile.y){
                                            isDuplicate = true;
                                        }
                                    })
                                    if (!isDuplicate){
                                        tilesBackground.push(map.getTileAt(tile.x, tile.y, true, "background"));
                                        tilesUnderground.push(map.getTileAt(tile.x, tile.y, true, "underground"));
                                    }
                                }
                            }
                            this.tweens.add({
                                targets: tilesUnderground,
                                alpha: 1,
                                ease: "Linear",
                                duration: 300,
                                onComplete: () => {
                                    tilesUnderground.forEach(tile => {
                                    })
                                }
                            })
                            this.matter.world.remove(bodies)
                        }
                    },
                })
            }
        })
    }

    loadTrapDelayDisappear(){
        var trapDelayDisappear = map.getObjectLayer("trapDelayDisappear");
        for (let i = 1; i < 10; i++){
            trapDelayDisappear.objects.forEach(object => {
                if (object.name == "active" + String(i)){
                    var bodies = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                        isStatic: true,
                        isSensor: true,
                        label: "active",
                        onCollideActiveCallback: (pair) => {
                            if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                trapDelayDisappear.objects.forEach(collide => {
                                    if (collide.name == ("position" + object.name.substring(6))){
                                        var enemy =  this.matter.add.image(collide.x + collide.width / 2, collide.y + collide.height / 2, "aLam_image", {}, {
                                            isStatic: true,
                                            isSensor: true,
                                            onCollideActiveCallback: (pair) => {
                                                if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                                    this.player.deadByLam();
                                                }
                                            }
                                        }).setScale(0.2);
                                        this.time.delayedCall(10000, () => {
                                            enemy.destroy();
                                        })
                                    }
                                })

                                this.matter.world.remove(bodies)
                            }
                        }
                    })

                }
            })
        }
    }

    loadTrapStatic(){
        var trapStatic = map.getObjectLayer("trapStatic");
        for (let i = 1; i <= 10; i++){
            trapStatic.objects.forEach(object => {
                if (object.name == ("active" + String(i))){
                    var activeCollide = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                        isSensor: true,
                        isStatic: true,
                        label: "active",
                        onCollideCallback: (pair) => {
                            if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                trapStatic.objects.forEach(collide => {
                                    if (collide.name == (object.name.substring(6) + "A")){
                                        console.log(collide)
                                        if (collide.properties[0].value == "cheemsBonk_image"){

                                        }
                                        var cheesm = this.matter.add.image(collide.x, collide.y + collide.height / 2, collide.properties[0].value, {}, {
                                            isSensor: true,
                                            ignoreGravity: true,
                                            onCollideCallback: (pair) => {
                                                if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                                    this.player.deadByCheemsBonk();
                                                }
                                            }
                                        }).setScale(0.5).setDepth(depthLayer.player - 1).setFlipX(true)
                                    }
                                })

                                this.matter.world.remove(activeCollide)
                            }
                        }
                    })
                }
            })
        }
    }

    loadTrapFakeTexture(){
        var trapFakeTexture = map.getObjectLayer("trapFakeTexture");
        trapFakeTexture.objects.forEach(object => {
            if (object.name == "active"){
                var srcImage = this.matter.add.image(object.x + object.width / 2, object.y + object.height / 2, object.properties[1].value, {}, {
                    isSensor: true,
                    isStatic: true,
                })
                var activeCollide = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                    isSensor: true,
                    isStatic: true,
                    label: "active",
                    onCollideCallback: (pair) => {
                        if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                            srcImage.destroy();
                            srcImage = this.matter.add.image(object.x + object.width / 2, object.y + object.height / 2, object.properties[0].value, {}, {
                                isSensor: true,
                                isStatic: true,
                            })
                            this.matter.world.remove(activeCollide)
                        }
                    }
                })

            }
        })
    }

    loadTrapGradient(){
        var trapGradient = map.getObjectLayer("trapGradient");
        for (let i = 1; i <= 10; i++){
            trapGradient.objects.forEach(object => {
                if (object.name == ("active" + String(i))){
                    var activeCollide = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                        isSensor: true,
                        isStatic: true,
                        label: "active",
                        onCollideCallback: (pair) => {
                            if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                trapGradient.objects.forEach(collide => {
                                    if (collide.name == ("area" + object.name.substring(6))){
                                        var rectangle = this.add.rectangle(collide.x + collide.width / 2, collide.y, collide.width, 1, 0xFF00000, 0.8)
                                        var rectangleBody = this.matter.add.rectangle(collide.x + collide.width / 2, collide.y, collide.width, 1, {
                                            isSensor: true,
                                            isStatic: true,
                                            label: "lava",
                                            
                                            onCollideCallback: (pair) => {
                                                if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                                    this.player.dead();
                                                }
                                            }
                                        })
                                        rectangleBody.bounds.max.y = collide.height;
                                        
                                        this.tweens.add({
                                            targets: [rectangleBody.vertices[2], rectangleBody.vertices[3]],
                                            y: collide.y + collide.height,
                                            ease: "Linear",
                                            duration: collide.properties[0].value,
                                        })
                                        this.tweens.add({
                                            targets: rectangle,
                                            displayHeight: (collide.height - rectangle.height) * 2 ,
                                            y: collide.y +  collide.height,
                                            ease: "Linear",
                                            duration: collide.properties[0].value * 2,
                                        })
                                    }
                                })
                                this.matter.world.remove(activeCollide)
                            }
                        }
                    })
                }
            })
        }
    }

    loadTrapWalls(){
        var trapWalls = map.getObjectLayer("trapWalls");
        for (let i = 1; i < 10; i++){
            trapWalls.objects.forEach(object => {
                if (object.name == "active" + String(i)){
                    var activeCollide = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {
                        isSensor: true,
                        isStatic: true,
                        label: "active",
                        onCollideCallback: (pair) => {
                            if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                trapWalls.objects.forEach(childObject => {
                                    if (childObject.name == ("wall" + object.name.substring(6))){
                                        var image = this.matter.add.image(childObject.x, childObject.y, childObject.properties[0].value, 0, {
                                            isSensor: true,
                                            isStatic: true,
                                            onCollideCallback: (pair) => {
                                                if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                                    if (childObject.properties[0].value.includes("aLam")){
                                                        this.player.deadByLam();
                                                    }
                                                }
                                            }
                                        })
                                        image.setScale(64 / image.displayHeight)

                                        var numberVertical = Math.ceil(childObject.width / image.displayWidth);
                                        var numberHorizontal = Math.ceil(childObject.height / image.displayHeight);
                                        for (let j = 1; j <= numberVertical * 2 + numberHorizontal * 2; j++){
                                            var x1;
                                            var y1;
                                            if (j > numberVertical * 2 + numberHorizontal){
                                                x1 = childObject.x ;
                                                y1 = childObject.y + childObject.height * (j - numberVertical * 2 - numberHorizontal) / numberHorizontal;
                                            }
                                            else if (j > numberVertical + numberHorizontal){
                                                x1 = childObject.x + childObject.width * (j - numberHorizontal - numberVertical) / numberVertical;
                                                y1 = childObject.y + childObject.height;
                                            }
                                            else if (j > numberVertical){
                                                x1 = childObject.x + childObject.width;
                                                y1 = childObject.y + childObject.height * (j - numberVertical) / numberHorizontal;
                                            }else if(j > 0){
                                                x1 = childObject.x  + childObject.width * j / numberVertical;
                                                y1 = childObject.y ;
                                            }
                                            var childImage = this.matter.add.image(x1, y1, childObject.properties[0].value, 0, {
                                                isSensor: true,
                                                isStatic: true,
                                                onCollideCallback: (pair) => {
                                                    if (pair.bodyA.label == "playerCollider" || pair.bodyB.label == "playerCollider"){
                                                        if (childObject.properties[0].value.includes("aLam")){
                                                            this.player.deadByLam();
                                                        }
                                                    }
                                                }
                                            })
                                            childImage.setScale(64 / childImage.displayHeight)
                                        }
                                    }
                                })
                                this.matter.world.remove(activeCollide)
                            }
                        }
                    })
                }
            })
        }
    }

    swapDepth(){
        this.matter.world.on("collisionactive", (event, bodyA, bodyB) => {
            event.pairs.forEach(pair => {
                if (pair.bodyA.label == "midground" && pair.bodyB.label == "playerSensor"
                ||  pair.bodyA.label == "playerSensor" && pair.bodyB.label == "midground"){
                    var tmp = bodyA;
                    bodyA = bodyA.label == "midground" ? bodyA : bodyB;
                    bodyB = bodyB.label == "playerSensor" ? bodyB : tmp;
                    var offsetY = 15;
                    if (pair.bodyA.position.y > pair.bodyB.position.y + offsetY){
                        this.player.setDepth(depthLayer.background);
                    }else if(pair.bodyA.position.y < pair.bodyB.position.y + offsetY){
                        this.player.setDepth(depthLayer.player);
                    }
                }
            });
        });
    }

    getRootBody (body)
    {
        if (body.parent === body) { return body; }
        while (body.parent !== body)
        {
            body = body.parent;
        }
        return body;
    }

    restartScene(key){
        this.game.scene.remove(key);
        this.game.scene.add(key,  MathGame);
    }




}
