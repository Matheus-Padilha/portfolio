/* ═══════════════════════════════════════════════
   CUBES-SCENE.JS — Blocos de Encaixe 3D no Scroll
   Portfolio — Matheus Padilha
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('cubes-canvas');
  if (!canvas || typeof THREE === 'undefined' || typeof gsap === 'undefined') return;

  /* ────────────────────────────────────────
     Renderer
  ──────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true, // Fundo transparente
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  /* ────────────────────────────────────────
     Scene & Camera
  ──────────────────────────────────────── */
  const scene = new THREE.Scene();
  
  // A câmera precisa de um FOV ajustado para ver os blocos bem
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 12);

  /* ────────────────────────────────────────
     Lights
  ──────────────────────────────────────── */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
  mainLight.position.set(10, 10, 10);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x77aaff, 1.0);
  fillLight.position.set(-10, -10, -10);
  scene.add(fillLight);

  /* ────────────────────────────────────────
     Material e Geometria
  ──────────────────────────────────────── */
  // Material Sombrio Premium
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    emissive: 0x050505, // Leve brilho base para garantir que seja visível
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const cubesGroup = new THREE.Group();
  scene.add(cubesGroup);

  // Mover o grupo para a direita para não bater com os textos principais.
  cubesGroup.position.set(3, 0, 0);

  const cubes = [];
  const spacing = 1.1; // Espaço entre os cubos

  // Criar grid 3x3x3
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const wrapper = new THREE.Group();

        // Posição Final (Alinhada)
        const targetX = (x - 1) * spacing;
        const targetY = (y - 1) * spacing;
        const targetZ = (z - 1) * spacing;

        // Posição Inicial (Caótica e espalhada)
        const startX = (Math.random() - 0.5) * 40;
        const startY = (Math.random() - 0.5) * 40 + 10;
        const startZ = (Math.random() - 0.5) * 40 - 10;

        wrapper.position.set(startX, startY, startZ);
        wrapper.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        wrapper.userData = { targetX, targetY, targetZ };

        const mesh = new THREE.Mesh(geometry, material);
        // Dados para animação idle flutuante
        mesh.userData = {
           rx: Math.random() * Math.PI * 2,
           ry: Math.random() * Math.PI * 2,
           speed: Math.random() * 0.02 + 0.01,
           offset: Math.random() * Math.PI * 2,
           radius: Math.random() * 2 + 0.5
        };
        wrapper.add(mesh);

        cubesGroup.add(wrapper);
        cubes.push({ wrapper, mesh });
      }
    }
  }

  /* ────────────────────────────────────────
     GSAP ScrollTrigger Animation
  ──────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      endTrigger: '#projects', // Termina de montar quando chegar na seção de projetos
      end: 'center center',
      scrub: 1.5, // Efeito suave ao rolar
    }
  });

  // Animar cada wrapper para sua posição final e rotação 0
  cubes.forEach(item => {
    tl.to(item.wrapper.position, {
      x: item.wrapper.userData.targetX,
      y: item.wrapper.userData.targetY,
      z: item.wrapper.userData.targetZ,
      ease: "power2.inOut"
    }, 0);
    
    tl.to(item.wrapper.rotation, {
      x: 0,
      y: 0,
      z: 0,
      ease: "power2.inOut"
    }, 0);
  });

  /* ────────────────────────────────────────
     Render Loop & Resize
  ──────────────────────────────────────── */
  let lastTime = Date.now();
  let isScrolling = false;
  let scrollTimeout = null;

  // Detectar se o usuário está rolando a página
  window.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 150); // Considera que parou após 150ms sem rolar
  });

  function render() {
    const now = Date.now();
    const dt = (now - lastTime) * 0.001; // delta time em segundos
    lastTime = now;

    const progress = Math.max(0, Math.min(tl.progress(), 1)); // Garante limite entre 0 e 1
    const intensity = 1 - Math.pow(progress, 0.5); // Fator que zera ao montar o cubo

    cubes.forEach(item => {
      const d = item.mesh.userData;
      
      // Incrementar o tempo de animação com dt (Evita aceleração infinita e saltos)
      d.offset += dt * d.speed * 2;
      
      // Movimento idle de flutuação multiplicado pela intensidade
      item.mesh.position.x = Math.sin(d.offset) * d.radius * intensity;
      item.mesh.position.y = Math.cos(d.offset * 0.75) * d.radius * intensity;
      item.mesh.position.z = Math.sin(d.offset * 0.9) * d.radius * intensity;
      
      // Rotação individual da malha. 
      // Incrementar ângulo apenas usando dt. 
      d.rx += dt * d.speed * 8;
      d.ry += dt * d.speed * 10;
      
      // Quando intensity chegar a 0, as rotações ficarão perfeitamente alinhadas em 0
      item.mesh.rotation.x = d.rx * intensity;
      item.mesh.rotation.y = d.ry * intensity;
      item.mesh.rotation.z = 0; 
    });

    // Rotação suave de todo o grupo quando não houver scroll ativo,
    // ou se o cubo já estiver 100% montado (assim ele continua girando ao passar dele)
    if (!isScrolling || progress >= 0.98) {
      cubesGroup.rotation.x += 0.0015;
      cubesGroup.rotation.y += 0.0025;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  
  // Iniciar loop
  requestAnimationFrame(render);

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // Pequeno ajuste de responsividade
    if (width < 768) {
      cubesGroup.scale.set(0.6, 0.6, 0.6);
    } else {
      cubesGroup.scale.set(1, 1, 1);
    }
  }

  window.addEventListener('resize', resize);
  resize(); // Trigger inicial

})();
