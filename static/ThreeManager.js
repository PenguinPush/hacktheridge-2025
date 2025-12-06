// import necessary modules
import * as THREE from "three";

import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Reflector} from 'three/addons/objects/Reflector.js';

import {Camera} from "./Camera.js";

import {
    noShadows,
} from "./constants.js";

// everything 3d
export class ThreeManager {
    constructor(app) {
        this.app = app;

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio)
        document.getElementById("view").appendChild(this.renderer.domElement);

        this.camera = new Camera(app, this.renderer);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.shadowMap.needsUpdate = true;

        this.ready = false;
        this.initAllThree().then(() => this.app.update());
    }

    initScene() {
        this.scene = new THREE.Scene();
        const loader = new GLTFLoader();

        loader.load("./static/assets/bedroom_base.glb", function (gltf) {
            const room = gltf.scene;

            // edit the bedroom
            room.traverse(function (item) {
                if (item instanceof THREE.Light) {
                    // disable blender lights, they don't translate well
                    item.intensity = 0;
                    item.dispose();
                }

                if (item.material) {
                    if (noShadows.includes(item.material.name)) {
                        item.castShadow = false;
                        item.receiveShadow = false;
                    }

                    if (item.material.name === "mirror") {
                        // swap out the mirror with a reflector object
                        const mirrorGeometry = new THREE.PlaneGeometry(0.8, 1.6, 1, 1);
                        const mirror = new Reflector(mirrorGeometry, {
                            clipBias: 0.003,
                            textureWidth: window.innerWidth * window.devicePixelRatio,
                            textureHeight: window.innerHeight * window.devicePixelRatio,
                            color: 0xbbbbbb
                        });

                        mirror.position.copy(item.position);
                        mirror.rotation.set(0, -Math.PI / 2, 0)

                        this.mirrorReflector = mirror;
                        this.mirrorReflector.visible = false;

                        this.scene.add(this.mirrorReflector);
                    }
                }
            }.bind(this));

            this.scene.add(room);
        }.bind(this))

        this.light = new THREE.PointLight(0xffe7d0, 3, 0, 1);
        this.light.position.set(2.93, 2.08, 0);
        this.light.castShadow = true;
        this.light.shadow.mapSize.width = 256;
        this.light.shadow.mapSize.height = 256;
        this.light.shadow.radius = 5;
        this.light.shadow.blurSamples = 25;
        this.light.shadow.bias = -0.0001;
        this.light.shadow.camera.near = 0.1;
        this.light.shadow.camera.far = 500;

        this.lamp = new THREE.PointLight(0xffe7d0, 1, 0, 1);
        this.lamp.position.set(4, 1.2, -1.6);
        this.lamp.castShadow = true;
        this.lamp.shadow.mapSize.width = 256;
        this.lamp.shadow.mapSize.height = 256;
        this.lamp.shadow.radius = 5;
        this.lamp.shadow.blurSamples = 25;
        this.lamp.shadow.bias = -0.0001;
        this.lamp.shadow.camera.near = 0.1;
        this.lamp.shadow.camera.far = 500;

        this.moodLight = new THREE.RectAreaLight(0xffffff, 0.5, 5, 3);
        this.moodLight.position.set(3.30, 2.67, -0.05);
        this.moodLight.lookAt(this.moodLight.position.x, -10, this.moodLight.position.z);

        const ambientLight = new THREE.AmbientLight(0xd4f8ff, 0.2);

        this.scene.add(this.light);
        this.scene.add(this.lamp);
        this.scene.add(this.moodLight);
        this.scene.add(ambientLight);
    }

    initControls() {
        this.inputX = 0;
        this.inputY = 0;
        this.isTouching = false;
    }

    update() {
        this.camera.update(this.inputX, this.inputY, this.isTouching);
        this.renderer.render(this.scene, this.camera.camera);
    }

    initAllThree() {
        return new Promise((resolve, reject) => {
            try {
                this.initScene();
                this.camera.initCamera();
                this.initControls();
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
