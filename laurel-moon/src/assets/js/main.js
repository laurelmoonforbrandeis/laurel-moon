// Laurel Moon: small enhancements. Every page still works without JavaScript,
// and nothing moves for people who ask their device to reduce motion.
(function () {
  var LM = (window.LaurelMoon = window.LaurelMoon || {});
  document.documentElement.classList.add("js");

  var motionOK = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function storage(kind) {
    return {
      get: function (key) { try { return window[kind].getItem(key); } catch (e) { return null; } },
      set: function (key, value) { try { window[kind].setItem(key, value); } catch (e) {} }
    };
  }
  var store = storage("localStorage");
  var session = storage("sessionStorage");

  function all(root, selector) { return Array.prototype.slice.call(root.querySelectorAll(selector)); }
  function setPressed(buttons, active) {
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === active)); });
  }

  // Replays a short entrance on items a filter just showed.
  function popIn(items) {
    if (!motionOK) return;
    items.forEach(function (el, i) {
      el.classList.remove("pop-in", "reveal", "is-revealed");
      void el.offsetWidth; // restart the animation
      el.style.animationDelay = Math.min(i, 12) * 30 + "ms";
      el.classList.add("pop-in");
    });
  }

  // ---- Sections drift up as they scroll into view -------------------------
  // Only things below the fold when the page opens are hidden, so nothing
  // already on screen flickers, and if this script never runs, nothing is hidden.
  var REVEAL = [
    ".section-head", ".issue-feature-cover", ".issue-feature-text > :not(.toc)", ".toc li",
    ".issue-grid li", ".band-text", ".facts > div", ".two-col > div > h2", ".two-col .body-lg",
    ".two-col .more-link", ".events li", ".events-empty", ".band-soft h2", ".band-soft .lede",
    ".staff-list > div", ".band-soft-inner > .btn", ".section--rule h2", ".section--rule .prose > *",
    ".issue-pager", ".reader-bio", ".keep-reading"
  ].join(",");

  function reveal(root) {
    if (!motionOK || !("IntersectionObserver" in window)) return;
    var fold = window.innerHeight * 0.92;
    var targets = all(root, REVEAL).filter(function (el) {
      return !el.closest(".hero") && el.getBoundingClientRect().top > fold;
    });
    if (!targets.length) return;
    var observer = new IntersectionObserver(function (entries) {
      var arriving = entries.filter(function (e) { return e.isIntersecting; });
      arriving.sort(function (a, b) {
        return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left);
      });
      arriving.forEach(function (entry, i) {
        var el = entry.target;
        observer.unobserve(el);
        el.style.transitionDelay = Math.min(i, 8) * 70 + "ms";
        el.classList.add("is-revealed");
        var finished = false;
        var done = function (event) {
          if (finished || (event && event.target !== el)) return;
          finished = true;
          el.classList.remove("reveal", "is-revealed");
          el.style.transitionDelay = "";
          el.removeEventListener("transitionend", done);
        };
        el.addEventListener("transitionend", done);
        window.setTimeout(done, 1800);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    targets.forEach(function (el) { el.classList.add("reveal"); observer.observe(el); });
  }

  // ---- Mobile menu ---------------------------------------------------------
  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("site-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });
    LM.closeMenu = function () {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    };
  }

  // ---- Issue contents: filter by poetry, prose, art ------------------------
  function initContents(root) {
    var contents = root.querySelector("[data-contents]");
    if (!contents) return;
    var buttons = all(contents, "[data-filter]");
    var items = all(contents, "[data-genre]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-filter");
        setPressed(buttons, btn);
        var shown = [];
        items.forEach(function (item) {
          item.hidden = value !== "All" && item.getAttribute("data-genre") !== value;
          if (!item.hidden) shown.push(item);
        });
        popIn(shown);
      });
    });
  }

  // ---- Archive: search and decade filters ---------------------------------
  function initArchive(root) {
    var archive = root.querySelector("[data-archive]");
    if (!archive) return;
    var input = archive.querySelector("[data-archive-search]");
    var buttons = all(archive, "[data-decade]");
    var issues = all(archive, "[data-issue]");
    var count = archive.querySelector("[data-archive-count]");
    var list = archive.querySelector("[data-archive-list]");
    var empty = archive.querySelector("[data-archive-empty]");
    var decade = "All";
    var total = issues.length;

    function update(animate) {
      var query = (input.value || "").trim().toLowerCase();
      var shown = [];
      issues.forEach(function (item) {
        var inDecade = decade === "All" || item.getAttribute("data-decade") === decade;
        var matches = !query || item.getAttribute("data-name").indexOf(query) !== -1;
        item.hidden = !(inDecade && matches);
        if (!item.hidden) shown.push(item);
      });
      count.textContent = shown.length === total
        ? "Showing all " + total + (total === 1 ? " issue" : " issues")
        : "Showing " + shown.length + " of " + total + " issues";
      list.hidden = shown.length === 0;
      empty.hidden = shown.length !== 0;
      if (animate) popIn(shown.length ? shown : [empty]);
    }

    input.addEventListener("input", function () { update(true); });
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        decade = btn.getAttribute("data-decade");
        setPressed(buttons, btn);
        update(true);
      });
    });
    archive.querySelector("[data-archive-clear]").addEventListener("click", function () {
      input.value = "";
      decade = "All";
      setPressed(buttons, buttons[0]);
      update(true);
      input.focus();
    });

    // Links like /archive/?q=2008 open with the search filled in.
    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) input.value = params.get("q");
    update(false);
  }

  // ---- Reader: text size, night reading, copy link ------------------------
  function initReader(root) {
    var reader = root.querySelector("[data-reader]");
    if (!reader) return;
    var size = parseInt(store.get("lm-reader-size"), 10) || (window.innerWidth < 760 ? 19 : 21);
    var nightButton = reader.querySelector("[data-night]");
    var applySize = function () { reader.style.setProperty("--reader-size", size + "px"); };
    var applyNight = function (on) {
      reader.classList.toggle("is-night", on);
      nightButton.setAttribute("aria-pressed", String(on));
    };
    applySize();
    applyNight(store.get("lm-reader-night") === "1");

    reader.querySelector("[data-smaller]").addEventListener("click", function () {
      size = Math.max(16, size - 2); applySize(); store.set("lm-reader-size", String(size));
    });
    reader.querySelector("[data-larger]").addEventListener("click", function () {
      size = Math.min(31, size + 2); applySize(); store.set("lm-reader-size", String(size));
    });
    nightButton.addEventListener("click", function () {
      var on = !reader.classList.contains("is-night");
      applyNight(on);
      store.set("lm-reader-night", on ? "1" : "0");
    });

    var copyLabel = reader.querySelector("[data-copy-label]");
    reader.querySelector("[data-copy]").addEventListener("click", function () {
      var url = window.location.href;
      var done = function () {
        copyLabel.textContent = "Link copied";
        window.setTimeout(function () { copyLabel.textContent = "Copy link"; }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { window.prompt("Copy this link:", url); });
      } else {
        window.prompt("Copy this link:", url);
      }
    });
  }

  // ---- Events: hide ones that have already happened -----------------------
  function initEvents(root) {
    all(root, "[data-events]").forEach(function (eventList) {
      var now = Date.now();
      var visible = 0;
      all(eventList, "[data-event-date]").forEach(function (item) {
        var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(item.getAttribute("data-event-date") || "");
        if (!m) { visible++; return; }
        // Timed events stay listed for 3 hours after they start; all-day events until midnight.
        var end = m[4]
          ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime() + 3 * 60 * 60 * 1000
          : new Date(+m[1], +m[2] - 1, +m[3], 23, 59).getTime();
        item.hidden = end < now;
        if (!item.hidden) visible++;
      });
      var emptyNote = eventList.parentElement.querySelector("[data-events-empty]");
      eventList.hidden = visible === 0;
      if (emptyNote) emptyNote.hidden = visible !== 0;
    });
  }

  // Sets up one page's worth of content. The site preview calls this again
  // each time it swaps pages, so it only touches what's inside `root`.
  LM.enhance = function (root) {
    initEvents(root);
    initContents(root);
    initArchive(root);
    initReader(root);
    reveal(root);
  };
  LM.initMenu = initMenu;
  LM.motionOK = motionOK;
  LM.session = session;

  if (!LM.manual) {
    initMenu();
    LM.enhance(document);
    // The home page's opening animation plays once per visit.
    if (document.querySelector(".hero")) session.set("lm-hero-seen", "1");
  }
})();
