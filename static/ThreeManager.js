// import necessary modules
import * as THREE from "three";

import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

import {Camera} from "./Camera.js";

import {
    noShadows,
} from "./constants.js";

function normalize(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, ((value + 1) / 2) * (max - min) + min));
}

// everything 3d
export class ThreeManager {
    constructor(app) {
        this.app = app;

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById("view").appendChild(this.renderer.domElement);

        this.camera = new Camera(app, this.renderer);

        this.inputData = {
            rotation: 0,
            joystick_x: 0,
            joystick_y: 0,
            axis: null,
            value: 0,
            ceilingLight: 1,
            lamp: 1,
            moodLight: 1,
            volume: 0,
            door: -1,
            windows: -1
        };

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.shadowMap.needsUpdate = true;

        this.lightIntensities = {};

        this.ready = false;
        this.initAllThree().then(() => {
            this.fetchInputData();
            this.app.update();
        });
    }

    fetchInputData() {
        const url = "http://127.0.0.1:5000/input_data";

        const fetchData = async () => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    this.inputData = await response.json();
                } else {
                    console.error("failed to fetch");
                }
            } catch (error) {
                console.error("error:", error);
            } finally {
                setTimeout(fetchData, 50);
            }
        };

        fetchData();
    }

    initScene() {
        this.scene = new THREE.Scene();
        const loader = new GLTFLoader();

        loader.load("./static/assets/bedroom1.glb", function (gltf) {
            const room = gltf.scene;

            room.traverse(function (item) {
                if (item instanceof THREE.Light) {
                    item.intensity = 0;
                    item.dispose();
                }

                if (item.name && item.name.toLowerCase().includes('door')) {
                    this.doorMesh = item;
                    this._doorRotation = item.rotation.y;
                }

                if (item.name && item.name.toLowerCase().includes('window')) {
                    if (!this.windowMeshes) {
                        this.windowMeshes = [];
                        this.windowOriginalRotations = [];
                    }
                    this.windowMeshes.push(item);
                    this.windowOriginalRotations.push({
                        x: item.rotation.x,
                        y: item.rotation.y,
                        z: item.rotation.z
                    });
                }

                if (item.material && noShadows.includes(item.material.name)) {
                    item.castShadow = false;
                    item.receiveShadow = false;
                }
            }.bind(this));

            this.scene.add(room);
        }.bind(this));

        this.light = new THREE.PointLight(0xffe7d0, 3, 0, 1);
        this.light.position.set(2.93, 2.08, 0);
        this.light.castShadow = true;

        this.lamp = new THREE.PointLight(0xffe7d0, 1, 0, 1);
        this.lamp.position.set(4, 1.2, -1.6);
        this.lamp.castShadow = true;

        this.moodLight = new THREE.RectAreaLight(0xffffff, 0.5, 5, 3);
        this.moodLight.position.set(3.30, 2.67, -0.05);
        this.moodLight.lookAt(this.moodLight.position.x, -10, this.moodLight.position.z);

        const ambientLight = new THREE.AmbientLight(0xd4f8ff, 0.2);

        this.scene.add(this.light, this.lamp, this.moodLight, ambientLight);

        this.lightIntensities = {
            ceilingLight: this.light.intensity,
            lamp: this.lamp.intensity,
            moodLight: this.moodLight.intensity
        };
    }

    update() {
        this.light.intensity = this.lightIntensities.ceilingLight * normalize(this.inputData.ceilingLight || 1, 0, 1);
        this.lamp.intensity = this.lightIntensities.lamp * normalize(this.inputData.lamp || 1, 0, 1);
        this.moodLight.intensity = this.lightIntensities.moodLight * normalize(this.inputData.moodLight || 1, 0, 1);
        this.musicVolume = normalize(this.inputData.volume || 0, 0, 1);

        if (this.doorMesh) {
            const doorRotation = normalize(this.inputData.door || -1, 0, Math.PI / 2);
            this.doorMesh.rotation.y = this._doorRotation + doorRotation;
        }

        if (this.windowMeshes) {
            const windowRotation = normalize(this.inputData.windows || -1, 0, Math.PI / 2);
            this.windowMeshes.forEach((windowMesh, index) => {
                const originalRot = this.windowOriginalRotations[index];
                windowMesh.rotation.y = originalRot.y + windowRotation;
            });
        }

        this.camera.update(this.inputData);
        this.renderer.render(this.scene, this.camera.camera);
    }

    initAllThree() {
        return new Promise((resolve, reject) => {
            try {
                this.initScene();
                this.camera.initCamera();
                resolve(this.ready = true);
            } catch (error) {
                reject(error);
            }
        });
    }

    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio)

        this.camera.resize();

        this.update()
    }
}

