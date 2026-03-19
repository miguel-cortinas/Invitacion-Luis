// Esperar a que el DOM cargue antes de añadir eventos
document.addEventListener('DOMContentLoaded', () => {
  // ⚠️ FECHA DEL EVENTO: 18 de Abril de 2026 a las 15:00 (3:00 PM)
  const EVENT_DATE = new Date(2026, 3, 18, 15, 0, 0); 

  // Elementos del DOM interactivos
  const bgMusic = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-btn');
  const eggWrap = document.getElementById('egg-wrap');
  const crackBtn = document.getElementById('crack-btn'); 

  // Asignar eventos
  if (eggWrap) eggWrap.addEventListener('click', handleEggClick);
  if (crackBtn) crackBtn.addEventListener('click', handleEggClick);
  if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

  // ─── LÓGICA DE APERTURA (MÁQUINA DE ESTADOS) ────────────
  let eggClicks = 0;

  // Sintetizador para los crujidos de la cáscara 
  function playCrackSound(intensity) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(intensity === 1 ? 150 : 80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
      if(navigator.vibrate) navigator.vibrate(intensity === 1 ? 50 : 150);
    } catch(e){}
  }

  // Generador de Onda Expansiva (Shockwave Visual)
  function createShockwave() {
    if(!eggWrap) return;
    const wave = document.createElement('div');
    wave.className = 'shockwave';
    eggWrap.appendChild(wave);
    setTimeout(() => wave.remove(), 500); // Limpia el DOM tras la animación
  }

  function playRoar() {
    const roarAudio = document.getElementById('roar-sound');
    if (roarAudio) {
      roarAudio.volume = 0.3; 
      roarAudio.currentTime = 0; 
      roarAudio.play().catch(e => console.log("Autoplay del rugido bloqueado", e));
    }
    try {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 400, 100, 600]); 
      }
    } catch(e){}
  }

  // Controlador FSM (Finite State Machine)
  function handleEggClick() {
    const egg = document.getElementById('egg');
    const crack = document.getElementById('crack-layer');
    const splash = document.getElementById('splash');
    const flashbang = document.getElementById('flashbang');

    eggClicks++;

    if (eggClicks === 1) {
      // ESTADO 1: Primer golpe (Desprende algo de polvo y brilla verde)
      if (crackBtn) crackBtn.textContent = "¡OTRA VEZ!"; 
      playCrackSound(1);
      createShockwave();
      if(window.launchDust) window.launchDust(8); // Lanza pequeños fragmentos de cascarón

      egg.classList.add('shake-mild');
      crack.classList.add('crack-step-1');
      setTimeout(() => egg.classList.remove('shake-mild'), 300);
    } 
    else if (eggClicks === 2) {
      // ESTADO 2: Segundo golpe (Más cascarones y la luz se vuelve ámbar radiactivo)
      if (crackBtn) crackBtn.textContent = "¡ÚLTIMO GOLPE!"; 
      playCrackSound(2);
      createShockwave();
      if(window.launchDust) window.launchDust(15); 

      egg.classList.add('shake-violent');
      crack.classList.replace('crack-step-1', 'crack-step-2');
      setTimeout(() => egg.classList.remove('shake-violent'), 400);
    } 
    else if (eggClicks >= 3) {
      // ESTADO 3: Estallido
      if (crackBtn) crackBtn.style.display = 'none'; 
      egg.classList.add('shake-violent'); 

      setTimeout(() => {
        // HIT FRAME
        if(flashbang) flashbang.style.opacity = '1'; 
        playRoar(); 

        setTimeout(() => {
          if(window.launchConfetti) window.launchConfetti(); 
          if(flashbang) flashbang.style.opacity = '0'; 
          if(splash) splash.classList.add('hidden'); 
          startMusic();
        }, 100);

        // REVELACIÓN CINEMÁTICA
        setTimeout(() => {
          const heroContent = document.getElementById('hero-content');
          const heroScroll = document.getElementById('hero-scroll');
          if (heroContent) heroContent.classList.add('play-cinematic');
          if (heroScroll) heroScroll.classList.add('play-cinematic');

          const navDots = document.getElementById('nav-dots');
          if (navDots) navDots.classList.add('visible');
          const footprints = document.getElementById('footprints');
          if (footprints) footprints.style.display='flex';
          if(musicBtn) musicBtn.classList.add('visible');

          initReveal(); 
          startCountdown();
        }, 1200); 

      }, 250); 
    }
  }

  // ─── MOTOR DE PARTÍCULAS (Maneja el confeti y los fragmentos de cascarón) ───
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [], isDrawing = false;
    
    // Paleta expandida: Añadí blanco y gris claro para simular cascarones en la explosión
    const colors = ['#aaff00','#ffb300','#ff6f00','#4caf50','#e53935','#fff176','#80cbc4','#ffffff','#e0e0e0'];
    const emojis = ['🦖','🦕','🌿','🥚','⭐'];

    function resize(){ 
      canvas.width = window.innerWidth; 
      canvas.height = window.innerHeight; 
    }
    window.addEventListener('resize', resize); 
    resize();

    // Función exclusiva para los golpes (Cascarones pequeños volando)
    window.launchDust = function(amount) {
      resize(); 
      const eggContainer = document.getElementById('egg-wrap');
      let originX = canvas.width / 2;
      let originY = canvas.height / 2;

      if (eggContainer) {
        const rect = eggContainer.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
      }

      for(let i = 0; i < amount; i++){
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 8 + 2; // Explosión suave
        particles.push({
          x: originX, y: originY,
          vx: Math.cos(angle) * velocity,
          vy: (Math.sin(angle) * velocity) - 5,
          rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 15,
          size: 4 + Math.random() * 6, // Tamaño pequeño
          color: '#ffffff', // Cascarón blanco puro
          emoji: null, alpha: 1
        });
      }
      if (!isDrawing) { isDrawing = true; draw(); }
    };

    // Función de la explosión final
    window.launchConfetti = function(){ 
      resize(); 
      const eggContainer = document.getElementById('egg-wrap');
      let originX = canvas.width / 2;
      let originY = canvas.height / 2;

      if (eggContainer) {
        const rect = eggContainer.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
      }

      for(let i = 0; i < 150; i++){
        const isEmoji = Math.random() < 0.12;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 20 + 5;
        particles.push({
          x: originX, y: originY,
          vx: Math.cos(angle) * velocity,
          vy: (Math.sin(angle) * velocity) - 12,
          rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 15,
          size: isEmoji ? 18 + Math.random() * 12 : 8 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
          alpha: 1
        });
      }
      if (!isDrawing) { isDrawing = true; draw(); }
    };

    // Ciclo de físicas (reutilizable)
    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles = particles.filter(p => p.alpha > 0.05);

      particles.forEach(p => {
        p.vy += 0.8; // Gravedad
        p.vx *= 0.97; // Fricción X
        p.vy *= 0.98; // Fricción Y

        p.x += p.vx; 
        p.y += p.vy; 
        p.rot += p.rotV;

        if(p.vy > 3) p.alpha -= 0.015;

        ctx.save(); 
        ctx.globalAlpha = Math.max(0, p.alpha); 
        ctx.translate(p.x, p.y); 
        ctx.rotate(p.rot * Math.PI / 180);
        
        if(p.emoji){
          ctx.font = `${p.size}px serif`;
          ctx.fillText(p.emoji, -p.size/2, p.size/2);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
        }
        ctx.restore();
      });

      if(particles.length > 0) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        isDrawing = false; // Apaga el motor cuando no hay partículas para ahorrar batería
      }
    }
  }

  // ─── MÚSICA DE FONDO ────────────────────────────────────
  function startMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0;
    bgMusic.play().then(() => {
      musicBtn.classList.add('playing');
      let vol = 0;
      const fade = setInterval(() => {
        vol = Math.min(vol + 0.035, 0.55);
        bgMusic.volume = vol;
        if (vol >= 0.55) clearInterval(fade);
      }, 100);
    }).catch(() => {});
  }

  function toggleMusic() {
    if (!bgMusic) return;
    if (bgMusic.paused) {
      bgMusic.play();
      musicBtn.classList.add('playing');
    } else {
      bgMusic.pause();
      musicBtn.classList.remove('playing');
    }
  }

  // ─── INTERSECTION OBSERVER (REVEAL ANIMATIONS) ──────────
  function initReveal(){
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); }),{threshold:0.15});
    document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
  }

  // ─── CONTADOR REGRESIVO ─────────────────────────────────
  function startCountdown(){
    const display = document.getElementById('countdown-display');
    const doneMsg = document.getElementById('countdown-done');
    if (!display || !doneMsg) return;

    function update(){
      const diff=EVENT_DATE-new Date();
      if(diff<=0){ 
        display.style.display='none'; 
        doneMsg.style.display='block'; 
        return; 
      }
      const pad=n=>String(n).padStart(2,'0');
      document.getElementById('cd-dias').textContent =pad(Math.floor(diff/86400000));
      document.getElementById('cd-horas').textContent=pad(Math.floor((diff%86400000)/3600000));
      document.getElementById('cd-min').textContent  =pad(Math.floor((diff%3600000)/60000));
      document.getElementById('cd-seg').textContent  =pad(Math.floor((diff%60000)/1000));
    }
    update(); setInterval(update,1000);
  }

  // ─── NAVEGACIÓN CON DOTS LATERALES ──────────────────────
  const sections=['inicio','invitacion','detalles','contador','ubicacion','after','vestimenta','confirmacion'];
  const dots=document.querySelectorAll('.nav-dot');
  
  dots.forEach(d=>d.addEventListener('click',()=> {
    const target = document.getElementById(d.dataset.target);
    if(target) target.scrollIntoView({behavior:'smooth'});
  }));
  
  const dotObs=new IntersectionObserver(entries=>entries.forEach(e=>{ 
    if(e.isIntersecting){ 
      const i=sections.indexOf(e.target.id); 
      dots.forEach((d,j)=>d.classList.toggle('active',i===j)); 
    } 
  }),{threshold:0.5});
  
  sections.forEach(id=> {
    const sec = document.getElementById(id);
    if(sec) dotObs.observe(sec);
  });
});