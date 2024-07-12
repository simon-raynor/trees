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


const alight = new THREE.AmbientLight( 0x202020 ); // soft white light
scene.add( alight );

const dlight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( dlight );


/* const shape = new THREE.Mesh(
    new THREE.DodecahedronGeometry(),
    new THREE.MeshPhongMaterial()
);

scene.add( shape );

const shapeQuat = new THREE.Quaternion();
shapeQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 100); */


const treeOne = new TypeOne(new THREE.Vector3(0, 0, 0));

scene.add(treeOne.mesh);


const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set(0, 30, -60)
controls.target = new THREE.Vector3(0, 5, 0);
controls.update();



function animate(dt) {
    requestAnimationFrame(animate);

    //shape.applyQuaternion(shapeQuat);

    controls.update();
    stats.update();

    treeOne.tick(dt / 1000);


    renderer.render( scene, camera );
}

animate();