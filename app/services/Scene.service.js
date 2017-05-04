import { initOptions } from '../constants';

import { Scene, PerspectiveCamera, WebGLRenderer, Vector3 } from 'three';
import { OrbitControls } from '../util';

import { Mover } from '../factories/Mover.factory';

export default {
    init(element) {
        this.rootElement = element;
        this.size = {
            w: window.innerWidth,
            h: window.innerHeight
        };
        this.camSettings = {
            fov: 40,
            aspect: this.size.w / this.size.h,
            near: 0.001,
            far: 1000000000.0
        };
        this.options = initOptions;
        this.startTime = this.now = Date.now();
        this.renderInterval = 1000 / parseInt(this.options.framerate);
    },

    create(element) {
        this.scene = new Scene({
            caseShadow: true
        });
        this.camera = new PerspectiveCamera(
            this.camSettings.fov,
            this.camSettings.aspect,
            this.camSettings.near,
            this.camSettings.far
        );
        this.renderer = new WebGLRenderer({
            preserveDrawingBuffer: true
        });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.renderer.setSize(this.size.w, this.size.h);
        this.renderer.setClearColor(0x222222);

        this.rootElement.append(this.renderer.domElement);

        this.totalMass = 0;
        this.movers = [];

        let mover = new Mover(1, 1, new Vector3());

        this.draw();
    },

    draw() {
        window.requestAnimationFrame(() => {
            this.draw();
        });
        this.now = Date.now();
        this.deltaT = this.now - this.startTime;

        if(this.deltaT > this.renderInterval) {
            this.startTime = this.now - (this.deltaT % this.renderInterval);
            this.render();
        }
    },

    render() {
        let moversAliveCount = 0,
            maximumMass = 0;
        this.totalMass = 0;

        if(this.movers.length > 0) this.calcMovers();

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    },

    calcMovers() {

    }
};
