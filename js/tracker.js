/**
 * Endo-Tracker & Symptom-Tagebuch
 * Ganzheitliches Tracking für Endometriose mit Kalender, 1-10 Schmerzskala,
 * dynamischen Kategorien, PDF-Druckexport mit Symbolen & Legende.
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_DATA = 'endo_tracker_data_v1';
  const STORAGE_KEY_CONFIG = 'endo_tracker_config_v1';

  // Standard-Kategorien Definition
  const DEFAULT_CATEGORIES = [
    { id: 'cycle', title: 'Zyklus', icon: '🩸', defaultActive: true },
    { id: 'sleep', title: 'Schlaf & Erholung', icon: '😴', defaultActive: true },
    { id: 'pain', title: 'Schmerzen (1–10)', icon: '⚡', defaultActive: true, highlight: true },
    { id: 'meds', title: 'Medikamente & Vitalstoffe', icon: '💊', defaultActive: true },
    { id: 'appointments', title: 'Arzt- & Therapietermine', icon: '🩺', defaultActive: true },
    { id: 'endobelly', title: 'Endo-Belly (Blähbauch)', icon: '🎈', defaultActive: true },
    { id: 'digestion', title: 'Verdauung & Darmgesundheit', icon: '🌿', defaultActive: true },
    { id: 'energy', title: 'Energie & Vitalität', icon: '🔋', defaultActive: true },
    { id: 'brainfog', title: 'Brain Fog & Fokus', icon: '🌫️', defaultActive: true },
    { id: 'meditation', title: 'Meditation & Entspannung', icon: '🧘‍♀️', defaultActive: true },
    { id: 'mood', title: 'Stimmung & Wohlbefinden', icon: '💖', defaultActive: true },
    { id: 'nutrition', title: 'Ernährung & Trigger', icon: '🥗', defaultActive: true },
    { id: 'helpers', title: 'Wohltuende Helfer', icon: '🌸', defaultActive: true },
    { id: 'notes', title: 'Gedanken & Wohlfühlmoment', icon: '📝', defaultActive: true, fullWidth: true }
  ];

  // State
  let currentDate = getTodayDateString();
  let trackerData = loadTrackerData();
  let trackerConfig = loadTrackerConfig();

  // Initialisierung beim Laden
  document.addEventListener('DOMContentLoaded', () => {
    initTracker();
  });

  // Globale Registrierung
  window.initEndoTracker = initTracker;

  function initTracker() {
    const trackerContainer = document.getElementById('trackerMainContainer');
    if (!trackerContainer) return;

    // Falls noch überhaupt keine Daten vorliegen, Muster-Daten für heute anbieten
    if (Object.keys(trackerData).length === 0) {
      seedInitialData();
    }

    renderDateBar();
    renderWeekStrip();
    renderTrackerCards();
    setupEventHandlers();
  }

  /* ==========================================================================
     DATEN- & KONFIGURATION-MANAGEMENT (localStorage)
     ========================================================================== */
  function loadTrackerData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATA);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('Fehler beim Laden der Tracker-Daten:', e);
      return {};
    }
  }

  function saveTrackerData() {
    try {
      if (trackerData[currentDate]) {
        trackerData[currentDate].isRecorded = true;
      }
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(trackerData));
      showSaveStatus();
      renderWeekStrip(); // Aktualisiere Indikatorpunkte
    } catch (e) {
      console.warn('Fehler beim Speichern der Tracker-Daten:', e);
    }
  }

  function loadTrackerConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Fehler beim Laden der Konfiguration:', e);
    }
    return {
      hiddenCategories: [],
      customCategories: []
    };
  }

  function saveTrackerConfig() {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(trackerConfig));
    } catch (e) {
      console.warn('Fehler beim Speichern der Konfiguration:', e);
    }
  }

  function getDayData(dateStr) {
    if (!trackerData[dateStr]) {
      trackerData[dateStr] = createEmptyDayData();
    }
    return trackerData[dateStr];
  }

  function createEmptyDayData() {
    return {
      isRecorded: false,
      cycleDay: '',
      cyclePhase: '',
      flow: 'none',
      cycleSymptoms: [],
      sleepHours: 7.5,
      sleepQuality: 3,
      sleepSymptoms: [],
      painAbdomen: 0,
      painBack: 0,
      painHead: 0,
      painPelvic: 0,
      painType: [],
      medsPain: [],
      medsSupplements: [],
      medsCustom: '',
      endoBellySeverity: 0,
      endoBellySymptoms: [],
      digestionStatus: '',
      digestionPain: 0,
      digestionSymptoms: [],
      energyLevel: 5,
      brainFogLevel: 5,
      meditationDone: false,
      meditationMinutes: 10,
      meditationTypes: [],
      moodTags: [],
      nutritionAntiInflammatory: false,
      nutritionTriggers: [],
      helpersUsed: [],
      hasPhysio: false,
      physioTypes: [],
      physioCustom: '',
      physioNotes: '',
      hasDoctor: false,
      doctorType: '',
      doctorNotes: '',
      notesDaily: '',
      customValues: {}
    };
  }

  function seedInitialData() {
    const todayObj = parseDateKey(getTodayDateString());
    
    // 1. Heute: Eisprung, milde Schmerzen, Meditation, Dankbar
    const today = formatDateKey(todayObj);
    trackerData[today] = {
      isRecorded: true,
      cycleDay: 14,
      cyclePhase: 'ovulation',
      flow: 'none',
      cycleSymptoms: ['Ziehen im Unterleib'],
      sleepHours: 7.5,
      sleepQuality: 4,
      sleepSymptoms: [],
      painAbdomen: 3,
      painBack: 2,
      painHead: 0,
      painPelvic: 1,
      painType: ['ziehend'],
      medsPain: ['Magnesium'],
      medsSupplements: ['Omega-3', 'Vitamin D3'],
      medsCustom: 'Morgens 400mg Magnesium & Goldene Milch',
      endoBellySeverity: 2,
      endoBellySymptoms: ['Leichtes Spannen'],
      digestionStatus: 'normal',
      digestionPain: 0,
      digestionSymptoms: [],
      energyLevel: 7,
      brainFogLevel: 8,
      meditationDone: true,
      meditationMinutes: 15,
      meditationTypes: ['4-4-6 Vagus-Atmung'],
      moodTags: ['Dankbar', 'Ausgeglichen'],
      nutritionAntiInflammatory: true,
      nutritionTriggers: [],
      helpersUsed: ['Wärmflasche', 'Spaziergang im Grünen'],
      hasPhysio: false,
      hasDoctor: false,
      notesDaily: 'Heute morgen 15 Minuten Vagus-Atmung in der Atem-Oase gemacht. Das hat meinem Unterleib spürbar gut getan!',
      customValues: {}
    };

    // 2. Gestern: Arzttermin im Endo-Zentrum, Physio, stärkere Schmerzen
    const yesterdayObj = new Date(todayObj);
    yesterdayObj.setDate(todayObj.getDate() - 1);
    const yesterday = formatDateKey(yesterdayObj);
    trackerData[yesterday] = {
      isRecorded: true,
      cycleDay: 13,
      cyclePhase: 'follicular',
      flow: 'none',
      cycleSymptoms: [],
      sleepHours: 6.5,
      sleepQuality: 3,
      sleepSymptoms: ['Aufwachen durch Schmerz'],
      painAbdomen: 7,
      painBack: 5,
      painHead: 2,
      painPelvic: 4,
      painType: ['krampfartig', 'stechend'],
      medsPain: ['Ibuprofen 400mg', 'Buscopan'],
      medsSupplements: ['Magnesium'],
      medsCustom: 'Mittags Ibuprofen 400mg eingenommen',
      endoBellySeverity: 3,
      endoBellySymptoms: ['Druckschmerz', 'Fester Bauch'],
      digestionStatus: 'bloating',
      digestionPain: 3,
      digestionSymptoms: [],
      energyLevel: 4,
      brainFogLevel: 5,
      meditationDone: true,
      meditationMinutes: 20,
      meditationTypes: ['Body Scan'],
      moodTags: ['Überfordert', 'Sanft mit mir'],
      nutritionAntiInflammatory: true,
      nutritionTriggers: [],
      helpersUsed: ['Wärmekissen', 'Kräutertee'],
      hasDoctor: true,
      doctorType: 'Endometriose-Zentrum',
      doctorNotes: 'Ultraschall-Befund besprochen, gute Empfehlungen zur Physiotherapie bekommen',
      hasPhysio: true,
      physioTypes: ['Beckenboden-Physio'],
      physioCustom: 'Mobilisation Becken & Vagusnerv',
      physioNotes: 'Sanfte Triggerpunktbehandlung, fühlte sich danach entlasteter an',
      notesDaily: 'Gestern war ein fordernder Tag mit Arzt- und Therapietermin, aber ich habe gut für mich gesorgt.',
      customValues: {}
    };

    // 3. Vorgestern: Schmerzfreier, ausgeglichener Tag
    const dayBeforeObj = new Date(todayObj);
    dayBeforeObj.setDate(todayObj.getDate() - 2);
    const dayBefore = formatDateKey(dayBeforeObj);
    trackerData[dayBefore] = {
      isRecorded: true,
      cycleDay: 12,
      cyclePhase: 'follicular',
      flow: 'none',
      cycleSymptoms: [],
      sleepHours: 8,
      sleepQuality: 5,
      sleepSymptoms: [],
      painAbdomen: 0,
      painBack: 0,
      painHead: 0,
      painPelvic: 0,
      painType: [],
      medsPain: [],
      medsSupplements: ['Omega-3', 'Zink'],
      medsCustom: '',
      endoBellySeverity: 0,
      endoBellySymptoms: [],
      digestionStatus: 'normal',
      digestionPain: 0,
      digestionSymptoms: [],
      energyLevel: 8,
      brainFogLevel: 9,
      meditationDone: true,
      meditationMinutes: 10,
      meditationTypes: ['Stilles Verweilen'],
      moodTags: ['Ausgeglichen', 'Hoffnungsvoll'],
      nutritionAntiInflammatory: true,
      nutritionTriggers: [],
      helpersUsed: ['Sanftes Dehnen'],
      hasDoctor: false,
      hasPhysio: false,
      notesDaily: 'Ein wunderbar schmerzfreier Tag voller Leichtigkeit!',
      customValues: {}
    };

    saveTrackerData();
  }

  /* ==========================================================================
     DATUMS- & KALENDER-NAVIGATION
     ========================================================================== */
  function getTodayDateString() {
    const now = new Date();
    return formatDateKey(now);
  }

  function formatDateKey(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseDateKey(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatGermanDate(dateStr) {
    const dateObj = parseDateKey(dateStr);
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    
    const dayName = weekdays[dateObj.getDay()];
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    return `${dayName}, ${day}. ${month} ${year}`;
  }

  function setDate(newDateStr) {
    currentDate = newDateStr;
    renderDateBar();
    renderWeekStrip();
    renderTrackerCards();
  }

  function stepDate(deltaDays) {
    const dateObj = parseDateKey(currentDate);
    dateObj.setDate(dateObj.getDate() + deltaDays);
    setDate(formatDateKey(dateObj));
  }

  function renderDateBar() {
    const dateDisplay = document.getElementById('trackerDateDisplay');
    const dateInput = document.getElementById('trackerDatePicker');
    if (!dateDisplay || !dateInput) return;

    dateDisplay.textContent = formatGermanDate(currentDate);
    dateInput.value = currentDate;
  }

  function hasAnyDayData(data) {
    if (!data) return false;
    if (data.isRecorded) return true;
    return !!(
      data.cycleDay ||
      (data.cyclePhase && data.cyclePhase !== '') ||
      (data.flow && data.flow !== 'none') ||
      (data.cycleSymptoms && data.cycleSymptoms.length) ||
      Number(data.painAbdomen) > 0 ||
      Number(data.painBack) > 0 ||
      Number(data.painHead) > 0 ||
      Number(data.painPelvic) > 0 ||
      (data.painType && data.painType.length) ||
      (data.medsPain && data.medsPain.length) ||
      (data.medsSupplements && data.medsSupplements.length) ||
      data.medsCustom ||
      data.hasDoctor ||
      data.doctorType ||
      data.hasPhysio ||
      (data.physioTypes && data.physioTypes.length) ||
      Number(data.endoBellySeverity) > 0 ||
      data.meditationDone ||
      (data.moodTags && data.moodTags.length) ||
      data.notesDaily ||
      (data.energyLevel !== undefined && data.energyLevel !== null && Number(data.energyLevel) !== 5) ||
      (data.brainFogLevel !== undefined && data.brainFogLevel !== null && Number(data.brainFogLevel) !== 5)
    );
  }

  function getMaxPainForDay(data) {
    if (!data) return 0;
    return Math.max(
      Number(data.painAbdomen) || 0,
      Number(data.painBack) || 0,
      Number(data.painHead) || 0,
      Number(data.painPelvic) || 0
    );
  }

  function getCyclePhaseIcon(phase) {
    const map = {
      menstruation: '🩸',
      follicular: '🌱',
      ovulation: '🌸',
      luteal: '🌙'
    };
    return map[phase] || '✨';
  }

  function getCyclePhaseShortName(phase) {
    const map = {
      menstruation: 'Periode',
      follicular: 'Follikel',
      ovulation: 'Eisprung',
      luteal: 'Luteal'
    };
    return map[phase] || '';
  }

  function getPainChipClass(val) {
    val = Number(val) || 0;
    if (val === 0) return 'pain-chip pain-chip-0';
    if (val <= 3) return 'pain-chip pain-chip-mild';
    if (val <= 6) return 'pain-chip pain-chip-mod';
    return 'pain-chip pain-chip-sev';
  }

  function renderWeekStrip() {
    const stripEl = document.getElementById('trackerWeekStrip');
    if (!stripEl) return;

    stripEl.innerHTML = '';
    const centerDate = parseDateKey(currentDate);
    const todayStr = getTodayDateString();

    // Datumsbereich der aktuellen Woche für den Header berechnen
    const startObj = new Date(centerDate);
    startObj.setDate(centerDate.getDate() - 3);
    const endObj = new Date(centerDate);
    endObj.setDate(centerDate.getDate() + 3);

    const rangeEl = document.getElementById('stripWeekRangeDisplay');
    if (rangeEl) {
      const months = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
      rangeEl.textContent = `${startObj.getDate()}. ${months[startObj.getMonth()]} – ${endObj.getDate()}. ${months[endObj.getMonth()]} ${endObj.getFullYear()}`;
    }
    
    // 3 Tage davor, der gewählte Tag, 3 Tage danach (7 Tage-Fenster)
    for (let i = -3; i <= 3; i++) {
      const dayObj = new Date(centerDate);
      dayObj.setDate(centerDate.getDate() + i);
      const dayKey = formatDateKey(dayObj);

      const weekdaysShort = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      const weekdayStr = weekdaysShort[dayObj.getDay()];
      const dayNum = dayObj.getDate();

      const isCurrent = dayKey === currentDate;
      const isToday = dayKey === todayStr;
      const data = trackerData[dayKey];
      const hasData = hasAnyDayData(data);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `week-strip-card ${isCurrent ? 'active' : ''} ${isToday ? 'today' : ''}`;
      btn.setAttribute('aria-label', `Tag ${dayNum}. ${weekdayStr}, ${formatGermanDate(dayKey)}`);

      let badgesHtml = '';
      let cycleHtml = '';

      if (hasData) {
        // 1. Zyklus & Phase
        if (data.cycleDay || data.cyclePhase) {
          const phaseClass = data.cyclePhase ? `phase-${data.cyclePhase}` : '';
          const phaseIcon = getCyclePhaseIcon(data.cyclePhase);
          const ztText = data.cycleDay ? `ZT ${data.cycleDay}` : '';
          const phaseName = getCyclePhaseShortName(data.cyclePhase);
          cycleHtml = `
            <div class="strip-card-cycle">
              <span class="strip-cycle-badge ${phaseClass}" title="Zyklustag: ${data.cycleDay || '—'}, Phase: ${getCyclePhaseLabel(data.cyclePhase)}">
                ${phaseIcon} ${ztText ? `<strong>${ztText}</strong>` : ''} ${phaseName ? `· ${phaseName}` : ''}
              </span>
            </div>
          `;
        }

        const badgesList = [];

        // 2. Schmerz (Schmerzhaft oder nicht?)
        const maxPain = getMaxPainForDay(data);
        if (maxPain === 0) {
          badgesList.push(`
            <span class="strip-badge-item strip-badge-pain-0" title="Schmerzfrei (0/10)">
              🟢 Schmerzfrei
            </span>
          `);
        } else if (maxPain <= 3) {
          badgesList.push(`
            <span class="strip-badge-item strip-badge-pain-mild" title="Leichte Schmerzen (Intensität ${maxPain}/10)">
              🟡 ⚡ ${maxPain}/10
            </span>
          `);
        } else if (maxPain <= 6) {
          badgesList.push(`
            <span class="strip-badge-item strip-badge-pain-mod" title="Spürbare Schmerzen (Intensität ${maxPain}/10)">
              🟠 ⚡ ${maxPain}/10
            </span>
          `);
        } else {
          badgesList.push(`
            <span class="strip-badge-item strip-badge-pain-sev" title="Starke Schmerzen (Intensität ${maxPain}/10)">
              🔴 ⚡ ${maxPain}/10
            </span>
          `);
        }

        // 3. Energie & Vitalität
        if (!trackerConfig.hiddenCategories.includes('energy') && data.energyLevel !== undefined && data.energyLevel !== null && Number(data.energyLevel) > 0) {
          const energyVal = Number(data.energyLevel);
          badgesList.push(`
            <span class="strip-badge-item strip-badge-energy" title="Energie &amp; Vitalität: ${energyVal}/10 – ${escapeHtml(getEnergyLabel(energyVal))}">
              🔋 Energie ${energyVal}/10
            </span>
          `);
        }

        // 4. Mentale Klarheit
        if (!trackerConfig.hiddenCategories.includes('brainfog') && data.brainFogLevel !== undefined && data.brainFogLevel !== null && Number(data.brainFogLevel) > 0) {
          const fogVal = Number(data.brainFogLevel);
          badgesList.push(`
            <span class="strip-badge-item strip-badge-brainfog" title="Mentale Klarheit: ${fogVal}/10 – ${escapeHtml(getBrainFogLabel(fogVal))}">
              <span class="strip-badge-text">🧠 Mentale Klarheit</span>
              <span class="strip-badge-score">${fogVal}/10</span>
            </span>
          `);
        }

        // 5. Arzttermin / Physio
        const hasDoctor = data.hasDoctor || data.doctorType;
        const hasPhysio = data.hasPhysio || (data.physioTypes && data.physioTypes.length) || data.physioCustom;
        if (hasDoctor && hasPhysio) {
          badgesList.push(`
            <span class="strip-badge-item strip-badge-doctor" title="Arzt- &amp; Physiotermin wahrgenommen">
              🩺+💆‍♀️ Termine
            </span>
          `);
        } else if (hasDoctor) {
          badgesList.push(`
            <span class="strip-badge-item strip-badge-doctor" title="Arzttermin: ${escapeHtml(data.doctorType || 'Wahrgenommen')}">
              🩺 Arzttermin
            </span>
          `);
        } else if (hasPhysio) {
          badgesList.push(`
            <span class="strip-badge-item strip-badge-doctor" title="Physiotherapie wahrgenommen">
              💆‍♀️ Physio
            </span>
          `);
        }

        // 6. Medikamente / Vitalstoffe
        const hasMeds = (data.medsPain && data.medsPain.length) || (data.medsSupplements && data.medsSupplements.length) || data.medsCustom;
        if (hasMeds) {
          const medNames = [
            ...(data.medsPain || []),
            ...(data.medsSupplements || [])
          ];
          const tooltip = medNames.length ? escapeHtml(medNames.join(', ')) : 'Medikamente/Vitalstoffe eingenommen';
          badgesList.push(`
            <span class="strip-badge-item strip-badge-meds" title="${tooltip}">
              💊 Meds
            </span>
          `);
        }

        // 7. Meditation & Entspannung
        if (data.meditationDone) {
          badgesList.push(`
            <span class="strip-badge-item strip-badge-meditation" title="Meditation: ${data.meditationMinutes || 10} Minuten praktiziert">
              🧘‍♀️ ${data.meditationMinutes || 10}m
            </span>
          `);
        }

        // 8. Stimmung & Wohlbefinden
        if (data.moodTags && data.moodTags.length) {
          const firstMood = escapeHtml(data.moodTags[0]);
          badgesList.push(`
            <span class="strip-badge-item strip-badge-mood" title="Seelenbefinden: ${escapeHtml(data.moodTags.join(', '))}">
              💖 ${firstMood}
            </span>
          `);
        }

        // 9. Endo-Belly
        if (Number(data.endoBellySeverity) > 0) {
          badgesList.push(`
            <span class="strip-badge-item strip-badge-belly" title="Endo-Belly Stufe ${data.endoBellySeverity}">
              🎈 Stufe ${data.endoBellySeverity}
            </span>
          `);
        }

        badgesHtml = `
          <div class="strip-card-badges">
            ${badgesList.join('')}
          </div>
        `;
      } else {
        badgesHtml = `
          <div class="strip-card-empty">
            <span class="plus-sign">+</span>
            <span>Eintragen</span>
          </div>
        `;
      }

      btn.innerHTML = `
        <div class="strip-card-header">
          <span class="strip-weekday">${weekdayStr}</span>
          <span class="strip-daynumber">${dayNum}</span>
          ${isToday ? '<span class="strip-today-badge">Heute</span>' : ''}
        </div>
        ${cycleHtml}
        ${badgesHtml}
      `;

      btn.addEventListener('click', () => {
        setDate(dayKey);
      });

      stripEl.appendChild(btn);
    }
  }

  function showSaveStatus() {
    const badge = document.getElementById('trackerSaveBadge');
    if (!badge) return;
    badge.style.opacity = '1';
    badge.textContent = '✓ Gespeichert';
    clearTimeout(badge._fadeTimer);
    badge._fadeTimer = setTimeout(() => {
      badge.style.opacity = '0.6';
    }, 1800);
  }

  /* ==========================================================================
     RENDERING DER TRACKER-KARTEN
     ========================================================================== */
  function renderTrackerCards() {
    const grid = document.getElementById('trackerCardsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const dayData = getDayData(currentDate);

    // 1. Standard-Kategorien rendern (falls nicht ausgeblendet)
    DEFAULT_CATEGORIES.forEach(cat => {
      if (trackerConfig.hiddenCategories.includes(cat.id)) return;
      const cardEl = createCategoryCard(cat, dayData);
      if (cardEl) grid.appendChild(cardEl);
    });

    // 2. Benutzerdefinierte Kategorien rendern
    if (trackerConfig.customCategories && trackerConfig.customCategories.length > 0) {
      trackerConfig.customCategories.forEach(customCat => {
        if (trackerConfig.hiddenCategories.includes(customCat.id)) return;
        const customCardEl = createCustomCategoryCard(customCat, dayData);
        if (customCardEl) grid.appendChild(customCardEl);
      });
    }
  }

  function createCategoryCard(cat, dayData) {
    const card = document.createElement('div');
    card.className = `tracker-card ${cat.highlight ? 'card-highlight' : ''} ${cat.fullWidth ? 'card-full-width' : ''}`;
    card.id = `card-${cat.id}`;

    // Header
    const headerHtml = `
      <div class="tracker-card-header">
        <div class="card-title-group">
          <div class="card-icon">${cat.icon}</div>
          <div>
            <h3>${cat.title}</h3>
            <p>${getCategorySubtitle(cat.id)}</p>
          </div>
        </div>
        <div class="card-header-actions">
          <button type="button" class="card-action-btn hide-cat-btn" title="Kategorie ausblenden" data-cat-id="${cat.id}">
            &times;
          </button>
        </div>
      </div>
    `;

    // Body
    let bodyHtml = '';
    switch (cat.id) {
      case 'cycle':
        bodyHtml = renderCycleCardContent(dayData);
        break;
      case 'sleep':
        bodyHtml = renderSleepCardContent(dayData);
        break;
      case 'pain':
        bodyHtml = renderPainCardContent(dayData);
        break;
      case 'meds':
        bodyHtml = renderMedsCardContent(dayData);
        break;
      case 'appointments':
        bodyHtml = renderAppointmentsCardContent(dayData);
        break;
      case 'endobelly':
        bodyHtml = renderEndoBellyCardContent(dayData);
        break;
      case 'digestion':
        bodyHtml = renderDigestionCardContent(dayData);
        break;
      case 'energy':
        bodyHtml = renderEnergyCardContent(dayData);
        break;
      case 'brainfog':
        bodyHtml = renderBrainFogCardContent(dayData);
        break;
      case 'meditation':
        bodyHtml = renderMeditationCardContent(dayData);
        break;
      case 'mood':
        bodyHtml = renderMoodCardContent(dayData);
        break;
      case 'nutrition':
        bodyHtml = renderNutritionCardContent(dayData);
        break;
      case 'helpers':
        bodyHtml = renderHelpersCardContent(dayData);
        break;
      case 'notes':
        bodyHtml = renderNotesCardContent(dayData);
        break;
      default:
        bodyHtml = '';
    }

    card.innerHTML = headerHtml + `<div class="tracker-card-body">${bodyHtml}</div>`;
    setupCardInteractions(card, cat.id, dayData);
    return card;
  }

  function getCategorySubtitle(id) {
    const subtitles = {
      cycle: 'Zyklustag, Phase & Blutungsstärke',
      sleep: 'Schlafdauer, Erholung & Ruhe',
      pain: 'Differenzierte Skala von 1 bis 10',
      meds: 'Schmerzmittel, Hormone & Vitalstoffe',
      appointments: 'Physiotherapie, Facharztbesuche & vertrauliche Notizen',
      endobelly: 'Spannungsgefühl & Schwellung',
      digestion: 'Stuhlgang, Blähungen & Dyschezie',
      energy: 'Vitalität & Fatigue-Level (1–10)',
      brainfog: 'Mentale Klarheit vs. Gehirnnebel (1–10)',
      meditation: 'Atem-Oase, Achtsamkeit & Vagusnerv',
      mood: 'Seelenbefinden & emotionale Balance',
      nutrition: 'Antientzündliche Kost & Verträglichkeit',
      helpers: 'Wärme, TENS, Wickel & Sanftes Dehnen',
      notes: 'Mein Wohlfühl-Moment & Notizen des Tages'
    };
    return subtitles[id] || '';
  }

  /* --- Kategorie-Inhalte Generierung --- */

  // 1. ZYKLUS
  function renderCycleCardContent(data) {
    return `
      <div class="tracker-field-group">
        <label class="tracker-label">
          <span>Zyklustag</span>
          <span class="tracker-label-desc">Tag deines Zyklus</span>
        </label>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="number" min="1" max="60" class="tracker-input" id="input-cycleDay" value="${data.cycleDay || ''}" placeholder="z. B. 14" style="max-width: 110px;">
          <span style="font-size: 0.9rem; color: var(--text-muted);">Tag</span>
        </div>
      </div>

      <div class="tracker-field-group">
        <label class="tracker-label"><span>Zyklusphase</span></label>
        <div class="pill-options-group" data-field="cyclePhase">
          <button type="button" class="tracker-pill ${data.cyclePhase === 'menstruation' ? 'active' : ''}" data-val="menstruation">🩸 Menstruation</button>
          <button type="button" class="tracker-pill ${data.cyclePhase === 'follicular' ? 'active' : ''}" data-val="follicular">🌱 Follikelphase</button>
          <button type="button" class="tracker-pill ${data.cyclePhase === 'ovulation' ? 'active' : ''}" data-val="ovulation">✨ Eisprung</button>
          <button type="button" class="tracker-pill ${data.cyclePhase === 'luteal' ? 'active' : ''}" data-val="luteal">🌙 Lutealphase</button>
        </div>
      </div>

      <div class="tracker-field-group">
        <label class="tracker-label"><span>Blutungsstärke</span></label>
        <div class="pill-options-group" data-field="flow">
          <button type="button" class="tracker-pill ${data.flow === 'none' ? 'active' : ''}" data-val="none">Keine</button>
          <button type="button" class="tracker-pill ${data.flow === 'spotting' ? 'active' : ''}" data-val="spotting">Schmierblutung</button>
          <button type="button" class="tracker-pill ${data.flow === 'light' ? 'active' : ''}" data-val="light">Leicht</button>
          <button type="button" class="tracker-pill ${data.flow === 'medium' ? 'active' : ''}" data-val="medium">Mittel</button>
          <button type="button" class="tracker-pill ${data.flow === 'heavy' ? 'active' : ''}" data-val="heavy">Stark</button>
        </div>
      </div>

      <div class="tracker-field-group">
        <label class="tracker-label"><span>Zyklus-Begleiter</span></label>
        <div class="pill-options-group multi-pill" data-field="cycleSymptoms">
          ${renderPills(['Krämpfe', 'Ziehen im Unterleib', 'Brustspannen', 'Rückenspannung', 'Wassereinlagerungen'], data.cycleSymptoms)}
        </div>
      </div>
    `;
  }

  // 2. SCHLAF
  function renderSleepCardContent(data) {
    return `
      <div class="tracker-field-group">
        <div class="tracker-label">
          <span>Schlafdauer</span>
          <span class="tracker-value-badge" id="badge-sleepHours">${data.sleepHours || 7.5} Stunden</span>
        </div>
        <div class="pain-slider-container">
          <input type="range" min="3" max="12" step="0.5" value="${data.sleepHours || 7.5}" class="scale-slider" id="slider-sleepHours">
          <div class="scale-ticks">
            <span>3 Std.</span>
            <span>6 Std.</span>
            <span>8 Std.</span>
            <span>10 Std.</span>
            <span>12 Std.</span>
          </div>
        </div>
      </div>

      <div class="tracker-field-group">
        <div class="tracker-label"><span>Schlafqualität</span></div>
        <div class="star-rating-group" data-field="sleepQuality">
          ${[1, 2, 3, 4, 5].map(star => `
            <button type="button" class="star-rating-btn ${data.sleepQuality >= star ? 'active' : ''}" data-val="${star}" title="${star} von 5">
              ★
            </button>
          `).join('')}
          <span style="font-size: 0.85rem; color: var(--text-muted); align-self: center; margin-left: 8px;">
            ${getSleepQualityText(data.sleepQuality)}
          </span>
        </div>
      </div>

      <div class="tracker-field-group">
        <label class="tracker-label"><span>Schlaf-Herausforderungen</span></label>
        <div class="pill-options-group multi-pill" data-field="sleepSymptoms">
          ${renderPills(['Einschlafprobleme', 'Durchschlafstörungen', 'Nachtschweiß', 'Schmerzbedingtes Erwachen', 'Alpträume', 'Tief & erholt'], data.sleepSymptoms)}
        </div>
      </div>
    `;
  }

  // 3. SCHMERZEN (1-10 SKALA)
  function renderPainCardContent(data) {
    return `
      <!-- Bauch / Unterleib -->
      <div class="tracker-field-group">
        <div class="tracker-label">
          <span>🌸 Unterleib & Beckenraum</span>
          <span class="tracker-value-badge ${getPainBadgeClass(data.painAbdomen)}" id="badge-painAbdomen">${getPainLabel(data.painAbdomen)}</span>
        </div>
        <div class="pain-slider-container">
          <input type="range" min="0" max="10" step="1" value="${data.painAbdomen || 0}" class="scale-slider" id="slider-painAbdomen" data-field="painAbdomen">
          <div class="scale-ticks">
            <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
          </div>
        </div>
      </div>

      <!-- Rücken / Lendenwirbelsäule -->
      <div class="tracker-field-group">
        <div class="tracker-label">
          <span>🌿 Rücken & Lenden</span>
          <span class="tracker-value-badge ${getPainBadgeClass(data.painBack)}" id="badge-painBack">${getPainLabel(data.painBack)}</span>
        </div>
        <div class="pain-slider-container">
          <input type="range" min="0" max="10" step="1" value="${data.painBack || 0}" class="scale-slider" id="slider-painBack" data-field="painBack">
          <div class="scale-ticks">
            <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
          </div>
        </div>
      </div>

      <!-- Kopf / Migräne -->
      <div class="tracker-field-group">
        <div class="tracker-label">
          <span>💆‍♀️ Kopfschmerzen & Migräne</span>
          <span class="tracker-value-badge ${getPainBadgeClass(data.painHead)}" id="badge-painHead">${getPainLabel(data.painHead)}</span>
        </div>
        <div class="pain-slider-container">
          <input type="range" min="0" max="10" step="1" value="${data.painHead || 0}" class="scale-slider" id="slider-painHead" data-field="painHead">
          <div class="scale-ticks">
            <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
          </div>
        </div>
      </div>

      <!-- Beckenboden / Beine -->
      <div class="tracker-field-group">
        <div class="tracker-label">
          <span>⚡ Beckenboden & Beine / Ischias</span>
          <span class="tracker-value-badge ${getPainBadgeClass(data.painPelvic)}" id="badge-painPelvic">${getPainLabel(data.painPelvic)}</span>
        </div>
        <div class="pain-slider-container">
          <input type="range" min="0" max="10" step="1" value="${data.painPelvic || 0}" class="scale-slider" id="slider-painPelvic" data-field="painPelvic">
          <div class="scale-ticks">
            <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
          </div>
        </div>
      </div>

      <!-- Schmerzcharakter -->
      <div class="tracker-field-group">
        <label class="tracker-label"><span>Schmerzcharakter</span></label>
        <div class="pill-options-group multi-pill" data-field="painType">
          ${renderPills(['krampfartig', 'stechend', 'dumpf', 'ziehend', 'brennend', 'pochend', 'ausstrahlend'], data.painType)}
        </div>
      </div>
    `;
  }

  // 4. MEDIKAMENTE
  function renderMedsCardContent(data) {
    const commonPainMeds = ['Ibuprofen', 'Buscopan', 'Paracetamol', 'Novaminsulfon', 'Naproxen'];
    const commonSupplements = [
      'Magnesium', 'Omega-3', 'Kurkuma', 'Vitamin D3', 'Vitamin B-Komplex',
      'Vitamin C', 'Vitamin E', 'Eisen', 'Zink', 'Probiotikum', 'CBD-Öl'
    ];

    return `
      <div class="tracker-field-group">
        <label class="tracker-label"><span>Schmerzmedikation & Krampflöser</span></label>
        <div class="pill-options-group multi-pill" data-field="medsPain">
          ${renderPills(commonPainMeds, data.medsPain)}
        </div>
      </div>

      <div class="tracker-field-group">
        <label class="tracker-label"><span>Vitalstoffe & Nahrungsergänzung</span></label>
        <div class="pill-options-group multi-pill" data-field="medsSupplements">
          ${renderPills(commonSupplements, data.medsSupplements)}
        </div>
      </div>

      <div class="tracker-field-group">
        <label class="tracker-label"><span>Dosierung, Einnahmezeiten & Notizen</span></label>
        <input type="text" class="tracker-input" id="input-medsCustom" value="${escapeHtml(data.medsCustom || '')}" placeholder="z. B. 1x Buscopan Plus 14 Uhr, 400mg Magnesium abends">
      </div>
    `;
  }

  // 5. ARZT- & THERAPIETERMINE
  function renderAppointmentsCardContent(data) {
    const physioPills = [
      'Beckenboden-Physio',
      'Manuelle Therapie',
      'Osteopathie',
      'Lymphdrainage',
      'Krankengymnastik',
      'Faszientherapie'
    ];
    const doctorSuggestions = [
      'Gynäkologie',
      'Endometriose-Zentrum',
      'Schmerztherapie',
      'Hausarzt',
      'Gastroenterologie',
      'Radiologie / MRT'
    ];

    const hasPhysio = !!data.hasPhysio;
    const hasDoctor = !!data.hasDoctor;

    return `
      <!-- 1. Physiotherapie & Körpertherapie -->
      <div class="appointment-subcard ${hasPhysio ? 'is-active' : ''}" id="subcard-physio">
        <div class="appointment-subcard-header">
          <button type="button" class="appointment-toggle-pill ${hasPhysio ? 'active' : ''}" id="btn-togglePhysio">
            <span>💆‍♀️ Physiotherapie wahrgenommen</span>
            <span class="toggle-status-icon">${hasPhysio ? '✓ Erfasst' : '○ Nicht erfasst'}</span>
          </button>
        </div>

        <div class="appointment-fields" style="${hasPhysio ? '' : 'opacity: 0.85;'}">
          <div class="tracker-field-group">
            <label class="tracker-label">
              <span>Therapie-Schwerpunkt</span>
              <span class="tracker-label-desc">Mehrfachauswahl möglich</span>
            </label>
            <div class="pill-options-group multi-pill" data-field="physioTypes">
              ${renderPills(physioPills, data.physioTypes || [])}
            </div>
          </div>

          <div class="tracker-field-group">
            <label class="tracker-label" for="input-physioCustom">
              <span>Behandlung / Therapeutin / Praxis</span>
            </label>
            <input type="text" class="tracker-input" id="input-physioCustom" value="${escapeHtml(data.physioCustom || '')}" placeholder="z. B. Beckenboden-Triggerpunkte, Mobilisation, Praxis Müller...">
          </div>

          <div class="tracker-field-group">
            <div class="tracker-label">
              <label for="textarea-physioNotes"><span>Persönliche Notizen zur Physiotherapie</span></label>
              <span class="privacy-notice-badge">🔒 Nicht im PDF-Druck</span>
            </div>
            <textarea class="tracker-textarea" id="textarea-physioNotes" rows="2" placeholder="Übungen für zuhause, körperliche Reaktion, wie es dir getan hat...">${escapeHtml(data.physioNotes || '')}</textarea>
          </div>
        </div>
      </div>

      <!-- 2. Arzttermin & Facharzt -->
      <div class="appointment-subcard ${hasDoctor ? 'is-active' : ''}" id="subcard-doctor">
        <div class="appointment-subcard-header">
          <button type="button" class="appointment-toggle-pill ${hasDoctor ? 'active' : ''}" id="btn-toggleDoctor">
            <span>🩺 Arzttermin wahrgenommen</span>
            <span class="toggle-status-icon">${hasDoctor ? '✓ Erfasst' : '○ Nicht erfasst'}</span>
          </button>
        </div>

        <div class="appointment-fields" style="${hasDoctor ? '' : 'opacity: 0.85;'}">
          <div class="tracker-field-group">
            <label class="tracker-label" for="input-doctorType">
              <span>Was für ein Arzttermin war das?</span>
              <span class="tracker-label-desc">Selbst eintragen / Fachrichtung</span>
            </label>
            <input type="text" class="tracker-input" id="input-doctorType" value="${escapeHtml(data.doctorType || '')}" placeholder="z. B. Gynäkologie, Endometriose-Zentrum Dr. Weber...">
            <div class="quick-suggestions-wrap">
              <span style="font-size: 0.75rem; color: var(--text-light); align-self: center;">Schnell-Vorschläge:</span>
              ${doctorSuggestions.map(s => `<button type="button" class="quick-suggest-btn" data-suggest="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
            </div>
          </div>

          <div class="tracker-field-group">
            <div class="tracker-label">
              <label for="textarea-doctorNotes"><span>Persönliche Notizen zum Arzttermin</span></label>
              <span class="privacy-notice-badge">🔒 Nicht im PDF-Druck</span>
            </div>
            <textarea class="tracker-textarea" id="textarea-doctorNotes" rows="2" placeholder="Besprochene Befunde, nächste Schritte, persönliche Fragen, Gedanken...">${escapeHtml(data.doctorNotes || '')}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  // 6. ENDO-BELLY
  function renderEndoBellyCardContent(data) {
    return `
      <div class="tracker-field-group">
        <div class="tracker-label">
          <span>Intensität des Blähbauchs</span>
          <span class="tracker-value-badge ${getEndoBellyBadgeClass(data.endoBellySeverity)}" id="badge-endoBellySeverity">
            ${getEndoBellyLabel(data.endoBellySeverity)}
          </span>
        </div>
        <div class="pain-slider-container">
          <input type="range" min="0" max="4" step="1" value="${data.endoBellySeverity || 0}" class="scale-slider" id="slider-endoBellySeverity" data-field="endoBellySeverity">
          <div class="scale-ticks">
            <span>Kein Blähbauch</span>
            <span>Leicht</span>
            <span>Deutlich</span>
            <span>Stark</span>
            <span>Schmerzhaft</span>
          </div>
        </div>
      </div>

      <div class="tracker-field-group">
        <label class="tracker-label"><span>Begleitgefühle</span></label>
        <div class="pill-options-group multi-pill" data-field="endoBellySymptoms">
          ${renderPills(['Starkes Spannungsgefühl', 'Kleidung drückt', 'Atem-Einengung', 'Druckgefühl nach Mahlzeit', 'Wärmebedürfnis'], data.endoBellySymptoms)}
        </div>
      </div>
    `;
  }

  // 6. VERDAUUNG
  function renderDigestionCardContent(data) {
    return `
      <div class="tracker-field-group">
        <label class="tracker-label"><span>Stuhlgang-Muster</span></label>
        <div class="pill-options-group" data-field="digestionStatus">
          <button type="button" class="tracker-pill ${data.digestionStatus === 'normal' ? 'active' : ''}" data-val="normal">🌿 Normal / Wohlfühlend</button>
          <button type="button" class="tracker-pill ${data.digestionStatus === 'constipation' ? 'active' : ''}" data-val="constipation">🐢 Verstopfung</button>
          <button type="button" class="tracker-pill ${data.digestionStatus === 'diarrhea' ? 'active' : ''}" data-val="diarrhea">⚡ Durchfall</button>
          <button type="button" class="tracker-pill ${data.digestionStatus === 'bloating' ? 'active' : ''}" data-val="bloating">🎈 Starke Blähungen</button>
        </div>
      </div>

      <div class="tracker-field-group">
        <div class="tracker-label">
          <span>Schmerzen beim Stuhlgang (Dyschezie)</span>
          <span class="tracker-value-badge ${getPainBadgeClass(data.digestionPain)}" id="badge-digestionPain">${getPainLabel(data.digestionPain)}</span>
        </div>
        <div class="pain-slider-container">
          <input type="range" min="0" max="10" step="1" value="${data.digestionPain || 0}" class="scale-slider" id="slider-digestionPain" data-field="digestionPain">
          <div class="scale-ticks">
            <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
          </div>
        </div>
      </div>

      <div class="tracker-field-group">
        <label class="tracker-label"><span>Magen- & Darmbegleiter</span></label>
        <div class="pill-options-group multi-pill" data-field="digestionSymptoms">
          ${renderPills(['Übelkeit', 'Sodbrennen', 'Völlegefühl', 'Krämpfe vor Stuhlgang', 'Bauchgeräusche'], data.digestionSymptoms)}
        </div>
      </div>
    `;
  }

  // 7. ENERGIE
  function renderEnergyCardContent(data) {
    const val = data.energyLevel !== undefined ? data.energyLevel : 5;
    return `
      <div class="tracker-field-group">
        <div class="tracker-label">
          <span>Energielevel</span>
          <span class="tracker-value-badge" id="badge-energyLevel" style="background: var(--gold-light); color: var(--gold-dark);">
            ${val}/10 – ${getEnergyLabel(val)}
          </span>
        </div>
        <div class="pain-slider-container">
          <input type="range" min="1" max="10" step="1" value="${val}" class="scale-slider" id="slider-energyLevel" data-field="energyLevel">
          <div class="scale-ticks">
            <span>1 (Fatigue / erschöpft)</span>
            <span>5 (Mittel)</span>
            <span>10 (Voller Kraft & Vitalität)</span>
          </div>
        </div>
      </div>
    `;
  }

  // 8. BRAIN FOG
  function renderBrainFogCardContent(data) {
    const val = data.brainFogLevel !== undefined ? data.brainFogLevel : 5;
    return `
      <div class="tracker-field-group">
        <div class="tracker-label">
          <span>Mentale Klarheit vs. Brain Fog</span>
          <span class="tracker-value-badge" id="badge-brainFogLevel" style="background: var(--sage-light); color: var(--sage-dark);">
            ${val}/10 – ${getBrainFogLabel(val)}
          </span>
        </div>
        <div class="pain-slider-container">
          <input type="range" min="1" max="10" step="1" value="${val}" class="scale-slider" id="slider-brainFogLevel" data-field="brainFogLevel">
          <div class="scale-ticks">
            <span>1 (Dichter Gehirnnebel)</span>
            <span>5 (Leicht benebelt)</span>
            <span>10 (Glasklarer Fokus)</span>
          </div>
        </div>
      </div>
    `;
  }

  // 9. MEDITATION & ENTSPANNUNG
  function renderMeditationCardContent(data) {
    const currentMins = Number(data.meditationMinutes) || 10;
    return `
      <div class="tracker-field-group">
        <label class="tracker-label"><span>Achtsamkeit geübt?</span></label>
        <div style="display: flex; gap: 12px; align-items: center;">
          <button type="button" class="tracker-pill ${data.meditationDone ? 'active' : ''}" id="btn-meditationToggle">
            ${data.meditationDone ? '✓ Ja, heute praktiziert' : '○ Heute noch nicht'}
          </button>
          <a href="#atem-oase" class="tracker-btn tracker-btn-secondary" style="padding: 6px 14px; font-size: 0.85rem; text-decoration: none;">
            🌸 Zur Atem-Oase
          </a>
        </div>
      </div>

      <div class="tracker-field-group">
        <div class="tracker-label">
          <span>Dauer der Einheit</span>
          <span class="tracker-value-badge" id="badge-meditationMinutes">${formatMeditationDuration(currentMins)}</span>
        </div>
        <div class="pain-slider-container">
          <input type="range" min="1" max="180" step="1" value="${currentMins}" class="scale-slider meditation-slider" id="slider-meditationMinutes" data-field="meditationMinutes">
          <div class="scale-ticks">
            <span>1 Min.</span>
            <span>1 Std.</span>
            <span>2 Std.</span>
            <span>3 Std.</span>
          </div>
        </div>
        <div class="meditation-quick-pills" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
          ${[5, 10, 15, 20, 30, 45, 60, 90, 120, 180].map(m => `
            <button type="button" class="tracker-pill tracker-pill-sm meditation-quick-pill ${currentMins === m ? 'active' : ''}" data-val="${m}">
              ${m >= 60 ? (m % 60 === 0 ? `${m / 60} Std.` : `${Math.floor(m / 60)}h ${m % 60}m`) : `${m} Min.`}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="tracker-field-group">
        <label class="tracker-label"><span>Methode / Technik</span></label>
        <div class="pill-options-group multi-pill" data-field="meditationTypes">
          ${renderPills(['4-4-6 Vagus-Atmung', 'Bienenatmung', 'Body Scan', 'Geführte Meditation', 'Yoga Nidra', 'Stilles Verweilen'], data.meditationTypes)}
        </div>
      </div>
    `;
  }

  // 10. STIMMUNG & SEELENBEFINDEN
  function renderMoodCardContent(data) {
    const emotions = [
      'Ausgeglichen', 'Dankbar', 'Hoffnungsvoll', 'Ruhig',
      'Verletzlich', 'Traurig', 'Überfordert', 'Reizbar', 'Ängstlich', 'Sanft mit mir'
    ];
    return `
      <div class="tracker-field-group">
        <label class="tracker-label"><span>Mein emotionales Befinden</span></label>
        <div class="pill-options-group multi-pill" data-field="moodTags">
          ${renderPills(emotions, data.moodTags)}
        </div>
      </div>
    `;
  }

  // 11. ERNÄHRUNG & TRIGGER
  function renderNutritionCardContent(data) {
    const triggers = ['Zucker & Süßes', 'Gluten', 'Kuhmilch', 'Koffein / Kaffee', 'Alkohol', 'Histaminreiches', 'Frittiertes / Fast Food'];
    return `
      <div class="tracker-field-group">
        <div class="checkbox-item" style="margin-bottom: 12px;">
          <label class="checkbox-label" for="cb-antiInflammatory">
            <input type="checkbox" id="cb-antiInflammatory" ${data.nutritionAntiInflammatory ? 'checked' : ''}>
            <span>🌿 Antientzündliche Mahlzeiten gewählt (frisches Gemüse, Beeren, gesunde Fette)</span>
          </label>
        </div>
      </div>

      <div class="tracker-field-group">
        <label class="tracker-label"><span>Mögliche Trigger / Ausnahmen heute</span></label>
        <div class="pill-options-group multi-pill" data-field="nutritionTriggers">
          ${renderPills(triggers, data.nutritionTriggers)}
        </div>
      </div>
    `;
  }

  // 12. HELFER & SELBSTFÜRSORGE
  function renderHelpersCardContent(data) {
    const helpers = [
      'Wärmflasche / Kirschkernkissen', 'TENS-Gerät', 'Basenbad / Fußbad',
      'Sanftes Dehnen / Beckenboden', 'Darmmassage', 'Spaziergang im Grünen',
      'Akupressurmatte', 'Erlaubnis zur Bettruhe', 'Tee-Ritual (Frauenmantel/Schafgarbe)'
    ];
    return `
      <div class="tracker-field-group">
        <label class="tracker-label"><span>Was meinem Körper heute gut tat</span></label>
        <div class="pill-options-group multi-pill" data-field="helpersUsed">
          ${renderPills(helpers, data.helpersUsed)}
        </div>
      </div>
    `;
  }

  // 13. NOTIZEN & WOHLFÜHL-MOMENT
  function renderNotesCardContent(data) {
    return `
      <div class="tracker-field-group">
        <label class="tracker-label">
          <span>Was hat mir heute gut getan? Wofür bin ich meinem Körper dankbar?</span>
        </label>
        <textarea class="tracker-textarea" id="textarea-notesDaily" rows="3" placeholder="Meine Gedanken, Erkenntnisse oder liebevolle Worte an mich selbst...">${escapeHtml(data.notesDaily || '')}</textarea>
      </div>
    `;
  }

  /* --- Benutzerdefinierte Kategorien Rendern --- */
  function createCustomCategoryCard(customCat, dayData) {
    const card = document.createElement('div');
    card.className = 'tracker-card';
    card.id = `card-custom-${customCat.id}`;

    const currentVal = dayData.customValues && dayData.customValues[customCat.id] !== undefined 
      ? dayData.customValues[customCat.id] 
      : getDefaultCustomVal(customCat.type);

    let contentHtml = '';
    if (customCat.type === 'scale10') {
      contentHtml = `
        <div class="tracker-field-group">
          <div class="tracker-label">
            <span>Intensität (1–10)</span>
            <span class="tracker-value-badge" id="badge-custom-${customCat.id}">${currentVal || 0}/10</span>
          </div>
          <div class="pain-slider-container">
            <input type="range" min="0" max="10" step="1" value="${currentVal || 0}" class="scale-slider custom-slider" data-custom-id="${customCat.id}">
            <div class="scale-ticks"><span>0</span><span>5</span><span>10</span></div>
          </div>
        </div>
      `;
    } else if (customCat.type === 'rating5') {
      contentHtml = `
        <div class="tracker-field-group">
          <div class="star-rating-group custom-rating" data-custom-id="${customCat.id}">
            ${[1, 2, 3, 4, 5].map(star => `
              <button type="button" class="star-rating-btn ${currentVal >= star ? 'active' : ''}" data-val="${star}">★</button>
            `).join('')}
          </div>
        </div>
      `;
    } else if (customCat.type === 'boolean') {
      contentHtml = `
        <div class="tracker-field-group">
          <button type="button" class="tracker-pill custom-bool-btn ${currentVal ? 'active' : ''}" data-custom-id="${customCat.id}">
            ${currentVal ? '✓ Erledigt / Ja' : '○ Nicht durchgeführt / Nein'}
          </button>
        </div>
      `;
    } else {
      // Text
      contentHtml = `
        <div class="tracker-field-group">
          <input type="text" class="tracker-input custom-text-input" data-custom-id="${customCat.id}" value="${escapeHtml(currentVal || '')}" placeholder="Eingabe für ${escapeHtml(customCat.title)}...">
        </div>
      `;
    }

    card.innerHTML = `
      <div class="tracker-card-header">
        <div class="card-title-group">
          <div class="card-icon">${customCat.icon || '✨'}</div>
          <div>
            <h3>${escapeHtml(customCat.title)}</h3>
            <p>Eigene Kategorie (${getCustomTypeName(customCat.type)})</p>
          </div>
        </div>
        <div class="card-header-actions">
          <button type="button" class="card-action-btn delete-custom-btn" title="Kategorie dauerhaft entfernen" data-custom-id="${customCat.id}">
            🗑️
          </button>
        </div>
      </div>
      <div class="tracker-card-body">
        ${contentHtml}
      </div>
    `;

    // Event Listeners für Custom Card
    setupCustomCardInteractions(card, customCat, dayData);
    return card;
  }

  function getDefaultCustomVal(type) {
    if (type === 'scale10') return 0;
    if (type === 'rating5') return 3;
    if (type === 'boolean') return false;
    return '';
  }

  function getCustomTypeName(type) {
    const map = {
      scale10: 'Skala 1–10',
      rating5: '1–5 Sterne',
      boolean: 'Ja / Nein',
      text: 'Freitext'
    };
    return map[type] || 'Benutzerdefiniert';
  }

  /* ==========================================================================
     INTERAKTIONS-LOGIK & EVENT-HANDLERS
     ========================================================================== */
  function setupCardInteractions(card, catId, dayData) {
    // 1. Ausblenden-Button
    const hideBtn = card.querySelector('.hide-cat-btn');
    if (hideBtn) {
      hideBtn.addEventListener('click', () => {
        if (!trackerConfig.hiddenCategories.includes(catId)) {
          trackerConfig.hiddenCategories.push(catId);
          saveTrackerConfig();
          renderTrackerCards();
        }
      });
    }

    // 2. Einzelauswahl-Pills (z.B. Zyklusphase, Blutungsstärke, Verdauung)
    card.querySelectorAll('.pill-options-group:not(.multi-pill)').forEach(group => {
      const field = group.getAttribute('data-field');
      group.querySelectorAll('.tracker-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-val');
          const isAlreadyActive = btn.classList.contains('active');
          
          group.querySelectorAll('.tracker-pill').forEach(b => b.classList.remove('active'));
          
          if (!isAlreadyActive) {
            btn.classList.add('active');
            dayData[field] = val;
          } else {
            dayData[field] = '';
          }
          saveTrackerData();
        });
      });
    });

    // 3. Mehrfachauswahl-Pills (Tags)
    card.querySelectorAll('.pill-options-group.multi-pill').forEach(group => {
      const field = group.getAttribute('data-field');
      group.querySelectorAll('.tracker-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-val');
          if (!Array.isArray(dayData[field])) dayData[field] = [];

          const idx = dayData[field].indexOf(val);
          if (idx === -1) {
            dayData[field].push(val);
            btn.classList.add('active');
          } else {
            dayData[field].splice(idx, 1);
            btn.classList.remove('active');
          }
          saveTrackerData();
        });
      });
    });

    // 4. Slider (Schmerzen, Schlafdauer, Endo-Belly, Energie etc.)
    card.querySelectorAll('input[type="range"]').forEach(slider => {
      const field = slider.getAttribute('data-field') || slider.id.replace('slider-', '');
      slider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        dayData[field] = val;

        // Badge aktualisieren
        const badge = document.getElementById(`badge-${field}`);
        if (badge) {
          if (field.startsWith('pain') || field === 'digestionPain') {
            badge.textContent = getPainLabel(val);
            badge.className = `tracker-value-badge ${getPainBadgeClass(val)}`;
          } else if (field === 'sleepHours') {
            badge.textContent = `${val} Stunden`;
          } else if (field === 'meditationMinutes') {
            badge.textContent = formatMeditationDuration(val);
          } else if (field === 'endoBellySeverity') {
            badge.textContent = getEndoBellyLabel(val);
            badge.className = `tracker-value-badge ${getEndoBellyBadgeClass(val)}`;
          } else if (field === 'energyLevel') {
            badge.textContent = `${val}/10 – ${getEnergyLabel(val)}`;
          } else if (field === 'brainFogLevel') {
            badge.textContent = `${val}/10 – ${getBrainFogLabel(val)}`;
          }
        }

        if (field === 'meditationMinutes') {
          card.querySelectorAll('.meditation-quick-pill').forEach(pill => {
            pill.classList.toggle('active', Number(pill.getAttribute('data-val')) === val);
          });
        }

        saveTrackerData();
      });
    });

    // 4b. Meditation Quick-Pills
    card.querySelectorAll('.meditation-quick-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const val = Number(pill.getAttribute('data-val'));
        dayData.meditationMinutes = val;

        const slider = card.querySelector('#slider-meditationMinutes');
        if (slider) slider.value = val;

        const badge = card.querySelector('#badge-meditationMinutes');
        if (badge) badge.textContent = formatMeditationDuration(val);

        card.querySelectorAll('.meditation-quick-pill').forEach(p => {
          p.classList.toggle('active', Number(p.getAttribute('data-val')) === val);
        });

        saveTrackerData();
      });
    });

    // 5. Sterne-Bewertungen
    card.querySelectorAll('.star-rating-group').forEach(group => {
      const field = group.getAttribute('data-field');
      group.querySelectorAll('.star-rating-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = Number(btn.getAttribute('data-val'));
          dayData[field] = val;

          group.querySelectorAll('.star-rating-btn').forEach(b => {
            const bVal = Number(b.getAttribute('data-val'));
            b.classList.toggle('active', bVal <= val);
          });

          // Text aktualisieren falls Schlaf
          if (field === 'sleepQuality') {
            const labelSpan = group.querySelector('span');
            if (labelSpan) labelSpan.textContent = getSleepQualityText(val);
          }
          saveTrackerData();
        });
      });
    });

    // 6. Text-Inputs & Textareas
    const cycleDayInput = card.querySelector('#input-cycleDay');
    if (cycleDayInput) {
      cycleDayInput.addEventListener('input', (e) => {
        dayData.cycleDay = e.target.value ? Number(e.target.value) : '';
        saveTrackerData();
      });
    }

    const medsCustomInput = card.querySelector('#input-medsCustom');
    if (medsCustomInput) {
      medsCustomInput.addEventListener('input', (e) => {
        dayData.medsCustom = e.target.value;
        saveTrackerData();
      });
    }

    const antiInflammatoryCb = card.querySelector('#cb-antiInflammatory');
    if (antiInflammatoryCb) {
      antiInflammatoryCb.addEventListener('change', (e) => {
        dayData.nutritionAntiInflammatory = e.target.checked;
        saveTrackerData();
      });
    }

    const meditationToggleBtn = card.querySelector('#btn-meditationToggle');
    if (meditationToggleBtn) {
      meditationToggleBtn.addEventListener('click', () => {
        dayData.meditationDone = !dayData.meditationDone;
        meditationToggleBtn.classList.toggle('active', dayData.meditationDone);
        meditationToggleBtn.textContent = dayData.meditationDone 
          ? '✓ Ja, heute praktiziert' 
          : '○ Heute noch nicht';
        saveTrackerData();
      });
    }

    const notesDailyTextarea = card.querySelector('#textarea-notesDaily');
    if (notesDailyTextarea) {
      notesDailyTextarea.addEventListener('input', (e) => {
        dayData.notesDaily = e.target.value;
        saveTrackerData();
      });
    }

    // 7. Arzt- & Therapietermine
    if (catId === 'appointments') {
      const togglePhysioBtn = card.querySelector('#btn-togglePhysio');
      const subcardPhysio = card.querySelector('#subcard-physio');
      const statusPhysioIcon = togglePhysioBtn ? togglePhysioBtn.querySelector('.toggle-status-icon') : null;

      const updatePhysioUi = () => {
        if (togglePhysioBtn) {
          togglePhysioBtn.classList.toggle('active', !!dayData.hasPhysio);
          if (statusPhysioIcon) statusPhysioIcon.textContent = dayData.hasPhysio ? '✓ Erfasst' : '○ Nicht erfasst';
        }
        if (subcardPhysio) {
          subcardPhysio.classList.toggle('is-active', !!dayData.hasPhysio);
          const fields = subcardPhysio.querySelector('.appointment-fields');
          if (fields) fields.style.opacity = dayData.hasPhysio ? '1' : '0.85';
        }
      };

      if (togglePhysioBtn) {
        togglePhysioBtn.addEventListener('click', () => {
          dayData.hasPhysio = !dayData.hasPhysio;
          updatePhysioUi();
          saveTrackerData();
        });
      }

      card.querySelectorAll('.pill-options-group[data-field="physioTypes"] .tracker-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!dayData.hasPhysio && dayData.physioTypes && dayData.physioTypes.length > 0) {
            dayData.hasPhysio = true;
            updatePhysioUi();
          }
        });
      });

      const inputPhysioCustom = card.querySelector('#input-physioCustom');
      if (inputPhysioCustom) {
        inputPhysioCustom.addEventListener('input', (e) => {
          dayData.physioCustom = e.target.value;
          if (e.target.value.trim() && !dayData.hasPhysio) {
            dayData.hasPhysio = true;
            updatePhysioUi();
          }
          saveTrackerData();
        });
      }

      const textareaPhysioNotes = card.querySelector('#textarea-physioNotes');
      if (textareaPhysioNotes) {
        textareaPhysioNotes.addEventListener('input', (e) => {
          dayData.physioNotes = e.target.value;
          saveTrackerData();
        });
      }

      const toggleDoctorBtn = card.querySelector('#btn-toggleDoctor');
      const subcardDoctor = card.querySelector('#subcard-doctor');
      const statusDoctorIcon = toggleDoctorBtn ? toggleDoctorBtn.querySelector('.toggle-status-icon') : null;

      const updateDoctorUi = () => {
        if (toggleDoctorBtn) {
          toggleDoctorBtn.classList.toggle('active', !!dayData.hasDoctor);
          if (statusDoctorIcon) statusDoctorIcon.textContent = dayData.hasDoctor ? '✓ Erfasst' : '○ Nicht erfasst';
        }
        if (subcardDoctor) {
          subcardDoctor.classList.toggle('is-active', !!dayData.hasDoctor);
          const fields = subcardDoctor.querySelector('.appointment-fields');
          if (fields) fields.style.opacity = dayData.hasDoctor ? '1' : '0.85';
        }
      };

      if (toggleDoctorBtn) {
        toggleDoctorBtn.addEventListener('click', () => {
          dayData.hasDoctor = !dayData.hasDoctor;
          updateDoctorUi();
          saveTrackerData();
        });
      }

      const inputDoctorType = card.querySelector('#input-doctorType');
      if (inputDoctorType) {
        inputDoctorType.addEventListener('input', (e) => {
          dayData.doctorType = e.target.value;
          if (e.target.value.trim() && !dayData.hasDoctor) {
            dayData.hasDoctor = true;
            updateDoctorUi();
          }
          saveTrackerData();
        });
      }

      card.querySelectorAll('.quick-suggest-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-suggest');
          if (inputDoctorType) {
            const currentVal = inputDoctorType.value.trim();
            if (!currentVal) {
              inputDoctorType.value = val;
            } else if (!currentVal.includes(val)) {
              inputDoctorType.value = `${currentVal}, ${val}`;
            }
            dayData.doctorType = inputDoctorType.value;
            dayData.hasDoctor = true;
            updateDoctorUi();
            saveTrackerData();
          }
        });
      });

      const textareaDoctorNotes = card.querySelector('#textarea-doctorNotes');
      if (textareaDoctorNotes) {
        textareaDoctorNotes.addEventListener('input', (e) => {
          dayData.doctorNotes = e.target.value;
          saveTrackerData();
        });
      }
    }
  }

  function setupCustomCardInteractions(card, customCat, dayData) {
    if (!dayData.customValues) dayData.customValues = {};

    // Lösch-Button
    const delBtn = card.querySelector('.delete-custom-btn');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        if (confirm(`Möchtest du die Kategorie "${customCat.title}" wirklich dauerhaft entfernen?`)) {
          trackerConfig.customCategories = trackerConfig.customCategories.filter(c => c.id !== customCat.id);
          saveTrackerConfig();
          renderTrackerCards();
        }
      });
    }

    // Slider
    const slider = card.querySelector('.custom-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        dayData.customValues[customCat.id] = val;
        const badge = card.querySelector(`#badge-custom-${customCat.id}`);
        if (badge) badge.textContent = `${val}/10`;
        saveTrackerData();
      });
    }

    // Rating
    const ratingGroup = card.querySelector('.custom-rating');
    if (ratingGroup) {
      ratingGroup.querySelectorAll('.star-rating-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = Number(btn.getAttribute('data-val'));
          dayData.customValues[customCat.id] = val;
          ratingGroup.querySelectorAll('.star-rating-btn').forEach(b => {
            const bVal = Number(b.getAttribute('data-val'));
            b.classList.toggle('active', bVal <= val);
          });
          saveTrackerData();
        });
      });
    }

    // Boolean
    const boolBtn = card.querySelector('.custom-bool-btn');
    if (boolBtn) {
      boolBtn.addEventListener('click', () => {
        const current = !!dayData.customValues[customCat.id];
        const next = !current;
        dayData.customValues[customCat.id] = next;
        boolBtn.classList.toggle('active', next);
        boolBtn.textContent = next ? '✓ Erledigt / Ja' : '○ Nicht durchgeführt / Nein';
        saveTrackerData();
      });
    }

    // Text
    const textInput = card.querySelector('.custom-text-input');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        dayData.customValues[customCat.id] = e.target.value;
        saveTrackerData();
      });
    }
  }

  /* ==========================================================================
     GLOBAL EVENT HANDLERS (Toolbar, Navigation & Modale)
     ========================================================================== */
  function setupEventHandlers() {
    // 1. Datumspicker Navigation
    const prevBtn = document.getElementById('trackerPrevDayBtn');
    const nextBtn = document.getElementById('trackerNextDayBtn');
    const todayBtn = document.getElementById('trackerTodayBtn');
    const datePicker = document.getElementById('trackerDatePicker');

    if (prevBtn) prevBtn.addEventListener('click', () => stepDate(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => stepDate(1));
    if (todayBtn) todayBtn.addEventListener('click', () => setDate(getTodayDateString()));
    if (datePicker) {
      datePicker.addEventListener('change', (e) => {
        if (e.target.value) setDate(e.target.value);
      });
    }

    // Wochen-Buttons (◀ Vorherige 7 Tage / Nächste 7 Tage ▶)
    const stripPrevBtn = document.getElementById('stripPrevWeekBtn');
    const stripNextBtn = document.getElementById('stripNextWeekBtn');
    if (stripPrevBtn) stripPrevBtn.addEventListener('click', () => stepDate(-7));
    if (stripNextBtn) stripNextBtn.addEventListener('click', () => stepDate(7));

    // 2. Toolbar: Kategorie hinzufügen (+ Button)
    const addCatBtn = document.getElementById('trackerAddCategoryBtn');
    const addModal = document.getElementById('modalAddCategory');
    const closeAddModalBtn = document.getElementById('closeAddCategoryModalBtn');
    const cancelAddModalBtn = document.getElementById('cancelAddCategoryBtn');
    const saveAddCatBtn = document.getElementById('saveNewCategoryBtn');

    if (addCatBtn && addModal) {
      addCatBtn.addEventListener('click', () => {
        resetAddCategoryForm();
        addModal.classList.add('active');
      });
    }

    [closeAddModalBtn, cancelAddModalBtn].forEach(btn => {
      if (btn && addModal) {
        btn.addEventListener('click', () => addModal.classList.remove('active'));
      }
    });

    // Icon Auswahl im Modal
    if (addModal) {
      addModal.querySelectorAll('.icon-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          addModal.querySelectorAll('.icon-choice-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    if (saveAddCatBtn) {
      saveAddCatBtn.addEventListener('click', handleSaveNewCategory);
    }

    // 3. Toolbar: Kategorien anpassen & wiederherstellen
    const manageCatBtn = document.getElementById('trackerManageCategoriesBtn');
    const manageModal = document.getElementById('modalManageCategories');
    const closeManageModalBtn = document.getElementById('closeManageCategoriesModalBtn');

    if (manageCatBtn && manageModal) {
      manageCatBtn.addEventListener('click', () => {
        renderManageCategoriesList();
        manageModal.classList.add('active');
      });
    }

    if (closeManageModalBtn && manageModal) {
      closeManageModalBtn.addEventListener('click', () => manageModal.classList.remove('active'));
    }

    // 4. Toolbar: PDF Drucken / Speichern
    const printBtn = document.getElementById('trackerPrintBtn');
    const printModal = document.getElementById('modalPrintOptions');
    const closePrintModalBtn = document.getElementById('closePrintModalBtn');
    const executePrintBtn = document.getElementById('executePrintBtn');

    if (printBtn && printModal) {
      printBtn.addEventListener('click', () => {
        printModal.classList.add('active');
      });
    }

    if (closePrintModalBtn && printModal) {
      closePrintModalBtn.addEventListener('click', () => printModal.classList.remove('active'));
    }

    // Druck-Option Karten (Wochenübersicht vs. Monatsübersicht vs. Tagesbericht)
    if (printModal) {
      printModal.querySelectorAll('.print-option-card').forEach(card => {
        card.addEventListener('click', () => {
          printModal.querySelectorAll('.print-option-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        });
      });
    }

    if (executePrintBtn) {
      executePrintBtn.addEventListener('click', () => {
        const activeOption = printModal.querySelector('.print-option-card.active');
        const printMode = activeOption ? activeOption.getAttribute('data-mode') : 'week';
        const includeNotesCb = document.getElementById('printIncludeAppointmentNotes');
        const includePrivateNotes = includeNotesCb ? includeNotesCb.checked : false;
        printModal.classList.remove('active');
        triggerPrintReport(printMode, includePrivateNotes);
      });
    }

    // 5. Toolbar: Backup & Export
    const exportBtn = document.getElementById('trackerExportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', handleExportData);
    }

    const importBtn = document.getElementById('trackerImportBtn');
    const importInput = document.getElementById('trackerImportFile');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', handleImportData);
    }
  }

  /* --- Eigene Kategorie speichern --- */
  function resetAddCategoryForm() {
    const titleInput = document.getElementById('newCategoryTitle');
    const typeSelect = document.getElementById('newCategoryType');
    if (titleInput) titleInput.value = '';
    if (typeSelect) typeSelect.value = 'scale10';

    const addModal = document.getElementById('modalAddCategory');
    if (addModal) {
      addModal.querySelectorAll('.icon-choice-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === 0);
      });
    }
  }

  function handleSaveNewCategory() {
    const titleInput = document.getElementById('newCategoryTitle');
    const typeSelect = document.getElementById('newCategoryType');
    const activeIconBtn = document.querySelector('#modalAddCategory .icon-choice-btn.active');
    const addModal = document.getElementById('modalAddCategory');

    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      alert('Bitte gib einen Namen für deine neue Tracking-Kategorie ein.');
      return;
    }

    const id = 'custom_' + Date.now();
    const type = typeSelect ? typeSelect.value : 'scale10';
    const icon = activeIconBtn ? activeIconBtn.getAttribute('data-icon') : '✨';

    if (!trackerConfig.customCategories) trackerConfig.customCategories = [];
    trackerConfig.customCategories.push({
      id: id,
      title: title,
      type: type,
      icon: icon
    });

    saveTrackerConfig();
    if (addModal) addModal.classList.remove('active');
    renderTrackerCards();
  }

  /* --- Kategorien verwalten & wiederherstellen --- */
  function renderManageCategoriesList() {
    const listEl = document.getElementById('manageCategoriesList');
    if (!listEl) return;

    listEl.innerHTML = '';

    // Alle Kategorien auflisten
    const allCategories = [
      ...DEFAULT_CATEGORIES,
      ...(trackerConfig.customCategories || [])
    ];

    allCategories.forEach(cat => {
      const isHidden = trackerConfig.hiddenCategories.includes(cat.id);
      const row = document.createElement('div');
      row.className = 'manage-category-item';
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.2rem;">${cat.icon}</span>
          <strong style="color: var(--text-main);">${escapeHtml(cat.title)}</strong>
        </div>
        <button type="button" class="tracker-btn tracker-btn-secondary" style="padding: 6px 14px; font-size: 0.85rem;" data-toggle-cat="${cat.id}">
          ${isHidden ? '+ Einblenden' : 'Ausblenden'}
        </button>
      `;

      row.querySelector('button').addEventListener('click', () => {
        if (isHidden) {
          trackerConfig.hiddenCategories = trackerConfig.hiddenCategories.filter(id => id !== cat.id);
        } else {
          trackerConfig.hiddenCategories.push(cat.id);
        }
        saveTrackerConfig();
        renderManageCategoriesList();
        renderTrackerCards();
      });

      listEl.appendChild(row);
    });
  }

  /* ==========================================================================
     DRUCK- & PDF-GENERIERUNG MIT SYMBOLEN & LEGENDE
     ========================================================================== */
  function triggerPrintReport(mode, includePrivateNotes = false) {
    const printContainer = document.getElementById('printReportContainer');
    if (!printContainer) return;

    // 1. Dynamisches @page CSS injizieren für saubere Orientierung (Querformat für Woche & Monat)
    let pageStyleEl = document.getElementById('printDynamicOrientationStyle');
    if (!pageStyleEl) {
      pageStyleEl = document.createElement('style');
      pageStyleEl.id = 'printDynamicOrientationStyle';
      document.head.appendChild(pageStyleEl);
    }

    if (mode === 'week' || mode === 'month') {
      pageStyleEl.textContent = '@page { size: A4 landscape; margin: 8mm 8mm; }';
    } else {
      pageStyleEl.textContent = '@page { size: A4 portrait; margin: 10mm 10mm; }';
    }

    // 2. Inhalt generieren
    if (mode === 'week') {
      printContainer.innerHTML = generateWeekPrintHtml(currentDate, includePrivateNotes);
    } else if (mode === 'month') {
      printContainer.innerHTML = generateMonthPrintHtml(currentDate, includePrivateNotes);
    } else {
      printContainer.innerHTML = generateDayPrintHtml(currentDate, includePrivateNotes);
    }

    // 3. Druckdialog aufrufen
    setTimeout(() => {
      window.print();
    }, 180);
  }

  function renderPrintAppointmentsCard(data, includePrivateNotes) {
    const hasPhysio = data.hasPhysio || (data.physioTypes && data.physioTypes.length) || data.physioCustom;
    const hasDoctor = data.hasDoctor || data.doctorType;
    if (!hasPhysio && !hasDoctor) return '';

    const physioParts = [];
    if (data.physioTypes && data.physioTypes.length) physioParts.push(data.physioTypes.join(', '));
    if (data.physioCustom) physioParts.push(escapeHtml(data.physioCustom));

    return `
      <div class="print-item-card" style="margin-bottom: 14px; background: #FFFDF9; border: 1.5px solid #C29B63;">
        <h4>🩺 Arzt- &amp; Therapietermine</h4>
        <p style="margin: 0; line-height: 1.6;">
          ${hasPhysio ? `
            • 💆‍♀️ Physiotherapie: <strong>${physioParts.length ? physioParts.join(' – ') : 'Wahrgenommen'}</strong><br>
            ${includePrivateNotes && data.physioNotes ? `<span style="font-style: italic; color: #444; margin-left: 14px; display: inline-block;">Notiz: „${escapeHtml(data.physioNotes)}“</span><br>` : ''}
          ` : ''}
          ${hasDoctor ? `
            • 🩺 Arzttermin: <strong>${data.doctorType ? escapeHtml(data.doctorType) : 'Wahrgenommen'}</strong><br>
            ${includePrivateNotes && data.doctorNotes ? `<span style="font-style: italic; color: #444; margin-left: 14px; display: inline-block;">Notiz: „${escapeHtml(data.doctorNotes)}“</span><br>` : ''}
          ` : ''}
          ${!includePrivateNotes && (data.physioNotes || data.doctorNotes) ? `
            <span style="font-size: 8pt; color: #777;">🔒 Persönliche Gesprächs- &amp; Behandlungsnotizen wurden zum Schutz deiner Privatsphäre im Ausdruck ausgeblendet.</span>
          ` : ''}
        </p>
      </div>
    `;
  }

  function getAppointmentsSummaryShort(data) {
    const parts = [];
    if (data.hasPhysio || (data.physioTypes && data.physioTypes.length) || data.physioCustom) {
      if (data.physioTypes && data.physioTypes.length) {
        parts.push(`💆‍♀️ Physio (${data.physioTypes[0].replace('-Physio', '')})`);
      } else {
        parts.push('💆‍♀️ Physio');
      }
    }
    if (data.hasDoctor || data.doctorType) {
      if (data.doctorType) {
        const shortDoc = data.doctorType.split(',')[0].trim();
        parts.push(`🩺 Dr. (${shortDoc.length > 15 ? shortDoc.substring(0, 13) + '…' : shortDoc})`);
      } else {
        parts.push('🩺 Arzttermin');
      }
    }
    return parts.length ? parts.join('<br>') : '—';
  }

  function generateDayPrintHtml(dateStr, includePrivateNotes = false) {
    const data = getDayData(dateStr);
    const dateFormatted = formatGermanDate(dateStr);

    return `
      <div class="print-header">
        <div class="print-title">
          <h1>Gesundheit bei Endometriose – Symptombericht</h1>
          <p>Mein persönliches Gesundheitstagebuch & Dokumentation zur Selbstbestimmung</p>
        </div>
        <div class="print-meta-box">
          Datum: <strong>${dateFormatted}</strong><br>
          ${data.cycleDay ? `Zyklustag: <strong>Tag ${data.cycleDay}</strong>` : ''} 
          ${data.cyclePhase ? `(${getCyclePhaseLabel(data.cyclePhase)})` : ''}
        </div>
      </div>

      <div class="print-summary-grid">
        <!-- 1. Schmerzen -->
        <div class="print-item-card">
          <h4>⚡ Schmerzdokumentation (Skala 1–10)</h4>
          <p>
            • Unterleib / Beckenraum: <span class="print-pain-indicator">${data.painAbdomen || 0}/10</span> (${getPainLabel(data.painAbdomen)})<br>
            • Rücken & Lenden: <span class="print-pain-indicator">${data.painBack || 0}/10</span> (${getPainLabel(data.painBack)})<br>
            • Kopf & Migräne: <span class="print-pain-indicator">${data.painHead || 0}/10</span> (${getPainLabel(data.painHead)})<br>
            • Beckenboden & Beine: <span class="print-pain-indicator">${data.painPelvic || 0}/10</span> (${getPainLabel(data.painPelvic)})<br>
            ${data.painType && data.painType.length ? `• Charakter: <em>${data.painType.join(', ')}</em>` : ''}
          </p>
        </div>

        <!-- 2. Zyklus & Blutung -->
        <div class="print-item-card">
          <h4>🩸 Zyklus & Menstruation</h4>
          <p>
            • Zyklustag: <strong>${data.cycleDay ? `Tag ${data.cycleDay}` : 'Nicht erfasst'}</strong><br>
            • Phase: <strong>${getCyclePhaseLabel(data.cyclePhase)}</strong><br>
            • Blutungsstärke: <strong>${getFlowLabel(data.flow)}</strong><br>
            ${data.cycleSymptoms && data.cycleSymptoms.length ? `• Begleiter: ${data.cycleSymptoms.join(', ')}` : ''}
          </p>
        </div>

        <!-- 3. Schlaf & Erholung -->
        <div class="print-item-card">
          <h4>😴 Schlaf & Erholung</h4>
          <p>
            • Schlafdauer: <strong>${data.sleepHours || 0} Stunden</strong><br>
            • Qualität: <strong>${getSleepQualityText(data.sleepQuality)} (${data.sleepQuality || 0}/5)</strong><br>
            ${data.sleepSymptoms && data.sleepSymptoms.length ? `• Besonderheiten: ${data.sleepSymptoms.join(', ')}` : ''}
          </p>
        </div>

        <!-- 4. Medikamente & Supplements -->
        <div class="print-item-card">
          <h4>💊 Medikamente & Vitalstoffe</h4>
          <p>
            • Schmerzmittel: <strong>${data.medsPain && data.medsPain.length ? data.medsPain.join(', ') : 'Keine'}</strong><br>
            • Vitalstoffe: <strong>${data.medsSupplements && data.medsSupplements.length ? data.medsSupplements.join(', ') : 'Keine'}</strong><br>
            ${data.medsCustom ? `• Details/Dosis: ${escapeHtml(data.medsCustom)}` : ''}
          </p>
        </div>

        <!-- 5. Endo-Belly & Verdauung -->
        <div class="print-item-card">
          <h4>🎈 Endo-Belly & 🌿 Verdauung</h4>
          <p>
            • Endo-Belly Ausprägung: <strong>${getEndoBellyLabel(data.endoBellySeverity)}</strong><br>
            • Stuhlgang: <strong>${getDigestionStatusLabel(data.digestionStatus)}</strong><br>
            • Schmerzen bei Stuhlgang (Dyschezie): <strong>${data.digestionPain || 0}/10</strong><br>
            ${data.endoBellySymptoms && data.endoBellySymptoms.length ? `• Endo-Belly Symptome: ${data.endoBellySymptoms.join(', ')}<br>` : ''}
            ${data.digestionSymptoms && data.digestionSymptoms.length ? `• Magen/Darm: ${data.digestionSymptoms.join(', ')}` : ''}
          </p>
        </div>

        <!-- 6. Energie, Fokus & Achtsamkeit -->
        <div class="print-item-card">
          <h4>🔋 Energie, 🧠 Mentale Klarheit & 🧘‍♀️ Meditation</h4>
          <p>
            • Vitalitäts-Level: <strong>${data.energyLevel || 0}/10</strong> (${getEnergyLabel(data.energyLevel)})<br>
            • Mentale Klarheit: <strong>${data.brainFogLevel || 0}/10</strong> (${getBrainFogLabel(data.brainFogLevel)})<br>
            • Meditation: <strong>${data.meditationDone ? `Ja (${data.meditationMinutes} Min. ${data.meditationTypes.join(', ')})` : 'Nein'}</strong><br>
            ${data.moodTags && data.moodTags.length ? `• Seelenbefinden: <em>${data.moodTags.join(', ')}</em>` : ''}
          </p>
        </div>
      </div>

      <!-- Arzt- & Therapietermine -->
      ${renderPrintAppointmentsCard(data, includePrivateNotes)}

      <!-- Notizen & Reflexion -->
      ${data.notesDaily ? `
        <div class="print-item-card" style="margin-bottom: 16px;">
          <h4>📝 Tagesreflexion & Wohlfühl-Moment</h4>
          <p style="font-style: italic;">„${escapeHtml(data.notesDaily)}“</p>
        </div>
      ` : ''}

      <!-- Legende & Symbolerklärung -->
      <div class="print-legend">
        <h4>Legende & Erläuterung der Skalen & Symbole</h4>
        <div class="print-legend-grid">
          <div class="legend-item"><strong>Skala 1–3:</strong> Leicht, kaum einschränkend</div>
          <div class="legend-item"><strong>Skala 4–6:</strong> Mäßig, Alltag beeinträchtigt</div>
          <div class="legend-item"><strong>Skala 7–10:</strong> Stark bis extrem, Bettruhe nötig</div>
          <div class="legend-item">🩸 Zyklus & Menstruation</div>
          <div class="legend-item">⚡ Schmerz (Bauch/Rücken/Kopf)</div>
          <div class="legend-item">🎈 Endo-Belly (Blähbauch)</div>
          <div class="legend-item">🌿 Verdauung / Dyschezie</div>
          <div class="legend-item">😴 Schlafqualität (1–5)</div>
          <div class="legend-item">💊 Medikation / Schmerztherapie</div>
          <div class="legend-item">🩺 Arzt- &amp; Therapietermine</div>
        </div>
      </div>

      <!-- Arztnotiz-Feld -->
      <div class="print-doctor-notes">
        <h4>Ärztliche Bemerkungen / Nächste Schritte:</h4>
        <div class="print-notes-lines"></div>
      </div>
    `;
  }

  function getDigestionStatusShort(status) {
    const map = {
      normal: 'Norm',
      constipation: 'Verstopf.',
      diarrhea: 'Durchfall',
      bloating: 'Blähung'
    };
    return map[status] || '—';
  }

  function generateWeekPrintHtml(centerDateStr, includePrivateNotes = false) {
    const centerDate = parseDateKey(centerDateStr);
    const days = [];
    let totalPainSum = 0;
    let painDaysCount = 0;
    let medsDaysCount = 0;
    let appointmentsCount = 0;
    let totalMeditationMins = 0;

    for (let i = -3; i <= 3; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      const key = formatDateKey(d);
      const data = trackerData[key] || {};
      days.push({ dateObj: d, key: key, data: data });

      const maxP = getMaxPainForDay(data);
      if (maxP > 0) {
        painDaysCount++;
        totalPainSum += maxP;
      }
      if ((data.medsPain && data.medsPain.length) || (data.medsSupplements && data.medsSupplements.length) || data.medsCustom) {
        medsDaysCount++;
      }
      if (data.hasDoctor || data.doctorType || data.hasPhysio || (data.physioTypes && data.physioTypes.length)) {
        appointmentsCount++;
      }
      if (data.meditationDone) {
        totalMeditationMins += (Number(data.meditationMinutes) || 10);
      }
    }

    const avgPain = painDaysCount > 0 ? (totalPainSum / painDaysCount).toFixed(1) : '0';
    const dateRangeStr = `${formatGermanDate(days[0].key)} bis ${formatGermanDate(days[6].key)}`;

    const rows = days.map(item => {
      const d = item.dateObj;
      const data = item.data;
      const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      const dateShort = `${weekdays[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;

      // Zyklus & Phase
      let cycleCell = '—';
      if (data.cycleDay || data.cyclePhase || (data.flow && data.flow !== 'none')) {
        const parts = [];
        if (data.cycleDay) parts.push(`<strong>ZT ${data.cycleDay}</strong>`);
        if (data.cyclePhase) parts.push(getCyclePhaseLabel(data.cyclePhase));
        if (data.flow && data.flow !== 'none') parts.push(`Blutung: ${getFlowLabel(data.flow)}`);
        cycleCell = parts.join('<br>');
      }

      // Schmerzen (Unterleib, Rücken, Kopf, Becken)
      const painParts = [];
      const pAbd = Number(data.painAbdomen) || 0;
      const pBck = Number(data.painBack) || 0;
      const pHd = Number(data.painHead) || 0;
      const pPel = Number(data.painPelvic) || 0;

      painParts.push(`Bauch: <span class="${getPainChipClass(pAbd)}">${pAbd}/10</span>`);
      if (pBck > 0) painParts.push(`Rücken: <span class="${getPainChipClass(pBck)}">${pBck}/10</span>`);
      if (pHd > 0) painParts.push(`Kopf: <span class="${getPainChipClass(pHd)}">${pHd}/10</span>`);
      if (pPel > 0) painParts.push(`Becken: <span class="${getPainChipClass(pPel)}">${pPel}/10</span>`);
      if (data.painType && data.painType.length) {
        painParts.push(`<em style="font-size: 7.2pt; color: #555;">${escapeHtml(data.painType.join(', '))}</em>`);
      }
      const painCell = painParts.join('<br>');

      // Endo-Belly & Verdauung
      const bellyParts = [];
      if (Number(data.endoBellySeverity) > 0) {
        bellyParts.push(`🎈 Belly: <strong>Stufe ${data.endoBellySeverity}/4</strong>`);
      }
      if (data.digestionStatus) {
        bellyParts.push(`🌿 ${getDigestionStatusLabel(data.digestionStatus)}`);
      }
      if (Number(data.digestionPain) > 0) {
        bellyParts.push(`Schmerz Stuhl: ${data.digestionPain}/10`);
      }
      const bellyCell = bellyParts.length ? bellyParts.join('<br>') : '—';

      // Schlaf & Energie / Fokus
      const sleepParts = [];
      if (data.sleepHours) sleepParts.push(`😴 ${data.sleepHours}h (${data.sleepQuality || 0}/5★)`);
      if (data.energyLevel) sleepParts.push(`🔋 Vitalität: ${data.energyLevel}/10`);
      if (data.brainFogLevel) sleepParts.push(`🧠 Klarheit: ${data.brainFogLevel}/10`);
      const sleepCell = sleepParts.length ? sleepParts.join('<br>') : '—';

      // Stimmung / Befinden
      let moodCell = '—';
      if (data.moodTags && data.moodTags.length) {
        moodCell = `💖 ${escapeHtml(data.moodTags.join(', '))}`;
      }

      // Medikamente & Vitalstoffe
      const medParts = [];
      if (data.medsPain && data.medsPain.length) medParts.push(`<strong>${escapeHtml(data.medsPain.join(', '))}</strong>`);
      if (data.medsSupplements && data.medsSupplements.length) medParts.push(escapeHtml(data.medsSupplements.join(', ')));
      if (data.medsCustom) medParts.push(`<span style="font-size: 7.2pt; color: #444;">${escapeHtml(data.medsCustom)}</span>`);
      const medsCell = medParts.length ? medParts.join('<br>') : '—';

      // Arzt- & Therapietermine
      const appParts = [];
      if (data.hasPhysio || (data.physioTypes && data.physioTypes.length) || data.physioCustom) {
        const pDesc = data.physioCustom ? escapeHtml(data.physioCustom) : (data.physioTypes ? data.physioTypes.join(', ') : 'Wahrgenommen');
        appParts.push(`💆‍♀️ Physio: <strong>${pDesc}</strong>`);
        if (includePrivateNotes && data.physioNotes) {
          appParts.push(`<span style="font-style: italic; color: #555;">„${escapeHtml(data.physioNotes)}“</span>`);
        }
      }
      if (data.hasDoctor || data.doctorType) {
        const dDesc = data.doctorType ? escapeHtml(data.doctorType) : 'Arzttermin';
        appParts.push(`🩺 ${dDesc}`);
        if (includePrivateNotes && data.doctorNotes) {
          appParts.push(`<span style="font-style: italic; color: #555;">„${escapeHtml(data.doctorNotes)}“</span>`);
        }
      }
      const appCell = appParts.length ? appParts.join('<br>') : '—';

      // Meditation & Notizen
      const noteParts = [];
      if (data.meditationDone) {
        const mType = data.meditationTypes && data.meditationTypes.length ? `(${data.meditationTypes[0]})` : '';
        noteParts.push(`🧘‍♀️ ${data.meditationMinutes || 10} Min ${mType}`);
      }
      if (data.notesDaily) {
        const truncNote = data.notesDaily.length > 80 ? data.notesDaily.substring(0, 77) + '…' : data.notesDaily;
        noteParts.push(`📝 <em>„${escapeHtml(truncNote)}“</em>`);
      }
      const noteCell = noteParts.length ? noteParts.join('<br>') : '—';

      return `
        <tr>
          <td class="cell-date">${dateShort}</td>
          <td class="cell-cycle">${cycleCell}</td>
          <td class="cell-pain">${painCell}</td>
          <td>${bellyCell}</td>
          <td>${sleepCell}</td>
          <td>${moodCell}</td>
          <td class="cell-meds">${medsCell}</td>
          <td class="cell-appointments">${appCell}</td>
          <td>${noteCell}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="print-landscape-wrapper">
        <div class="print-header">
          <div class="print-title">
            <h1>Gesundheit bei Endometriose – Symptom-Wochenbericht (7 Tage)</h1>
            <p>Strukturierte Wochenübersicht für die gynäkologische &amp; schmerztherapeutische Verlaufskontrolle</p>
          </div>
          <div class="print-meta-box">
            Zeitraum: <strong>${dateRangeStr}</strong><br>
            Erstellt am: ${formatGermanDate(getTodayDateString())}
          </div>
        </div>

        <div class="print-stats-bar">
          <span class="print-stat-item">Schmerztage: <strong>${painDaysCount} von 7 Tagen</strong></span>
          <span class="print-stat-item">Ø Schmerzintensität: <strong>${avgPain} / 10</strong></span>
          <span class="print-stat-item">Medikamenteneinnahme: <strong>${medsDaysCount} Tage</strong></span>
          <span class="print-stat-item">Arzt- / Therapietermine: <strong>${appointmentsCount} wahrgenommen</strong></span>
          <span class="print-stat-item">Achtsamkeit &amp; Meditation: <strong>${totalMeditationMins} Minuten gesamt</strong></span>
        </div>

        <table class="print-week-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>🩸 Zyklus &amp; Phase</th>
              <th>⚡ Schmerzen (1–10)</th>
              <th>🎈 Belly &amp; Darm</th>
              <th>😴 Schlaf, Energie &amp; Fokus</th>
              <th>💖 Befinden</th>
              <th>💊 Medikamente</th>
              <th>🩺 Termine</th>
              <th>🧘‍♀️ Achtsamkeit &amp; Notiz</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="print-legend">
          <h4>Legende &amp; Skalen (nach EEL-Kriterien)</h4>
          <div class="print-legend-grid">
            <div class="legend-item"><span class="pain-chip pain-chip-0">0/10</span> Schmerzfrei</div>
            <div class="legend-item"><span class="pain-chip pain-chip-mild">1–3/10</span> Leicht / gut tolerierbar</div>
            <div class="legend-item"><span class="pain-chip pain-chip-mod">4–6/10</span> Mäßig / Alltag beeinträchtigt</div>
            <div class="legend-item"><span class="pain-chip pain-chip-sev">7–10/10</span> Stark / Bettruhe erforderlich</div>
            <div class="legend-item">🩸 ZT = Zyklustag</div>
            <div class="legend-item">🎈 Belly: Stufe 1 (leicht) bis 4 (schmerzhaft gespannt)</div>
            <div class="legend-item">💊 Medikation: Schmerzmittel &amp; Vitalstoff-Therapie</div>
            <div class="legend-item">🩺 Termine: ${includePrivateNotes ? 'Inklusive persönlicher Notizen' : 'Notizen aus Datenschutzgründen ausgeblendet'}</div>
          </div>
        </div>

        <div class="print-doctor-notes">
          <h4>Ärztliche Besprechungsnotizen / Nächste Therapieschritte:</h4>
          <div class="print-notes-lines"></div>
        </div>
      </div>
    `;
  }

  function generateMonthPrintHtml(centerDateStr, includePrivateNotes = false) {
    const centerDate = parseDateKey(centerDateStr);
    const days = [];
    let totalPainSum = 0;
    let painDaysCount = 0;
    let maxPainOverall = 0;
    let maxPainDay = '—';
    let medsDaysCount = 0;
    let appointmentsCount = 0;

    // 30 Tage rückblickend bis zum Stichtag
    for (let i = 29; i >= 0; i--) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() - i);
      const key = formatDateKey(d);
      const data = trackerData[key] || {};
      days.push({ dateObj: d, key: key, data: data });

      const maxP = getMaxPainForDay(data);
      if (maxP > 0) {
        painDaysCount++;
        totalPainSum += maxP;
        if (maxP > maxPainOverall) {
          maxPainOverall = maxP;
          maxPainDay = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
        }
      }
      if ((data.medsPain && data.medsPain.length) || (data.medsSupplements && data.medsSupplements.length) || data.medsCustom) {
        medsDaysCount++;
      }
      if (data.hasDoctor || data.doctorType || data.hasPhysio || (data.physioTypes && data.physioTypes.length)) {
        appointmentsCount++;
      }
    }

    const avgPain = painDaysCount > 0 ? (totalPainSum / painDaysCount).toFixed(1) : '0';
    const dateRangeStr = `${formatGermanDate(days[0].key)} bis ${formatGermanDate(days[29].key)}`;

    const rows = days.map(item => {
      const d = item.dateObj;
      const data = item.data;
      const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      const dateShort = `${weekdays[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;

      const zt = data.cycleDay ? `T${data.cycleDay}` : '—';
      const flow = getFlowLabelShort(data.flow);

      const pAbd = Number(data.painAbdomen) || 0;
      const pBck = Number(data.painBack) || 0;
      const pHd = Number(data.painHead) || 0;
      const pPel = Number(data.painPelvic) || 0;

      const chipAbd = pAbd > 0 ? `<span class="${getPainChipClass(pAbd)}">${pAbd}</span>` : '0';
      const chipBck = pBck > 0 ? `<span class="${getPainChipClass(pBck)}">${pBck}</span>` : '0';
      const chipHd = pHd > 0 ? `<span class="${getPainChipClass(pHd)}">${pHd}</span>` : '0';
      const chipPel = pPel > 0 ? `<span class="${getPainChipClass(pPel)}">${pPel}</span>` : '0';

      const belly = Number(data.endoBellySeverity) > 0 ? `${data.endoBellySeverity}/4` : '—';
      const digestion = data.digestionStatus ? getDigestionStatusShort(data.digestionStatus) : '—';
      const sleep = data.sleepHours ? `${data.sleepHours}h` : '—';
      const energy = data.energyLevel !== undefined ? `${data.energyLevel}/10` : '—';
      const mood = data.moodTags && data.moodTags.length ? escapeHtml(data.moodTags[0]) : '—';

      // Meds short
      let meds = '—';
      if (data.medsPain && data.medsPain.length) {
        meds = `💊 ${escapeHtml(data.medsPain.join(', '))}`;
      } else if (data.medsSupplements && data.medsSupplements.length) {
        meds = 'Supplements';
      }

      // Termine
      const app = getAppointmentsSummaryShort(data);

      // Meditation
      const med = data.meditationDone ? `🧘 ${data.meditationMinutes || 10}m` : '—';

      return `
        <tr>
          <td class="cell-date">${dateShort}</td>
          <td>${zt}</td>
          <td>${flow}</td>
          <td>${chipAbd}</td>
          <td>${chipBck}</td>
          <td>${chipHd}</td>
          <td>${chipPel}</td>
          <td>${belly}</td>
          <td>${digestion}</td>
          <td>${sleep}</td>
          <td>${energy}</td>
          <td>${mood}</td>
          <td>${meds}</td>
          <td>${app}</td>
          <td>${med}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="print-landscape-wrapper">
        <div class="print-header">
          <div class="print-title">
            <h1>Endometriose Symptom-Monatsübersicht (30 Tage)</h1>
            <p>Kompakte Verlaufsmatrix nach EEL-Standard für das Endometriosezentrum &amp; Gynäkologie</p>
          </div>
          <div class="print-meta-box">
            Zeitraum: <strong>${dateRangeStr}</strong><br>
            Stichtag: <strong>${formatGermanDate(centerDateStr)}</strong>
          </div>
        </div>

        <div class="print-stats-bar">
          <span class="print-stat-item">Dokumentierte Tage: <strong>30 Tage</strong></span>
          <span class="print-stat-item">Schmerztage: <strong>${painDaysCount} / 30</strong></span>
          <span class="print-stat-item">Ø Schmerz (an Schmerztagen): <strong>${avgPain} / 10</strong></span>
          <span class="print-stat-item">Spitzen-Schmerztag: <strong>${maxPainOverall > 0 ? `${maxPainOverall}/10 (${maxPainDay})` : 'Keine'}</strong></span>
          <span class="print-stat-item">Tage mit Medikation: <strong>${medsDaysCount} Tage</strong></span>
          <span class="print-stat-item">Wahrgenommene Termine: <strong>${appointmentsCount}</strong></span>
        </div>

        <table class="print-month-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>🩸 ZT</th>
              <th>Blutung</th>
              <th>⚡ Bauch</th>
              <th>⚡ Rücken</th>
              <th>⚡ Kopf</th>
              <th>⚡ Becken</th>
              <th>🎈 Belly</th>
              <th>🌿 Darm</th>
              <th>😴 Schlaf</th>
              <th>🔋 Energie</th>
              <th>💖 Befinden</th>
              <th>💊 Medikamente</th>
              <th>🩺 Termine</th>
              <th>🧘 Achtsamkeit</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="print-legend">
          <h4>Legende &amp; Symbolerklärung</h4>
          <div class="print-legend-grid">
            <div class="legend-item"><span class="pain-chip pain-chip-0">0</span> Schmerzfrei</div>
            <div class="legend-item"><span class="pain-chip pain-chip-mild">1–3</span> Milde Schmerzen</div>
            <div class="legend-item"><span class="pain-chip pain-chip-mod">4–6</span> Mäßige Schmerzen</div>
            <div class="legend-item"><span class="pain-chip pain-chip-sev">7–10</span> Starke Schmerzen</div>
            <div class="legend-item">Blutung: K=Keine, S=Schmier, L=Leicht, M=Mittel, St=Stark</div>
            <div class="legend-item">🎈 Belly: 0 (keiner) bis 4 (stark gespannt)</div>
            <div class="legend-item">🌿 Darm: N=Normal, V=Verstopfung, D=Durchfall, B=Blähungen</div>
            <div class="legend-item">🩺 Termine: Ärztliche &amp; physiotherapeutische Behandlungen</div>
          </div>
        </div>

        <div class="print-doctor-notes">
          <h4>Ärztliche Bemerkungen &amp; Wiedervorstellung:</h4>
          <div class="print-notes-lines"></div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     BACKUP EXPORT & IMPORT
     ========================================================================== */
  function handleExportData() {
    const backup = {
      version: 1,
      exportDate: new Date().toISOString(),
      config: trackerConfig,
      data: trackerData
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `endo-tracker-daten-${currentDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportData(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.data) {
          trackerData = Object.assign({}, trackerData, imported.data);
          saveTrackerData();
        }
        if (imported.config) {
          trackerConfig = Object.assign({}, trackerConfig, imported.config);
          saveTrackerConfig();
        }
        alert('Deine Tracker-Daten wurden erfolgreich importiert!');
        renderTrackerCards();
        renderWeekStrip();
      } catch (err) {
        alert('Fehler beim Einlesen der Backup-Datei: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  /* ==========================================================================
     HILFSFUNKTIONEN (LABELS, FORMATIERUNG, BADGES)
     ========================================================================== */
  function formatMeditationDuration(val) {
    const mins = Math.max(1, Math.min(180, Number(val) || 10));
    if (mins < 60) {
      return `${mins} Minute${mins === 1 ? '' : 'n'}`;
    }
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (remMins === 0) {
      return `${mins} Min. (${hours} Stunde${hours > 1 ? 'n' : ''})`;
    }
    return `${mins} Min. (${hours} Std. ${remMins} Min.)`;
  }

  function renderPills(optionsList, activeList) {
    if (!Array.isArray(activeList)) activeList = [];
    return optionsList.map(opt => `
      <button type="button" class="tracker-pill ${activeList.includes(opt) ? 'active' : ''}" data-val="${escapeHtml(opt)}">
        ${escapeHtml(opt)}
      </button>
    `).join('');
  }

  function getPainLabel(val) {
    val = Number(val) || 0;
    if (val === 0) return '0 - Schmerzfrei';
    if (val <= 2) return `${val} - Milder Schmerz`;
    if (val <= 4) return `${val} - Spürbar / Mäßig`;
    if (val <= 6) return `${val} - Alltag eingeschränkt`;
    if (val <= 8) return `${val} - Starker Schmerz`;
    return `${val} - Akuter Schmerzschub`;
  }

  function getPainBadgeClass(val) {
    val = Number(val) || 0;
    if (val === 0) return 'pain-badge-0';
    if (val <= 3) return 'pain-badge-low';
    if (val <= 6) return 'pain-badge-mid';
    if (val <= 8) return 'pain-badge-high';
    return 'pain-badge-extreme';
  }

  function getSleepQualityText(rating) {
    const map = {
      1: 'Sehr unruhig & erschöpft',
      2: 'Mäßig / mehrmals erwacht',
      3: 'In Ordnung',
      4: 'Gut & erholsam',
      5: 'Tief, friedlich & vital'
    };
    return map[rating] || 'Nicht bewertet';
  }

  function getEndoBellyLabel(val) {
    val = Number(val) || 0;
    const map = {
      0: 'Kein Blähbauch',
      1: 'Leichtes Spannen',
      2: 'Deutlicher Blähbauch',
      3: 'Starker Endo-Belly',
      4: 'Schmerzhafter Akut-Belly'
    };
    return map[val] || '0 - Kein Blähbauch';
  }

  function getEndoBellyBadgeClass(val) {
    val = Number(val) || 0;
    if (val === 0) return 'pain-badge-0';
    if (val === 1) return 'pain-badge-low';
    if (val === 2) return 'pain-badge-mid';
    if (val === 3) return 'pain-badge-high';
    return 'pain-badge-extreme';
  }

  function getEnergyLabel(val) {
    val = Number(val) || 5;
    if (val <= 2) return 'Fatigue / Sehr erschöpft';
    if (val <= 4) return 'Geringe Energie';
    if (val <= 6) return 'Ausgeglichen / Moderat';
    if (val <= 8) return 'Gute Vitalität';
    return 'Voller Lebenskraft';
  }

  function getBrainFogLabel(val) {
    val = Number(val) || 5;
    if (val <= 2) return 'Dichter Nebel / Wortfindungsstörung';
    if (val <= 4) return 'Benebelt / Müde';
    if (val <= 6) return 'Passabel';
    if (val <= 8) return 'Guter Fokus';
    return 'Glasklare Konzentration';
  }

  function getCyclePhaseLabel(phase) {
    const map = {
      menstruation: 'Menstruation',
      follicular: 'Follikelphase',
      ovulation: 'Eisprung',
      luteal: 'Lutealphase'
    };
    return map[phase] || 'Nicht angegeben';
  }

  function getFlowLabel(flow) {
    const map = {
      none: 'Keine',
      spotting: 'Schmierblutung',
      light: 'Leicht',
      medium: 'Mittel',
      heavy: 'Stark'
    };
    return map[flow] || 'Keine';
  }

  function getFlowLabelShort(flow) {
    const map = {
      none: 'K',
      spotting: 'S',
      light: 'L',
      medium: 'M',
      heavy: 'St'
    };
    return map[flow] || '—';
  }

  function getDigestionStatusLabel(status) {
    const map = {
      normal: 'Normal / Angenehm',
      constipation: 'Verstopfung',
      diarrhea: 'Durchfall',
      bloating: 'Blähungen'
    };
    return map[status] || 'Nicht erfasst';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
