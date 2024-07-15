import * as THREE from 'three';
import BaseTree from "./base.js";


const GROW_INTERVAL = 100;
const FAILSAFE_MAX_SEGMENTS = 1000;

export default class TypeOne extends BaseTree {

    segments = [];
    growable = [];

    constructor(position, branchDirections = 6, maxSegments = 100) {
        super(position);

        this.branchDirections = branchDirections;
        this.maxSegments = maxSegments;

        this.rootSegment = this.createSegement(null, 0);
        this.rootSegment.grow();

        this.geomBuffer = new THREE.BufferAttribute(new Float32Array(60000), 3);
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', this.geomBuffer);
        this.mesh = new THREE.LineSegments(
            this.geometry,
            new THREE.LineBasicMaterial({ color: 0x999999 })
        );

        this.mesh.position.copy(this.position);
    }

    tick(dt) {
        if (isNaN(dt)) return;
        
        BaseTree.prototype.tick.call(this, dt);

        this.growable.forEach(
            g => g.tick(dt)
        );
    }

    createSegement(fromSegment, direction) {
        if (
            this.segments.length > this.maxSegments
            || this.segments.length > FAILSAFE_MAX_SEGMENTS
        ) return null;

        const segment = new TypeOneSegment(this, fromSegment, direction);

        for (let i = 0; i < this.segments.length; i++) {
            if (fuzzyEquals(this.segments[i].position, segment.position)) {
                return null; // return something truthy so that above/aside checks work
            }
        }

        this.segments.push(segment);
        this.growable.unshift(segment);

        return segment;
    }

    randomHDirection() {
        return 1 + Math.floor(Math.random() * this.branchDirections * 0.9999);
    }
    
    directionVector(direction) {
        if (!direction) {
            return UP;
        } else {
            const theta = direction * (Math.PI * 2 / this.branchDirections);
    
            return new THREE.Vector3(1, 0, 0).applyAxisAngle(UP, theta);
        }
    }
}


const tmpVec3 = new THREE.Vector3();

class TypeOneSegment {
    age = 0;
    growAt = 0;

    above;
    aside;

    constructor(tree, root, dir) {
        this.tree = tree;
        this.idx = tree.segments.length;

        this.root = root;
        this.direction = dir;

        this.position = this.root
                    ? root.position.clone().add(this.tree.directionVector(this.direction))
                    : new THREE.Vector3(0, 0, 0);
        
        this.below = dir ? null : this.root;

        this.growAt = GROW_INTERVAL + Math.round(Math.random() * GROW_INTERVAL);
    }

    tick(dt) {
        this.age += dt;

        if (this.age >= this.growAt) {
            this.growAt += GROW_INTERVAL + Math.round(Math.random() * GROW_INTERVAL);
            this.grow();
        }
    }

    grow() {
        if (this.above && (this.aside || !this.below)) {
            this.tree.growable.splice(
                this.tree.growable.indexOf(this),
                1
            );
            return;
        }

        if (this.above === undefined) {
            this.above = this.tree.createSegement(this, 0);
        } else if (
            this.above !== null
            && this.aside === undefined
            && !!this.below // don't grow horizontals from first segment
        ) {
            this.aside = this.tree.createSegement(this, this.tree.randomHDirection());
        } else {
            this.aside = true;
        }

        this.updateGeometry();
    }

    updateGeometry() {
        if (this.root) {
            const [a, b, c] = this.root.position.toArray();
            const [x, y, z] = this.position.toArray();

            this.tree.geomBuffer.setXYZ(this.idx * 2, a, b, c);
            this.tree.geomBuffer.setXYZ(1 + (this.idx * 2), x, y, z);

            this.tree.geomBuffer.needsUpdate = true;
        }
    }

    get geometry() {
        if (this.root) {
            return [
                ...this.root.position.toArray(),
                ...this.position.toArray()
            ];
        } else return [];
    }

    get abovePosition() {
        return tmpVec3.set(0, 1, 0).add(this.position);
    }
}




const UP = new THREE.Vector3(0, 1, 0);


function fuzzyEquals(v1, v2) {
    const e = Number.EPSILON * 10;
    return Math.abs(v1.x - v2.x) < e
        && Math.abs(v1.y - v2.y) < e
        && Math.abs(v1.z - v2.z) < e;
}