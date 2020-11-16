"use strict";

import {
    Group,
    Mesh,
    MeshPhongMaterial,
    Object3D,
    PointLight,
    SphereGeometry
} from "../lib/three.module.js";


export default class DayNightCycle {

    constructor(scene) {

        /**
         * Create a origo object to be used for calculations with lightCheck function
         * @type {Object3D}
         */
        this.origo = new Object3D();
        scene.add(this.origo);

        this.centerOrbitNode = new Object3D();

        /**
         * Add a sun sphere and move it up
         */
        let sunGeometry = new SphereGeometry(30, 64, 64);
        let sunMaterial = new MeshPhongMaterial({color: 'yellow', emissive: '#F8CE3B', fog: false});
        this.sun = new Mesh(sunGeometry, sunMaterial);
        this.sun.position.y = 1400;

        /**
         * Add a moon sphere and move it down
         */
        let moonGeometry = new SphereGeometry(30, 64, 64);
        let moonMaterial = new MeshPhongMaterial({shininess: 1.0, emissive: '#FFF', fog: false});
        this.moon = new Mesh(moonGeometry, moonMaterial);
        this.moon.position.y = -1400;

        /**
         * Adds two PointLights to the sun and moon with different intensity / color
         * @type {PointLight}
         */
        this.sunLight = new PointLight(0xfdfbd3, 1.0);
        this.moonLight = new PointLight(0xffffff, 0.3);

        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.height = 2000;
        this.sunLight.shadow.mapSize.width = 2000;
        this.sunLight.shadow.camera.near = 0.1;
        this.sunLight.shadow.camera.far = 3000;

        this.moonLight.castShadow = true;
        this.moonLight.shadow.mapSize.height = 2000;
        this.moonLight.shadow.mapSize.width = 2000;
        this.moonLight.shadow.camera.near = 0.1;
        this.moonLight.shadow.camera.far = 3000;

        this.sun.add(this.sunLight);
        this.moon.add(this.moonLight);
        this.moon.visible = false;

        /**
         * Add both moon and sun to the orbit node and group it all up into a lightGroup
         */
        this.centerOrbitNode.add(this.sun);
        this.centerOrbitNode.add(this.moon);

        this.lightGroup = new Group();
        this.lightGroup.add(this.centerOrbitNode);

        scene.add(this.lightGroup);
    }

    animateCycle() {
        // Apply rotation to the orbit node for the sun and moon
        this.centerOrbitNode.rotation.x += 0.0015;
    }

    /**
     * Helper-function called every frame to disable/enable the sun/moon
     * when they 'collide' with the water
     */
    lightCheck() {
        if (this.sun.getWorldPosition(this.origo.position).y <= -50 && !this.moon.visible) {
            this.sun.visible = false;
            this.sun.remove(this.sunLight);

            this.moon.visible = true;
            this.moon.add(this.moonLight);


        } else if (this.sun.getWorldPosition(this.origo.position).y >= -50 && !this.sun.visible) {
            this.sun.visible = true;
            this.sun.add(this.sunLight);

            this.moon.visible = false;
            this.moon.remove(this.moonLight);

        }
    }
}