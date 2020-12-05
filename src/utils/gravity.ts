import { Vector3 } from 'three';
import { Mover } from '../lib/Mover';

export default {
  calcG(o1: Mover, o2: Mover, G: number) {
    let force = new Vector3().subVectors(o1.location, o2.location);
    const distance = Math.sqrt(force.length() ** 2);

    force = force.normalize();
    const strength = -(G * o1.mass * o2.mass) / distance ** 2;

    return force.multiplyScalar(strength);
  },
};
