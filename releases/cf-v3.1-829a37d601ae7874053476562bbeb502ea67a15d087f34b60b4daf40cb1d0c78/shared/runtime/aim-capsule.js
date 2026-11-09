/** Pure aim measurements; callers retain hit policy and pitch defaults. */
export function aimCapsule({dx,dz,yaw,pitch,eyeHeight}) {
  const projection=dx*-Math.sin(yaw)+dz*-Math.cos(yaw);
  const lateral=Math.abs(dx*Math.cos(yaw)-dz*Math.sin(yaw));
  const height=eyeHeight+Math.tan(pitch)*projection;
  return {projection,lateral,height};
}
