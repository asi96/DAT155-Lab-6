import {Sprite, SpriteMaterial, TextureLoader} from "../lib/three.module.js";

export function generateBillboardClouds(snø) {
    var pX = Math.random() * 2500 - 1250;
    var pZ = Math.random() * 2500 - 1250;
    var pY = Math.random() * 100 + 200;
    var cloudtexture = new TextureLoader().load('resources/textures/clouds/cloud4.png');
    var material = new SpriteMaterial(
        {
            map: cloudtexture,
            transparent: true,
            opacity: 0.7,
            depthTest: true,
            depthWrite: true
        })
    if (snø) {
        pX = Math.random() * 2 + 180;
        pY = Math.random() * 2 + 85;
        pZ = Math.random() * 2 + 180;
    }
    var sky = new Sprite(material);
    sky.position.setX(pX + Math.round(Math.random() * 15));
    sky.position.setY(pY + Math.round(Math.random() * 15));
    sky.position.setZ(pZ + Math.round(Math.random() * 15));
    sky.scale.set( 50,  50);
    return sky;
}
export function animateSky(skyTab) {
    for (let j = 0; j < skyTab.length; j++) {
        skyTab[j].material.rotation += 0.001;
    }
}