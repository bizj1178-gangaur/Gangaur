/* =====================================================
   INTRO ANIMATION - index.html only
   The 8 stamps (4 Sona + 4 Chandi) appear as a deck, shuffle,
   then get "pasted" into the 4 stamp positions.
   Tap / click anywhere (or press Esc) to skip.
   ===================================================== */
(function () {
  var root = document.documentElement;
  var box = document.querySelector(".landing");

  // Nothing to do if the head script didn't switch the intro on
  // (reduced-motion setting, or not the landing page)
  if (!box || !root.classList.contains("intro-on")) { return; }

  // ---- Settings you can change ----
  var SHUFFLE_MOVES = 10;   // how many times the top stamp slides to the bottom
  var DECK = 1.3;           // how big the deck looks (1 = final stamp size)
  // ---------------------------------

  // Where each stamp sits in the collage (% of the picture box)
  var SPOTS = {
    tadka:    { l: 14.35, t: 10.44, w: 35.65, h: 35.56 },
    jharokha: { l: 54.35, t: 10.44, w: 35.65, h: 35.56 },
    nagina:   { l: 14.35, t: 50.00, w: 35.65, h: 35.63 },
    saadgi:   { l: 54.35, t: 50.00, w: 35.65, h: 35.63 }
  };

  var done = false;

  // ---------- small helpers ----------
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function mix(list) { return list.slice().sort(function () { return Math.random() - 0.5; }); }

  // Move/rotate/scale a stamp (x and y are % of the stamp's own size)
  function place(el, x, y, scale, rot) {
    el.style.transform = "translate(" + x + "%," + y + "%) scale(" + scale + ") rotate(" + rot + "deg)";
  }
  // Set up the animation for the NEXT place() call
  function anim(el, ms, ease, shadow) {
    el.style.transition = "transform " + ms + "ms " + ease + ", filter " + ms + "ms ease, opacity " + ms + "ms ease";
    el.style.filter = shadow ? "drop-shadow(0 8px 12px rgba(0,0,0,.35))" : "none";
  }

  // ---------- build the 8 stamps ----------
  var layer = document.createElement("div");
  layer.className = "intro-layer";
  layer.setAttribute("aria-hidden", "true");
  box.appendChild(layer);

  var hint = document.createElement("div");
  hint.className = "intro-skip";
  hint.textContent = "tap to skip";
  document.body.appendChild(hint);

  var stamps = [];
  Object.keys(SPOTS).forEach(function (name) {
    ["sona", "chandi"].forEach(function (th) {
      var s = SPOTS[name];
      var img = new Image();
      img.src = "images/" + th + "/stamp-" + name + ".webp";
      img.alt = "";
      img.className = "intro-stamp";
      img.style.cssText = "left:" + s.l + "%;top:" + s.t + "%;width:" + s.w + "%;height:" + s.h + "%";
      img.stampTheme = th;
      // how far (in % of its own size) the stamp must move to reach the middle of the box
      img.deckX = (50 - (s.l + s.w / 2)) / s.w * 100;
      img.deckY = (50 - (s.t + s.h / 2)) / s.h * 100;
      layer.appendChild(img);
      stamps.push(img);
    });
  });

  var order = mix(stamps);   // deck order, bottom -> top
  function stack() { order.forEach(function (el, i) { el.style.zIndex = i + 1; }); }

  // ---------- 1) the deck appears ----------
  async function showDeck() {
    stamps.forEach(function (el) {
      el.rot = rnd(-4, 4);
      el.style.transition = "none";
      el.style.opacity = "0";
      place(el, el.deckX, el.deckY, DECK * 0.85, el.rot);
    });
    stack();
    void layer.offsetWidth;   // lets the browser register the start position
    stamps.forEach(function (el) {
      anim(el, 400, "ease-out", true);
      el.style.opacity = "1";
      place(el, el.deckX, el.deckY, DECK, el.rot);
    });
    await sleep(600);
  }

  // ---------- 2) shuffle: top stamp slides out, goes under the deck ----------
  async function shuffle() {
    for (var i = 0; i < SHUFFLE_MOVES; i++) {
      if (done) return;
      var card = order[order.length - 1];
      var side = i % 2 ? 1 : -1;
      var ms = Math.max(80, 130 - i * 5);   // gets a little faster each time

      anim(card, ms, "ease-out", true);     // slide out sideways
      place(card, card.deckX + side * 60, card.deckY, DECK, side * rnd(8, 16));
      await sleep(ms);

      order.unshift(order.pop());           // send it to the bottom of the deck
      stack();
      card.rot = rnd(-5, 5);
      anim(card, ms, "ease-in", true);      // slide back in
      place(card, card.deckX, card.deckY, DECK, card.rot);
      await sleep(ms);
    }
  }

  // ---------- 3) paste every stamp into its spot ----------
  async function paste() {
    hint.remove();
    root.classList.remove("intro-red");     // background fades from red to cream

    var theme = root.getAttribute("data-theme") || "sona";
    var under = mix(stamps.filter(function (el) { return el.stampTheme !== theme; }));
    var top = mix(stamps.filter(function (el) { return el.stampTheme === theme; }));
    var seq = under.concat(top);            // current theme lands last, on top

    for (var i = 0; i < seq.length; i++) {
      if (done) return;
      var el = seq[i];
      el.style.zIndex = 20 + i;
      anim(el, 420, "cubic-bezier(.34,1.56,.64,1)", false);   // little overshoot = "slap"
      place(el, 0, 0, 1, 0);
      await sleep(150);
    }
    await sleep(500);
  }

  // ---------- finish (or skip) ----------
  function finish(instant) {
    if (done) return;
    done = true;
    root.classList.remove("intro-on", "intro-red");   // reveals the real landing page
    hint.remove();
    if (instant) { layer.remove(); return; }
    layer.style.transition = "opacity .25s ease";     // seamless hand-over
    layer.style.opacity = "0";
    setTimeout(function () { layer.remove(); }, 300);
  }

  document.addEventListener("pointerdown", function (e) {
    if (e.target.closest && e.target.closest(".site-header")) return;   // using the toggle doesn't skip
    finish(true);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") finish(true); });

  // ---------- run ----------
  async function run() {
    try {
      // wait (max 3s) until all stamp pictures are loaded
      await Promise.race([
        Promise.all(stamps.map(function (el) { return el.decode ? el.decode().catch(function () {}) : null; })),
        sleep(3000)
      ]);
      if (done) return;
      await showDeck();
      await shuffle();
      await paste();
      finish(false);
    } catch (err) {
      finish(true);   // if anything goes wrong, just show the normal page
    }
  }
  run();
})();