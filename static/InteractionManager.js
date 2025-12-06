export class InteractionManager {
    constructor(scene) {
        this.scene = scene;
        this.interactiveObjects = new Map();
        this.objectStates = new Map();
    }

    registerInteractiveObject(id, object, config) {
        const interactiveObject = {
            id,
            object3D: object,
            type: config.type,
            key: config.key,
            onInteract: config.onInteract,
            config: config
        };

        this.interactiveObjects.set(id, interactiveObject);

        const initialState = config.initialState !== undefined ? config.initialState : null;
        this.objectStates.set(id, initialState);
    }

    getObjectState(id) {
        return this.objectStates.get(id);
    }

    setObjectState(id, state) {
        this.objectStates.set(id, state);
    }

    update() {
        for (const [id, interactiveObject] of this.interactiveObjects) {
            if (interactiveObject.type === 'momentary') {
                const currentState = this.objectStates.get(id);

                if (currentState === false) {
                    this.objectStates.set(id, false);
                    interactiveObject.onInteract(false, interactiveObject.object3D);
                }
            }
        }
    }
}