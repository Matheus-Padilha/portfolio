/* ═══════════════════════════════════════════════
   THREE-SCENE.JS — Particle Constellation Hero
   Portfolio — Matheus Padilha
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ────────────────────────────────────────
     Renderer
  ──────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  /* ────────────────────────────────────────
     Scene & Camera
  ──────────────────────────────────────── */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    canvas.offsetWidth / canvas.offsetHeight,
    0.1,
    500
  );
  camera.position.set(0, 0, 18);

  /* ────────────────────────────────────────
     Particles
  ──────────────────────────────────────── */
  const PARTICLE_COUNT = 130;
  const SPREAD_X       = 32;
  const SPREAD_Y       = 22;
  const SPREAD_Z       = 6;
  const CONNECTION_DIST = 6.5;
  const DRIFT_SPEED    = 0.012;
  const DRIFT_RADIUS   = 2.5;

  const positions  = new Float32Array(PARTICLE_COUNT * 3);
  const origins    = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const phases     = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * SPREAD_X;
    const y = (Math.random() - 0.5) * SPREAD_Y;
    const z = (Math.random() - 0.5) * SPREAD_Z;

    positions[i * 3]     = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    origins[i * 3]     = x;
    origins[i * 3 + 1] = y;
    origins[i * 3 + 2] = z;

    velocities[i * 3]     = (Math.random() - 0.5) * DRIFT_SPEED;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * DRIFT_SPEED;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * DRIFT_SPEED * 0.2;

    phases[i * 3]     = Math.random() * Math.PI * 2;
    phases[i * 3 + 1] = Math.random() * Math.PI * 2;
    phases[i * 3 + 2] = Math.random() * Math.PI * 2;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color:          0x222222,
    size:           0.10,
    sizeAttenuation: true,
    transparent:    true,
    opacity:        0.75,
  });

  const pointsMesh = new THREE.Points(particleGeo, particleMat);
  scene.add(pointsMesh);

  /* ────────────────────────────────────────
     Connection Lines (updated each frame)
  ──────────────────────────────────────── */
  const lineGeo = new THREE.BufferGeometry();
  const lineMat = new THREE.LineBasicMaterial({
    color:       0x222222,
    transparent: true,
    opacity:     0.12,
  });
  const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineSegments);

  /* Pre-allocate max line buffer: n*(n-1)/2 pairs × 2 verts × 3 floats */
  const maxLines    = Math.floor(PARTICLE_COUNT * (PARTICLE_COUNT - 1) / 2);
  const lineBuffer  = new Float32Array(maxLines * 6);
  const lineAttr    = new THREE.BufferAttribute(lineBuffer, 3);
  lineAttr.setUsage(THREE.DynamicDrawUsage);
  lineGeo.setAttribute('position', lineAttr);

  /* ────────────────────────────────────────
     Mouse Parallax
  ──────────────────────────────────────── */
  let mouseNormX = 0;
  let mouseNormY = 0;
  let camX = 0;
  let camY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseNormX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseNormY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ────────────────────────────────────────
     Color API (called by animations.js)
  ──────────────────────────────────────── */
  let currentDark = false;

  window.heroSceneSetDark = function (dark) {
    if (dark === currentDark) return;
    currentDark = dark;
    const hex = dark ? 0xcccccc : 0x222222;
    particleMat.color.setHex(hex);
    lineMat.color.setHex(hex);
  };

  /* ────────────────────────────────────────
     Animation Loop
  ──────────────────────────────────────── */
  let time = 0;

  function buildLines(pos) {
    let lineCount = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const xi = pos[i * 3];
      const yi = pos[i * 3 + 1];
      const zi = pos[i * 3 + 2];

      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = xi - pos[j * 3];
        const dy = yi - pos[j * 3 + 1];
        const dz = zi - pos[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < CONNECTION_DIST * CONNECTION_DIST) {
          const base = lineCount * 6;
          lineBuffer[base]     = xi;
          lineBuffer[base + 1] = yi;
          lineBuffer[base + 2] = zi;
          lineBuffer[base + 3] = pos[j * 3];
          lineBuffer[base + 4] = pos[j * 3 + 1];
          lineBuffer[base + 5] = pos[j * 3 + 2];
          lineCount++;
        }
      }
    }

    return lineCount;
  }

  function animate() {
    requestAnimationFrame(animate);
    time += 0.008;

    /* Update particle positions with sinusoidal drift */
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = origins[i * 3]     + Math.sin(time * 0.7 + phases[i * 3])     * DRIFT_RADIUS * 0.5 + velocities[i * 3]     * time * 0.3;
      positions[i * 3 + 1] = origins[i * 3 + 1] + Math.sin(time * 0.5 + phases[i * 3 + 1]) * DRIFT_RADIUS * 0.4 + velocities[i * 3 + 1] * time * 0.3;
      positions[i * 3 + 2] = origins[i * 3 + 2] + Math.sin(time * 0.9 + phases[i * 3 + 2]) * DRIFT_RADIUS * 0.15;
    }

    particleGeo.attributes.position.needsUpdate = true;

    /* Build line buffer */
    const lineCount = buildLines(positions);
    lineAttr.needsUpdate = true;
    lineGeo.setDrawRange(0, lineCount * 2);

    /* Smooth camera parallax */
    camX += (mouseNormX * 3 - camX) * 0.04;
    camY += (-mouseNormY * 2 - camY) * 0.04;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  /* ────────────────────────────────────────
     Resize Handler
  ──────────────────────────────────────── */
  function onResize() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);
  // Initial size fix (canvas may not have rendered dimensions yet)
  requestAnimationFrame(onResize);

})();
