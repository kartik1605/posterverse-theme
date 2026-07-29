/* ============================================================
   POSTERVERSE — hero parallax, scroll reveals, stat counters
   Loaded with defer from layout/theme.liquid.
   Re-runs on Shopify theme-editor events so sections behave
   correctly while a merchant is editing them.
   ============================================================ */
(function () {
  'use strict';

  // Arms the hidden start state for reveal animations. Without this class
  // the CSS leaves everything visible, so a JS failure can never blank the page.
  document.documentElement.classList.add('pv-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- hero parallax ---------------- */
  function initParallax(scope) {
    var heroes = (scope || document).querySelectorAll('[data-pv-parallax]');

    heroes.forEach(function (hero) {
      if (hero.dataset.pvParallaxReady === 'true') return;
      hero.dataset.pvParallaxReady = 'true';

      // Pointer-coarse devices can't hover, so skip the work entirely.
      if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

      var layers = hero.querySelectorAll('[data-pv-depth]');
      if (!layers.length) return;
      var frame = null;

      hero.addEventListener('mousemove', function (event) {
        if (frame) return;
        var rect = hero.getBoundingClientRect();
        var nx = (event.clientX - rect.left) / rect.width - 0.5;
        var ny = (event.clientY - rect.top) / rect.height - 0.5;

        frame = requestAnimationFrame(function () {
          layers.forEach(function (layer) {
            var depth = parseFloat(layer.dataset.pvDepth) || 1;
            layer.style.setProperty('--pv-px', (-nx * 34 * depth).toFixed(1) + 'px');
            layer.style.setProperty('--pv-py', (-ny * 26 * depth).toFixed(1) + 'px');
          });
          frame = null;
        });
      });

      hero.addEventListener('mouseleave', function () {
        layers.forEach(function (layer) {
          layer.style.setProperty('--pv-px', '0px');
          layer.style.setProperty('--pv-py', '0px');
        });
      });
    });
  }

  /* ---------------- scroll reveal ---------------- */
  function initReveal(scope) {
    var els = (scope || document).querySelectorAll('.pv-reveal:not(.pv-in), .pv-stagger:not(.pv-in)');
    if (!els.length) return;

    // Stagger children by index so grids cascade in.
    els.forEach(function (el) {
      if (!el.classList.contains('pv-stagger')) return;
      Array.prototype.forEach.call(el.children, function (child, i) {
        child.style.transitionDelay = (i * 80) + 'ms';
      });
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('pv-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('pv-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) { observer.observe(el); });

    // Failsafe: if the observer never reports (background tab, older engine),
    // show everything rather than leaving sections invisible.
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add('pv-in'); });
    }, 2500);
  }

  /* ---------------- stat counters ---------------- */
  function initCounters(scope) {
    var counters = (scope || document).querySelectorAll('[data-pv-count]:not([data-pv-counted])');
    if (!counters.length) return;

    function run(el) {
      el.dataset.pvCounted = 'true';
      var target = parseFloat(el.dataset.pvCount);
      if (isNaN(target)) return;
      var suffix = el.dataset.pvSuffix || '';
      var decimals = (el.dataset.pvCount.split('.')[1] || '').length;

      if (reduceMotion) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }

      var duration = 1400;
      var start = performance.now();
      (function tick(now) {
        var k = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - k, 3);
        var value = target * eased;
        el.textContent = (decimals
          ? value.toFixed(decimals)
          : Math.round(value).toLocaleString('en-IN')) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      })(start);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- filter rail ---------------- */
  // The active chip can sit off-screen on a narrow rail, which makes it look
  // like no filter is applied. Bring it into view without scrolling the page.
  function initFilterRail(scope) {
    var rails = (scope || document).querySelectorAll('.pv-filter__rail');

    rails.forEach(function (rail) {
      if (rail.dataset.pvRailReady === 'true') return;
      rail.dataset.pvRailReady = 'true';

      var active = rail.querySelector('[aria-current="true"]');
      if (!active) return;

      // Positioned instantly rather than animated: this is establishing the
      // initial state, and a scroll animation on load reads as jank.
      var target = active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2;
      rail.scrollLeft = Math.max(0, target);
    });
  }

  function initAll(scope) {
    initParallax(scope);
    initReveal(scope);
    initCounters(scope);
    initFilterRail(scope);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  // Shopify theme editor: re-initialise when a section is added or redrawn,
  // otherwise freshly injected markup keeps its hidden reveal state.
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
  document.addEventListener('shopify:section:select', function (event) {
    initReveal(event.target);
  });
})();
