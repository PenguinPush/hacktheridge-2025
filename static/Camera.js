// import necessary modules
import * as THREE from "three";
import CameraControls from "https://cdn.jsdelivr.net/npm/camera-controls@2.8.5/+esm";

import {
    baseFov,
    maxFov,
    minFov,
} from "./constants.js";

CameraControls.install({THREE: THREE});

export class Camera {
    constructor(app, renderer) {
        this.renderer = renderer;
        this.camera = new THREE.PerspectiveCamera(THREE.MathUtils.clamp(baseFov / (window.innerWidth / window.innerHeight) * 1.5, minFov, maxFov), window.innerWidth / window.innerHeight, 0.1, 1000);
        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
        this.clock = new THREE.Clock();
    }

    initCamera() {
        this.cameraControls.distance = 0.1;

        this.cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
        this.cameraControls.mouseButtons.right = CameraControls.ACTION.NONE;
        this.cameraControls.mouseButtons.middle = CameraControls.ACTION.NONE;
        this.cameraControls.mouseButtons.wheel = CameraControls.ACTION.NONE;
        this.cameraControls.touches.one = CameraControls.ACTION.NONE;
        this.cameraControls.touches.two = CameraControls.ACTION.NONE;
        this.cameraControls.touches.three = CameraControls.ACTION.NONE;

        this.cameraControls.smoothTime = 0.1
        this.cameraControls.moveTo(3, 1.15, 0, false);

        this.cameraControls.saveState();
        this.cameraControls.update(this.clock.getDelta());
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.fov = THREE.MathUtils.clamp(baseFov / this.camera.aspect * 1.5, minFov, maxFov);

        this.camera.updateProjectionMatrix();
    }

    update(inputData) {
        let targetRotation = -inputData.rotation;
        let currentRotation = this.cameraControls.azimuthAngle;

        let deltaRotation = targetRotation - currentRotation;
        deltaRotation = THREE.MathUtils.euclideanModulo(deltaRotation + Math.PI, 2 * Math.PI) - Math.PI;


        if (inputData.axis === 'x') {
            this.cameraControls.rotateTo(currentRotation + deltaRotation - inputData.value * 0.1, Math.PI / 2, true);

        } else if (inputData.axis === 'y') {
            this.cameraControls.rotateTo(currentRotation + deltaRotation, Math.PI / 2 + inputData.value * 0.1, true);
        } else {
            this.cameraControls.rotateTo(currentRotation + deltaRotation, Math.PI / 2, true);
        }

        this.cameraControls.forward(inputData.joystick_y * 0.01, true)
        this.cameraControls.truck(inputData.joystick_x * 0.01, 0, true)

        this.cameraControls.update(this.clock.getDelta());
    }
}