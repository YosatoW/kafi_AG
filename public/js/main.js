// public/js/main.js
(() => {
  const qs  = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  // ── Zentrale Textbausteine ────────────────────────────────────────────────
  const TEXT = {
    cupMissing: "Bitte Tasse hinstellen.",
    insertMore: (amount, currency) => `Bitte noch ${amount.toFixed(2)} ${currency} einwerfen.`,
    insertMoreAndCup: (amount, currency) => `Bitte noch ${amount.toFixed(2)} ${currency} einwerfen und Tasse hinstellen.`,
    willStartIn: (drink, secs) => `${drink} wird automatisch in ${secs}s zubereitet…`,
    brewing: "Zubereitung läuft…",
    finished: "Fertig! Bitte Getränk entnehmen.",
    done: "Fertig."
  };

  // ── State ─────────────────────────────────────────────────────────────────
  const state = {
    screensaverTimer: null,
    screensaverTimeoutMs: 60000,
    appliedScreensaverTimeoutMs: null,

    autoBrewTriggered: false,

    // Brew UI
    brewAnimTimer: null,

    // Countdown (10s beim ready entry / 3s beim späteren ready)
    startBrewTimerId: null,
    startBrewSecs: 0,

    // Merker: Pay war beim Einstieg schon „bereit“ (Cup + Basis gedeckt)
    wasReadyOnEntry: false,
    beanEventsBound: false
  };


  // Screensaver (nur Home)
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

  // API
  // ───────────────────────────────────────────────────────────────────────────
  async function getStatus() {
    const r = await fetch('/api/status', { cache: 'no-store' });
    return r.json();
  }

  async function postJSON(url, body) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    return r.json();
  }

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

    // Header: Guthaben live aktualisieren
    const headerInsertedEl = qs('#pay-inserted');
    if (headerInsertedEl && s?.payment) {
      const inserted = Number(s.payment.inserted || 0);
      const currency = s.currency || '';
      headerInsertedEl.textContent = `${inserted.toFixed(2)} ${currency}`;
    }

    // Kacheln: aktiv/disabled
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

  // PAY – Bohnenwahl & Auto-Start (10s/3s Countdown)
  // ───────────────────────────────────────────────────────────────────────────
  function showBeanSection(show) {
    const sec = qs('#bean-section');
    if (!sec) return;
    sec.classList.toggle('hidden', !show);
  }

  // Zentrale Berechnung: Preise/Remain
  function computePayState(status, ctx) {
    const inserted  = Number(status.payment.inserted || 0);
    const basePrice = Number((ctx.basePrice ?? ctx.price) || 0);

    const beans = status.modules?.beans || [];
    const selectedBeanId = (ctx.secondCoffee && ctx.recipeCoffee > 0)
      ? (ctx.bean || beans[0]?.id || null)
      : null;

    const priceMod = selectedBeanId
      ? (Number((beans.find(b => b.id === selectedBeanId)?.priceMod) || 0))
      : 0;

    const effective = Number((basePrice + priceMod).toFixed(2));

    const remainBase = Math.max(0, basePrice - inserted);
    const remainEff  = Math.max(0, effective - inserted);

    return {
      inserted, basePrice, effective, remainBase, remainEff, selectedBeanId, priceMod
    };
  }

  function cancelBrewCountdown() {
    if (state.startBrewTimerId) {
      clearInterval(state.startBrewTimerId);
      state.startBrewTimerId = null;
    }
    state.startBrewSecs = 0;
  }

  function startBrewCountdown(secs, ctx, status) {
    cancelBrewCountdown();
    state.startBrewSecs = secs;

    const info = document.querySelector('#pay-info');
    const cupIcon = document.querySelector('#cup-missing');
    const drinkName =
      (typeof ctx.name === 'string' && ctx.name) ||
      (document.querySelector('h2')?.textContent?.split('–')[0]?.trim()) ||
      'Getränk';

    if (cupIcon) cupIcon.classList.add('hidden');
    if (info) info.textContent = TEXT.willStartIn(drinkName, state.startBrewSecs);

    state.startBrewTimerId = setInterval(async () => {
      state.startBrewSecs--;

      // Während des Countdowns Bedingungen weiter validieren:
      const s = await getStatus();
      const ps = computePayState(s, ctx);

      if (!s.cupPresent) {
        cancelBrewCountdown();
        const infoNow = document.querySelector('#pay-info');
        const cupIconNow = document.querySelector('#cup-missing');
        if (cupIconNow) cupIconNow.classList.remove('hidden');
        if (infoNow) infoNow.textContent = TEXT.cupMissing;
        state.autoBrewTriggered = false;
        return;
      }

      if (ps.remainEff > 0) {
        cancelBrewCountdown();
        const infoNow = document.querySelector('#pay-info');
        if (infoNow) infoNow.textContent = TEXT.insertMore(ps.remainEff, s.currency || 'CHF');
        state.autoBrewTriggered = false;
        return;
      }

      const infoTick = document.querySelector('#pay-info');
      if (infoTick) infoTick.textContent = TEXT.willStartIn(drinkName, state.startBrewSecs);

      if (state.startBrewSecs <= 0) {
        cancelBrewCountdown();
        // Start
        try {
          const res = await postJSON('/api/brew', {
            id: ctx.drinkId,
            bean: (ctx.secondCoffee && ctx.recipeCoffee > 0) ? (ctx.bean || null) : null
          });
          if (res?.ok) {
            window.location.href = `/brew/${ctx.drinkId}`;
          } else {
            const infoErr = document.querySelector('#pay-info');
            if (infoErr) infoErr.textContent = res?.msg || 'Start fehlgeschlagen.';
            state.autoBrewTriggered = false;
          }
        } catch {
          const infoErr = document.querySelector('#pay-info');
          if (infoErr) infoErr.textContent = 'Start fehlgeschlagen.';
          state.autoBrewTriggered = false;
        }
      }
    }, 1000);
  }

  // Bohnenkarten anklickbar: sofortige, verbindliche Auswahl + Countdown neu bewerten (ohne Reset)
  function setBeanCardsSelection(ctx) {
    const cards  = qsa('.bean-card');
    const radios = qsa('input[name=bean]');

    function applyCheckedClasses() {
      cards.forEach(c => c.classList.remove('checked'));
      const cur = qs('input[name=bean]:checked');
      cur?.closest('.bean-card')?.classList.add('checked');
    }

    async function confirm(radioEl) {
      if (!radioEl) return;
      radios.forEach(rr => rr.checked = false);
      radioEl.checked = true;
      applyCheckedClasses();

      // Auswahl verbindlich
      ctx.bean = radioEl.value;

      // Countdown NICHT resetten, wenn weiterhin alle Bedingungen erfüllt sind
      const hadCountdown = !!state.startBrewTimerId;
      const remainingBefore = state.startBrewSecs;

      const s = await getStatus();
      const ps = computePayState(s, ctx);
      const info = document.querySelector('#pay-info');
      const cupIcon = document.querySelector('#cup-missing');
      const currency = s.currency || 'CHF';
      const drinkName =
        (typeof ctx.name === 'string' && ctx.name) ||
        (document.querySelector('h2')?.textContent?.split('–')[0]?.trim()) ||
        'Getränk';

      if (!s.cupPresent) {
        if (cupIcon) cupIcon.classList.remove('hidden');
        if (info) info.textContent = TEXT.cupMissing;
        if (hadCountdown) cancelBrewCountdown();
        return;
      }
      if (ps.remainBase > 0) {
        if (cupIcon) cupIcon.classList.add('hidden');
        if (info) info.textContent = TEXT.insertMore(ps.remainBase, currency);
        if (hadCountdown) cancelBrewCountdown();
        return;
      }
      if (ps.remainEff === 0) {
        if (hadCountdown) {
          // Countdown läuft → Restlaufzeit behalten
          if (info) info.textContent = TEXT.willStartIn(drinkName, remainingBefore);
          return;
        } else {
          const secs = state.wasReadyOnEntry ? 10 : 3;
          startBrewCountdown(secs, ctx, s);
          return;
        }
      } else {
        // Effektiver Preis nicht gedeckt → Countdown abbrechen, Hinweis zeigen
        if (info) info.textContent = TEXT.insertMore(ps.remainEff, currency);
        if (hadCountdown) cancelBrewCountdown();
        return;
      }
    }

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const r = card.querySelector('input[name=bean]');
        confirm(r);
      });
    });
    radios.forEach(r => r.addEventListener('change', () => confirm(r)));

    applyCheckedClasses();
  }

  async function tickPay() {
    const ctx = window.__PAY_CONTEXT__;
    if (!ctx) return;

    const s = await getStatus();

    // Default-Bean initial
    if (!ctx.bean) {
      const selected = qs('input[name=bean]:checked');
      const fallback = s.modules?.beans?.[0]?.id || null;
      ctx.bean = selected?.value || fallback;
    }

    // Bohnenkarten-Klicks binden (idempotent)
    // const shouldShowBeans = (ctx.secondCoffee && ctx.recipeCoffee > 0);
    // showBeanSection(shouldShowBeans);
    // if (shouldShowBeans) setBeanCardsSelection(ctx);
    const shouldShowBeans = (ctx.secondCoffee && ctx.recipeCoffee > 0);
    showBeanSection(shouldShowBeans);
    if (shouldShowBeans && !state.beanEventsBound) {
      setBeanCardsSelection(ctx);
      state.beanEventsBound = true;
    }
    if (!shouldShowBeans && state.beanEventsBound) {
      state.beanEventsBound = false;
    }


    // Payment-State
    const ps = computePayState(s, ctx);

    // UI Geld/Preis
    // qs('#pay-inserted')?.replaceChildren(document.createTextNode(`${ps.inserted.toFixed(2)} ${s.currency}`));
    // qs('#pay-remain')  ?.replaceChildren(document.createTextNode(`${ps.remainEff.toFixed(2)} ${s.currency}`));
    // qs('#pay-change')  ?.replaceChildren(document.createTextNode(`${Math.max(0, ps.inserted - ps.effective).toFixed(2)} ${s.currency}`));
    // qs('#pay-title-price')?.replaceChildren(document.createTextNode(`${ps.effective.toFixed(2)} ${s.currency}`));

    const elInserted = qs('#pay-inserted');
    const elRemain   = qs('#pay-remain');
    const elChange   = qs('#pay-change');
    const elTitle    = qs('#pay-title-price');
    if (elInserted) elInserted.textContent = `${ps.inserted.toFixed(2)} ${s.currency}`;
    if (elRemain)   elRemain.textContent   = `${ps.remainEff.toFixed(2)} ${s.currency}`;
    if (elChange)   elChange.textContent   = `${Math.max(0, ps.inserted - ps.effective).toFixed(2)} ${s.currency}`;
    if (elTitle)    elTitle.textContent    = `${ps.effective.toFixed(2)} ${s.currency}`;


    const info    = qs('#pay-info');
    const cupIcon = qs('#cup-missing');

    // 4 klare Fälle
    if (ps.remainBase > 0 && !s.cupPresent) {
      info.textContent = TEXT.insertMoreAndCup(ps.remainBase, s.currency);
      cupIcon?.classList.remove('hidden');
      cancelBrewCountdown();
      state.autoBrewTriggered = false;
      return;
    }

    if (ps.remainBase > 0 && s.cupPresent) {
      info.textContent = TEXT.insertMore(ps.remainBase, s.currency);
      cupIcon?.classList.add('hidden');
      cancelBrewCountdown();
      state.autoBrewTriggered = false;
      return;
    }

    if (ps.remainBase === 0 && !s.cupPresent) {
      info.textContent = TEXT.cupMissing;
      cupIcon?.classList.remove('hidden');
      cancelBrewCountdown();
      state.autoBrewTriggered = false;
      return;
    }

    // Basis gedeckt + Tasse da → prüfen, ob effektiver Preis gedeckt ist
    cupIcon?.classList.add('hidden');

    if (ps.remainEff > 0) {
      info.textContent = TEXT.insertMore(ps.remainEff, s.currency);
      cancelBrewCountdown();
      state.autoBrewTriggered = false;
      return;
    }

    // Effektiv gedeckt + Cup da → Countdown (10s beim Entry-ready, sonst 3s)
    const secs = state.wasReadyOnEntry ? 10 : 3;
    if (!state.startBrewTimerId && !state.autoBrewTriggered) {
      startBrewCountdown(secs, ctx, s);
      state.autoBrewTriggered = true;
    }
  }

  // BREW – Fortschritt + Warten auf Tassenentnahme
  // ───────────────────────────────────────────────────────────────────────────
  function animateBar(durationMs) {
    const dur = Number(durationMs);
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
        if (msg) msg.textContent = TEXT.brewing;
        removeBlock?.classList.add('hidden');
      }
      return;
    }

    // Zubereitung beendet
    if (state.brewAnimTimer) cancelAnimationFrame(state.brewAnimTimer);
    const bar = qs('#brew-bar');
    if (bar) bar.style.width = '100%';

    if (s.brewing.awaitingCupRemoval) {
      // Warten auf Tassenentnahme
      removeBlock?.classList.remove('hidden');
      if (msg) msg.textContent = TEXT.finished;
      if (!s.cupPresent) {
        // Tasse wurde entfernt -> Abschluss
        await postJSON('/api/finish', {});
        window.location.href = '/';
      }
    } else {
      // Fallback
      if (msg) msg.textContent = TEXT.done;
      setTimeout(() => { window.location.href = '/'; }, 1200);
    }
  }

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
      // Merken, ob die Seite schon „bereit“ war (Cup + Basis gedeckt)
      const s0  = await getStatus();
      const ctx = window.__PAY_CONTEXT__ || {};
      const inserted0  = Number(s0.payment.inserted || 0);
      const basePrice0 = Number((ctx.basePrice ?? ctx.price) || 0);
      const remainBase0 = Math.max(0, basePrice0 - inserted0);
      state.wasReadyOnEntry = (remainBase0 === 0 && !!s0.cupPresent);

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