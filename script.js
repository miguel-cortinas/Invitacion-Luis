// Esperar a que el DOM cargue antes de añadir eventos
document.addEventListener('DOMContentLoaded', () => {
  // El mes es 3 porque Abril es el cuarto mes (índice 0-3). Las horas usan formato 24h (3:00 PM = 15).
  const EVENT_DATE = new Date(2026, 3, 18, 15, 0, 0); // ⚠️ EDITAR: año, mes-1, día, hora, min

  // Elementos del DOM
  const bgMusic = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-btn');
  const openBtn = document.getElementById('open-btn');
  const eggWrap = document.getElementById('egg-wrap');

  // Asignar eventos a los botones (reemplaza los onclick del HTML)
  if (openBtn) openBtn.addEventListener('click', openInvitation);
  if (eggWrap) eggWrap.addEventListener('click', openInvitation);
  if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

  function playRoar() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const makeLayer = (freq, type, gainVal, dur, freqEnd) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
        osc.type = type; osc.frequency.setValueAtTime(freq, now);
        if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + dur);
        filter.type = 'lowpass'; filter.frequency.value = 800;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(gainVal, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + dur);
      };
      makeLayer(80,'sawtooth',0.35,2.0,30); makeLayer(120,'sawtooth',0.25,1.8,50);
      makeLayer(200,'square',0.15,1.5,80);  makeLayer(45,'sine',0.4,2.5,20);
      if (navigator.vibrate) navigator.vibrate([200,100,400,100,600]);
    } catch(e){}
  }

  // Lógica del Confeti Optimizado (Física de Explosión)
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [], animId;
    // Colores jurásicos
    const colors = ['#aaff00','#ffb300','#ff6f00','#4caf50','#e53935','#fff176','#80cbc4'];
    const emojis = ['🦖','🦕','🌿','🥚','⭐'];

    function resize(){ canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
    window.addEventListener('resize', resize); 
    resize();

    function spawn(){
      // 1. Calculamos el origen dinámico: el centro del huevo
      const egg = document.getElementById('egg-wrap');
      let originX = canvas.width / 2;
      let originY = canvas.height / 2;

      if (egg) {
        const rect = egg.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
      }

      // 2. Generamos las partículas con vectores de explosión
      for(let i = 0; i < 150; i++){ // Aumentamos la densidad para mayor impacto
        const isEmoji = Math.random() < 0.12;
        
        // Distribución radial aleatoria (360 grados)
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 20 + 5; // Fuerza de salida

        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * velocity, // Vector de velocidad en X
          vy: (Math.sin(angle) * velocity) - 12, // Vector en Y (sesgado hacia arriba con el -12)
          rot: Math.random() * 360,
          rotV: (Math.random() - 0.5) * 15, // Rotación caótica sobre su propio eje
          size: isEmoji ? 18 + Math.random() * 12 : 8 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
          alpha: 1
        });
      }
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // Limpiamos la memoria destruyendo partículas invisibles
      particles = particles.filter(p => p.alpha > 0.05);

      particles.forEach(p => {
        // 3. Aplicamos variables físicas al entorno de cada frame
        p.vy += 0.8; // Fuerza de Gravedad constante hacia abajo
        p.vx *= 0.97; // Fricción del aire horizontal (desaceleración)
        p.vy *= 0.98; // Fricción del aire vertical

        p.x += p.vx; 
        p.y += p.vy; 
        p.rot += p.rotV;

        // Desvanecimiento suave (fade out) conforme empiezan a caer
        if(p.vy > 3) p.alpha -= 0.015;

        ctx.save(); 
        ctx.globalAlpha = Math.max(0, p.alpha); // Evitamos valores negativos
        ctx.translate(p.x, p.y); 
        ctx.rotate(p.rot * Math.PI / 180);
        
        // Renderizado
        if(p.emoji){
          ctx.font = `${p.size}px serif`;
          ctx.fillText(p.emoji, -p.size/2, p.size/2);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
        }
        ctx.restore();
      });

      // Ciclo de animación
      if(particles.length > 0) {
        animId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0,0,canvas.width,canvas.height);
      }
    }

    window.launchConfetti = function(){ 
      spawn(); 
      cancelAnimationFrame(animId); 
      draw(); 
    };
  }

  // ─── MÚSICA ─────────────────────────────────────────────
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
    }).catch(() => {
      // Autoplay bloqueado — el usuario pulsa el botón manualmente
    });
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

  function openInvitation() {
    const egg=document.getElementById('egg');
    const fog=document.getElementById('fog-overlay'), splash=document.getElementById('splash');
    
    if(egg) egg.classList.add('shake');
    
    setTimeout(()=>{ 
      if(egg) egg.classList.remove('shake'); 
      if(eggWrap) eggWrap.classList.add('cracking'); 
    },600);
    
    setTimeout(()=>{ 
      playRoar(); 
      if(window.launchConfetti) window.launchConfetti(); 
    },1000);
    
    setTimeout(()=>{ 
      if(fog) fog.classList.add('active'); 
    },1600);
    
    setTimeout(()=>{
      if(splash) splash.classList.add('hidden'); 
      if(fog) fog.classList.remove('active');
      
      const navDots = document.getElementById('nav-dots');
      if (navDots) navDots.classList.add('visible');
      
      const footprints = document.getElementById('footprints');
      if (footprints) footprints.style.display='flex';
      
      if(musicBtn) musicBtn.classList.add('visible');
      startMusic();
      initReveal(); 
      startCountdown();
    },2600);
  }

  function initReveal(){
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); }),{threshold:0.15});
    document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
  }

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

  // Navegación con dots
  const sections=['inicio','invitacion','detalles','contador','ubicacion','vestimenta','confirmacion'];
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