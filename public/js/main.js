// public/js/main.js
(() => {
  const qs  = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));


  const state = {
    screensaverTimer: null,
    screensaverTimeoutMs: 60000,
    appliedScreensaverTimeoutMs: null,
    autoBrewTriggered: false,
    brewAnimTimer: null
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
  async function tickPay() {
    const ctx = window.__PAY_CONTEXT__;
    if (!ctx) return;

    const s = await getStatus();

    // UI
    const inserted = Number(s.payment.inserted || 0);
    const price    = Number(ctx.price || 0);
    const remain   = Math.max(0, price - inserted);
    const predictedChange = Math.max(0, inserted - price); // Prognose für Retourgeld *vor* Start

    qs('#pay-inserted').textContent = inserted.toFixed(2) + ' ' + s.currency;
    qs('#pay-remain').textContent   = remain.toFixed(2)   + ' ' + s.currency;
    qs('#pay-change').textContent   = predictedChange.toFixed(2) + ' ' + s.currency;
    const info = qs('#pay-info');
    const cupMissing = qs('#cup-missing');

    if (remain > 0) {
      info.textContent = `Bitte ${remain.toFixed(2)} ${s.currency} einwerfen.`;
      cupMissing.classList.add('hidden');
      state.autoBrewTriggered = false;
      return;
    }

    if (!s.cupPresent) {
      info.textContent = 'Bitte Tasse hinstellen – die Zubereitung startet automatisch.';
      cupMissing.classList.remove('hidden');
      state.autoBrewTriggered = false;
      return;
    }

    // bezahlt & Tasse da -> Auto-Start
    cupMissing.classList.add('hidden');
    info.textContent = 'Bereit. Starte Zubereitung…';
    if (!state.autoBrewTriggered && !s.brewing.inProgress) {
      state.autoBrewTriggered = true;
      const res = await postJSON('/api/brew', { id: ctx.drinkId });
      if (res.ok) {
        window.location.href = `/brew/${ctx.drinkId}`;
      } else {
        info.textContent = res.msg || 'Start fehlgeschlagen.';
        state.autoBrewTriggered = false;
      }
    } else if (s.brewing.inProgress) {
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