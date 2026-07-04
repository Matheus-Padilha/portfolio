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
  // Luz ambiente suave para manter as sombras bem escuras
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Luz principal forte vindo da frente/direita para criar highlights no vidro/metal
  const mainLight = new THREE.DirectionalLight(0xffffff, 4.0);
  mainLight.position.set(5, 8, 10);
  scene.add(mainLight);

  // Luz de contra (Rim light) vindo de trás/esquerda MUITO forte
  // É essa luz que cria a "borda" brilhante que separa o cubo preto do fundo preto!
  const rimLight = new THREE.DirectionalLight(0xffffff, 6.0);
  rimLight.position.set(-10, 10, -10);
  scene.add(rimLight);

  // Leve preenchimento frontal azulado para dar um toque premium nas áreas de sombra
  const fillLight = new THREE.DirectionalLight(0x4466ff, 1.5);
  fillLight.position.set(-5, -5, 8);
  scene.add(fillLight);

  // Luz de destaque dinâmico (Orbita o cubo para criar reflexos que varrem a superfície)
  const sweepLight = new THREE.PointLight(0xffffff, 20.0, 50);
  scene.add(sweepLight);

  /* ────────────────────────────────────────
     Material e Geometria
  ──────────────────────────────────────── */
  // Material Sombrio Premium - Retorno à cor original quase preta
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x050505, // Quase preto absoluto
    emissive: 0x000000, // Sem emissão para não deixar cinza lavado
    metalness: 0.95, // Altamente reflexivo (glossy)
    roughness: 0.1, // Superfície lisa para reflexos nítidos
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
      endTrigger: '#project-3', // Termina de montar quando chegar no projeto 3
      end: 'center center',
      scrub: 1.5, // Efeito suave ao rolar
      pin: '#cubes-canvas', // Fixa o canvas na tela enquanto anima
      pinSpacing: false     // Evita empurrar o layout para baixo
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
      
      // Utilizando Quaternion Slerp para evitar pulos quando os ângulos ficam muito grandes
      const idleQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(d.rx, d.ry, 0));
      const targetQ = new THREE.Quaternion(); // Rotação zero (alinhado)
      
      // Quando intensity chegar a 0, as rotações ficarão perfeitamente alinhadas em 0
      item.mesh.quaternion.slerpQuaternions(targetQ, idleQ, intensity); 
    });

    // Rotação suave de todo o grupo quando não houver scroll ativo,
    // ou se o cubo já estiver 100% montado (assim ele continua girando ao passar dele)
    if (!isScrolling || progress >= 0.98) {
      cubesGroup.rotation.x += 0.0015;
      cubesGroup.rotation.y += 0.0025;
    }

    // Animação da luz de destaque orbitando o cubo (Efeito de reflexo varrendo o metal)
    // Usamos o centro do grupo (x: 3) como âncora
    sweepLight.position.x = 3 + Math.sin(now * 0.001) * 10;
    sweepLight.position.y = Math.cos(now * 0.0013) * 10;
    sweepLight.position.z = Math.sin(now * 0.0008) * 10 + 6;

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
