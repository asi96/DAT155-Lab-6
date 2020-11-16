import {DoubleSide, Sprite, SpriteMaterial, TextureLoader} from "../lib/three.module.js";

export function generateSmoke(){
let textureSmoke = new TextureLoader().load('resources/textures/smoke2.png');
let smokeMaterial = new SpriteMaterial({
    map: textureSmoke,
    transparent: true,
    opacity: 0.1,
    side: DoubleSide
});
let smoke = new Sprite(smokeMaterial);

smoke.position.set(
    Math.random() * 20 - 140,
    Math.random() * 100 + 50,
    Math.random()* 20 - 90
);
smoke.scale.set(
    20,
    20
);
return smoke;
}
export function animateSmoke(roykTab){
    for (let i = 0, l = 100; i<l; i++){
        roykTab[i].position.setY(roykTab[i].position.y + 0.05);
        if(roykTab[i].position.y > 150){
            roykTab[i].position.setY(45);
        }
    }
}
