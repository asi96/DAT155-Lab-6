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
    MeshLambertMaterial, MeshFaceMaterial, ObjectLoader
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


async function main() {

    const scene = new Scene();

    const axesHelper = new AxesHelper(15);
    scene.add(axesHelper);

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);

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
    const directionalLight = new DirectionalLight(0xffffff, 1.0);

    scene.add(directionalLight);

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

    //Water - Gammel
    //var cubeRenderTarget = new WebGLCubeRenderTarget( 128, { format: RGBFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter } );
    //var waterGeometry = new PlaneGeometry(512.0, 512.0, 56,56);
    //var cubeCamera = new Cam Camera(1,100000,  cubeRenderTarget);
    //scene.add(cubeCamera);

    //envMap: cubeCamera.renderTarget.texture
    //var waterMaterial = new MeshPhongMaterial({map: new TextureLoader().load( 'resources/textures/waternormals.jpg' )
    //});
    //waterMaterial.envMap = cubeCamera.renderTarget.texture;
    //var waterPlane = new Mesh(waterGeometry, waterMaterial);
    //waterPlane.animate()

    //waterPlane.rotation.x = - Math.PI / 2;
    //waterPlane.position.setY(1.0);


    //scene.add(waterPlane);

    // Water

    const waterGeometry = new PlaneBufferGeometry( 512, 512, 56,56 );

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

    water.rotation.x = - Math.PI / 2;

    water.position.setY(2);

    scene.add( water );

    //lava
    var lavageom = new PlaneGeometry(15,15,33,32);
    var lavaMat = new MeshPhongMaterial({map: new TextureLoader().load('resources/textures/lava.png')})
    var lava = new Mesh(lavageom,lavaMat);
    lava.rotation.x = - Math.PI / 2;
    lava.rotation.z = Math.PI/6;
    lava.position.set(-130, 35, -85)
    scene.add(lava);



    //clouds
    function generateBillboardClouds() {
        for(var i = 0; i < 100; i++) {
            /*var cloudtextures = [
               new TextureLoader().load('resources/textures/clouds/c1.jpg'), //Laster inn noen skyteksturer
                new TextureLoader().load('resources/textures/clouds/c2.jpg'),
                new TextureLoader().load('resources/textures/clouds/c3.jpg'),
                new TextureLoader().load('resources/textures/clouds/c4.jpg'),
                new TextureLoader().load('resources/textures/clouds/c5.jpg')

            ];
            */
            var cloudtexture = new TextureLoader().load('resources/textures/clouds/cloud10.png');

            var randomTexture = Math.floor(Math.random() * 4);
            var material = new SpriteMaterial({
                map: cloudtexture,
                transparent: true,
                opacity: 3.0,
                side: DoubleSide
            });
            var skyPlane = new Sprite(material);

            //Positions- plasser litt tilfeldig
            var pX = Math.random() * 1000 - 500;
            var pZ = Math.random() * 1000 - 500;
            var pY = Math.random() * 50 + 100;
            if(i < 2){
                pX = 185;
                pY = 100;
                pZ = 185;
            }
            var s1 = 50;
            var s2 = 50;

            //Set positions and scale
            skyPlane.position.set(pX, pY, pZ);
            skyPlane.scale.set(s1, s2);


            //Add to scene
            scene.add(skyPlane);
        }
    }
    generateBillboardClouds();

    //smoke
    var texture = new TextureLoader().load('resources/textures/smoke2.png');
            var smokeArray = new Array();

            var smokeMaterial = new SpriteMaterial({
                map: texture,
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


        var icegeo = new PlaneGeometry(24, 24, 32, 32);
        var icemat = new MeshPhongMaterial({map: new TextureLoader().load('resources/textures/iceTexture.jpg')});
        var ice = new Mesh(icegeo, icemat);
        ice.rotation.x = - Math.PI/2;
        ice.position.set(188, 1.5, 178);
        scene.add(ice);

        var snowArray = new Array();
        var texture = new TextureLoader().load('resources/textures/snowTexture.png');
        var snowMaterial = new SpriteMaterial({
            map: texture,
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

        // render scene:
        animateSmoke();
        animateSnow();
        renderer.render(scene, camera);
        /*
        waterPlane.visible = false;
        cubeCamera.position.copy( camera.position );
        cubeCamera.position.setY(0.5);

        cubeCamera.update(renderer, scene);
        waterPlane.visible = true;
        */
        requestAnimationFrame(loop);


    };

    loop(performance.now());


}

main(); // Start application