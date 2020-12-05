export interface SceneOptions {
  framerate: number;
  G: number;
  startSpeed: number;
  moverCount: number;
  trailsDisplay: boolean;
  trailsLength: number;
  minMass: number;
  maxMass: number;
  density: number;
  reset?: () => void;
}
export const initOptions: SceneOptions = {
  framerate: 60,
  G: 250,
  startSpeed: 30,
  moverCount: 40,
  trailsDisplay: true,
  trailsLength: 100,
  minMass: 400,
  maxMass: 3000,
  density: 0.15,
};

export const G = 6.6742e-11;

export const SPHERE_SIDES = 20;
export const MASS_FACTOR = 0.01;
