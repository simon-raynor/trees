import * as THREE from 'three';
import BaseTree from "./base.js";


const GROW_INTERVAL = 100;
const H_DIRECTIONS = 3;

export default class TypeOne extends BaseTree {
    lastGrew = 0;

    segments = [];

    constructor(position) {
        super(position);

        this.rootSegment = this.createSegement(null, 0);

        this.geomBuffer = new THREE.BufferAttribute(new Float32Array(60000), 3);
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', this.geomBuffer);
        this.mesh = new THREE.LineSegments(
            this.geometry,
            new THREE.LineBasicMaterial({ color: 0x999999 })
        );

        this.mesh.position.copy(this.position);

        this.grow();
    }

    tick(dt) {
        if (isNaN(dt)) return;
        
        BaseTree.prototype.tick.call(this, dt);

        this.lastGrew += dt;

        if (this.lastGrew >= GROW_INTERVAL) {
            this.lastGrew = 0;

            this.grow();
        }
    }

    grow() {
        if (this.segments.length >= 10000) return;
        //this.segments.forEach(s => s.grow());
        for (let i = this.segments.length - 1; i >= 0; i--) {
            this.segments[i].grow();
        }

        this.updateGeometry();
    }

    updateGeometry() {
        this.segments.forEach(
            (seg, idx) => {
                const segGeom = seg.geometry;

                if (segGeom.length) {
                    const [a, b, c, x, y, z] = segGeom;

                    this.geomBuffer.setXYZ(idx * 2, a, b, c);
                    this.geomBuffer.setXYZ(1 + (idx * 2), x, y, z);
                }
            }
        );

        this.geomBuffer.needsUpdate = true;
    }

    createSegement(fromSegment, direction) {
        const segment = new TypeOneSegment(this, fromSegment, direction);

        for (let i = 0; i < this.segments.length; i++) {
            if (fuzzyEquals(this.segments[i].position, segment.position)) {
                return null;
            }
        }

        this.segments.push(segment);

        return segment;
    }
}


const tmpVec3 = new THREE.Vector3();

class TypeOneSegment {
    above = null;
    aside = null;

    constructor(tree, root, dir) {
        this.tree = tree;
        this.root = root;
        this.direction = dir;
        
        this.x = this.direction + ',' + (this.root?.direction ?? 0);
        this.y = 1 + (this.root?.x ?? 0);

        this.position = this.root
                    ? root.position.clone().add(directionVector(this.direction))
                    : new THREE.Vector3(0, 0, 0);
        
        this.below = dir ? null : this.root;
    }

    grow() {
        // TODO collision detect
        if (!this.above) {
            this.above = this.tree.createSegement(this, 0);
        } else if (
            !this.aside
            && !!this.below // don't grow horizontals from first segment
        ) {
            this.aside = this.tree.createSegement(this, randomHDirection());
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


function randomHDirection() {
    return 1 + Math.floor(Math.random() * H_DIRECTIONS * 0.9999);
}


const UP = new THREE.Vector3(0, 1, 0);

function directionVector(direction) {
    if (!direction) {
        return UP;
    } else {
        const theta = direction * (Math.PI * 2 / H_DIRECTIONS);

        return new THREE.Vector3(1, 0, 0).applyAxisAngle(UP, theta);
    }
}


function fuzzyEquals(v1, v2) {
    const e = Number.EPSILON * 10;
    return Math.abs(v1.x - v2.x) < e
        && Math.abs(v1.y - v2.y) < e
        && Math.abs(v1.z - v2.z) < e;
}