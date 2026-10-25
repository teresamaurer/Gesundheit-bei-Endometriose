/**
 * Gesundheit trotz Endometriose - Interaktive Funktionen
 * Atem-Oase (Vagusnerv-Atmung), Tab-Umschaltung, Akkordeons, Audio-Klangschale & Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initPillarTabs();
  initBreathingTool();
  initFaqAccordion();
  initContactForm();
  initSmoothScroll();
});

/* ==========================================================================
   1. MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');

  if (!toggleBtn || !mainNav) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
    toggleBtn.innerHTML = isOpen 
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
  });

  // Schließen bei Klick auf Menüpunkt
  document.querySelectorAll('.nav-item a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });
  });
}

/* ==========================================================================
   2. PILLAR TABS (DIE 6 SÄULEN)
   ========================================================================== */
function initPillarTabs() {
  const tabButtons = document.querySelectorAll('.pillar-tab-btn');
  const tabPanels = document.querySelectorAll('.pillar-tab-content');

  function switchTab(targetId) {
    tabButtons.forEach(btn => {
      const isTarget = btn.getAttribute('data-pillar') === targetId;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget);
    });

    tabPanels.forEach(panel => {
      const isTarget = panel.id === `pillar-${targetId}`;
      panel.classList.toggle('active', isTarget);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-pillar');
      switchTab(targetId);
    });
  });

  // Klick auf Übersichtskarten leitet direkt zum jeweiligen Tab und scrollt dorthin
  document.querySelectorAll('.pillar-link, .pillar-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const target = card.getAttribute('data-target-pillar');
      if (target) {
        e.preventDefault();
        switchTab(target);
        const section = document.getElementById('saeulen-details');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

/* ==========================================================================
   3. ATEM-OASE: VAGUSNERV-ATMUNG (4-4-6 & BIENENATMUNG)
   ========================================================================== */
function initBreathingTool() {
  const startBtn = document.getElementById('startBreathingBtn');
  const soundBtn = document.getElementById('toggleSoundBtn');
  const instructionEl = document.getElementById('breathingInstruction');
  const timerEl = document.getElementById('breathingTimer');
  const statusEl = document.getElementById('breathingStatus');
  const mandalaBg = document.getElementById('breathingMandala');
  const innerCircle = document.getElementById('breathingInner');
  const affirmationEl = document.getElementById('breathingAffirmation');
  const modeBtns = document.querySelectorAll('.breathing-mode-btn');
  const modeDescEl = document.getElementById('breathingModeDesc');

  if (!startBtn || !instructionEl) return;

  let isRunning = false;
  let isSoundEnabled = false;
  let timerInterval = null;
  let phaseTimeout = null;
  let audioCtx = null;
  let activeHumNode = null;
  let activeMode = '446';
  let currentPhaseIdx = 0;
  let remainingSeconds = 0;
  let affirmationIdx = 0;

  // Konfiguration der Atemtechniken
  const breathingModes = {
    '446': {
      id: '446',
      name: '4-4-6 Vagus-Atmung',
      initialTimer: '4-4-6',
      initialStatus: 'Klicke auf Start für sanfte 4-4-6 Atmung',
      description: 'Der heilsame 4-4-6 Rhythmus signalisiert deinem Beckenboden und deinem Vagusnerv: „Du bist sicher.“ Die verlängerte Ausatmung senkt nachweislich die Schmerzwahrnehmung im Gehirn.',
      phases: [
        { name: 'Einatmen', duration: 4, action: 'Sanft durch die Nase füllen', scale: 1.35, freq: 432, color: 'rgba(212, 139, 123, 0.45)', isHumming: false },
        { name: 'Halten', duration: 4, action: 'In der Stille verweilen', scale: 1.35, freq: 528, color: 'rgba(194, 155, 99, 0.4)', isHumming: false },
        { name: 'Ausatmen', duration: 6, action: 'Lippenbremse & Becken entspannen', scale: 1.0, freq: 396, color: 'rgba(118, 141, 114, 0.35)', isHumming: false }
      ],
      affirmations: [
        "Mein Becken darf weich, warm und entspannt sein.",
        "Ich begegne meinem Körper mit Liebe statt mit Kampf.",
        "Jeder sanfte Atemzug schenkt meinem Nervensystem Sicherheit.",
        "Ich ehre das Bedürfnis meines Körpers nach echter Ruhe.",
        "Heilung ist mein natürlicher Zustand.",
        "Ich bin voller Kraft, Sanftheit und Vertrauen."
      ]
    },
    'bee': {
      id: 'bee',
      name: 'Bienenatmung (Bhramari)',
      initialTimer: '4 - 8',
      initialStatus: 'Klicke auf Start & summe beim Ausatmen',
      description: 'Die Bienenatmung (Bhramari) beruhigt durch das sanfte Summen („Mmm“) direkt den Vagusnerv. Durch die doppelt so lange Ausatmung sinkt der Muskeltonus im Becken und innere Schmerzanspannung löst sich.',
      phases: [
        { name: 'Einatmen', duration: 4, action: 'Ruhig durch die Nase einatmen', scale: 1.35, freq: 432, color: 'rgba(212, 139, 123, 0.45)', isHumming: false },
        { name: 'Ausatmen & Summen', duration: 8, action: 'Mit geschlossenem Mund summen („Mmm“)', scale: 1.0, freq: 216, color: 'rgba(194, 155, 99, 0.45)', isHumming: true }
      ],
      affirmations: [
        "Die sanfte Vibration löst alle Anspannung in meinem Becken.",
        "Mein Vagusnerv bringt tiefe Ruhe und Geborgenheit in jede Zelle.",
        "Mit jedem Summen fließt krampfartige Enge sanft aus meinem Körper.",
        "Ich erlaube meinem Unterleib, weich, warm und gelöst zu sein.",
        "Mein Atem wiegt mich sanft in Sicherheit.",
        "Tiefer Frieden und Leichtigkeit breiten sich in mir aus."
      ]
    }
  };

  // Sound mit Web Audio API erzeugen (sanfter obertonreicher Klangschalen-Ton)
  function playBowlSound(freq = 432) {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 2.6);
    } catch (e) {
      console.log('Audio init prevented:', e);
    }
  }

  // Sanfter Summton für die Bienenatmung (Solfeggio 174 Hz mit weichen Obertönen)
  function playHumDrone(duration = 8) {
    if (!isSoundEnabled) return;
    stopHumSound();
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // 174 Hz (Solfeggio-Frequenz für Schmerzlinderung & Entspannung)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(174, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(174 * 2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);

      gainNode.gain.setValueAtTime(0.001, now);
      // Sanftes Einblenden (0.5s)
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.5);
      // Gleichmäßig halten bis kurz vor Phasenende
      const sustainTime = Math.max(0.6, duration - 0.8);
      gainNode.gain.setValueAtTime(0.08, now + sustainTime);
      // Sanftes Ausblenden
      gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);

      activeHumNode = { osc1, osc2, gainNode };
    } catch (e) {
      console.log('Hum sound prevented:', e);
    }
  }

  function stopHumSound() {
    if (activeHumNode) {
      try {
        const { osc1, osc2, gainNode } = activeHumNode;
        if (audioCtx && gainNode) {
          gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
          gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        }
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
            gainNode.disconnect();
          } catch (e) {}
        }, 150);
      } catch (e) {}
      activeHumNode = null;
    }
  }

  function runNextPhase() {
    if (!isRunning) return;

    const currentMode = breathingModes[activeMode];
    const phases = currentMode.phases;
    const phase = phases[currentPhaseIdx];
    remainingSeconds = phase.duration;

    instructionEl.textContent = phase.name;
    statusEl.textContent = phase.action;
    timerEl.textContent = `${remainingSeconds}s`;

    // Visuelle Transformation synchron zur Phasenlänge (z.B. 4s vs. 8s)
    if (mandalaBg && innerCircle) {
      mandalaBg.style.transition = `transform ${phase.duration}s ease-in-out`;
      innerCircle.style.transition = `transform ${phase.duration}s ease-in-out, background ${phase.duration}s ease`;

      mandalaBg.style.transform = `scale(${phase.scale}) rotate(${currentPhaseIdx * 45}deg)`;
      innerCircle.style.transform = `scale(${phase.scale})`;
      innerCircle.style.backgroundColor = phase.color;

      if (phase.isHumming) {
        innerCircle.classList.add('is-humming');
      } else {
        innerCircle.classList.remove('is-humming');
      }
    }

    stopHumSound();
    playBowlSound(phase.freq);
    if (phase.isHumming) {
      playHumDrone(phase.duration);
    }

    // Affirmation bei jedem neuen Zyklus wechseln
    const affirmations = currentMode.affirmations;
    if (currentPhaseIdx === 0 && affirmationEl) {
      affirmationEl.style.opacity = 0;
      setTimeout(() => {
        affirmationEl.textContent = `„${affirmations[affirmationIdx % affirmations.length]}“`;
        affirmationEl.style.opacity = 1;
        affirmationIdx++;
      }, 300);
    }

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds >= 0) {
        timerEl.textContent = `${remainingSeconds}s`;
      }
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        currentPhaseIdx = (currentPhaseIdx + 1) % phases.length;
        runNextPhase();
      }
    }, 1000);
  }

  function startBreathing() {
    isRunning = true;
    currentPhaseIdx = 0;
    startBtn.textContent = 'Pause machen';
    startBtn.classList.replace('btn-primary', 'btn-outline');
    runNextPhase();
  }

  function stopBreathing() {
    isRunning = false;
    clearInterval(timerInterval);
    clearTimeout(phaseTimeout);
    stopHumSound();

    startBtn.textContent = 'Atem-Oase starten';
    startBtn.classList.replace('btn-outline', 'btn-primary');
    instructionEl.textContent = 'Bereit';

    const currentMode = breathingModes[activeMode];
    statusEl.textContent = currentMode.initialStatus;
    timerEl.textContent = currentMode.initialTimer;

    if (mandalaBg && innerCircle) {
      mandalaBg.style.transition = 'transform 0.5s ease-in-out';
      innerCircle.style.transition = 'transform 0.5s ease-in-out, background 0.5s ease';
      mandalaBg.style.transform = 'scale(1) rotate(0deg)';
      innerCircle.style.transform = 'scale(1)';
      innerCircle.style.backgroundColor = '';
      innerCircle.classList.remove('is-humming');
    }
  }

  function switchMode(newModeId) {
    if (!breathingModes[newModeId] || activeMode === newModeId) return;

    if (isRunning) {
      stopBreathing();
    }

    activeMode = newModeId;
    const mode = breathingModes[activeMode];

    // Buttons aktualisieren
    modeBtns.forEach(btn => {
      const isActive = btn.dataset.mode === activeMode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Beschreibung aktualisieren
    if (modeDescEl) {
      modeDescEl.style.opacity = '0';
      setTimeout(() => {
        modeDescEl.textContent = mode.description;
        modeDescEl.style.opacity = '1';
      }, 200);
    }

    // Anzeige auf Anfangszustand des neuen Modus setzen
    instructionEl.textContent = 'Bereit';
    statusEl.textContent = mode.initialStatus;
    timerEl.textContent = mode.initialTimer;

    if (mandalaBg && innerCircle) {
      mandalaBg.style.transition = 'transform 0.4s ease-in-out';
      innerCircle.style.transition = 'transform 0.4s ease-in-out, background 0.4s ease';
      mandalaBg.style.transform = 'scale(1) rotate(0deg)';
      innerCircle.style.transform = 'scale(1)';
      innerCircle.style.backgroundColor = '';
      innerCircle.classList.remove('is-humming');
    }

    // Passende erste Affirmation anzeigen
    affirmationIdx = 0;
    if (affirmationEl) {
      affirmationEl.textContent = `„${mode.affirmations[0]}“`;
    }
  }

  // Modus-Umschalter Event Listener
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode) switchMode(mode);
    });
  });

  startBtn.addEventListener('click', () => {
    if (isRunning) {
      stopBreathing();
    } else {
      startBreathing();
    }
  });

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      soundBtn.setAttribute('aria-pressed', isSoundEnabled);
      soundBtn.innerHTML = isSoundEnabled
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Ton an'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> Ton aus';
      if (isSoundEnabled) {
        playBowlSound(528);
        const currentMode = breathingModes[activeMode];
        const currentPhase = currentMode.phases[currentPhaseIdx];
        if (isRunning && currentPhase && currentPhase.isHumming) {
          playHumDrone(remainingSeconds);
        }
      } else {
        stopHumSound();
      }
    });
  }
}

/* ==========================================================================
   4. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Schließe andere für aufgeräumte Übersicht
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('active', !isActive);
      questionBtn.setAttribute('aria-expanded', (!isActive).toString());
    });
  });
}

/* ==========================================================================
   5. KONTAKTFORMULAR & NOTIFICATIONS
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const topicInput = document.getElementById('contactTopic');
    const messageInput = document.getElementById('contactMessage');

    const name = nameInput ? nameInput.value.trim() : 'Liebe Ratsuchende';

    showToast(`Vielen Dank, ${name}! Deine Nachricht wurde mit viel Achtsamkeit empfangen. Ich melde mich innerhalb von 24 Stunden bei dir.`);
    form.reset();
  });
}

function showToast(message) {
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'siteToast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="toast-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    </div>
    <div class="toast-text">${message}</div>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

/* ==========================================================================
   6. SMOOTH SCROLL & ACTIVE LINK HIGHLIGHTING
   ========================================================================== */
function initSmoothScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-item a');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}
