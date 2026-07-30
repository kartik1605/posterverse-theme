/* ============================================================
   POSTERVERSE — infinite scroll for collection grids

   Progressive enhancement over Dawn's paginated grid. With JS off the
   normal pagination links remain and everything still works; with JS on
   the next page is fetched and appended as the shopper nears the end.

   Deliberately keeps a real "Load more" button rather than pure
   auto-loading: a grid that never ends makes the footer unreachable and
   strands keyboard users. The button is focusable, the observer just
   presses it for mouse/touch shoppers.
   ============================================================ */
(function () {
  'use strict';

  // Auto-load this many pages before requiring a deliberate click, so the
  // footer stays reachable on very large collections.
  var AUTO_LOAD_LIMIT = 3;

  function init(scope) {
    var root = scope || document;
    var grid = root.querySelector('#product-grid');
    if (!grid || grid.dataset.pvInfiniteReady === 'true') return;

    var wrapper = root.querySelector('.pagination-wrapper');
    if (!wrapper) return;

    var nextLink = wrapper.querySelector('a.pagination__item--next, .pagination__item--next a, a[rel="next"]');
    if (!nextLink) return; // single page of results — nothing to do

    grid.dataset.pvInfiniteReady = 'true';

    var nextUrl = nextLink.href;
    var loading = false;
    var autoLoads = 0;
    var exhausted = false;

    /* ---- UI: replace pagination with a load-more control ---- */
    var ui = document.createElement('div');
    ui.className = 'pv-more';
    ui.innerHTML =
      '<button type="button" class="pv-more__btn">Load more</button>' +
      '<p class="pv-more__status" role="status" aria-live="polite"></p>';
    wrapper.parentNode.insertBefore(ui, wrapper);
    wrapper.classList.add('pv-more__fallback');

    var button = ui.querySelector('.pv-more__btn');
    var status = ui.querySelector('.pv-more__status');

    function setStatus(text) { status.textContent = text; }

    function finish(message) {
      exhausted = true;
      button.remove();
      setStatus(message);
      if (observer) observer.disconnect();
    }

    function load() {
      if (loading || exhausted || !nextUrl) return;
      loading = true;
      button.disabled = true;
      button.classList.add('is-loading');
      setStatus('Loading more products…');

      fetch(nextUrl)
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var incoming = doc.querySelector('#product-grid');
          if (!incoming) throw new Error('no product grid in response');

          var items = Array.prototype.slice.call(incoming.children);
          items.forEach(function (item) { grid.appendChild(item); });

          // The fetched page carries the next cursor, filters and sort order
          // already applied — reuse its link rather than rebuilding the URL.
          var incomingNext = doc.querySelector('a.pagination__item--next, .pagination__item--next a, a[rel="next"]');
          var previousUrl = nextUrl;
          nextUrl = incomingNext ? incomingNext.href : null;

          // Keep the address bar in step so a refresh lands in roughly the
          // same place, without adding history entries the Back button
          // would force the shopper to walk through.
          try { history.replaceState(history.state, '', previousUrl); } catch (e) {}

          setStatus(items.length + ' more loaded');
          if (!nextUrl) {
            finish("That's everything.");
            return;
          }
          loading = false;
          button.disabled = false;
          button.classList.remove('is-loading');
        })
        .catch(function (error) {
          // Restore the real pagination so the shopper is never stuck.
          console.error('[posterverse] infinite scroll failed:', error);
          loading = false;
          button.remove();
          wrapper.classList.remove('pv-more__fallback');
          setStatus('Could not load more — use the page links below.');
          if (observer) observer.disconnect();
        });
    }

    button.addEventListener('click', function () {
      autoLoads = 0; // an explicit click re-arms auto-loading
      load();
    });

    /* ---- auto-load as the sentinel approaches ---- */
    var observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || loading || exhausted) return;
          if (autoLoads >= AUTO_LOAD_LIMIT) {
            setStatus('Showing ' + grid.children.length + ' products');
            return;
          }
          autoLoads++;
          load();
        });
      }, { rootMargin: '600px 0px' }); // start early so it feels seamless
      observer.observe(ui);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }

  // Dawn re-renders the grid when facets or sorting change; re-arm against
  // the fresh markup.
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });
  document.addEventListener('facet:update', function () { init(document); });
})();
