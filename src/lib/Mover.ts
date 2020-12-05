import { SPHERE_SIDES, MASS_FACTOR } from '../constants';
import {
  Vector3,
  SphereGeometry,
  Line,
  MeshPhongMaterial,
  PointLight,
  Mesh,
  Geometry,
  Scene,
  Light,
  Color,
} from 'three';
import { darken } from '../utils/colors';
import Gravity from '../utils/gravity';

export class Mover {
  public uid: string;
  public location: Vector3;
  public velocity: Vector3;
  public acceleration: Vector3;
  public mass: number;
  public alive: boolean;
  public geometry: Geometry;
  public vertices: Vector3[];
  public line: Line;
  public color: Color;
  public basicMaterial: MeshPhongMaterial;
  public selectionLight: Light;
  public mesh: Mesh;
  public position: Vector3;
  public parentScene: Scene;

  constructor(mass: number, velocity: Vector3, location: Vector3, id: string, scene: Scene) {
    this.uid = `mover-${id}`;
    this.location = location;
    this.velocity = velocity;
    this.acceleration = new Vector3(0.0, 0.0, 0.0);
    this.mass = mass;
    this.alive = true;
    this.geometry = new SphereGeometry(100, SPHERE_SIDES, SPHERE_SIDES);
    this.vertices = [];
    this.line = new Line();
    this.color = new Color(Math.random() * 0xffffff);
    this.basicMaterial = new MeshPhongMaterial({
      color: this.color,
      specular: this.color,
      shininess: 10,
    });

    this.selectionLight = new PointLight(this.color, 0.1);
    this.selectionLight.position.copy(this.location);

    this.mesh = new Mesh(this.geometry, this.basicMaterial);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;

    this.position = this.location;

    this.parentScene = scene;
  }

  addMover() {
    this.parentScene.add(this.mesh);
    this.parentScene.add(this.selectionLight);
    this.parentScene.add(this.line);
  }

  applyForce(force: Vector3) {
    if (!this.mass) this.mass = 1.0;
    const f = force.divideScalar(this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.location.add(this.velocity);
    this.acceleration.multiplyScalar(0);

    this.selectionLight.position.copy(this.location);
    this.mesh.position.copy(this.location);

    if (this.vertices.length > 10000) this.vertices.splice(0, 1);
    this.vertices.push(this.location.clone());
  }

  eat(otherMover: Mover) {
    const newMass = this.mass + otherMover.mass;
    const newLocation = new Vector3(
      (this.location.x * this.mass + otherMover.location.x * otherMover.mass) / newMass,
      (this.location.y * this.mass + otherMover.location.y * otherMover.mass) / newMass,
      (this.location.z * this.mass + otherMover.location.z * otherMover.mass) / newMass
    );

    const newVelocity = new Vector3(
      (this.velocity.x * this.mass + otherMover.velocity.x * otherMover.mass) / newMass,
      (this.velocity.y * this.mass + otherMover.velocity.y * otherMover.mass) / newMass,
      (this.velocity.z * this.mass + otherMover.velocity.z * otherMover.mass) / newMass
    );

    this.location = newLocation;
    this.velocity = newVelocity;
    this.mass = newMass;

    otherMover.kill();
  }

  attract(otherMover: Mover, G: number) {
    const force = Gravity.calcG(this, otherMover, G);

    this.applyForce(force);
  }

  kill() {
    this.alive = false;
    this.selectionLight.intensity = 0;
    this.parentScene.remove(this.mesh);
  }

  display(totalMass: number) {
    if (this.alive) {
      const scale = ((this.mass * MASS_FACTOR) / (4 * Math.PI)) ** (1 / 3);
      this.mesh.scale.x = scale;
      this.mesh.scale.y = scale;
      this.mesh.scale.z = scale;

      this.selectionLight.intensity = (2 * this.mass) / totalMass;

      let emissiveColor = this.color.getHex().toString(16);
      emissiveColor = darken(emissiveColor, -1 + this.mass / totalMass);

      this.basicMaterial.emissive.setHex(parseInt(emissiveColor, 16));
    } else {
      this.selectionLight.intensity = 0;
    }
  }

  showTrace(trailsLength: number) {
    this.parentScene.remove(this.line);
    const geometry = new Geometry();
    geometry.vertices = this.vertices.slice();
    geometry.verticesNeedUpdate = true;

    if (!this.alive) this.vertices.shift();
    while (geometry.vertices.length > trailsLength) {
      geometry.vertices.shift();
    }
    this.line = new Line(geometry, this.line.material);
    this.parentScene.add(this.line);
  }
}
