import { initOptions, MASS_FACTOR } from '../constants';

import {
    Scene, PerspectiveCamera, WebGLRenderer,
    Vector3, DirectionalLight, AxisHelper
} from 'three';
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
        this.currentRadius = 2000.0;
        this.options = initOptions;
        this.options.RESET = () => { this.reset(); };

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
            preserveDrawingBuffer: true,
            antialias: true
        });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.renderer.setSize(this.size.w, this.size.h);
        this.renderer.setClearColor(0x000000);

        this.rootElement.append(this.renderer.domElement);

        this.totalMass = 0;
        this.movers = [];

        /*test*/
        let directionalLight = new DirectionalLight(0x666666);
        directionalLight.position.set(1000, 1000, 1000);
        directionalLight.castShadow = true;

        let axisHelper = new AxisHelper(10000);
        this.scene.add(axisHelper);

        this.setCamera();
        this.draw();
        this.reset();
    },

    reset() {
        let movers = this.movers;

        if(movers) { // CLEAR MOVER LIST
            movers.forEach(v => {
                this.scene.remove(v.mesh);
                this.scene.remove(v.selectionLight);
                this.scene.remove(v.line);
            });
        }

        movers = [];
        for ( let i = 0; i < parseInt(this.options.MOVER_COUNT); i++) {
            let mass = this.getRandomize(this.options.MIN_MASS, this.options.MAX_MASS),
                maxDistance = parseFloat(1000 / this.options.DENSITY),
                maxSpeed = parseFloat(this.options.START_SPEED);

            let velocity = new Vector3(
                this.getRandomize(-maxSpeed, maxSpeed),
                this.getRandomize(-maxSpeed, maxSpeed),
                this.getRandomize(-maxSpeed, maxSpeed)
            );
            let location = new Vector3(
                this.getRandomize(-maxDistance, maxDistance),
                this.getRandomize(-maxDistance, maxDistance),
                this.getRandomize(-maxDistance, maxDistance)
            );

            movers.push(new Mover(mass, velocity, location, i, this.scene));
        }

        movers.forEach(v => {
            v.addMover();
        });

        this.movers = movers;
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

        if(this.movers.length > 0) {
            this.calcMovers();
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    },

    setCamera() {
        this.movers.forEach(v => {
            this.updateTrace(v);
        });

        this.camera.position.set(this.currentRadius, this.currentRadius, this.currentRadius);
        this.camera.lookAt(new Vector3());
        this.camera.updateMatrix();
    },

    updateTrace(mover) {
        if(this.options.TRAILS_DISPLAY) {
            mover.showTrace(this.options.TRAILS_LENGTH);
        }
    },

    calcMovers() {
        let movers = this.movers;
        for (let i = movers.length - 1; i >= 0; i--) {
            let m1 = movers[i];

            if(m1.alive) {
                this.totalMass += m1.mass;
                // if(m1.mass > maximunMass) maximunMass = m1.mass;

                for (let j = movers.length - 1; j >= 0; j--) {
                    let m2 = movers[j];

                    if(m1.alive && m2.alive && i !== j) {
                        let distance = m1.location.distanceTo(m2.location);
                        let radiusM1 = (m1.mass / MASS_FACTOR / MASS_FACTOR / 4 * Math.PI) ** (1/3);
                        let radiusM2 = (m2.mass / MASS_FACTOR / MASS_FACTOR / 4 * Math.PI) ** (1/3);

                        if(distance < radiusM1 + radiusM2) { // CRAHSED
                            console.log('crashed => ', m1, m2);
                            m2.eat(m1);
                            // m2.attract(m1, this.options);
                        }
                        else {
                            m2.attract(m1, this.options);
                        }
                    }
                }
            }
        }

        this.updateMovers();
    },

    updateMovers() {
        let movers = this.movers;
        for (let i = movers.length - 1; i >= 0; i--) {
            let mover = movers[i];
            if(mover.alive) {
                mover.update();
                mover.display(this.totalMass);
            }

            this.updateTrace(mover);
        }
    },

    getRandomize(min, max) {
        return Math.random() * (max - min) + min;
    }
};
