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

                // Identify door mesh by name
                if (item.name && item.name.toLowerCase().includes('door')) {
                    console.log('Door found:', item.name);
                    this.doorMesh = item;
                    // Store original rotation for animation
                    this.doorOriginalRotation = item.rotation.y;
                }

                // Identify window meshes by name
                if (item.name && item.name.toLowerCase().includes('window')) {
                    console.log('Window found:', item.name);
                    if (!this.windowMeshes) {
                        this.windowMeshes = [];
                        this.windowOriginalRotations = [];
                    }
                    this.windowMeshes.push(item);
                    // Store original rotation for each window
                    this.windowOriginalRotations.push({
                        x: item.rotation.x,
                        y: item.rotation.y,
                        z: item.rotation.z
                    });
                }

                if (item.material) {
                    if (noShadows.includes(item.material.name)) {
                        item.castShadow = false;
                        item.receiveShadow = false;
                    }
                }
            }.bind(this));

            this.scene.add(room);
            
            // Log all object names to help identify meshes
            console.log('Scene objects:');
            room.traverse(function (item) {
                if (item.name) {
                    console.log(' -', item.name, item.type);
                }
            });
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
        
        // Music volume state
        this.musicVolume = 0.5; // Default 50%
        
        // RGB light brightness state
        this.rgbBrightness = 0.5; // Default 50% (intensity multiplier)
        
        // Register ceiling light as interactive object
        this.interactionManager.registerInteractiveObject(
            'ceilingLight',
            this.light,
            {
                key: KEY_BINDINGS.interactions.ceilingLight,
                type: 'toggle',
                initialState: true,
                onInteract: (state, lightObject) => {
                    console.log(`Ceiling light toggle! State: ${state}`);
                    lightObject.intensity = state ? this.originalLightIntensities.ceilingLight : 0;
                    this.renderer.shadowMap.needsUpdate = true;
                }
            }
        );
        
        // Register lamp as interactive object
        this.interactionManager.registerInteractiveObject(
            'lamp',
            this.lamp,
            {
                key: KEY_BINDINGS.interactions.lamp,
                type: 'toggle',
                initialState: true,
                onInteract: (state, lightObject) => {
                    console.log(`Lamp toggle! State: ${state}`);
                    lightObject.intensity = state ? this.originalLightIntensities.lamp : 0;
                    this.renderer.shadowMap.needsUpdate = true;
                }
            }
        );
        
        // Register mood light as interactive object
        this.interactionManager.registerInteractiveObject(
            'moodLight',
            this.moodLight,
            {
                key: KEY_BINDINGS.interactions.moodLight,
                type: 'toggle',
                initialState: true,
                onInteract: (state, lightObject) => {
                    console.log(`Mood light toggle! State: ${state}`);
                    lightObject.intensity = state ? this.originalLightIntensities.moodLight * this.rgbBrightness : 0;
                }
            }
        );
        
        // Register TV as interactive object (using a placeholder object)
        this.tvState = { on: false };
        this.interactionManager.registerInteractiveObject(
            'tv',
            this.scene, // Using scene as placeholder since TV mesh needs to be found
            {
                key: KEY_BINDINGS.interactions.tv,
                type: 'toggle',
                initialState: false,
                onInteract: (state) => {
                    console.log(`TV toggle! State: ${state ? 'ON' : 'OFF'}`);
                    this.tvState.on = state;
                    // TODO: Update TV material/emission when TV mesh is identified
                }
            }
        );
        
        // Register door as interactive object
        this.doorState = { open: false, targetRotation: 0, currentRotation: 0 };
        this.interactionManager.registerInteractiveObject(
            'door',
            this.scene,
            {
                key: KEY_BINDINGS.interactions.door,
                type: 'toggle',
                initialState: false,
                onInteract: (state) => {
                    console.log(`Door ${state ? 'OPEN' : 'CLOSED'}`);
                    this.doorState.open = state;
                    // Set target rotation: open = 90 degrees, closed = 0 degrees
                    this.doorState.targetRotation = state ? Math.PI / 2 : 0;
                }
            }
        );
        
        // Register windows as interactive object
        this.windowsState = { open: false, targetRotation: 0, currentRotation: 0 };
        this.interactionManager.registerInteractiveObject(
            'windows',
            this.scene,
            {
                key: KEY_BINDINGS.interactions.windows,
                type: 'toggle',
                initialState: false,
                onInteract: (state) => {
                    console.log(`Windows ${state ? 'OPEN' : 'CLOSED'}`);
                    this.windowsState.open = state;
                    // Set target rotation: open = 45 degrees, closed = 0 degrees
                    this.windowsState.targetRotation = state ? Math.PI / 4 : 0;
                }
            }
        );
        
        // Register volume up
        this.interactionManager.registerInteractiveObject(
            'volumeUp',
            this.scene,
            {
                key: KEY_BINDINGS.interactions.volumeUp,
                type: 'momentary',
                initialState: false,
                onInteract: (state) => {
                    if (state) {
                        this.musicVolume = Math.min(1.0, this.musicVolume + 0.1);
                        console.log(`Volume UP: ${Math.round(this.musicVolume * 100)}%`);
                        // TODO: Update audio volume when audio is implemented
                    }
                }
            }
        );
        
        // Register volume down
        this.interactionManager.registerInteractiveObject(
            'volumeDown',
            this.scene,
            {
                key: KEY_BINDINGS.interactions.volumeDown,
                type: 'momentary',
                initialState: false,
                onInteract: (state) => {
                    if (state) {
                        this.musicVolume = Math.max(0.0, this.musicVolume - 0.1);
                        console.log(`Volume DOWN: ${Math.round(this.musicVolume * 100)}%`);
                        // TODO: Update audio volume when audio is implemented
                    }
                }
            }
        );
        
        // Register RGB brightness up
        this.interactionManager.registerInteractiveObject(
            'rgbBrightnessUp',
            this.moodLight,
            {
                key: KEY_BINDINGS.interactions.rgbBrightnessUp,
                type: 'momentary',
                initialState: false,
                onInteract: (state) => {
                    if (state) {
                        this.rgbBrightness = Math.min(1.0, this.rgbBrightness + 0.1);
                        const moodLightState = this.interactionManager.getObjectState('moodLight');
                        if (moodLightState) {
                            this.moodLight.intensity = this.originalLightIntensities.moodLight * this.rgbBrightness;
                        }
                        console.log(`RGB Brightness UP: ${Math.round(this.rgbBrightness * 100)}%`);
                    }
                }
            }
        );
        
        // Register RGB brightness down
        this.interactionManager.registerInteractiveObject(
            'rgbBrightnessDown',
            this.moodLight,
            {
                key: KEY_BINDINGS.interactions.rgbBrightnessDown,
                type: 'momentary',
                initialState: false,
                onInteract: (state) => {
                    if (state) {
                        this.rgbBrightness = Math.max(0.0, this.rgbBrightness - 0.1);
                        const moodLightState = this.interactionManager.getObjectState('moodLight');
                        if (moodLightState) {
                            this.moodLight.intensity = this.originalLightIntensities.moodLight * this.rgbBrightness;
                        }
                        console.log(`RGB Brightness DOWN: ${Math.round(this.rgbBrightness * 100)}%`);
                    }
                }
            }
        );
    }

    initControls() {
        this.inputX = 0;
        this.inputY = 0;
        this.isTouching = false;
    }

    update() {
        // Update input manager first to process key states
        if (this.inputManager) {
            this.inputManager.update();
        }
        
        // Update interaction manager to handle interactions
        if (this.interactionManager) {
            this.interactionManager.update();
        }
        
        // Animate door rotation smoothly
        if (this.doorMesh && this.doorState) {
            const rotationSpeed = 0.05; // Smooth animation speed
            const diff = this.doorState.targetRotation - this.doorState.currentRotation;
            
            if (Math.abs(diff) > 0.001) {
                this.doorState.currentRotation += diff * rotationSpeed;
                this.doorMesh.rotation.y = this.doorOriginalRotation + this.doorState.currentRotation;
            }
        }

        // Animate windows rotation smoothly
        if (this.windowMeshes && this.windowsState) {
            const rotationSpeed = 0.05; // Smooth animation speed
            const diff = this.windowsState.targetRotation - this.windowsState.currentRotation;
            
            if (Math.abs(diff) > 0.001) {
                this.windowsState.currentRotation += diff * rotationSpeed;
                
                // Apply rotation to all window meshes
                this.windowMeshes.forEach((windowMesh, index) => {
                    const originalRot = this.windowOriginalRotations[index];
                    // Rotate windows on their hinge axis (typically Y or Z axis)
                    windowMesh.rotation.y = originalRot.y + this.windowsState.currentRotation;
                });
            }
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

    /**
     * Set ceiling light brightness
     * @param {number} brightness - Brightness value from 0.0 to 1.0
     */
    setCeilingLightBrightness(brightness) {
        brightness = Math.max(0, Math.min(1, brightness));
        this.light.intensity = this.originalLightIntensities.ceilingLight * brightness;
        this.interactionManager.setObjectState('ceilingLight', brightness > 0);
        this.renderer.shadowMap.needsUpdate = true;
        console.log(`Ceiling light brightness set to ${Math.round(brightness * 100)}%`);
    }

    /**
     * Set lamp brightness
     * @param {number} brightness - Brightness value from 0.0 to 1.0
     */
    setLampBrightness(brightness) {
        brightness = Math.max(0, Math.min(1, brightness));
        this.lamp.intensity = this.originalLightIntensities.lamp * brightness;
        this.interactionManager.setObjectState('lamp', brightness > 0);
        this.renderer.shadowMap.needsUpdate = true;
        console.log(`Lamp brightness set to ${Math.round(brightness * 100)}%`);
    }

    /**
     * Set mood light (RGB) brightness
     * @param {number} brightness - Brightness value from 0.0 to 1.0
     */
    setMoodLightBrightness(brightness) {
        brightness = Math.max(0, Math.min(1, brightness));
        this.rgbBrightness = brightness;
        this.moodLight.intensity = this.originalLightIntensities.moodLight * brightness;
        this.interactionManager.setObjectState('moodLight', brightness > 0);
        console.log(`Mood light brightness set to ${Math.round(brightness * 100)}%`);
    }

    /**
     * Set TV state
     * @param {boolean} on - True for on, false for off
     */
    setTVState(on) {
        this.tvState.on = on;
        this.interactionManager.setObjectState('tv', on);
        console.log(`TV set to ${on ? 'ON' : 'OFF'}`);
        // TODO: Update TV material/emission when TV mesh is identified
    }

    /**
     * Set door open amount
     * @param {number} amount - Open amount from 0.0 (closed) to 1.0 (fully open)
     */
    setDoorOpen(amount) {
        amount = Math.max(0, Math.min(1, amount));
        this.doorState.open = amount > 0;
        this.doorState.targetRotation = amount * (Math.PI / 2);
        this.interactionManager.setObjectState('door', amount > 0);
        console.log(`Door set to ${Math.round(amount * 100)}% open`);
    }

    /**
     * Set windows open amount
     * @param {number} amount - Open amount from 0.0 (closed) to 1.0 (fully open)
     */
    setWindowsOpen(amount) {
        amount = Math.max(0, Math.min(1, amount));
        this.windowsState.open = amount > 0;
        this.windowsState.targetRotation = amount * (Math.PI / 4);
        this.interactionManager.setObjectState('windows', amount > 0);
        console.log(`Windows set to ${Math.round(amount * 100)}% open`);
    }

    /**
     * Set music volume
     * @param {number} volume - Volume from 0.0 to 1.0
     */
    setMusicVolume(volume) {
        volume = Math.max(0, Math.min(1, volume));
        this.musicVolume = volume;
        console.log(`Music volume set to ${Math.round(volume * 100)}%`);
        // TODO: Update audio volume when audio is implemented
    }
}
