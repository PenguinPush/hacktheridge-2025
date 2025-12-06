import {ThreeManager} from "./ThreeManager.js";

class AppManager {
    constructor() {
        this.threeMng = new ThreeManager(this);
        window.addEventListener("resize", () => this.threeMng.resize());
        this.update();
    }

    update() {
        if (this.threeMng.ready) {
            this.threeMng.update();
        }
        window.requestAnimationFrame(() => this.update());
    }
}

let App = new AppManager();