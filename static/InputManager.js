/**
 * InputManager - Centralized keyboard input handling with state tracking
 * 
 * Manages keyboard events and provides a clean API for querying input state.
 * Tracks key states across frames to detect "just pressed" and "just released" events.
 */
export class InputManager {
    constructor() {
        // Map of key codes to their current state
        this.keyStates = new Map();
        
        // Map of key codes to their previous frame state
        this.previousKeyStates = new Map();
        
        // Map of key bindings: key -> { action, handler }
        this.keyBindings = new Map();
        
        // Bind event handlers to maintain context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Register event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event 
     */
    handleKeyDown(event) {
        const key = event.key;
        console.log(`Key down: '${key}'`);
        
        // Prevent default behavior for registered keys
        if (this.keyBindings.has(key)) {
            console.log(`Key '${key}' is registered, preventing default`);
            event.preventDefault();
        }
        
        // Update key state
        this.keyStates.set(key, true);
    }
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} event 
     */
    handleKeyUp(event) {
        const key = event.key;
        
        // Update key state
        this.keyStates.set(key, false);
    }
    
    /**
     * Check if a key is currently pressed
     * @param {string} key - The key to check
     * @returns {boolean} True if the key is currently pressed
     */
    isKeyPressed(key) {
        return this.keyStates.get(key) === true;
    }
    
    /**
     * Check if a key was just pressed this frame
     * @param {string} key - The key to check
     * @returns {boolean} True if the key was just pressed
     */
    isKeyJustPressed(key) {
        const current = this.keyStates.get(key) === true;
        const previous = this.previousKeyStates.get(key) === true;
        return current && !previous;
    }
    
    /**
     * Check if a key was just released this frame
     * @param {string} key - The key to check
     * @returns {boolean} True if the key was just released
     */
    isKeyJustReleased(key) {
        const current = this.keyStates.get(key) === true;
        const previous = this.previousKeyStates.get(key) === true;
        return !current && previous;
    }
    
    /**
     * Register a key binding with an action and handler
     * @param {string} key - The key to bind
     * @param {string} action - The action name
     * @param {Function} handler - The handler function to call
     */
    registerKeyBinding(key, action, handler) {
        if (this.keyBindings.has(key)) {
            console.warn(`Key binding for '${key}' already exists. Overriding with new binding for action '${action}'.`);
        }
        
        if (typeof handler !== 'function') {
            console.error(`Handler for key '${key}' must be a function.`);
            return;
        }
        
        this.keyBindings.set(key, { action, handler });
    }
    
    /**
     * Unregister a key binding
     * @param {string} key - The key to unbind
     */
    unregisterKeyBinding(key) {
        this.keyBindings.delete(key);
    }
    
    /**
     * Update method to be called each frame
     * Processes key bindings and updates state tracking
     */
    update() {
        // Process key bindings for just-pressed keys
        for (const [key, binding] of this.keyBindings) {
            if (this.isKeyJustPressed(key)) {
                console.log(`Key '${key}' just pressed, calling handler for action: ${binding.action}`);
                try {
                    binding.handler();
                } catch (error) {
                    console.error(`Error executing handler for key '${key}' (action: ${binding.action}):`, error);
                }
            }
        }
        
        // Update previous frame state for next frame
        this.previousKeyStates.clear();
        for (const [key, state] of this.keyStates) {
            this.previousKeyStates.set(key, state);
        }
    }
    
    /**
     * Clean up event listeners and resources
     */
    dispose() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        
        this.keyStates.clear();
        this.previousKeyStates.clear();
        this.keyBindings.clear();
    }
}
