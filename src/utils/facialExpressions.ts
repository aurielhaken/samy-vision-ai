// Définitions des expressions faciales pour Samy
export interface FacialExpression {
  eyeOpenness: number;      // 0-1
  eyebrowHeight: number;    // -1 to 1
  mouthOpenness: number;    // 0-1
  mouthSmile: number;       // -1 to 1
  headTilt: number;         // -1 to 1
}

export const EXPRESSIONS: Record<'calm' | 'curious' | 'energetic' | 'speaking', FacialExpression> = {
  calm: {
    eyeOpenness: 0.6,
    eyebrowHeight: 0,
    mouthOpenness: 0.1,
    mouthSmile: 0.3,
    headTilt: 0,
  },
  curious: {
    eyeOpenness: 0.9,
    eyebrowHeight: 0.5,
    mouthOpenness: 0.15,
    mouthSmile: 0.2,
    headTilt: 0.2,
  },
  energetic: {
    eyeOpenness: 1,
    eyebrowHeight: 0.3,
    mouthOpenness: 0.3,
    mouthSmile: 0.8,
    headTilt: -0.1,
  },
  speaking: {
    eyeOpenness: 0.8,
    eyebrowHeight: 0.1,
    mouthOpenness: 0.5,
    mouthSmile: 0.4,
    headTilt: 0,
  },
};

export const interpolateExpression = (
  from: FacialExpression,
  to: FacialExpression,
  t: number
): FacialExpression => {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  
  return {
    eyeOpenness: lerp(from.eyeOpenness, to.eyeOpenness, t),
    eyebrowHeight: lerp(from.eyebrowHeight, to.eyebrowHeight, t),
    mouthOpenness: lerp(from.mouthOpenness, to.mouthOpenness, t),
    mouthSmile: lerp(from.mouthSmile, to.mouthSmile, t),
    headTilt: lerp(from.headTilt, to.headTilt, t),
  };
};
