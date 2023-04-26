import { MathUtils } from 'three';
export const normalizeCoords = ({ minR = 0, maxR = Infinity, minTheta = 0, maxTheta = Math.PI / 2 } = {}, [r, theta, phi]) => [
    MathUtils.clamp(r, minR, maxR),
    MathUtils.clamp(theta, minTheta, maxTheta),
    MathUtils.euclideanModulo(phi, Math.PI * 2)
];
