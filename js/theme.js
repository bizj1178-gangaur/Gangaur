/* =====================================================
   THEME TOGGLE - shared by every page
   - Theme is stored as data-theme="sona" | "chandi" on <html>
   - Choice is saved in localStorage
   - Load this file in <head> WITHOUT defer/async so the theme is
     applied before the page paints (no flash of the wrong theme).
   ===================================================== */
(function () {
  var KEY = "theme-choice";      // localStorage key
  var DEFAULT = "sona";          // default theme
  var root = document.documentElement;

  // Read saved choice (falls back to default if blocked or invalid)
  function getSaved() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "chandi" || v === "sona" ? v : DEFAULT;
    } catch (e) { return DEFAULT; }
  }

  // Apply a theme to the page (and update the toggle if it exists)
  function apply(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.querySelector(".theme-toggle");
    if (btn) btn.setAttribute("aria-pressed", String(theme === "chandi")); // true = Chandi
    // Any element with data-theme-label shows the current theme name (test helper)
    document.querySelectorAll("[data-theme-label]").forEach(function (el) {
      el.textContent = theme === "chandi" ? "Chandi (silver)" : "Sona (gold)";
    });
  }

  // 1) Runs immediately, before first paint
  apply(getSaved());

  // 2) Once the page is ready, build the toggle and wire it up
  document.addEventListener("DOMContentLoaded", function () {
    var slot = document.getElementById("theme-toggle-slot"); // placed in each page's header
    if (slot) {
      slot.innerHTML =
        '<button type="button" class="theme-toggle" aria-pressed="false" ' +
        'aria-label="Switch theme between Sona (gold) and Chandi (silver)">' +
        '<span class="theme-toggle__thumb" aria-hidden="true"></span>' +
        '<span class="theme-toggle__label">Sona</span>' +
        '<span class="theme-toggle__label">Chandi</span></button>';

      slot.querySelector(".theme-toggle").addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "chandi" ? "sona" : "chandi";
        try { localStorage.setItem(KEY, next); } catch (e) {}
        apply(next);
      });
    }
    apply(getSaved()); // sync aria-pressed + labels now that the toggle exists
  });

  // Back/forward button can restore a cached page: re-apply the saved theme
  window.addEventListener("pageshow", function () { apply(getSaved()); });
})();
