import {
    AdditiveBlending,
    Float32BufferAttribute,
    Geometry, MultiplyBlending,
    ParticleSystem,
    TextureLoader,
    Vector3,
    Vertex
} from "../lib/three.module.js";
import {ParticleBasicMaterial} from "../lib/three.module.js";
import {Points} from "../lib/three.module.js";
import {BufferGeometry} from "../lib/three.module.js";
import {PointsMaterial} from "../lib/three.module.js";
import {DoubleSide} from "../lib/three.module.js";

export function smoke(){
    let particleCount = 1800;
    let point = [];
    let velocity = [];
    for(let p = 0; p < particleCount; p++){
        let pX = Math.random() * 20 - 140;
        let pY = Math.random() * 100 + 50;
        let pZ = Math.random()* 20 - 90;
        point.push(pX);
        point.push(pY);
        point.push(pZ);
        velocity.push(Math.random());
    }

    let particles = new BufferGeometry();
    particles.setAttribute("position", new Float32BufferAttribute(point,3));
    particles.setAttribute("velocity", new Float32BufferAttribute(velocity, 1));
    let texture = new TextureLoader().load('resources/textures/smoke2.png');
    let particleMaterial = new PointsMaterial({
        size: 20,
        map: texture,
        transparent: true,
        opacity: 0.1,
        side: DoubleSide,
        depthTest: true,
        depthWrite: false,
        alphaTest: 0.5
    });

    let particleSystem = new Points(particles, particleMaterial);
    return(particleSystem);

}
export function update(particleSystem){
    let positions = particleSystem.geometry.getAttribute('position');
    let velocities = particleSystem.geometry.getAttribute('velocity');
    for(let i = 0; i < positions.count; i++){
        let velocity = velocities.getX(i);
        let y = positions.getY(i);
         y += velocity;

        if(y > 150){
            y = 5;
        }
        positions.setY(i, y);
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
}


