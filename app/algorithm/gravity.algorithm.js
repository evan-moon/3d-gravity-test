import { Vector3 } from 'three';

export default {
    calcG(o1, o2, G) {
        let force = new Vector3().subVectors(o1.location, o2.location);
        let distance = Math.sqrt(force.length() ** 2);

        force = force.normalize();


        const strength = -(G * o1.mass * o2.mass) / (distance ** 2);

        force = force.multiplyScalar(strength);

        return force;
    }
}
