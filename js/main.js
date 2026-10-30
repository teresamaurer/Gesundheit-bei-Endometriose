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
  initPageRouter();
  initOrganVisualization();
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
      const target = card.getAttribute('data-target-pillar') || card.closest('.pillar-card')?.getAttribute('data-target-pillar');
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
      description: 'Der heilsame 4-4-6 Rhythmus signalisiert meinem Beckenboden und meinem Vagusnerv: „Du bist in Sicherheit.“ Die sanft verlängerte Ausatmung fördert spürbar die Entspannung und schenkt meinem Gehirn tiefe Ruhe.',
      phases: [
        { name: 'Einatmen', duration: 4, action: 'Sanft durch die Nase füllen', scale: 1.35, freq: 432, color: 'rgba(212, 139, 123, 0.45)', isHumming: false },
        { name: 'Halten', duration: 4, action: 'In der Stille verweilen', scale: 1.35, freq: 528, color: 'rgba(194, 155, 99, 0.4)', isHumming: false },
        { name: 'Ausatmen', duration: 6, action: 'Lippenbremse & Becken entspannen', scale: 1.0, freq: 396, color: 'rgba(118, 141, 114, 0.35)', isHumming: false }
      ],
      affirmations: [
        "Ich bin stark. In mir wohnt eine unerschütterliche, stille Kraft.",
        "Ich habe Geduld mit mir und schenke meinem Körper die Zeit, die er braucht.",
        "Ich darf mich in Akzeptanz üben – dieser Moment darf genau so sein.",
        "Ich werde jeden Tag mehr zur besten Expertin für mich selbst.",
        "Mein Becken darf weich, warm und vollkommen in Sicherheit sein.",
        "Ich begegne meinem Körper mit tiefer Liebe, Fürsorge und Verständnis.",
        "Ich erlaube mir Leichtigkeit, Freude und Ruhe. Ich bin wundervoll so, wie ich bin.",
        "Jeder sanfte Atemzug schenkt meinem Nervensystem tiefen Frieden."
      ]
    },
    'bee': {
      id: 'bee',
      name: 'Bienenatmung (Bhramari)',
      initialTimer: '4 - 8',
      initialStatus: 'Klicke auf Start & summe beim Ausatmen',
      description: 'Die Bienenatmung (Bhramari) beruhigt durch das sanfte Summen („Mmm“) direkt den Vagusnerv. Durch die doppelt so lange Ausatmung entspannt sich das Becken wunderbar und wohltuende Weite breitet sich aus.',
      phases: [
        { name: 'Einatmen', duration: 4, action: 'Ruhig durch die Nase einatmen', scale: 1.35, freq: 432, color: 'rgba(212, 139, 123, 0.45)', isHumming: false },
        { name: 'Ausatmen & Summen', duration: 8, action: 'Mit geschlossenem Mund summen („Mmm“)', scale: 1.0, freq: 216, color: 'rgba(194, 155, 99, 0.45)', isHumming: true }
      ],
      affirmations: [
        "Ich bin stark, geduldig und sanft mit mir selbst.",
        "Ich übe mich in Akzeptanz und schenke meinem Körper volles Vertrauen.",
        "Die sanfte Vibration schenkt meinem Becken wohltuende Weite, Weichheit und Entspannung.",
        "Mein Vagusnerv bringt tiefe Ruhe und Geborgenheit in jede Zelle.",
        "Ich werde Schritt für Schritt zur besten Expertin für meine Gesundheit.",
        "Ich ehre das Bedürfnis meines Körpers nach Stille und Erholung.",
        "Mit jedem Summen entfalten sich wohlige Weite, Wärme und Gelassenheit in meinem Körper."
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
   6. PAGE ROUTER (MULTI-PAGE VIEW NAVIGATION)
   ========================================================================== */
function initPageRouter() {
  const pageViews = document.querySelectorAll('.page-view');
  const navLinks = document.querySelectorAll('.nav-links .nav-item a');
  const mainNav = document.getElementById('mainNav');
  const mobileToggle = document.getElementById('mobileMenuToggle');

  // Mapping von URL-Hashes auf Seiten & Unter-Elemente
  const routeMap = {
    'startseite': { page: 'startseite', anchor: null },
    'start': { page: 'startseite', anchor: null },
    'ueber-mich': { page: 'startseite', anchor: 'ueber-mich' },
    'faq': { page: 'startseite', anchor: 'faq' },
    'saeulen': { page: 'saeulen', anchor: null },
    'saeulen-details': { page: 'saeulen', anchor: 'saeulen-details' },
    'alternative-ansaetze': { page: 'alternative-ansaetze', anchor: null },
    'organ-visualisierung': { page: 'organ-visualisierung', anchor: null },
    'organ-visualisierung-hero': { page: 'organ-visualisierung', anchor: 'organ-visualisierung-hero' },
    'organ-karte': { page: 'organ-visualisierung', anchor: 'organ-karte' },
    'organ-uebergaenge': { page: 'organ-visualisierung', anchor: 'organ-uebergaenge' },
    'organ-galerie': { page: 'organ-visualisierung', anchor: 'organ-galerie' },
    'organ-energie': { page: 'organ-visualisierung', anchor: 'organ-energie' },
    'organ-reise': { page: 'organ-visualisierung', anchor: 'organ-reise' },
    'atem-oase': { page: 'atem-oase', anchor: null },
    'sos-hilfe': { page: 'sos-hilfe', anchor: null }
  };

  function switchPage(pageId, anchorId = null, updateHistory = true) {
    const targetPageEl = document.getElementById(`page-${pageId}`)
      || document.querySelector(`.page-view[data-page="${pageId}"]`)
      || document.getElementById('page-start');

    if (!targetPageEl) return;

    const actualPageId = targetPageEl.getAttribute('data-page') || 'startseite';

    // 1. Alle Page-Views verbergen, Ziel-Page anzeigen
    pageViews.forEach(view => {
      view.classList.remove('active');
    });
    targetPageEl.classList.add('active');

    // 2. Navigation-Links aktualisieren
    navLinks.forEach(link => {
      const linkPage = link.getAttribute('data-page') || link.getAttribute('href')?.replace('#', '');
      const isActive = linkPage === actualPageId;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // 3. Mobiles Menü schließen (falls offen)
    if (mainNav && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
      }
    }

    // 4. URL-Historie aktualisieren
    const targetHash = anchorId ? `#${anchorId}` : `#${actualPageId}`;
    if (updateHistory && window.location.hash !== targetHash) {
      history.pushState(null, '', targetHash);
    }

    // 5. Scrollen: Zu spezifischem Anker oder ganz nach oben
    if (anchorId) {
      setTimeout(() => {
        const anchorEl = document.getElementById(anchorId);
        if (anchorEl) {
          anchorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo(0, 0);
    }
  }

  // Behandelt Hash aus URL
  function handleHash() {
    const rawHash = (window.location.hash || '').replace('#', '').trim();
    if (!rawHash) {
      switchPage('startseite', null, false);
      return;
    }

    if (rawHash === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const route = routeMap[rawHash];
    if (route) {
      switchPage(route.page, route.anchor, false);
    } else {
      const el = document.getElementById(rawHash);
      if (el) {
        const parentPage = el.closest('.page-view');
        if (parentPage) {
          const pageId = parentPage.getAttribute('data-page');
          switchPage(pageId, rawHash, false);
          return;
        }
      }
      switchPage('startseite', null, false);
    }
  }

  // Klick-Handler für alle internen Hash-Links (Nav, Hero-Buttons, Footer etc.)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    const hash = href.replace('#', '').trim();

    if (!hash) return;

    if (hash === 'top') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const route = routeMap[hash];
    if (route) {
      e.preventDefault();
      switchPage(route.page, route.anchor, true);
      return;
    }

    const el = document.getElementById(hash);
    if (el) {
      const parentPage = el.closest('.page-view');
      if (parentPage) {
        e.preventDefault();
        const pageId = parentPage.getAttribute('data-page');
        switchPage(pageId, hash, true);
      }
    }
  });

  // Browser Vor/Zurück reagieren
  window.addEventListener('popstate', handleHash);
  window.addEventListener('hashchange', handleHash);

  // Initial ausführen
  handleHash();
}

/* ==========================================================================
   7. HEILSAME ORGAN- & BAUCHRAUM-VISUALISIERUNG
   ========================================================================== */
function initOrganVisualization() {
  // Überprüfen, ob die Seite im DOM vorhanden ist
  const pageContainer = document.getElementById('page-organ-visualisierung');
  if (!pageContainer) return;

  /* ------------------------------------------------------------------------
     A. DATENMODELL DER ORGANE IM GESUNDEN ZUSTAND
     ------------------------------------------------------------------------ */
  const organData = {
    'uterus': {
      id: 'uterus',
      name: 'Gebärmutter',
      latin: 'Uterus',
      category: 'pelvis',
      badge: 'Schoßraum & Becken',
      icon: '🌸',
      color: '#D48B7B',
      freq: 396,
      healthDesc: 'Wie eine weiche, geschützte Knospe im Zentrum deines Beckens. Wunderbar elastisch, prall und rosig durchblutet. Das Muskelgewebe (Myometrium) schwingt frei in alle Richtungen – ohne Schmerzreize, ohne Krampf.',
      transitionDesc: 'Sanft getragen von elastischen Bändern. Nach hinten gleitet sie seidig am Douglas-Raum und Enddarm vorbei; nach vorn federt sie weich an die dehnbare Blase an. Völlige Bewegungsfreiheit bei jedem Atemzug.',
      affirmation: '„Mein Schoßraum ist ein sicherer, warmer Ort. Meine Gebärmutter darf vollkommen weich, entspannt und heilsam durchblutet sein.“',
      cardId: 'card-uterus'
    },
    'ovaries': {
      id: 'ovaries',
      name: 'Eierstöcke & Eileiter',
      latin: 'Ovarien & Tuben',
      category: 'pelvis',
      badge: 'Schoßraum & Becken',
      icon: '✨',
      color: '#C29B63',
      freq: 432,
      healthDesc: 'Zwei mandelförmige, perlmuttfarben schimmernde Juwelen. Die Fimbrien der Eileiter fächeln sanft wie zarte Blütenblätter. Frei von Zysten, Entzündungen oder Verwachsungen – lebendig pulsierend im Rhythmus des Mondes.',
      transitionDesc: 'Schweben frei beweglich an der seitlichen Beckenwand über den Darmschlingen, ohne irgendwo anzuhaften. Sie schwingen elastisch mit jedem Schritt mit.',
      affirmation: '„Meine Eierstöcke pulsieren im heilsamen Rhythmus der Natur. Ich segne meine weibliche Schöpferkraft.“',
      cardId: 'card-ovaries'
    },
    'douglas': {
      id: 'douglas',
      name: 'Douglas-Raum & Bauchfell',
      latin: 'Excavatio rectouterina & Peritoneum',
      category: 'pelvis',
      badge: 'Schoßraum & Becken',
      icon: '🌊',
      color: '#768D72',
      freq: 528,
      healthDesc: 'Spiegelglatt wie feuchter Seidenstoff. Eine hauchdünne, klare Schicht Peritonealflüssigkeit benetzt diesen Raum. Vollkommen frei von Narbengewebe, Entzündungshitze oder Verklebungen – ein reiner Raum des reibungslosen Fließens.',
      transitionDesc: 'Ermöglicht es Gebärmutterhinterwand und Mastdarm, wie zwei nasse Seidentücher absolut widerstands- und schmerzfrei aneinander vorbeizugleiten.',
      affirmation: '„Der Raum hinter meiner Gebärmutter ist frei, weit, seidig glatt und vollkommen entspannt.“',
      cardId: 'card-douglas'
    },
    'bladder': {
      id: 'bladder',
      name: 'Harnblase',
      latin: 'Vesica urinaria',
      category: 'pelvis',
      badge: 'Schoßraum & Becken',
      icon: '🕊️',
      color: '#D48B7B',
      freq: 432,
      healthDesc: 'Ein geschmeidiger, elastischer Hohlmuskel mit glatter, gesunder Schleimhaut. Passt sich sanft und flexibel ihrem Füllstand an – ohne Reizungen, Druckgefühl oder Brennen. Ein Ort des vertrauensvollen Loslassens.',
      transitionDesc: 'Ruht weich vor der Gebärmutter auf dem Beckenboden. Eine feine Bindegewebsschicht federt jede Bewegung sanft ab.',
      affirmation: '„Meine Blase ist entspannt, weit und weich. Ich darf Altes vertrauensvoll loslassen.“',
      cardId: 'card-bladder'
    },
    'pelvicfloor': {
      id: 'pelvicfloor',
      name: 'Beckenboden',
      latin: 'Diaphragma pelvis',
      category: 'pelvis',
      badge: 'Schoßraum & Becken',
      icon: '🪷',
      color: '#768D72',
      freq: 396,
      healthDesc: 'Eine dreischichtige, hochelastische Hängematte. Sie trägt alle Beckenorgane mit souveräner Leichtigkeit, federt mit jedem Atemzug mit und lässt jede alte Schutzspannung liebevoll los.',
      transitionDesc: 'Bildet das tragende Fundament unter Blase, Gebärmutter und Enddarm und kommuniziert synchron mit dem Zwerchfell.',
      affirmation: '„Mein Beckenboden ist ein warmes, tragendes Nest. Er darf weich schwingen und allen Druck loslassen.“',
      cardId: 'card-diaphragm'
    },
    'intestines': {
      id: 'intestines',
      name: 'Darmtrakt (Dünn- & Dickdarm)',
      latin: 'Intestinum (Colon & Ileum)',
      category: 'digestion',
      badge: 'Verdauung & Mitte',
      icon: '🥑',
      color: '#C29B63',
      freq: 528,
      healthDesc: 'Rosig, warm und von sanften, rhythmischen Wellen (Peristaltik) durchströmt wie ein ruhiges Meer. Das Mikrobiom floriert in Harmonie, die Schleimhautbarriere ist dicht und stark.',
      transitionDesc: 'Die Darmschlingen gleiten frei und ungestört über Gebärmutter, Eierstöcke und Beckenwand. Das Rektum gleitet sanft hinter dem Douglas-Raum.',
      affirmation: '„Mein Darm arbeitet in friedlicher Ruhe und Leichtigkeit. Sanfte Wellen des Wohlbefindens durchströmen mich.“',
      cardId: 'card-intestines'
    },
    'liver': {
      id: 'liver',
      name: 'Leber & Gallenblase',
      latin: 'Hepar & Vesica biliaris',
      category: 'digestion',
      badge: 'Verdauung & Mitte',
      icon: '🌿',
      color: '#B96F60',
      freq: 432,
      healthDesc: 'Samtig rotbraun, kraftvoll und weich wie Seide. Sie filtert und reinigt unermüdlich dein Blut, baut überschüssige Östrogene gelassen ab und schenkt deinem Körper vitale Energie und Leichtigkeit.',
      transitionDesc: 'Schmiegt sich harmonisch an die Unterseite des Zwerchfells an. Wird mit jedem Atemzug sanft massiert und massiert ihrerseits Magen und Darm.',
      affirmation: '„Meine Leber reinigt und erneuert mein Blut mit kraftvoller Ruhe. Sie balanciert meine Hormone in Perfektion.“',
      cardId: 'card-liver'
    },
    'stomach': {
      id: 'stomach',
      name: 'Magen & Bauchspeicheldrüse',
      latin: 'Gaster & Pankreas',
      category: 'digestion',
      badge: 'Verdauung & Mitte',
      icon: '🔥',
      color: '#C29B63',
      freq: 528,
      healthDesc: 'Ein wohlig warmes Verdauungsfeuer ohne brennende Entzündungshitze. Die Magenschleimhaut ist samtig geschützt, die Bauchspeicheldrüse spendet fein ausbalancierte Enzyme.',
      transitionDesc: 'Gebettet im linken Oberbauch, atmet synchron mit dem Zwerchfell und gibt den Nahrungsbrei sanft an den Zwölffingerdarm weiter.',
      affirmation: '„Meine Mitte ist warm, genährt und in Balance. Ich nehme das Gute auf und wandle es in reine Lebenskraft.“',
      cardId: 'card-stomach'
    },
    'kidneys': {
      id: 'kidneys',
      name: 'Nieren & Nebennieren',
      latin: 'Renes & Glandulae suprarenales',
      category: 'vitality',
      badge: 'Vitalität & Rhythmus',
      icon: '💧',
      color: '#768D72',
      freq: 432,
      healthDesc: 'In ein weiches, warmes Fettlager an den Flanken gebettet. Die Nieren filtern dein Blut in gelassener Stetigkeit. Die goldenen Nebennieren dürfen loslassen: Dauerstress weicht tiefer Ruhe.',
      transitionDesc: 'Gleiten sanft am großen Lendenmuskel (Psoas) bei jedem Schritt mit. Über die feinen Harnleiter elastisch mit der Blase verbunden.',
      affirmation: '„Meine Nieren sind voller tiefer Lebenskraft. Meine Nebennieren schalten auf tiefe Erholung und Ruhe.“',
      cardId: 'card-kidneys'
    },
    'diaphragm': {
      id: 'diaphragm',
      name: 'Zwerchfell & Atemwiege',
      latin: 'Diaphragma',
      category: 'vitality',
      badge: 'Vitalität & Rhythmus',
      icon: '🌬️',
      color: '#768D72',
      freq: 432,
      healthDesc: 'Eine weite, geschmeidige Kuppel aus pulsierendem Muskelgewebe. Sie senkt sich mit jedem Einatmen sanft nach unten und massiert Leber, Magen, Darm und Nieren mit heilsamer Zuwendung.',
      transitionDesc: 'Bildet das obere atmende Dach der Bauchhöhle und ist über große Faszienzüge mit Perikard, Wirbelsäule und Beckenboden verknüpft.',
      affirmation: '„Mein Zwerchfell atmet frei und schenkt allen meinen Organen eine sanfte, beruhigende Wiegenmassage.“',
      cardId: 'card-diaphragm'
    },
    'fascia': {
      id: 'fascia',
      name: 'Fasziennetz & Gleiträume',
      latin: 'Fascia abdominalis & Peritoneum',
      category: 'vitality',
      badge: 'Vitalität & Rhythmus',
      icon: '🕸️',
      color: '#C29B63',
      freq: 528,
      healthDesc: 'Kristallklar, reich an Hyaluronsäure und Feuchtigkeit, hochelastisch wie ein feines Spinnennetz. Es bettet alle Organe schützend ein und lässt sie mühelos aneinander vorbeigleiten.',
      transitionDesc: 'Verbindet jedes einzelne Organ mit der Wirbelsäule und der Bauchwand zu einem harmonischen, atmenden Gesamtkunstwerk.',
      affirmation: '„Mein Bindegewebe ist feucht, elastisch und frei. Alle Organe tanzen in harmonischer Eintracht.“',
      cardId: 'card-fascia'
    },
    'all': {
      id: 'all',
      name: 'Gesamter Bauch- & Schoßraum',
      latin: 'Abdomen & Pelvis',
      category: 'all',
      badge: 'Ganzheitliche Harmonie',
      icon: '🌟',
      color: '#C29B63',
      freq: 432,
      healthDesc: 'Ein lebendiger, durchwärmter Raum voller Licht, Geschmeidigkeit und sanfter Kooperation. Alle Organe sind in heilsamem Rhythmus miteinander verbunden.',
      transitionDesc: 'Flüssige Gleiträume, freie Ligamente und eine geschmeidige Peritonealflüssigkeit ermöglichen pure Schmerzfreiheit und Mobilität.',
      affirmation: '„Mein gesamter Bauchraum ist ein sicherer, friedvoller Ort voller Licht, Gesundheit und Vitalität.“',
      cardId: 'organ-karte'
    }
  };

  /* ------------------------------------------------------------------------
     B. AUDIO-KLANGSCHALENSYNTHESE FÜR HEILSAME ENERGIE
     ------------------------------------------------------------------------ */
  let energyAudioCtx = null;
  let isEnergySoundOn = true;

  function playHealingTone(baseFreq = 432, type = 'gold') {
    if (!isEnergySoundOn) return;

    try {
      if (!energyAudioCtx) {
        energyAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (energyAudioCtx.state === 'suspended') {
        energyAudioCtx.resume();
      }

      const now = energyAudioCtx.currentTime;

      // Klangschalen-Harmonik: Grundton + Quinte / Oktave
      let freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2.0];
      if (type === 'rose') {
        freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Wärmere Terz
      } else if (type === 'emerald') {
        freqs = [baseFreq, baseFreq * 1.333, baseFreq * 2.0]; // Reine Quarte & Oktave
      }

      freqs.forEach((freq, idx) => {
        const osc = energyAudioCtx.createOscillator();
        const gain = energyAudioCtx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const peakGain = (0.16 / (idx + 1));
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(peakGain, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

        osc.connect(gain);
        gain.connect(energyAudioCtx.destination);

        osc.start(now);
        osc.stop(now + 3.5);
      });
    } catch (err) {
      console.warn('AudioContext not allowed or not supported:', err);
    }
  }

  // Sound-Button im Energie-Ritual
  const soundBtn = document.getElementById('btnToggleEnergySound');
  const soundIcon = document.getElementById('energySoundIcon');
  const soundText = document.getElementById('energySoundText');

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      isEnergySoundOn = !isEnergySoundOn;
      soundBtn.setAttribute('aria-pressed', isEnergySoundOn);
      if (isEnergySoundOn) {
        soundIcon.textContent = '🔔';
        soundText.textContent = 'Klangschale: An';
        soundBtn.classList.remove('btn-outline');
        soundBtn.classList.add('btn-primary');
        playHealingTone(432, 'gold');
      } else {
        soundIcon.textContent = '🔕';
        soundText.textContent = 'Klangschale: Stumm';
        soundBtn.classList.add('btn-outline');
        soundBtn.classList.remove('btn-primary');
      }
    });
  }

  /* ------------------------------------------------------------------------
     C. INTERAKTIVE ANATOMIE-KARTE & FOKUSFENSTER
     ------------------------------------------------------------------------ */
  const interactiveGroups = document.querySelectorAll('.organ-interactive-group');
  const filterBtns = document.querySelectorAll('.organ-filter-btn');
  const focusBadge = document.getElementById('focusCategoryBadge');
  const focusLatin = document.getElementById('focusLatinName');
  const focusTitle = document.getElementById('focusTitle');
  const focusHealth = document.getElementById('focusHealthDesc');
  const focusTransition = document.getElementById('focusTransitionDesc');
  const focusAffirmation = document.getElementById('focusAffirmation');
  const btnFocusSendEnergy = document.getElementById('btnFocusSendEnergy');
  const btnFocusViewDetail = document.getElementById('btnFocusViewDetail');

  let currentSelectedOrganId = 'uterus';

  function updateOrganFocus(organId) {
    const data = organData[organId] || organData['uterus'];
    currentSelectedOrganId = organId;

    // 1. Fokusfenster aktualisieren
    if (focusTitle) focusTitle.textContent = data.name;
    if (focusLatin) focusLatin.textContent = data.latin;
    if (focusBadge) focusBadge.textContent = data.badge;
    if (focusHealth) focusHealth.textContent = data.healthDesc;
    if (focusTransition) focusTransition.textContent = data.transitionDesc;
    if (focusAffirmation) focusAffirmation.textContent = data.affirmation;

    if (btnFocusViewDetail) {
      btnFocusViewDetail.setAttribute('href', `#${data.cardId}`);
    }

    // 2. SVG-Klassen aktualisieren (Aktivieren)
    interactiveGroups.forEach(grp => {
      const isTarget = grp.getAttribute('data-organ') === organId;
      grp.classList.toggle('active', isTarget);
    });

    // 3. Dropdown im Energie-Ritual synchronisieren
    const energySelect = document.getElementById('energyOrganSelector');
    if (energySelect && energySelect.value !== organId) {
      energySelect.value = organId;
      updateEnergyStageOrgan(organId);
    }
  }

  // Klick- & Tastatur-Events auf SVG-Organen
  interactiveGroups.forEach(grp => {
    const organId = grp.getAttribute('data-organ');

    grp.addEventListener('click', () => {
      updateOrganFocus(organId);
    });

    grp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updateOrganFocus(organId);
      }
    });

    // Subtiler Hover-Fokus
    grp.addEventListener('mouseenter', () => {
      if (currentSelectedOrganId !== organId) {
        grp.classList.add('hovered');
      }
    });

    grp.addEventListener('mouseleave', () => {
      grp.classList.remove('hovered');
    });
  });

  // Filter-Buttons (Alle / Schoßraum / Verdauung / Vitalität)
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      // SVG Organe ein- oder ausblenden (Dimmen)
      interactiveGroups.forEach(grp => {
        const cat = grp.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          grp.classList.remove('dimmed');
        } else {
          grp.classList.add('dimmed');
        }
      });

      // Erstes passendes Organ fokussieren
      let firstMatch = null;
      interactiveGroups.forEach(grp => {
        if (!firstMatch && (filter === 'all' || grp.getAttribute('data-category') === filter)) {
          firstMatch = grp.getAttribute('data-organ');
        }
      });

      if (firstMatch) {
        updateOrganFocus(firstMatch);
      }
    });
  });

  // Klick auf "Heilsame Energie senden" im Fokusfenster
  if (btnFocusSendEnergy) {
    btnFocusSendEnergy.addEventListener('click', () => {
      const targetSec = document.getElementById('organ-energie');
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      updateEnergyStageOrgan(currentSelectedOrganId);
    });
  }

  /* ------------------------------------------------------------------------
     D. ORGAN-GALERIE: ENERGIE-BUTTONS
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.btn-card-energy').forEach(btn => {
    btn.addEventListener('click', () => {
      const organId = btn.getAttribute('data-target-organ');
      if (organId) {
        updateOrganFocus(organId);
        const energySelect = document.getElementById('energyOrganSelector');
        if (energySelect) {
          energySelect.value = organId;
        }
        updateEnergyStageOrgan(organId);
        const targetSec = document.getElementById('organ-energie');
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ------------------------------------------------------------------------
     E. INTERAKTIVES ENERGIE-RITUAL
     ------------------------------------------------------------------------ */
  const energySelect = document.getElementById('energyOrganSelector');
  const freqButtons = document.querySelectorAll('.freq-btn');
  const btnStartRitual = document.getElementById('btnStartEnergyRitual');
  const btnEnergyLabel = document.getElementById('btnEnergyLabel');
  const energyStage = document.getElementById('energyStage');
  const stageTitle = document.getElementById('energyStageTitle');
  const stageGuide = document.getElementById('energyStageGuide');
  const stageAffirmation = document.getElementById('energyStageAffirmation');
  const stageOrbIcon = document.getElementById('energyOrbIcon');
  const progressWrapper = document.getElementById('energyProgressWrapper');
  const progressFill = document.getElementById('energyProgressFill');
  const timerText = document.getElementById('energyTimerText');
  const statusTag = document.getElementById('energyStatusTag');

  let activeFreqType = 'gold'; // 'gold', 'rose', 'emerald'
  let isRitualRunning = false;
  let ritualTimer = null;
  let ritualInterval = null;

  function updateEnergyStageOrgan(organId) {
    const data = organData[organId] || organData['uterus'];
    if (stageTitle) stageTitle.textContent = `Heilsame Energie für: ${data.name}`;
    if (stageOrbIcon) stageOrbIcon.textContent = data.icon;
    if (stageAffirmation) stageAffirmation.textContent = data.affirmation;

    if (stageGuide && !isRitualRunning) {
      stageGuide.textContent = `Klicke auf den Button oben. Schließe sanft die Augen, atme tief ein und spüre, wie heilsames Licht direkt in deine/n ${data.name} strömt.`;
    }
  }

  if (energySelect) {
    energySelect.addEventListener('change', () => {
      updateEnergyStageOrgan(energySelect.value);
      if (energySelect.value !== 'all') {
        updateOrganFocus(energySelect.value);
      }
    });
  }

  // Frequenz-Wahl (Gold / Rose / Emerald)
  freqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      freqButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');

      activeFreqType = btn.getAttribute('data-freq') || 'gold';

      if (energyStage) {
        energyStage.classList.remove('active-gold', 'active-rose', 'active-emerald');
        energyStage.classList.add(`active-${activeFreqType}`);
      }

      // Sanfter Test-Ton beim Umschalten
      playHealingTone(activeFreqType === 'rose' ? 396 : (activeFreqType === 'emerald' ? 528 : 432), activeFreqType);
    });
  });

  // Ritual-Start & Ablauf
  function startEnergyRitual() {
    if (isRitualRunning) {
      stopEnergyRitual(false);
      return;
    }

    isRitualRunning = true;
    const organId = energySelect ? energySelect.value : currentSelectedOrganId;
    const data = organData[organId] || organData['uterus'];

    if (energyStage) {
      energyStage.classList.add('active-running');
      energyStage.classList.remove('active-gold', 'active-rose', 'active-emerald');
      energyStage.classList.add(`active-${activeFreqType}`);
    }

    if (btnStartRitual) {
      btnStartRitual.classList.remove('btn-primary');
      btnStartRitual.classList.add('btn-outline');
    }
    if (btnEnergyLabel) {
      btnEnergyLabel.textContent = 'Ritual beenden';
    }

    if (statusTag) {
      statusTag.textContent = '✨ Heilstrom fließt aktiv';
    }

    if (stageGuide) {
      stageGuide.textContent = `Schließe sanft die Augen. Atme tief in deinen Schoßraum ein. Spüre, wie das ${activeFreqType === 'gold' ? 'goldene Sonnenlicht' : (activeFreqType === 'rose' ? 'sanfte Liebesrosa' : 'smaragdgrüne Quelllicht')} deine/n ${data.name} durchflutet und alles Gewebe rosig, warm, weich und frei macht.`;
    }

    // Audio Gong starten
    playHealingTone(activeFreqType === 'rose' ? 396 : (activeFreqType === 'emerald' ? 528 : 432), activeFreqType);

    // Fortschrittsbalken anzeigen
    if (progressWrapper) progressWrapper.style.display = 'block';
    if (progressFill) progressFill.style.width = '0%';

    let secondsLeft = 30;
    if (timerText) timerText.textContent = `${secondsLeft} Sekunden Heilstrom`;

    const totalSeconds = 30;
    ritualInterval = setInterval(() => {
      secondsLeft--;
      const percent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
      if (progressFill) progressFill.style.width = `${percent}%`;
      if (timerText) timerText.textContent = `${secondsLeft} Sekunden Heilstrom`;

      if (secondsLeft <= 0) {
        stopEnergyRitual(true);
      }
    }, 1000);
  }

  function stopEnergyRitual(completed = false) {
    isRitualRunning = false;
    clearInterval(ritualInterval);
    clearTimeout(ritualTimer);

    if (energyStage) {
      energyStage.classList.remove('active-running');
    }

    if (btnStartRitual) {
      btnStartRitual.classList.add('btn-primary');
      btnStartRitual.classList.remove('btn-outline');
    }
    if (btnEnergyLabel) {
      btnEnergyLabel.textContent = 'Heilsame Energie jetzt senden';
    }

    if (completed) {
      if (statusTag) statusTag.textContent = '✓ Heilsame Energie erfolgreich verankert';
      if (stageGuide) stageGuide.textContent = 'Nimm einen tiefen, dankbaren Atemzug. Dein Körper speichert dieses Bild der Gesundheit, Weichheit und Kraft tief in jeder Zelle.';
      playHealingTone(528, 'gold');
    } else {
      if (statusTag) statusTag.textContent = 'Bereit für dein Heilungs-Ritual';
      if (progressWrapper) progressWrapper.style.display = 'none';
      updateEnergyStageOrgan(energySelect ? energySelect.value : currentSelectedOrganId);
    }
  }

  if (btnStartRitual) {
    btnStartRitual.addEventListener('click', startEnergyRitual);
  }

  /* ------------------------------------------------------------------------
     F. GEFÜHRTE BAUCHRAUM-REISE (MEDITATIVER RUNDGANG)
     ------------------------------------------------------------------------ */
  const journeyStations = [
    {
      id: 'diaphragm',
      number: 'Station 1 von 10',
      name: 'Zwerchfell & Atemwiege',
      icon: '🌬️',
      guidance: 'Beginne ganz oben bei deinem Zwerchfell. Atme tief ein und spüre, wie sich die weite Kuppel sanft nach unten senkt. Wie eine schwingende Glocke gibt sie allen Organen darunter den heilsamen Takt vor. Mit jedem Ausatmen hebt sie sich leicht und schenkt deinem Brustkorb und deinem Herzen wohltuende Weite.',
      affirmation: '„Mein Atem verbindet mich mit unendlicher Ruhe. Mein Zwerchfell massiert meine Organe voller Sanftheit.“'
    },
    {
      id: 'liver',
      number: 'Station 2 von 10',
      name: 'Leber & Gallenblase',
      icon: '🌿',
      guidance: 'Wandere in deinen rechten Oberbauch zu deiner Leber. Spüre ihre samtige Weichheit und ihre enorme Kraft. Sie arbeitet Tag und Nacht in stiller Hingabe, um dein Blut zu klären und deine Hormone in feine Balance zu bringen. Schenke ihr ein inneres Lächeln und wohltuende Wärme.',
      affirmation: '„Meine Leber reinigt und erneuert mein Blut mit kraftvoller Ruhe. Sie balanciert meine Hormone in Perfektion.“'
    },
    {
      id: 'stomach',
      number: 'Station 3 von 10',
      name: 'Magen & Mitte',
      icon: '🔥',
      guidance: 'Gehe nach links hinüber zu deinem Magen und deiner Bauchspeicheldrüse. Stelle dir ein goldenes, wohliges Feuer vor – nicht zu heiß, sondern angenehm wärmend wie eine sanfte Frühlingssonne. Deine Mitte schöpft reine Kraft aus allem, was du aufnimmst.',
      affirmation: '„Meine Mitte ist warm, genährt und in Balance. Ich nehme das Gute auf und wandle es in reine Kraft.“'
    },
    {
      id: 'kidneys',
      number: 'Station 4 von 10',
      name: 'Nieren & Nebennieren',
      icon: '💧',
      guidance: 'Lass deine Aufmerksamkeit in die Flanken nach hinten zu deinen Nieren gleiten. Sie ruhen warm und geschützt. Deine Nebennieren dürfen jegliche Alarmbereitschaft und alten Stress loslassen. Tiefe Entwarnung breitet sich in deinem Nervensystem aus.',
      affirmation: '„Meine Nieren sind voller tiefer Urkraft. Meine Nebennieren schalten auf tiefe Erholung und Ruhe.“'
    },
    {
      id: 'intestines',
      number: 'Station 5 von 10',
      name: 'Darm & Peristaltik',
      icon: '🥑',
      guidance: 'Spüre nun deinen gesamten Darmtrakt in der Mitte deines Bauches. Sieh ihn in weichen, wellenförmigen Bewegungen – wie ein ruhiges Meer an einem sonnigen Sommertag. Alle Darmschlingen gleiten frei und unbeschwert, vollkommen losgelöst von Anspannung.',
      affirmation: '„Mein Darm arbeitet in friedlicher Ruhe und Leichtigkeit. Sanfte Wellen des Wohlbefindens durchströmen mich.“'
    },
    {
      id: 'uterus',
      number: 'Station 6 von 10',
      name: 'Gebärmutter',
      icon: '🌸',
      guidance: 'Sinke nun hinab in das Herz deines Schoßraums – deine Gebärmutter. Sieh sie als wunderschöne, rosig durchblutete Lotusknospe. Sie ist weich, warm und sicher gebettet. Sie darf jeden Schmerz loslassen und sich in vollkommener Weichheit entspannen.',
      affirmation: '„Mein Schoßraum ist ein sicherer, warmer Ort. Meine Gebärmutter ist weich, geschützt und tief geliebt.“'
    },
    {
      id: 'ovaries',
      number: 'Station 7 von 10',
      name: 'Eierstöcke & Eileiter',
      icon: '✨',
      guidance: 'Nimm die zarten Schwingungen deiner Eierstöcke wahr. Sie schweben frei an ihren Bändern wie schimmernde Perlen. Ihre Fimbrien fächeln leicht und durchlässig. Kein Ziehen, kein Festhalten – pure Leichtigkeit und natürliche Weiblichkeit.',
      affirmation: '„Meine Eierstöcke pulsieren im heilsamen Rhythmus der Natur. Ich segne meine weibliche Schöpferkraft.“'
    },
    {
      id: 'douglas',
      number: 'Station 8 von 10',
      name: 'Douglas-Raum & Bauchfell',
      icon: '🌊',
      guidance: 'Richte deinen Fokus auf den Raum hinter deiner Gebärmutter. Sieh ihn wie zwei Lagen feinster, nasser Seide. Ein hauchfeiner Gleitfilm lässt Gebärmutter und Darm vollkommen schmerzfrei und lautlos aneinander vorbeigleiten. Weite, Kühle und Freiheit erfüllen diesen Raum.',
      affirmation: '„Der Raum hinter meiner Gebärmutter ist frei, weit, seidig glatt und vollkommen entspannt.“'
    },
    {
      id: 'bladder',
      number: 'Station 9 von 10',
      name: 'Harnblase',
      icon: '🕊️',
      guidance: 'Spüre deine Harnblase vor der Gebärmutter. Ein geschmeidiger, elastischer Raum, der sich weich dehnt und mühelos loslässt. Das umliegende Bindegewebe federt sanft mit. Frieden und Entlastung ziehen ein.',
      affirmation: '„Meine Blase ist entspannt, weit und weich. Ich darf Altes vertrauensvoll und mühelos loslassen.“'
    },
    {
      id: 'pelvicfloor',
      number: 'Station 10 von 10',
      name: 'Beckenboden',
      icon: '🪷',
      guidance: 'Komme an der Basis deines Körpers an – deinem Beckenboden. Er ist eine weich schwingende, tragende Hängematte. Lass das Steißbein sinken, öffne die Sitzbeinhöcker im Geiste und spüre, wie jede verbliebene Schutzspannung in die Erde abfließt. Du bist gehalten.',
      affirmation: '„Mein Beckenboden ist ein warmes, tragendes Nest. Er darf weich schwingen und allen Druck loslassen.“'
    }
  ];

  let currentStationIdx = 0;
  let journeyAutoPlayTimer = null;
  let isJourneyPlaying = false;

  const stationNumEl = document.getElementById('journeyStationNumber');
  const stationNameEl = document.getElementById('journeyStationName');
  const progressIndEl = document.getElementById('journeyProgressIndicator');
  const percentEl = document.getElementById('journeyPercent');
  const visualIconEl = document.getElementById('journeyVisualIcon');
  const guidanceEl = document.getElementById('journeyGuidance');
  const affirmationEl = document.getElementById('journeyAffirmation');
  const btnPrev = document.getElementById('btnJourneyPrev');
  const btnNext = document.getElementById('btnJourneyNext');
  const btnPlayPause = document.getElementById('btnJourneyPlayPause');
  const playIcon = document.getElementById('journeyPlayIcon');
  const playText = document.getElementById('journeyPlayText');

  function renderStation(idx, playSound = false) {
    if (idx < 0) idx = 0;
    if (idx >= journeyStations.length) idx = journeyStations.length - 1;
    currentStationIdx = idx;

    const st = journeyStations[idx];
    if (stationNumEl) stationNumEl.textContent = st.number;
    if (stationNameEl) stationNameEl.textContent = st.name;
    if (visualIconEl) visualIconEl.textContent = st.icon;
    if (guidanceEl) guidanceEl.textContent = `„${st.guidance.replace(/^[„"]|[“"]$/g, '')}“`;
    if (affirmationEl) affirmationEl.textContent = st.affirmation;

    const percent = Math.round(((idx + 1) / journeyStations.length) * 100);
    if (progressIndEl) progressIndEl.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}%`;

    // Organ in der oberen SVG-Karte synchron hervorheben
    updateOrganFocus(st.id);

    if (playSound) {
      playHealingTone(432, 'gold');
    }
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      stopJourneyAutoPlay();
      if (currentStationIdx > 0) {
        renderStation(currentStationIdx - 1, true);
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      stopJourneyAutoPlay();
      if (currentStationIdx < journeyStations.length - 1) {
        renderStation(currentStationIdx + 1, true);
      }
    });
  }

  function startJourneyAutoPlay() {
    isJourneyPlaying = true;
    if (playIcon) playIcon.textContent = '⏸';
    if (playText) playText.textContent = 'Pause';

    renderStation(currentStationIdx, true);

    journeyAutoPlayTimer = setInterval(() => {
      if (currentStationIdx < journeyStations.length - 1) {
        renderStation(currentStationIdx + 1, true);
      } else {
        stopJourneyAutoPlay();
      }
    }, 20000); // 20 Sekunden Verweildauer pro Organ
  }

  function stopJourneyAutoPlay() {
    isJourneyPlaying = false;
    clearInterval(journeyAutoPlayTimer);
    if (playIcon) playIcon.textContent = '▶';
    if (playText) playText.textContent = 'Automatische Reise starten';
  }

  if (btnPlayPause) {
    btnPlayPause.addEventListener('click', () => {
      if (isJourneyPlaying) {
        stopJourneyAutoPlay();
      } else {
        startJourneyAutoPlay();
      }
    });
  }

  // Initial ersten Zustand setzen
  updateOrganFocus('uterus');
}

