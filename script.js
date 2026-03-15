// Esperar a que el DOM cargue antes de añadir eventos
document.addEventListener('DOMContentLoaded', () => {
  // ⚠️ FECHA DEL EVENTO: 18 de Abril de 2026 a las 15:00 (3:00 PM)
  // Recuerda: Enero es 0, Febrero es 1, Marzo es 2, Abril es 3.
  const EVENT_DATE = new Date(2026, 3, 18, 15, 0, 0); 

  // Elementos del DOM
  const bgMusic = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-btn');
  const openBtn = document.getElementById('open-btn');
  const eggWrap = document.getElementById('egg-wrap');

  // Asignar eventos a los botones
  if (openBtn) openBtn.addEventListener('click', openInvitation);
  if (eggWrap) eggWrap.addEventListener('click', openInvitation);
  if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

  // ─── LÓGICA DEL RUGIDO (AUDIO REAL) ───
  function playRoar() {
    // Reproducir el archivo mp3
    const roarAudio = document.getElementById('roar-sound');
    if (roarAudio) {
      roarAudio.volume = 0.3; 
      roarAudio.currentTime = 0; 
      roarAudio.play().catch(e => console.log("Autoplay del rugido bloqueado", e));
    }

    // Vibración háptica en celulares
    try {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 400, 100, 600]); 
      }
    } catch(e){}
  }

  // ─── LÓGICA DEL CONFETI OPTIMIZADO (FÍSICA DE EXPLOSIÓN) ───
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [], animId;
    const colors = ['#aaff00','#ffb300','#ff6f00','#4caf50','#e53935','#fff176','#80cbc4'];
    const emojis = ['🦖','🦕','🌿','🥚','⭐'];

    function resize(){ 
      canvas.width = window.innerWidth; 
      canvas.height = window.innerHeight; 
    }
    window.addEventListener('resize', resize); 
    resize();

    function spawn(){
      // Recálculo clave para pantallas móviles
      resize(); 

      // Calculamos el origen dinámico: el centro del huevo
      const egg = document.getElementById('egg-wrap');
      let originX = canvas.width / 2;
      let originY = canvas.height / 2;

      if (egg) {
        const rect = egg.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
      }

      for(let i = 0; i < 150; i++){
        const isEmoji = Math.random() < 0.12;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 20 + 5;

        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * velocity,
          vy: (Math.sin(angle) * velocity) - 12,
          rot: Math.random() * 360,
          rotV: (Math.random() - 0.5) * 15,
          size: isEmoji ? 18 + Math.random() * 12 : 8 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
          alpha: 1
        });
      }
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles = particles.filter(p => p.alpha > 0.05);

      particles.forEach(p => {
        p.vy += 0.8; 
        p.vx *= 0.97; 
        p.vy *= 0.98; 

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

  // ─── LÓGICA DE APERTURA ─────────────────────────────────
  function openInvitation() {
    const egg=document.getElementById('egg');
    const fog=document.getElementById('fog-overlay'), splash=document.getElementById('splash');
    
    if(egg) egg.classList.add('shake');
    
    setTimeout(()=>{ 
      if(egg) egg.classList.remove('shake'); 
      if(eggWrap) eggWrap.classList.add('cracking'); 
    },600);
    
    setTimeout(()=>{ 
      playRoar(); // Ejecuta el audio del rugido y la vibración
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

  // ─── NAVEGACIÓN CON DOTS LATERAELS ──────────────────────
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