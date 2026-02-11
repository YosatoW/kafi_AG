// public/js/main.js
(() => {
  const qs  = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));


  const state = {
    screensaverTimer: null,
    screensaverTimeoutMs: 60000,
    appliedScreensaverTimeoutMs: null,
    autoBrewTriggered: false,
    brewAnimTimer: null,
    beanTimerId: null,
    beanTimerStarted: false,
    beanAutoSeconds: 10,
    beanConfirmed: false,   
    awaitSince: null,
    wasReadyOnEntry: false,
    finishBtnBound: false
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Screensaver nur auf Home
  // ───────────────────────────────────────────────────────────────────────────
  function resetInactivityTimer() {
    if (state.screensaverTimer) clearTimeout(state.screensaverTimer);
    state.appliedScreensaverTimeoutMs = state.screensaverTimeoutMs;
    state.screensaverTimer = setTimeout(() => { window.location.href = '/screensaver'; }, state.screensaverTimeoutMs);
  }

  function hookInactivity() {
    ['click','touchstart','keydown','mousemove'].forEach(ev =>
      document.addEventListener(ev, resetInactivityTimer, { passive: true })
    );
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') resetInactivityTimer();
    }, { passive: true });

    resetInactivityTimer();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // API
  // ───────────────────────────────────────────────────────────────────────────
  async function getStatus() {
    const r = await fetch('/api/status', { cache: 'no-store' });
    return r.json();
  }

  async function postJSON(url, body) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body||{}) });
    return r.json();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HOME
  // ───────────────────────────────────────────────────────────────────────────
  async function tickHome() {
    const s = await getStatus();

    const newMs = Number(s.screensaverTimeoutMs);
    if (newMs !== state.screensaverTimeoutMs) {
      state.screensaverTimeoutMs = newMs;
      if (state.appliedScreensaverTimeoutMs !== state.screensaverTimeoutMs) {
        resetInactivityTimer();
      }
    }

// Header: Guthaben laufend aktualisieren (wie bei Pay)
    const headerInsertedEl = qs('#pay-inserted');
    if (headerInsertedEl && s?.payment) {
      const inserted = Number(s.payment.inserted || 0);
      const currency = s.currency || '';
      headerInsertedEl.textContent = `${inserted.toFixed(2)} ${currency}`;
    }

    qsa('.drink').forEach(a => {
      const id = a.dataset.id;
      const d = s.drinks.find(x => x.id === id);
      if (!d) return;
      if (!d.available || !d.active) {
        a.classList.add('disabled');
        a.setAttribute('aria-disabled', 'true');
        a.addEventListener('click', ev => ev.preventDefault());
      } else {
        a.classList.remove('disabled');
        a.removeAttribute('aria-disabled');
      }
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PAY – Auto-Start + grosses Bild bei fehlender Tasse
  // ───────────────────────────────────────────────────────────────────────────

  // UI-Helpers
  function setBeanCardsSelection() {
    const cards  = qsa('.bean-card');
    const radios = qsa('input[name=bean]');
    cards.forEach((card, idx) => {
      const r = radios[idx];
      card.onclick = () => {
        radios.forEach(rr => rr.checked = false);
        r.checked = true;
        cards.forEach(c => c.classList.remove('checked'));
        card.classList.add('checked');
      };
    });
  }

  function showBeanSection(show) {
    const sec = qs('#bean-section');
    if (!sec) return;
    if (show) {
      sec.classList.remove('hidden');
      setBeanCardsSelection();
    } else {
      sec.classList.add('hidden');
    }
  }

  function setBeanUIAvailable(visible) { // Neu
    const hint = qs('#bean-hint');
    const btn  = qs('#manual-continue');
    if (!hint || !btn) return;
    if (visible) {
      hint.classList.remove('hidden');
      btn.classList.remove('hidden');
    } else {
      hint.classList.add('hidden');
      btn.classList.add('hidden');
    }
  }

  function resetBeanTimerState() {
    if (state.beanTimerId) { clearInterval(state.beanTimerId); state.beanTimerId = null; }
    state.beanTimerStarted = false;
    state.beanConfirmed    = false;
    const t = qs('#auto-timer');
    if (t) t.textContent = '10';
  }

  function setAutoUIVisible(visible) {
    const hint = qs('#auto-hint');
    const btn  = qs('#manual-continue');
    if (!hint || !btn) return;
    hint.classList.toggle('hidden', !visible);
    btn.classList.toggle('hidden',  !visible);
  }

  function resetBeanTimer() {
    if (state.beanTimerId) { clearInterval(state.beanTimerId); state.beanTimerId = null; }
    state.beanTimerStarted = false;
    const t = qs('#auto-timer');
    if (t) t.textContent = '10';
  }

  function doManualConfirm() {
    const selected = qs("input[name=bean]:checked");
    if (selected) ctx.bean = selected.value;
    state.beanConfirmed = true;
  }

  function startBeanTimer() {
    if (state.beanTimerStarted) return;
    const timerEl  = qs('#auto-timer');
    const btn      = qs('#manual-continue');
    if (!timerEl) return; // Auswahl ist nicht sichtbar
    state.beanTimerStarted = true;
    state.beanAutoSeconds  = 10;
    timerEl.textContent    = state.beanAutoSeconds;
    if (btn) btn.addEventListener('click', () => { doManualConfirm(); }, { once: true });
    state.beanTimerId = setInterval(() => {
      state.beanAutoSeconds--;
      if (timerEl) timerEl.textContent = state.beanAutoSeconds;
      if (state.beanAutoSeconds <= 0) {
        clearInterval(state.beanTimerId);
        state.beanTimerId = null;
        // Fallback: erste Bohne markieren
        const first = qs('input[name=bean]');
        if (first && !first.checked) first.checked = true;
        doManualConfirm();
      }
    }, 1000);
  }

// Hilfen: gewählte Bohne & Aufschlag aus Status holen
function getSelectedBeanId(ctx) {
  const selected = document.querySelector("input[name=bean]:checked");
  return (selected && selected.value) || ctx.bean || 'sorte1';
}

function getBeanPriceMod(status, beanId) {
  const beans = status.modules?.beans || [];
  const b = beans.find(x => x.id === beanId);
  const mod = Number(b?.priceMod || 0);
  return Number.isFinite(mod) ? mod : 0;
}

async function tickPay() {
  const ctx = window.__PAY_CONTEXT__;
  if (!ctx) return;

  function doManualConfirm() {
    const selected = qs("input[name=bean]:checked");
    if (selected) ctx.bean = selected.value;
    state.beanConfirmed = true;
  }

  function startBeanTimer() {
    if (state.beanTimerStarted) return;
    const timerEl  = qs('#auto-timer');
    const btn      = qs('#manual-continue');
    if (!timerEl) return;
    state.beanTimerStarted = true;
    state.beanAutoSeconds  = 10;
    timerEl.textContent    = state.beanAutoSeconds;
    if (btn) btn.addEventListener('click', () => { doManualConfirm(); }, { once: true });
    state.beanTimerId = setInterval(() => {
      state.beanAutoSeconds--;
      if (timerEl) timerEl.textContent = state.beanAutoSeconds;
      if (state.beanAutoSeconds <= 0) {
        clearInterval(state.beanTimerId);
        state.beanTimerId = null;
        const first = qs('input[name=bean]');
        if (first && !first.checked) first.checked = true;
        doManualConfirm(); // Auto-Bestätigung
      }
    }, 1000);
  }

  async function tryStartIfReady(s, infoEl, effectivePrice) {
    const inserted = Number(s.payment.inserted || 0);
    const remain   = Math.max(0, effectivePrice - inserted);
    if (remain > 0) return;
    if (!s.cupPresent) return;
    if (state.autoBrewTriggered) return;
    if (s.brewing.inProgress) return;
    if (ctx.secondCoffee && ctx.recipeCoffee > 0 && !state.beanConfirmed) return;

    state.autoBrewTriggered = true;
    const res = await postJSON('/api/brew', { id: ctx.drinkId, bean: ctx.bean || null });
    if (res.ok) {
      if (state.beanTimerId) { clearInterval(state.beanTimerId); state.beanTimerId = null; }
      state.beanTimerStarted = false;
      window.location.href = `/brew/${ctx.drinkId}`;
    } else {
      if (infoEl) infoEl.textContent = res.msg || 'Start fehlgeschlagen.';
      state.autoBrewTriggered = false;
    }
  }

  const s = await getStatus();

  // Effektiven Preis ermitteln
  let beanId = null;
  if (ctx.secondCoffee && ctx.recipeCoffee > 0) {
    beanId = getSelectedBeanId(ctx);
    // Falls User noch nichts bestätigt hat, aber radiobutton ausgewählt ist, synchronisiere ctx.bean
    const selected = qs("input[name=bean]:checked");
    if (selected && !ctx.bean) ctx.bean = selected.value;
  }
  const priceMod = beanId ? getBeanPriceMod(s, beanId) : 0;
  const basePrice = Number(ctx.basePrice || 0);
  const effectivePrice = Number((basePrice + priceMod).toFixed(2));

  // UI aktualisieren …
  const inserted = Number(s.payment.inserted || 0);
  const remain   = Math.max(0, effectivePrice - inserted);
  const predictedChange = Math.max(0, inserted - effectivePrice);

  const elInserted = qs('#pay-inserted');
  const elRemain   = qs('#pay-remain');
  const elChange   = qs('#pay-change');
  if (elInserted) elInserted.textContent = inserted.toFixed(2) + ' ' + s.currency;
  if (elRemain)   elRemain.textContent   = remain.toFixed(2)   + ' ' + s.currency;
  if (elChange)   elChange.textContent   = predictedChange.toFixed(2) + ' ' + s.currency;

  // Preis im Titel live aktualisieren
  const titlePrice = qs('#pay-title-price');
  if (titlePrice) titlePrice.textContent = effectivePrice.toFixed(2) + ' ' + s.currency;

  const info = qs('#pay-info');
  const cupMissing = qs('#cup-missing');

  const shouldShowBeans = (ctx.secondCoffee && ctx.recipeCoffee > 0);
  showBeanSection(shouldShowBeans);

  if (remain > 0) {
    if (info) info.textContent = `Bitte ${remain.toFixed(2)} ${s.currency} einwerfen.`;
    if (cupMissing) cupMissing.classList.add('hidden');
    state.autoBrewTriggered = false;
    resetBeanTimerState();
    setAutoUIVisible(false);
    resetBeanTimer();
    return;
  }

  if (!s.cupPresent) {
    if (info) info.textContent = 'Bitte Tasse hinstellen – die Zubereitung startet automatisch.';
    if (cupMissing) cupMissing.classList.remove('hidden');
    state.autoBrewTriggered = false;
    resetBeanTimerState();
    return;
  }

  // bezahlt & Tasse da
  if (cupMissing) cupMissing.classList.add('hidden');
  if (info) info.textContent = 'Bereit. Du kannst gleich starten.';

  if (shouldShowBeans) {
    setBeanUIAvailable(true);
    if (!state.beanTimerStarted && !state.beanConfirmed) startBeanTimer();
  }

  await tryStartIfReady(s, info, effectivePrice);

  if (s.brewing.inProgress) {
    window.location.href = `/brew/${ctx.drinkId}`;
  }
}

  // ───────────────────────────────────────────────────────────────────────────
  // BREW – Fortschritt + Warten auf Tassenentnahme
  // ───────────────────────────────────────────────────────────────────────────
  function animateBar(durationMs) {
    const dur = Number(durationMs)
    if (!Number.isFinite(dur) || dur <= 0) return;

    const bar = qs('#brew-bar');
    if (!bar) return;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      bar.style.width = Math.floor(p * 100) + '%';
      if (p < 1) state.brewAnimTimer = requestAnimationFrame(step);
    }
    state.brewAnimTimer = requestAnimationFrame(step);
  }

  async function tickBrew() {
    const ctx = window.__BREW_CONTEXT__;
    if (!ctx) return;

    const s = await getStatus();
    const msg = qs('#brew-msg');
    const removeBlock = qs('#cup-remove');

    if (s.brewing.inProgress) {
      if (!state.brewAnimTimer) {
        animateBar(s.brewing.etaMs);
        msg.textContent = 'Zubereitung läuft…';
        removeBlock.classList.add('hidden');
      }
      return;
    }

    // Zubereitung beendet
    if (state.brewAnimTimer) cancelAnimationFrame(state.brewAnimTimer);
    qs('#brew-bar') && (qs('#brew-bar').style.width = '100%');

    if (s.brewing.awaitingCupRemoval) {
      // Warten auf Tassenentnahme
      removeBlock.classList.remove('hidden');
      msg.textContent = 'Fertig! Bitte Getränk entnehmen.';
      if (!s.cupPresent) {
        // Tasse wurde entfernt -> Abschluss
        await postJSON('/api/finish', {});
        window.location.href = '/';
      }
    } else {
      // Fallback
      msg.textContent = 'Fertig.';
      setTimeout(() => { window.location.href = '/'; }, 1200);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Init
  // ───────────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    if (location.pathname === '/') {
      const s = await getStatus();
      state.screensaverTimeoutMs = s.screensaverTimeoutMs;
      hookInactivity();
      await tickHome();
      setInterval(tickHome, 300);
      return;
    }

    if (location.pathname.startsWith('/pay/')) {
      const ctx = window.__PAY_CONTEXT__;
      const s0  = await getStatus();
      const inserted0 = Number(s0.payment.inserted || 0);
      const price0    = Number(ctx.price || 0);
      const remain0   = Math.max(0, price0 - inserted0);
      state.wasReadyOnEntry = (remain0 === 0 && !!s0.cupPresent); // <— NEU

      await tickPay();
      setInterval(tickPay, 700);
      return;
    }


    if (location.pathname.startsWith('/brew/')) {
      await tickBrew();
      setInterval(tickBrew, 500);
      return;
    }
  });
})();