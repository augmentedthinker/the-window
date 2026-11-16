// Positions of the moving parts in Terry's environmental plates, as fractions of the image
// (x of width, y and radii of height). From Terry's measurements in README.md, checked by eye.
window.ENV_REGIONS = {
  E1: { x: 0.500, y: 0.425, r: 0.315 },                  // speaker cone
  E2: { x: 0.499, y: 0.632, w: 0.134, h: 0.295 },        // lantern flame and chimney
  E3: { gauges: [0.163, 0.337, 0.500, 0.664, 0.837].map(x => ({ x, y: 0.499, r: 0.125 })) }  // five gauges; dial interior ≈ 0.81 r
};
