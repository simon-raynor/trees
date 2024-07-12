import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import TypeOne from './trees/type-one.js';


const stats = new Stats();
document.body.appendChild( stats.dom )


const scene = new THREE.Scene();


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.pixelRatio = window.devicePixelRatio;
//renderer.shadowMap.enabled = true;

document.getElementById('stage').appendChild(renderer.domElement);


const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.5,
    250
);



const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set(-5, 15, -30)
controls.target = new THREE.Vector3(0, 10, 0);
controls.update();



const alight = new THREE.AmbientLight( 0x202020 ); // soft white light
scene.add( alight );

const dlight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( dlight );



const trees = [];

const COUNT = 5;
const HCOUNT = Math.floor(COUNT / 2);

const GAP = 10;
const HGAP = GAP / 2;

for (let x = -HCOUNT; x <= HCOUNT; x++) {
    for (let y = -HCOUNT; y <= HCOUNT; y++) {
        trees.push(
            new TypeOne(
                new THREE.Vector3(
                    (GAP * x) + (HGAP * (0.5 - Math.random())),
                    0,
                    (GAP * y) + (HGAP * (0.5 - Math.random()))
                )
            )
        );
    }
}

scene.add(...trees.map(t => t.mesh));



function animate(_dt) {
    const dt = _dt / 1000;

    requestAnimationFrame(animate);

    controls.update();
    stats.update();


    trees.forEach(t => t.tick(dt));


    renderer.render( scene, camera );
}

animate();