"use strict";

import {BackSide, Mesh, MeshPhongMaterial, SphereGeometry, TextureLoader} from "../lib/three.module.js";

export default class Skybox {

    constructor() {

        /**
         * Create a skybox out of a sphere which we put in the middle
         * and then draw from the 'inside-out'
         */
        this.sphereGeometry = new SphereGeometry(1500, 64, 64);
        this.skyTexture = new TextureLoader().load('resources/textures/sky.png');
        this.sphereMaterial = new MeshPhongMaterial({map: this.skyTexture, color: 0x87ceeb, side: BackSide});
        this.skyBox = new Mesh(this.sphereGeometry, this.sphereMaterial);
    }

    addSkyBox(scene) {
        scene.add(this.skyBox);
    }
}