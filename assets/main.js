/* Goomee — landing page behaviour. Progressive: the page is fully readable
   and navigable with this file absent. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Language ----
     The page's own language (en / nl / fr) drives the few labels this script
     writes. Choosing a language in the switcher is remembered, so the
     first-visit redirect on the English page never overrides it. */
  var LANG = (document.documentElement.lang || 'en').slice(0, 2);
  var T = {
    en: { choose: 'Choose a card', card: 'Card {n} of {t}',
          ios: 'Goomee is coming to the App Store very soon.',
          android: 'Goomee for Android is coming later. iPhone first!',
          social: 'Our social pages are coming soon.' },
    nl: { choose: 'Kies een kaart', card: 'Kaart {n} van {t}',
          ios: 'Goomee komt heel binnenkort naar de App Store.',
          android: 'Goomee voor Android volgt later. Eerst iPhone!',
          social: 'Onze sociale pagina’s komen binnenkort.' },
    fr: { choose: 'Choisir une carte', card: 'Carte {n} sur {t}',
          ios: 'Goomee arrive très bientôt sur l’App Store.',
          android: 'Goomee pour Android arrivera plus tard. D’abord l’iPhone !',
          social: 'Nos réseaux sociaux arrivent bientôt.' }
  };
  T = T[LANG] || T.en;

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-lang]');
    if (!a) return;
    try { localStorage.setItem('goomee-lang', a.getAttribute('data-lang')); } catch (err) {}
  });

  /* ---- Store links ----
     Paste the listing URLs here on launch day; nothing else needs to change.
     While a URL is empty its badges stay the greyed "coming soon" placeholders
     and "Get the app" scrolls to the badge section as before. With URLs set:
       - each badge becomes a real link to its store, and a group's
         "Coming soon" note disappears once all of its badges are live;
       - "Get the app" sends iPhone and iPad visitors straight to the App Store
         and Android visitors to Google Play (desktop still scrolls).
     Replace the CSS-drawn badges with Apple's and Google's official artwork at
     the same time: both only allow their badges for apps that are live. */
  var STORES = {
    ios: '',      // e.g. https://apps.apple.com/be/app/goomee/id0000000000
    android: ''   // e.g. https://play.google.com/store/apps/details?id=com.goomee.app
  };

  var ua = navigator.userAgent || '';
  var platform = /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'ios'   // iPadOS reports itself as a Mac
    : /Android/.test(ua) ? 'android' : null;

  [].forEach.call(document.querySelectorAll('[data-store]'), function (badge) {
    var url = STORES[badge.getAttribute('data-store')];
    if (!url) return;
    var link = document.createElement('a');
    link.className = badge.className.replace(/\s*\bis-soon\b/, '');
    link.href = url;
    link.rel = 'noopener';
    link.setAttribute('data-store', badge.getAttribute('data-store'));
    link.innerHTML = badge.innerHTML;
    badge.parentNode.replaceChild(link, badge);
  });
  [].forEach.call(document.querySelectorAll('.store-badges'), function (group) {
    if (group.querySelector('.is-soon')) return;
    var note = group.parentNode.querySelector('.soon-note');
    if (note) note.hidden = true;
  });

  document.addEventListener('click', function (e) {
    var cta = e.target.closest('[data-get-app]');
    if (!cta || !platform || !STORES[platform]) return;
    e.preventDefault();
    window.location.href = STORES[platform];
  });

  /* ---- "Coming soon" toast ----
     Badges for stores we are not on yet, and social links with no page
     behind them (href="#"), say so instead of doing nothing. */
  var toast, toastTimer;
  function showToast(text) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.offsetWidth;   // restart the transition when shown twice in a row
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2800);
  }
  document.addEventListener('click', function (e) {
    var soon = e.target.closest('.badge.is-soon, .socials a[href="#"]');
    if (!soon) return;
    e.preventDefault();
    showToast(T[soon.getAttribute('data-store')] || T.social);
  });
  [].forEach.call(document.querySelectorAll('.badge.is-soon'), function (b) {
    b.removeAttribute('aria-disabled');
    b.setAttribute('role', 'button');
    b.setAttribute('tabindex', '0');
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.badge.is-soon')) {
      e.preventDefault();
      e.target.click();
    }
  });

  /* ---- Contact form ----
     Sends to Web3Forms, which emails the message to the inbox tied to the
     form's data-access-key. Every visible message comes from data-msg-*
     attributes on the form, so each language page carries its own wording. */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    // links like /contact?topic=press arrive with the topic already chosen
    var wanted = (location.search.match(/[?&]topic=([a-z]+)/) || [])[1];
    if (wanted && form.elements.topic.querySelector('option[value="' + wanted + '"]')) {
      form.elements.topic.value = wanted;
    }
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');
    var say = function (kind, key) {
      status.hidden = false;
      status.className = 'form-status' + (kind ? ' is-' + kind : '');
      status.textContent = form.getAttribute('data-msg-' + key);
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var key = form.getAttribute('data-access-key');
      if (!key) { say('err', 'offline'); return; }
      var topic = form.elements.topic;
      var topicLabel = topic.options[topic.selectedIndex].text;
      var payload = {
        access_key: key,
        subject: 'Goomee contact [' + topic.value + ', ' + LANG.toUpperCase() + '] ' + form.elements.name.value,
        from_name: 'Goomee website',
        name: form.elements.name.value,
        email: form.elements.email.value,
        topic: topicLabel,
        language: LANG,
        message: form.elements.message.value,
        botcheck: form.elements.botcheck.checked
      };
      submit.disabled = true;
      say('', 'sending');
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (res && res.success) { form.reset(); say('ok', 'sent'); }
          else { say('err', 'error'); }
        })
        .catch(function () { say('err', 'error'); })
        .then(function () { submit.disabled = false; });
    });
  }

  /* ---- Back to top ----
     Shows once the visitor is well down the page; glides back up (jumps
     under reduced motion). */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    toTop.hidden = false;
    var syncTop = function () {
      toTop.classList.toggle('is-on', window.scrollY > window.innerHeight * 1.5);
    };
    window.addEventListener('scroll', syncTop, { passive: true });
    syncTop();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      var skip = document.querySelector('.skip');
      if (skip) skip.focus({ preventScroll: true });
    });
  }

  /* ---- Theme toggle ----
     Without a saved choice the page follows the system setting (CSS media
     query). A click stores the opposite of whatever is showing now. */
  var root = document.documentElement;
  var darkMq = window.matchMedia('(prefers-color-scheme: dark)');
  var isDark = function () {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : darkMq.matches;
  };
  var themeBtn = document.querySelector('.theme-toggle');
  var syncTheme = function () { if (themeBtn) themeBtn.setAttribute('aria-pressed', String(isDark())); };
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('goomee-theme', next); } catch (e) {}
      syncTheme();
    });
    darkMq.addEventListener ? darkMq.addEventListener('change', syncTheme) : darkMq.addListener(syncTheme);
    syncTheme();
  }

  /* ---- Hero film: hold on the poster under reduced motion ---- */
  var heroVid = document.querySelector('.hero-video');
  if (heroVid && reduced) {
    heroVid.removeAttribute('autoplay');
    heroVid.pause();
  }

  /* ---- Story player ---- */
  var story = document.getElementById('story');
  if (story) {
    var vid = story.querySelector('.story-video');

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-story]')) {
        if (typeof story.showModal === 'function') story.showModal();
        else story.setAttribute('open', '');
        // preload="none" leaves currentSrc empty until play(), so play unconditionally
        if (vid) vid.play().catch(function () {});
      }
      if (e.target.closest('[data-close]')) story.close();
    });

    story.addEventListener('close', function () {
      if (vid && !vid.paused) { vid.pause(); vid.currentTime = 0; }
    });

    // click the backdrop to dismiss
    story.addEventListener('click', function (e) {
      if (e.target === story) story.close();
    });
  }

  /* ---- Mobile navigation ---- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        toggle.focus();
      }
    });
  }

  /* ---- Header hairline once the page has moved ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile carousels: dots for the journey cards and testimonials ----
     The rails work without this; the dots are a progressive addition. */
  var carousels = document.querySelectorAll('.journey-grid, .moment-grid');
  var mq = window.matchMedia('(max-width: 760px)');

  carousels.forEach(function (rail) {
    var dots = document.createElement('div');
    dots.className = 'dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', T.choose);
    var cards = [].slice.call(rail.children);

    cards.forEach(function (card, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', T.card.replace('{n}', i + 1).replace('{t}', cards.length));
      b.addEventListener('click', function () {
        rail.scrollTo({ left: card.offsetLeft - rail.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
      });
      dots.appendChild(b);
    });
    rail.parentNode.insertBefore(dots, rail.nextSibling);

    var sync = function () {
      if (!mq.matches) return;
      var mid = rail.scrollLeft + rail.clientWidth / 2;
      var best = 0, bestDist = Infinity;
      cards.forEach(function (card, i) {
        var c = card.offsetLeft - rail.offsetLeft + card.offsetWidth / 2;
        var d = Math.abs(c - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      [].forEach.call(dots.children, function (b, i) {
        b.classList.toggle('is-on', i === best);
        b.setAttribute('aria-selected', String(i === best));
      });
    };

    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync);
    sync();

    /* ---- Autoplay ----
       Advances every 6s and wraps. Stops for good the first time the visitor
       takes control, so it never fights a swipe. Never runs under reduced
       motion, while off screen, or while the tab is in the background. */
    var DELAY = 6000;
    var timer = null;
    var stopped = reduced;
    var onScreen = false;

    var current = function () {
      var mid = rail.scrollLeft + rail.clientWidth / 2, best = 0, bestDist = Infinity;
      cards.forEach(function (card, i) {
        var d = Math.abs((card.offsetLeft - rail.offsetLeft + card.offsetWidth / 2) - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    };

    var advance = function () {
      var next = (current() + 1) % cards.length;
      rail.scrollTo({
        left: cards[next].offsetLeft - rail.offsetLeft,
        behavior: 'smooth'
      });
    };

    var tick = function () {
      if (stopped || !onScreen || document.hidden || !mq.matches) return;
      timer = setTimeout(function () { advance(); tick(); }, DELAY);
    };

    var halt = function () { clearTimeout(timer); timer = null; };
    var restart = function () { halt(); tick(); };

    var stop = function () { stopped = true; halt(); };
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (evt) {
      rail.addEventListener(evt, stop, { passive: true, once: true });
    });
    dots.addEventListener('click', stop);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        onScreen ? restart() : halt();
      }, { threshold: 0.35 }).observe(rail);
    } else {
      onScreen = true;
      restart();
    }

    document.addEventListener('visibilitychange', function () {
      document.hidden ? halt() : restart();
    });
    mq.addEventListener
      ? mq.addEventListener('change', restart)
      : mq.addListener(restart);
  });

  /* ---- Destination rail ---- */
  var row = document.querySelector('.dest-row');
  var prev = document.querySelector('.rail-prev');
  var next = document.querySelector('.rail-next');

  if (row && prev && next) {
    var step = function () { return Math.max(row.clientWidth * 0.8, 200); };

    prev.addEventListener('click', function () { row.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { row.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' }); });

    var syncRail = function () {
      var max = row.scrollWidth - row.clientWidth - 1;
      prev.hidden = row.scrollLeft <= 0;
      next.hidden = row.scrollLeft >= max;
    };
    row.addEventListener('scroll', syncRail, { passive: true });
    window.addEventListener('resize', syncRail);
    syncRail();

    /* ---- Autoplay ----
       One card every 3.5s, gliding back to the first after the last. Pauses
       while the pointer or keyboard focus is on the rail, and for a few
       seconds after any manual scroll, so it never fights the visitor.
       Phones only, like the journey and moments carousels: on desktop the
       rail stays put and the arrows are enough. Also off under reduced
       motion, while off screen or in a background tab, and whenever every
       card already fits. */
    if (!reduced) {
      var RAIL_DELAY = 3500, RESUME_AFTER = 6000;
      var railTimer = null, railOnScreen = false, hovering = false, heldUntil = 0;

      var cardStep = function () {
        var first = row.children[0], second = row.children[1];
        return second ? second.offsetLeft - first.offsetLeft : row.clientWidth;
      };
      var railAdvance = function () {
        var max = row.scrollWidth - row.clientWidth;
        if (max <= 1) return;
        if (row.scrollLeft >= max - 2) row.scrollTo({ left: 0, behavior: 'smooth' });
        else row.scrollBy({ left: cardStep(), behavior: 'smooth' });
      };
      var railTick = function () {
        clearTimeout(railTimer);
        railTimer = setTimeout(function () {
          if (mq.matches && railOnScreen && !hovering && !document.hidden && Date.now() >= heldUntil) railAdvance();
          railTick();
        }, RAIL_DELAY);
      };
      var hold = function () { heldUntil = Date.now() + RESUME_AFTER; };

      row.addEventListener('pointerenter', function () { hovering = true; });
      row.addEventListener('pointerleave', function () { hovering = false; });
      row.addEventListener('focusin', function () { hovering = true; });
      row.addEventListener('focusout', function () { hovering = false; });
      ['touchstart', 'wheel', 'keydown'].forEach(function (evt) {
        row.addEventListener(evt, hold, { passive: true });
      });
      prev.addEventListener('click', hold);
      next.addEventListener('click', hold);

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          railOnScreen = entries[0].isIntersecting;
        }, { threshold: 0.4 }).observe(row);
      } else {
        railOnScreen = true;
      }
      railTick();
    }
  }

  /* ---- Reveal on scroll ---- */
  if (!reduced && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.section-head, .journey, .moment, .compare-copy, .compare-table-wrap, .planner-copy, .dests-head, .close-copy');
    targets.forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });

    // Failsafe: these elements start at opacity 0, so if the observer never
    // fires for any of them the content would simply never appear. Reveal
    // everything unconditionally after a few seconds.
    setTimeout(function () {
      targets.forEach(function (el) { el.classList.add('is-in'); });
    }, 3000);
  }
})();
