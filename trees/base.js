import * as THREE from 'three';

export default class BaseTree {
    age = 0
    position = new THREE.Vector3()
    mesh = new THREE.Object3D();

    constructor(position) {
        this.position = position.clone();
    }

    tick(dt) {
        this.age += dt;
    }
}