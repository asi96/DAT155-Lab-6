import {
    DoubleSide,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
    Sprite,
    SpriteMaterial,
    TextureLoader
} from "../lib/three.module.js";

export function generateIce() {
    let icegeo = new PlaneGeometry(24, 24, 32, 32);
    let icemat = new MeshPhongMaterial({map: new TextureLoader().load('resources/textures/iceTexture.jpg')});
    let ice = new Mesh(icegeo, icemat);
    ice.rotation.x = -Math.PI / 2;
    ice.position.set(188, 2.2, 178);
    return ice;
}
export function generateSno(){
let textureSnow = new TextureLoader().load('resources/textures/snowTexture.png');
let snowMaterial = new SpriteMaterial({
    map: textureSnow,
    transparent: true,
    opacity: 0.6,
    side: DoubleSide
});
let snow = new Sprite(snowMaterial);
snow.position.set(
    Math.random() * 20 +175,
    Math.random() * 80 + 5,
    Math.random() * 20 +175
);
snow.scale.set(
    10,
    10
);
return snow;
}
export function animateSnow(snoTab){
    for (let i = 0, l = 100; i<l; i++){
        snoTab[i].position.setX(snoTab[i].position.x + ((Math.random()/10) - 0.05));
        snoTab[i].position.setY(snoTab[i].position.y - (Math.random()/10));
        snoTab[i].position.setZ(snoTab[i].position.z + ((Math.random()/10) - 0.05));
        if(snoTab[i].position.y < 5){
            snoTab[i].position.set(Math.random() * 20 + 175, 80, Math.random() * 20 + 175);
        }
    }
}
