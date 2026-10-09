// Placement of new plants (spec section 8).
// Input: existing positions [{ pos_x, pos_z }]. Output: { pos_x, pos_z, rot_y }.
export function placePlant(existing = []) {
  const MIN_DIST = 2.0;
  const MAX_ATTEMPTS = 60;
  let rMin = 3;
  let rMax = 12;

  const farEnough = (x, z) =>
    existing.every((p) => {
      const dx = p.pos_x - x;
      const dz = p.pos_z - z;
      return Math.hypot(dx, dz) >= MIN_DIST;
    });

  // Expand the ring by +2 until a free spot is found.
  for (;;) {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = rMin + Math.random() * (rMax - rMin);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      if (farEnough(x, z)) {
        return { pos_x: x, pos_z: z, rot_y: Math.random() * Math.PI * 2 };
      }
    }
    rMin += 2;
    rMax += 2;
  }
}
