"use strict";

import {Mesh, MeshPhongMaterial, SphereGeometry, TextureLoader} from "../lib/three.module.js";

export default class Rock {

    constructor() {

        this.rockGeometry = new SphereGeometry(10, 64, 64);
        this.rockTexture = new TextureLoader().load('resources/textures/rock_02.jpg');
        this.rockBump = new TextureLoader().load('resources/textures/rock_02bump2.jpg');

        this.rockMaterial = new MeshPhongMaterial({map: this.rockTexture, bumpMap: this.rockBump});
        this.rock = new Mesh(this.rockGeometry, this.rockMaterial);

        this.rock.position.set(30,0,80)
        this.rock.castShadow = true;
        this.rock.receiveShadow = true;
    }

    addRock(scene) {
        scene.add(this.rock);
    }
}