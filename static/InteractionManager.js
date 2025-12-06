/**
 * InteractionManager - Manages interactive objects and their behaviors
 * 
 * Handles registration of interactive objects, state management, and interaction events.
 * Supports multiple interaction types: toggle, momentary, and cycle.
 */
export class InteractionManager {
    constructor(scene, inputManager) {
        this.scene = scene;
        this.inputManager = inputManager;
        
        // Registry of interactive objects: id -> InteractiveObject
        this.interactiveObjects = new Map();
        
        // State storage: id -> current state
        this.objectStates = new Map();
    }
    
    /**
     * Register an interactive object with the system
     * @param {string} id - Unique identifier for the object
     * @param {THREE.Object3D} object - The Three.js object to make interactive
     * @param {Object} config - Configuration object
     * @param {string} config.key - Keyboard key to trigger interaction
     * @param {string} config.type - Interaction type: 'toggle', 'momentary', or 'cycle'
     * @param {Function} config.onInteract - Callback function when interaction occurs
     * @param {*} config.initialState - Initial state value
     */
    registerInteractiveObject(id, object, config) {
        // Validate required parameters
        if (!id || typeof id !== 'string') {
            console.error('InteractionManager: id must be a non-empty string');
            return;
        }
        
        if (!object) {
            console.error(`InteractionManager: object is required for id '${id}'`);
            return;
        }
        
        if (!config || typeof config !== 'object') {
            console.error(`InteractionManager: config is required for id '${id}'`);
            return;
        }
        
        if (!config.key || typeof config.key !== 'string') {
            console.error(`InteractionManager: config.key is required for id '${id}'`);
            return;
        }
        
        if (!config.type || !['toggle', 'momentary', 'cycle'].includes(config.type)) {
            console.error(`InteractionManager: config.type must be 'toggle', 'momentary', or 'cycle' for id '${id}'`);
            return;
        }
        
        if (!config.onInteract || typeof config.onInteract !== 'function') {
            console.error(`InteractionManager: config.onInteract must be a function for id '${id}'`);
            return;
        }
        
        // Check if object already registered
        if (this.interactiveObjects.has(id)) {
            console.warn(`InteractionManager: Object with id '${id}' is already registered. Overriding.`);
            this.unregisterInteractiveObject(id);
        }
        
        // Store the interactive object configuration
        const interactiveObject = {
            id,
            object3D: object,
            type: config.type,
            key: config.key,
            onInteract: config.onInteract,
            config: config
        };
        
        this.interactiveObjects.set(id, interactiveObject);
        
        // Initialize state
        const initialState = config.initialState !== undefined ? config.initialState : null;
        this.objectStates.set(id, initialState);
        
        // Register key binding with InputManager
        const handler = () => this.handleInteraction(id);
        this.inputManager.registerKeyBinding(config.key, `interact_${id}`, handler);
    }
    
    /**
     * Unregister an interactive object
     * @param {string} id - The object identifier to unregister
     */
    unregisterInteractiveObject(id) {
        const interactiveObject = this.interactiveObjects.get(id);
        
        if (!interactiveObject) {
            console.warn(`InteractionManager: No object found with id '${id}'`);
            return;
        }
        
        // Unregister key binding
        this.inputManager.unregisterKeyBinding(interactiveObject.key);
        
        // Remove from registry and state
        this.interactiveObjects.delete(id);
        this.objectStates.delete(id);
    }
    
    /**
     * Get the current state of an object
     * @param {string} id - The object identifier
     * @returns {*} The current state, or undefined if object not found
     */
    getObjectState(id) {
        return this.objectStates.get(id);
    }
    
    /**
     * Set the state of an object
     * @param {string} id - The object identifier
     * @param {*} state - The new state value
     */
    setObjectState(id, state) {
        if (!this.interactiveObjects.has(id)) {
            console.error(`InteractionManager: Cannot set state for unregistered object '${id}'`);
            return;
        }
        
        this.objectStates.set(id, state);
    }
    
    /**
     * Handle interaction for a specific object
     * @param {string} id - The object identifier
     */
    handleInteraction(id) {
        const interactiveObject = this.interactiveObjects.get(id);
        
        if (!interactiveObject) {
            console.error(`InteractionManager: No object found with id '${id}'`);
            return;
        }
        
        const currentState = this.objectStates.get(id);
        
        try {
            // Handle different interaction types
            switch (interactiveObject.type) {
                case 'toggle':
                    this.handleToggle(id, interactiveObject, currentState);
                    break;
                    
                case 'momentary':
                    this.handleMomentary(id, interactiveObject, currentState);
                    break;
                    
                case 'cycle':
                    this.handleCycle(id, interactiveObject, currentState);
                    break;
                    
                default:
                    console.error(`InteractionManager: Unknown interaction type '${interactiveObject.type}' for id '${id}'`);
            }
        } catch (error) {
            console.error(`InteractionManager: Error handling interaction for '${id}':`, error);
        }
    }
    
    /**
     * Handle toggle interaction type
     * @param {string} id - The object identifier
     * @param {Object} interactiveObject - The interactive object configuration
     * @param {*} currentState - The current state
     */
    handleToggle(id, interactiveObject, currentState) {
        // Toggle between true/false or on/off
        const newState = !currentState;
        this.objectStates.set(id, newState);
        
        // Call the interaction handler with new state
        interactiveObject.onInteract(newState, interactiveObject.object3D);
    }
    
    /**
     * Handle momentary interaction type (active while key is held)
     * @param {string} id - The object identifier
     * @param {Object} interactiveObject - The interactive object configuration
     * @param {*} currentState - The current state
     */
    handleMomentary(id, interactiveObject, currentState) {
        // For momentary, we activate on key press
        // The key release would need to be handled in update() method
        const newState = true;
        this.objectStates.set(id, newState);
        
        // Call the interaction handler with active state
        interactiveObject.onInteract(newState, interactiveObject.object3D);
    }
    
    /**
     * Handle cycle interaction type (cycles through multiple states)
     * @param {string} id - The object identifier
     * @param {Object} interactiveObject - The interactive object configuration
     * @param {*} currentState - The current state
     */
    handleCycle(id, interactiveObject, currentState) {
        // Cycle requires a 'states' array in config
        const states = interactiveObject.config.states;
        
        if (!states || !Array.isArray(states) || states.length === 0) {
            console.error(`InteractionManager: Cycle type requires 'states' array in config for id '${id}'`);
            return;
        }
        
        // Find current state index and move to next
        const currentIndex = states.indexOf(currentState);
        const nextIndex = (currentIndex + 1) % states.length;
        const newState = states[nextIndex];
        
        this.objectStates.set(id, newState);
        
        // Call the interaction handler with new state
        interactiveObject.onInteract(newState, interactiveObject.object3D);
    }
    
    /**
     * Update method to be called each frame
     * Handles momentary interactions (key release)
     */
    update() {
        // Check for momentary interactions that need to be released
        for (const [id, interactiveObject] of this.interactiveObjects) {
            if (interactiveObject.type === 'momentary') {
                const isKeyPressed = this.inputManager.isKeyPressed(interactiveObject.key);
                const currentState = this.objectStates.get(id);
                
                // If key is released and state is active, deactivate
                if (!isKeyPressed && currentState === true) {
                    this.objectStates.set(id, false);
                    interactiveObject.onInteract(false, interactiveObject.object3D);
                }
            }
        }
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Unregister all objects
        for (const id of this.interactiveObjects.keys()) {
            this.unregisterInteractiveObject(id);
        }
        
        this.interactiveObjects.clear();
        this.objectStates.clear();
    }
}
