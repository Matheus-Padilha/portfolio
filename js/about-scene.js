/* ═══════════════════════════════════════════════
   ABOUT-SCENE.JS — Sólidos Geométricos Sombrios
   Portfolio — Matheus Padilha
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('about-canvas');
  if (!canvas || typeof THREE === 'undefined' || typeof gsap === 'undefined') return;

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

  /* ────────────────────────────────────────
     Scene & Camera
  ──────────────────────────────────────── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  /* ────────────────────────────────────────
     Lights
  ──────────────────────────────────────── */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Luz principal branca/fria vindo de cima/direita
  const mainLight = new THREE.DirectionalLight(0xffffff, 3.5);
  mainLight.position.set(5, 5, 5);
  scene.add(mainLight);

  // Luz de preenchimento levemente azulada vindo de baixo/esquerda
  const fillLight = new THREE.DirectionalLight(0xaaccff, 1.5);
  fillLight.position.set(-5, -5, 2);
  scene.add(fillLight);

  /* ────────────────────────────────────────
     Materials & Geometries
  ──────────────────────────────────────── */
  // Material Sombrio Premium (Dark Plastic / Glass / Metal)
  const darkMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const objects = [];

  // 1. Icosaedro (D20)
  const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), darkMaterial);
  icosahedron.position.set(-2.5, 1.8, 0);
  scene.add(icosahedron);
  objects.push(icosahedron);

  // 2. Octaedro
  const octahedron = new THREE.Mesh(new THREE.OctahedronGeometry(1.0, 0), darkMaterial);
  octahedron.position.set(2.8, -1.5, 1);
  scene.add(octahedron);
  objects.push(octahedron);

  // 3. Torus (Anel)
  const torus = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.25, 16, 50), darkMaterial);
  torus.position.set(2.2, 2.2, -1);
  scene.add(torus);
  objects.push(torus);
  
  // 4. Tetraedro extra
  const tetra = new THREE.Mesh(new THREE.TetrahedronGeometry(0.7, 0), darkMaterial);
  tetra.position.set(-2.2, -2.0, 0.5);
  scene.add(tetra);
  objects.push(tetra);

  // Inicialmente escala zero para animação de entrada
  objects.forEach(obj => {
    obj.scale.set(0, 0, 0);
  });

  /* ────────────────────────────────────────
     Resize Handler
  ──────────────────────────────────────── */
  function resize() {
    const parent = canvas.parentElement;
    const width = parent.offsetWidth;
    const height = parent.offsetHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  setTimeout(resize, 50);

  /* ────────────────────────────────────────
     Animation Loop & Optimization
  ──────────────────────────────────────── */
  let isVisible = false;
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);

    if (!isVisible) return; // Otimização: Não renderiza se não estiver na tela

    time += 0.005;

    objects.forEach((obj, i) => {
      // Rotação suave baseada no index para diversidade
      obj.rotation.x += 0.003 * (i + 1);
      obj.rotation.y += 0.004 * (i + 1);
      
      // Flutuação (Float)
      const offset = (i % 2 === 0) ? 1 : -1;
      obj.position.y += Math.sin(time * 3 + i) * 0.003 * offset;
    });

    // Movimento do mouse parallax sutil
    if (window.mouseX !== undefined && window.mouseY !== undefined) {
      const targetX = (window.mouseX - window.innerWidth / 2) * 0.001;
      const targetY = (window.mouseY - window.innerHeight / 2) * 0.001;
      
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (-targetY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
    }

    renderer.render(scene, camera);
  }

  animate();

  /* ────────────────────────────────────────
     GSAP ScrollTrigger Integration
  ──────────────────────────────────────── */
  // Observa a seção "Sobre"
  ScrollTrigger.create({
    trigger: '#about',
    start: 'top bottom', // Inicia quando o topo da seção encosta no fim da tela
    end: 'bottom top',   // Termina quando o fim da seção passa pelo topo da tela
    onEnter: () => {
      isVisible = true;
      // Anima os objetos explodindo elásticamente
      gsap.to(objects.map(o => o.scale), {
        x: 1, y: 1, z: 1,
        duration: 1.5,
        ease: "elastic.out(1, 0.4)",
        stagger: 0.15
      });
    },
    onLeave: () => {
      isVisible = false;
    },
    onEnterBack: () => {
      isVisible = true;
    },
    onLeaveBack: () => {
      isVisible = false;
    }
  });

})();
