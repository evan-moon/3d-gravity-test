import { initOptions, MASS_FACTOR, SceneOptions } from '../constants';
import {
  Scene as ThreeScene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  DirectionalLight,
  AxesHelper,
} from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { Mover } from './Mover';

export class Scene {
  public rootElement: HTMLElement;
  public size: { w: number; h: number };
  public camSettings: Pick<PerspectiveCamera, 'fov' | 'aspect' | 'near' | 'far'>;
  public currentRadius: number;
  public options: SceneOptions;
  public startTime: number;
  public renderInterval: number;

  public now = 0;
  public deltaT = 0;

  public scene: ThreeScene;
  public camera: PerspectiveCamera;
  public renderer: WebGLRenderer;
  public controls: OrbitControls;

  public totalMass: number;
  public movers: Mover[];

  constructor(element: HTMLElement) {
    this.rootElement = element;
    this.size = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    this.camSettings = {
      fov: 40,
      aspect: this.size.w / this.size.h,
      near: 0.001,
      far: 1000000000.0,
    };
    this.currentRadius = 12000.0;
    this.options = initOptions;
    this.options.reset = () => {
      this.reset();
    };

    this.startTime = this.now = Date.now();
    this.renderInterval = 1000 / this.options.framerate;

    this.scene = new ThreeScene();
    this.camera = new PerspectiveCamera(
      this.camSettings.fov,
      this.camSettings.aspect,
      this.camSettings.near,
      this.camSettings.far
    );

    this.renderer = new WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
    });
    this.renderer.setSize(this.size.w, this.size.h);
    this.renderer.setClearColor(0x000000);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.3;

    this.rootElement.append(this.renderer.domElement);

    this.totalMass = 0;
    this.movers = [];

    /*test*/
    const directionalLight = new DirectionalLight(0x666666);
    directionalLight.position.set(1000, 1000, 1000);
    directionalLight.castShadow = true;

    const axisHelper = new AxesHelper(10000);
    this.scene.add(axisHelper);

    this.setCamera();
    this.draw();
    this.reset();
  }

  reset() {
    let movers = this.movers;

    if (movers) {
      // CLEAR MOVER LIST
      movers.forEach((v) => {
        this.scene.remove(v.mesh);
        this.scene.remove(v.selectionLight);
        this.scene.remove(v.line);
      });
    }

    movers = [];
    for (let i = 0; i < this.options.moverCount; i++) {
      const mass = this.getRandomize(this.options.minMass, this.options.maxMass),
        maxDistance = 1000 / this.options.density,
        maxSpeed = this.options.startSpeed;

      const velocity = new Vector3(
        this.getRandomize(-maxSpeed, maxSpeed),
        this.getRandomize(-maxSpeed, maxSpeed),
        this.getRandomize(-maxSpeed, maxSpeed)
      );
      const location = new Vector3(
        this.getRandomize(-maxDistance, maxDistance),
        this.getRandomize(-maxDistance, maxDistance),
        this.getRandomize(-maxDistance, maxDistance)
      );

      movers.push(new Mover(mass, velocity, location, `mover-${i}`, this.scene));
    }

    movers.forEach((v) => {
      v.addMover();
    });

    this.movers = movers;
  }

  draw() {
    window.requestAnimationFrame(() => {
      this.draw();
    });
    this.now = Date.now();
    this.deltaT = this.now - this.startTime;

    if (this.deltaT > this.renderInterval) {
      this.startTime = this.now - (this.deltaT % this.renderInterval);
      this.render();
    }
  }

  render() {
    this.totalMass = 0;

    if (this.movers.length > 0) {
      this.calcMovers();
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  setCamera() {
    this.movers.forEach((v) => {
      this.updateTrace(v);
    });

    this.camera.position.set(this.currentRadius, this.currentRadius, this.currentRadius);
    this.camera.lookAt(new Vector3());
    this.camera.updateMatrix();
  }

  updateTrace(mover: Mover) {
    if (this.options.trailsDisplay) {
      mover.showTrace(this.options.trailsLength);
    }
  }

  calcMovers() {
    const movers = this.movers;

    movers.forEach((o1, i) => {
      if (!o1.alive) return false;
      if (o1.alive) {
        this.totalMass += o1.mass;
        movers.forEach((o2, j) => {
          if (o1.alive && o2.alive && i !== j) {
            const distance = o1.location.distanceTo(o2.location);
            const r1 = (o1.mass / MASS_FACTOR / MASS_FACTOR / (4 * Math.PI)) ** (1 / 3),
              r2 = (o2.mass / MASS_FACTOR / MASS_FACTOR / (4 * Math.PI)) ** (1 / 3);

            if (distance <= r1 + r2) o2.eat(o1);
            else o2.attract(o1, this.options.G);
          }
        });
      }
    });

    this.updateMovers();
  }

  updateMovers() {
    const movers = this.movers;
    for (let i = movers.length - 1; i >= 0; i--) {
      const mover = movers[i];
      if (mover.alive) {
        mover.update();
        mover.display(this.totalMass);
      }

      this.updateTrace(mover);
    }
  }

  getRandomize(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
}
