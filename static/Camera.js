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
        this.serverData = { rotation_x: 0, rotation_y: 0, rotation_z: 0 };
    }

    initCamera() {
        let cameraPos = cameraPositions[this.index].pos;
        let cameraRot = cameraPositions[this.index].rot;

        this.camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
        this.cameraControls.rotateTo(cameraRot[0], cameraRot[1], false);
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

        this.fetchInputData();
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.fov = THREE.MathUtils.clamp(baseFov / this.camera.aspect * 1.5, minFov, maxFov);

        this.camera.updateProjectionMatrix();
    }

    update() {
        this.camera.rotation.x = THREE.MathUtils.degToRad(this.serverData.rotation_x);
        this.camera.rotation.y = THREE.MathUtils.degToRad(this.serverData.rotation_y);
        this.camera.rotation.z = THREE.MathUtils.degToRad(this.serverData.rotation_z);

        this.cameraControls.update(this.clock.getDelta());
    }

    fetchInputData() {
        const url = "http://127.0.0.1:5000/input_data";

        const fetchData = async () => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    this.serverData = await response.json();
                } else {
                    console.error("failed to fetch");
                }
            } catch (error) {
                console.error("error:", error);
            } finally {
                setTimeout(fetchData, 100);
            }
        };

        fetchData();
    }
}