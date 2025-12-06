// import necessary modules
import * as THREE from "three";

import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

import {Camera} from "./Camera.js";

import {InputManager} from "./InputManager.js";
import {InteractionManager} from "./InteractionManager.js";

import {
    noShadows,
    KEY_BINDINGS,
} from "./constants.js";

// everything 3d
export class ThreeManager {
    constructor(app) {
        this.app = app;

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById("view").appendChild(this.renderer.domElement);

        this.camera = new Camera(app, this.renderer);

        this.inputData = {rotation: 0, joystick_x: 0, joystick_y: 0};

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.shadowMap.needsUpdate = true;

        // Initialize input and interaction managers
        this.inputManager = new InputManager();
        
        // Store original light intensities for toggle functionality
        this.originalLightIntensities = {};

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

    update() {
        this.camera.update(this.inputData);
        this.renderer.render(this.scene, this.camera.camera);
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
        
        // Store original light intensities (all lights default to "on" state)
        this.originalLightIntensities.ceilingLight = this.light.intensity;
        this.originalLightIntensities.lamp = this.lamp.intensity;
        this.originalLightIntensities.moodLight = this.moodLight.intensity;
        
        // Initialize InteractionManager after scene is set up
        this.interactionManager = new InteractionManager(this.scene, this.inputManager);
        console.log('InteractionManager initialized');
        
        // Register ceiling light as interactive object
        this.interactionManager.registerInteractiveObject(
            'ceilingLight',
            this.light,
            {
                key: KEY_BINDINGS.interactions.ceilingLight,
                type: 'toggle',
                initialState: true, // Default "on" state
                onInteract: (state, lightObject) => {
                    console.log(`Light toggle! State: ${state}, Intensity: ${state ? this.originalLightIntensities.ceilingLight : 0}`);
                    if (state) {
                        // Turn light on - restore original intensity
                        lightObject.intensity = this.originalLightIntensities.ceilingLight;
                    } else {
                        // Turn light off - set intensity to 0
                        lightObject.intensity = 0;
                    }
                    // Update shadow map when light state changes
                    this.renderer.shadowMap.needsUpdate = true;
                }
            }
        );
        console.log('Ceiling light registered with key:', KEY_BINDINGS.interactions.ceilingLight);
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
