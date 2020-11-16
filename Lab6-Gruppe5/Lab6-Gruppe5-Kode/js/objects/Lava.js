import {Mesh, MeshPhongMaterial, PlaneGeometry, TextureLoader} from "../lib/three.module.js";


export function generateLava(){
    let lavageom = new PlaneGeometry(15,15,33,32);
    let lavaMat = new MeshPhongMaterial({map: new TextureLoader().load('resources/textures/lava.png'), emissive: 0xFF0000})
    let lava = new Mesh(lavageom,lavaMat);
    lava.rotation.x = - Math.PI / 2;
    lava.rotation.z = Math.PI/6;
    lava.position.set(-130, 35, -85);
    return lava;
}