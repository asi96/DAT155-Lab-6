import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    Vector3,
    PlaneBufferGeometry,
    Fog,
    CatmullRomCurve3
} from './lib/three.module.js';

import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import {generateLava} from "./objects/Lava.js";
import {generateBillboardClouds, animateSky} from "./objects/Clouds.js";
import {generateSmoke, animateSmoke} from "./objects/Smoke.js";
import {animateSnow, generateIce, generateSno} from "./objects/Winter.js";

import DayNightCycle from "./objects/DayNightCycle.js";
import Skybox from "./objects/Skybox.js";
import Rock from "./objects/Rock.js";
import {Water} from '../js/objects/Water.js';
import Utilities from './lib/Utilities.js';
import Stats from "./lib/Stats.js";
import MouseLookController from './controls/MouseLookController.js';

async function main() {

    const scene = new Scene();

    /**
     * Add a FPS-counter to the top-left of the screen
     */
    var stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Enabling shadow mapping
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    /**
     * Handle window resize:
     *  - update aspect ratio.
     *  - update projection matrix
     *  - update renderer size
     */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    /**
     * Add canvas element to DOM.
     */
    document.body.appendChild(renderer.domElement);

    /**
     * Camera inital orientation:
     */
    camera.position.z = 70;
    camera.position.y = 55;
    camera.rotation.x -= Math.PI * 0.25;

    /**
     * Add terrain:
     *
     * We have to wait for the image file to be loaded by the browser.
     * There are many ways to handle asynchronous flow in your application.
     * We are using the async/await language constructs of Javascript:
     *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
     */
    const heightmapImage = await Utilities.loadImage('resources/images/kitts_experiment.png');

    const terrainGeometry = new TerrainBufferGeometry({ heightmapImage, width: 500, height: 50});

    const texture1 = new TextureLoader().load('./resources/textures/grass_02.png');

    texture1.wrapS = RepeatWrapping;
    texture1.wrapT = RepeatWrapping;

    texture1.repeat.set(50, 50);

    const texture2 = new TextureLoader().load('./resources/textures/rock_01.png');

    texture2.wrapS = RepeatWrapping;
    texture2.wrapT = RepeatWrapping;

    texture2.repeat.set(15, 15);

    const texture3 = new TextureLoader().load('./resources/textures/sand.png');

    texture3.wrapS = RepeatWrapping;
    texture3.wrapT = RepeatWrapping;

    const splatMapRock = new TextureLoader().load('resources/images/kitts_splatmap_rock.png');

    const splatMapSand = new TextureLoader().load('resources/images/kitts_sand_splat_final.png');

    const terrainMaterial = new TextureSplattingMaterial({
        color: 0xffffff,
        shininess: 0,
        textures: [texture2, texture1, texture3],
        splatMaps: [splatMapRock, splatMapSand]
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    // Shadow mapping
    terrain.receiveShadow = true;

    scene.add(terrain);

    /**
     * Add a day/night cycle to the scene with changing PointLights
     */
    const dayNightCycle = new DayNightCycle(scene);

    /**
     * Add trees:
     */
    const loader = new GLTFLoader();

    loader.load(
        // resource URL
        'resources/models/scene.gltf',
        // called when resource is loaded
        (object) => {
            for (let x = -2000; x < 2000; x += 13) {
                for (let z = -2000; z < 2000; z += 13) {

                    // TODO: Uncomment this once you've implemented the terrain.

                     const px = x + 1 + (6 * Math.random()) - 3;
                     const pz = z + 1 + (6 * Math.random()) - 3;

                     const height = terrainGeometry.getHeightAt(px, pz);

                     if (height < 12 && height > 4) {
                         const tree = object.scene.children[0].clone();

                         tree.traverse((child) => {
                             if (child.isMesh) {
                                 // Shadow mapping
                                 child.castShadow = true;
                             }
                         });

                         tree.position.x = px;
                         tree.position.y = height - 0.01;
                         tree.position.z = pz;

                         //tree.rotation.y = Math.random() * (2 * Math.PI);


                         tree.scale.multiplyScalar((1.5 + Math.random() * 1) * 0.0075);

                         scene.add(tree);
                     }

                }
            }
        },
        (xhr) => {
            console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading model.', error);
        }
    );

    /**
     * Adds a ship object to the scene which moves along a curve
     * @type {number}
     */
    let fraction = 0;
    let up = new Vector3(0,1,0);
    let axis = new Vector3();
    let curve = new CatmullRomCurve3([
        new Vector3(1000, 3 , 0),
        new Vector3(0, 3 , 1000),
        new Vector3(-1000, 3 , 0),
        new Vector3(0 , 3 , -1000)]
    );
    curve.closed = true;
    async function loadShip() {
        const shipLoader = new GLTFLoader();
        const skipData = await shipLoader.loadAsync('resources/models/skip/scene.gltf');
        const skip = skipData.scene.children[0];
        skip.position.x = 1000;
        skip.position.z = 0;
        skip.scale.multiplyScalar(0.1);
        //skip.rotateX(-0.1);
        skip.position.y = 3;

        scene.add(skip);
        return skip;
    }
    let skip = await loadShip();
    //radius 1500;

    /**
     * Water
     * Adds a water plane to the scene from the Water.js class
     */
    const waterGeometry = new PlaneBufferGeometry( 3000, 3000, 32,32 );

    let water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new TextureLoader().load( 'resources/textures/waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = RepeatWrapping;

            } ),
            alpha: 1.0,
            sunDirection: new Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    // Shadow mapping
    water.receiveShadow = true;

    water.rotation.x = - Math.PI / 2;
    water.position.setY(2);
    scene.add(water);

    /**
     * Lava
     * Adds a lava plane to the scene in the crater
     */
    let lava = generateLava();
    scene.add(lava);

    /**
     * Clouds in the sky
     */
    var skyTab = []
    for (let i = 0; i < 100; i++) {
        if(i == 0){
            var sky = generateBillboardClouds(true);
        } else {
            var sky = generateBillboardClouds(false);
        }
        skyTab.push(sky);
        scene.add(sky);
    }

    /**
     * Smoke from volcano
     */
    let roykTab = [];
    for (let p = 0, l = 100; p < l; p++) {
        let royk = generateSmoke();
        roykTab.push(royk);
        scene.add(royk);
    }

    /**
     * Create an ice plane and snow coming from a cloud above it
     */
    let ice = generateIce();
    scene.add(ice);

    let snoTab = [];
    for(let i = 0; i < 100; i++) {
        let sno = generateSno();
        snoTab.push(sno);
        scene.add(sno);
    }

    /**
     * Adds a rock with bump mapping
     *
     */
    const rock = new Rock();
    rock.addRock(scene);

    /**
     * Adds skybox to scene
     */
    const skyBox = new Skybox();
    skyBox.addSkyBox(scene);

    /**
     * Set up camera controller:
     */
    const mouseLookController = new MouseLookController(camera);

    // We attach a click lister to the canvas-element so that we can request a pointer lock.
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
    const canvas = renderer.domElement;

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    let yaw = 0;
    let pitch = 0;
    const mouseSensitivity = 0.001;

    function updateCamRotation(event) {
        yaw += event.movementX * mouseSensitivity;
        pitch += event.movementY * mouseSensitivity;
    }

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            canvas.addEventListener('mousemove', updateCamRotation, false);
        } else {
            canvas.removeEventListener('mousemove', updateCamRotation, false);
        }
    });

    let setting = {
        toggleFog: false
    }

    let move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        speed: 0.01,
        up: false,
    };

    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') {
            move.forward = true;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = true;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = true;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = true;
            e.preventDefault();
        } else if(e.code === 'KeyZ'){
            move.speed +=0.05;
            e.preventDefault();
        }else if(e.code === 'KeyX'){
            move.speed -=0.05;
            e.preventDefault();
        }else if(e.code === 'Space') {
            move.up = true;
            e.preventDefault();
        }else if(e.code === 'KeyF') {
            setting.toggleFog = true;
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') {
            move.forward = false;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = false;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = false;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = false;
            e.preventDefault();
        }else if(e.code === 'Space'){
            move.up = false;
            e.preventDefault();
        }else if (e.code === 'KeyF') {
            setting.toggleFog = false;
            e.preventDefault();
        }
    });

    const velocity = new Vector3(0.0, 0.0, 0.0);



    let then = performance.now();
    function loop(now) {

        // FPS-counter
        stats.begin();

        const delta = now - then;
        then = now;

        // Check if the sun has passed the water plane
        dayNightCycle.lightCheck();

        const moveSpeed = move.speed * delta + 3;

        velocity.set(0.0, 0.0, 0.0);

        if (move.left) {
            velocity.x -= moveSpeed;
        }

        if (move.right) {
            velocity.x += moveSpeed;
        }

        if (move.forward) {
            velocity.z -= moveSpeed;
        }

        if (move.backward) {
            velocity.z += moveSpeed;
        }
        if(move.up){
            velocity.y += moveSpeed;
        }

        /**
         * Legg til fog i scenen hvis man trykker på knappen 'F'
         */
        if(setting.toggleFog) {
            if (scene.fog === null) {
                if (dayNightCycle.sun.visible) {
                    scene.fog = new Fog(0xbcd1ec, 1, 500);
                } else {
                    scene.fog = new Fog(0x212533, 1, 500);
                }
            } else {
                scene.fog = null;
            }
        }

        // update controller rotation.
        mouseLookController.update(pitch, yaw);
        yaw = 0;
        pitch = 0;

        // apply rotation to velocity vector, and translate moveNode with it.
        velocity.applyQuaternion(camera.quaternion);
        camera.position.add(velocity);

        // Apply rotation to water
        water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

        dayNightCycle.animateCycle();
        animateSmoke(roykTab);
        animateSnow(snoTab);
        animateSky(skyTab);

        const newPosition = curve.getPoint(fraction);
        //const tangent = curve.getTangent(fraction);
        skip.position.copy(newPosition);
        //axis.crossVectors(up, tangent).normalize();
        //var zz = new Vector3(0,1,0);
        //var angle = Math.atan2(tangent.x, tangent.y);
        //const radians = Math.acos(up.dot(tangent));

        //skip.quaternion.setFromAxisAngle(zz, angle);
        skip.rotation.z = Math.atan2(curve.getPoint(fraction + 0.001).x - skip.position.x,
            curve.getPoint(fraction + 0.001).y - skip.position.y);
        fraction +=0.0001;
        if(fraction > 1){
            fraction = 0;
        }

        // render scene:
        renderer.render(scene, camera);

        // FPS-counter
        stats.end();

        requestAnimationFrame(loop);
    };

    loop(performance.now());
}

main(); // Start application
