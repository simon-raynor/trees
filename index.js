import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


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


const alight = new THREE.AmbientLight( 0x202020 ); // soft white light
scene.add( alight );

const dlight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( dlight );


const shape = new THREE.Mesh(
    new THREE.DodecahedronGeometry(),
    new THREE.MeshPhongMaterial()
);

scene.add( shape );


const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set(0, 30, -60)
controls.target = new THREE.Vector3(0, 0, 0);
controls.update();


function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render( scene, camera );
}

animate();