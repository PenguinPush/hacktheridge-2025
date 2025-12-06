// constants
export const baseFov = 60;
export const minFov = 60;
export const maxFov = 110;

export const cameraPositions = [
    { // spawnpoint
        pos: [5.68, 1.27, 1.6],
        rot: [Math.PI / 3, Math.PI / 2],
        text: [2.71, 1.3, -0.04]
    },
]
export const noShadows = ["polaroidline", "line", "MikuAcrylic", "inner sky", "colored sky", "outer sky"]

// Key bindings configuration for interactive objects
export const KEY_BINDINGS = {
    interactions: {
        ceilingLight: '1',
        lamp: '2',
        moodLight: '3',
        tv: '4',
        door: '5',
        windows: '6',
        volumeUp: '7',
        volumeDown: '8'
    }
};


