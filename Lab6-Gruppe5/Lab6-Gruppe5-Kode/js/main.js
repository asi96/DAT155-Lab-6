import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    Mesh,
    MeshPhongMaterial,
    TextureLoader,
    RepeatWrapping,
    DirectionalLight,
    Vector3,
    AxesHelper,
    PlaneBufferGeometry,
    MeshBasicMaterial,
    PlaneGeometry,
    DoubleSide,
    CubeCamera,
    BackSide,
    MeshLambertMaterial, MeshFaceMaterial, ObjectLoader, Fog, PointLight, AmbientLight
} from './lib/three.module.js';

import {Water} from '../js/objects/Water.js';

import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import { SimplexNoise } from './lib/SimplexNoise.js';
import {LinearMipmapLinearFilter, RGBFormat, WebGLCubeRenderTarget} from "./lib/three.module.js";
import {Sprite, SpriteMaterial} from "./lib/three.module.js";
import {SphereGeometry} from "./lib/three.module.js";
import {FogExp2} from "./lib/three.module.js";
import {Object3D} from "./lib/three.module.js";
import {Group} from "./lib/three.module.js";


async function main() {

    const scene = new Scene();

    let origo = new Object3D();

    scene.add(origo);

    // const axesHelper = new AxesHelper(15);
    // scene.add(axesHelper);

    /**
     * Add a orbit node in the middle of the scene for the sun to rotate around
     */
    let centerOrbitNode = new Object3D();

    /**
     * Add a sun sphere and move it up
     */
    let sunGeometry = new SphereGeometry(30, 64, 64);
    let sunMaterial = new MeshPhongMaterial({color: 'yellow', emissive: '#F8CE3B'});
    let sun = new Mesh(sunGeometry, sunMaterial);
    sun.position.y = 1400;

    /**
     * Add a moon sphere and move it down
     */
    let moonGeometry = new SphereGeometry(30, 64, 64);
    let moonMaterial = new MeshPhongMaterial({shininess: 1.0, emissive: '#FFF'});
    let moon = new Mesh(moonGeometry, moonMaterial);
    moon.position.y = -1400;

    /**
     * Add both moon and sun to the orbitnode and group it all up into a lightGroup
     */
    centerOrbitNode.add(sun);
    centerOrbitNode.add(moon);

    const lightGroup = new Group();
    lightGroup.add(centerOrbitNode);

    scene.add(lightGroup);

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 6000);

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
    const sunLight = new PointLight(0xfdfbd3, 1.0);
    const moonLight = new PointLight(0xffffff, 0.0);

    sun.add(sunLight);
    moon.add(moonLight);

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

    const texture3 = new TextureLoader().load('./resources/textures/sand2.png');

    texture3.wrapS = RepeatWrapping;
    texture3.wrapT = RepeatWrapping;

    const splatMap = new TextureLoader().load('resources/images/kitts_experiment2.png');

    const splatMapSand = new TextureLoader().load('resources/images/kitts_sand_splat_final.png');

    const terrainMaterial = new TextureSplattingMaterial({
        color: 0xffffff,
        shininess: 0,
        textures: [texture2, texture1, texture3],
        splatMaps: [splatMap, splatMapSand]
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    scene.add(terrain);

    /**
     * Add trees:
     */

    const loader = new GLTFLoader();
    const palmtreeTex = new TextureLoader().load('resources/models/palmtree.jpg');
    const palmtreeMat = new MeshPhongMaterial({map: palmtreeTex});

    loader.load(
        // resource URL
        'resources/models/palmtree.gltf',
        // called when resource is loaded
        (object) => {
            for (let x = -2000; x < 2000; x += 8) {
                for (let z = -2000; z < 2000; z += 8) {
                    
                    // TODO: Uncomment this once you've implemented the terrain.

                     const px = x + 1 + (6 * Math.random()) - 3;
                     const pz = z + 1 + (6 * Math.random()) - 3;

                     const height = terrainGeometry.getHeightAt(px, pz);

                     if (height < 8 && height > 4) {
                         const tree = object.scene.children[0].clone();

                         tree.traverse((child) => {
                             if (child.isMesh) {
                                 child.castShadow = true;
                                 child.receiveShadow = true;
                                 child.material = palmtreeMat;
                             }
                         });

                         tree.position.x = px;
                         tree.position.y = height - 0.01;
                         tree.position.z = pz;

                         //tree.rotation.y = Math.random() * (2 * Math.PI);


                         tree.scale.multiplyScalar((1.5 + Math.random() * 1) * 0.003);

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
     * Water
     * Adds a water plane to the scene from the Water.js class
     */
    const waterGeometry = new PlaneBufferGeometry( 3000, 3000, 56,56 );

    let water = new Water(
        waterGeometry,
        {
            textureWidth: 3000,
            textureHeight: 3000,
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
    water.rotation.x = - Math.PI / 2;

    water.position.setY(2);

    scene.add( water );

    /**
     * Lava
     * Adds a lava plane to the scene in the crater
     */
    let lavageom = new PlaneGeometry(15,15,33,32);
    let lavaMat = new MeshPhongMaterial({map: new TextureLoader().load('resources/textures/lava.png'), emissive: 0xFF0000})
    let lava = new Mesh(lavageom,lavaMat);
    lava.rotation.x = - Math.PI / 2;
    lava.rotation.z = Math.PI/6;
    lava.position.set(-130, 35, -85)

    scene.add(lava);

    //clouds
    function generateBillboardClouds() {
        for(let i = 0; i < 100; i++) {
            /*var cloudtextures = [
               new TextureLoader().load('resources/textures/clouds/c1.jpg'), //Laster inn noen skyteksturer
                new TextureLoader().load('resources/textures/clouds/c2.jpg'),
                new TextureLoader().load('resources/textures/clouds/c3.jpg'),
                new TextureLoader().load('resources/textures/clouds/c4.jpg'),
                new TextureLoader().load('resources/textures/clouds/c5.jpg')

            ];
            */
            let cloudtexture = new TextureLoader().load('resources/textures/clouds/cloud10.png');

            let randomTexture = Math.floor(Math.random() * 4);
            let material = new SpriteMaterial({
                map: cloudtexture,
                transparent: true,
                opacity: 3.0,
                side: DoubleSide
            });
            let skyPlane = new Sprite(material);

            //Positions- plasser litt tilfeldig
            let pX = Math.random() * 1000 - 500;
            let pZ = Math.random() * 1000 - 500;
            let pY = Math.random() * 50 + 100;
            if(i < 2){
                pX = 185;
                pY = 100;
                pZ = 185;
            }
            let s1 = 50;
            let s2 = 50;

            //Set positions and scale
            skyPlane.position.set(pX, pY, pZ);
            skyPlane.scale.set(s1, s2);

            //Add to scene
            scene.add(skyPlane);
        }
    }
    generateBillboardClouds();

    //smoke
    let textureSmoke = new TextureLoader().load('resources/textures/smoke2.png');
            let smokeArray = new Array();

            let smokeMaterial = new SpriteMaterial({
                map: textureSmoke,
                transparent: true,
                opacity: 3.0,
                side: DoubleSide
            });

            for (let p = 0, l = 100; p < l; p++) {
                let particle = new Sprite(smokeMaterial);

                particle.position.set(
                    Math.random() * 20 - 140,
                    Math.random() * 100 + 50,
                    Math.random()* 20 - 90
                );
                particle.scale.set(
                    20,
                    20
                )
                smokeArray.push(particle);

                //particle.rotation.z = Math.random() * 360;
                scene.add(particle);
            };

    function animateSmoke(){
       for (let i = 0, l = 100; i<l; i++){
           smokeArray[i].position.setY(smokeArray[i].position.y + 0.05);
           if(smokeArray[i].position.y > 150){
               smokeArray[i].position.setY(45);
           }
       }
    }


        let icegeo = new PlaneGeometry(24, 24, 32, 32);
        let icemat = new MeshPhongMaterial({map: new TextureLoader().load('resources/textures/iceTexture.jpg')});
        let ice = new Mesh(icegeo, icemat);
        ice.rotation.x = - Math.PI/2;
        ice.position.set(188, 2.2, 178);

        scene.add(ice);

        let snowArray = new Array();
        let textureSnow = new TextureLoader().load('resources/textures/snowTexture.png');
        let snowMaterial = new SpriteMaterial({
            map: textureSnow,
            transparent: true,
            opacity: 3.0,
            side: DoubleSide
        });
        for(let i = 0, l = 100; i < l; i++) {

            let particle = new Sprite(snowMaterial);

            particle.position.set(
                Math.random() * 20 + 175,
                Math.random() * 90 + 2,
                Math.random() * 20 + 175
            );
            particle.scale.set(
                10,
                10
            );

            snowArray.push(particle);
            scene.add(particle);
        }


    function animateSnow(){
        for (let i = 0, l = 100; i<l; i++){
            snowArray[i].position.setX(snowArray[i].position.x + ((Math.random()/10) - 0.05));
            snowArray[i].position.setY(snowArray[i].position.y - (Math.random()/10));
            snowArray[i].position.setZ(snowArray[i].position.z + ((Math.random()/10) - 0.05));
            if(snowArray[i].position.y < 5){
                snowArray[i].position.set(Math.random() * 20 + 175, 80, Math.random() * 20 + 175);
            }
        }
    }

    /**
     * Create a skybox out of a sphere which we put in the middle
     * and then draw from the 'inside-out'
     */
    let sphereGeometry = new SphereGeometry(1500, 64, 64);
    let skyTexture = new TextureLoader().load('resources/textures/sky.png');
    let sphereMaterial = new MeshPhongMaterial( {map: skyTexture, color: 0x87ceeb, side: BackSide});
    let skyBox = new Mesh(sphereGeometry, sphereMaterial);

    scene.add(skyBox);

    /**
     * Helper-function called every frame to disable/enable the sun/moon
     * when they 'collide' with the water
     */
    function lightCheck() {
        if(sun.getWorldPosition(origo.position).y <= -50) {
            sun.visible = false;
            sunLight.intensity = 0.0;

            moon.visible = true;
            moonLight.intensity = 0.3;

        } else {
            sun.visible = true;
            sunLight.intensity = 1.0;

            moon.visible = false;
            moonLight.intensity = 0.0;
        }
    }

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

    let move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        speed: 0.01,
        up: false
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
        }else if(e.code === 'Space'){
            move.up = true;
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
        }
    });

    const velocity = new Vector3(0.0, 0.0, 0.0);

    let then = performance.now();
    function loop(now) {

        const delta = now - then;
        then = now;

        lightCheck();

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

        // update controller rotation.
        mouseLookController.update(pitch, yaw);
        yaw = 0;
        pitch = 0;

        // apply rotation to velocity vector, and translate moveNode with it.
        velocity.applyQuaternion(camera.quaternion);
        camera.position.add(velocity);

        // Apply rotation to water
        water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

        // Apply rotation to the orbit node for the sun and moon
        centerOrbitNode.rotation.x += 0.0025;

        animateSmoke();
        animateSnow();

        // render scene:
        renderer.render(scene, camera);

        requestAnimationFrame(loop);
    };

    loop(performance.now());


}

main(); // Start application