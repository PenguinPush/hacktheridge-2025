// import necessary modules
import * as THREE from "three";
import CameraControls from "https://cdn.jsdelivr.net/npm/camera-controls@2.8.5/+esm";

import {
    baseFov,
    cameraPositions,
    maxFov,
    minFov,
} from "./constants.js";

CameraControls.install({THREE: THREE});

export class Camera {
    constructor(app, renderer) {
        this.renderer = renderer;
        this.index = 0;
        this.camera = new THREE.PerspectiveCamera(THREE.MathUtils.clamp(baseFov / (window.innerWidth / window.innerHeight) * 1.5, minFov, maxFov), window.innerWidth / window.innerHeight, 0.1, 1000);
        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
        this.clock = new THREE.Clock();
    }

    initCamera() {
        this.cameraControls.distance = this.cameraControls.minDistance = this.cameraControls.maxDistance = 0.1;

        this.cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
        this.cameraControls.mouseButtons.right = CameraControls.ACTION.NONE;
        this.cameraControls.mouseButtons.middle = CameraControls.ACTION.NONE;
        this.cameraControls.mouseButtons.wheel = CameraControls.ACTION.NONE;
        this.cameraControls.touches.one = CameraControls.ACTION.NONE;
        this.cameraControls.touches.two = CameraControls.ACTION.NONE;
        this.cameraControls.touches.three = CameraControls.ACTION.NONE;

        this.cameraControls.saveState();
        this.cameraControls.update(this.clock.getDelta());
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.fov = THREE.MathUtils.clamp(baseFov / this.camera.aspect * 1.5, minFov, maxFov);

        this.camera.updateProjectionMatrix();
    }

    update(inputData) {
        let cameraPos = cameraPositions[this.index].pos
        this.cameraControls.moveTo(cameraPos[0], cameraPos[1], cameraPos[2], true)

        let rotation_x = THREE.MathUtils.degToRad(this.inputData.rotation_x);
        let rotation_y = THREE.MathUtils.degToRad(this.inputData.rotation_y);
        this.cameraControls.rotateTo(rotation_x, rotation_y, true)

        console.log(this.inputData)
        this.cameraControls.update(this.clock.getDelta());
    }
}