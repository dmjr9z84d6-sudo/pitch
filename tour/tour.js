// ═══════════════════════════════════════════════════════════════════════════
// tour.js — Feature-Tour AllesDa: Overlay-Engine
// ---------------------------------------------------------------------------
// Läuft NEBEN der echten App (kein App-Code wird verändert). Aufgaben:
//   A) Geführte Phase: Abdunkeln + Spotlight-Loch + Sprechblase je Station.
//      Bei „tippen"-Schritten ist NUR das Ziel klickbar (Blocker-Divs
//      fangen alle anderen Klicks) — Prinzip C+B aus der Spec.
//   B) Freie Phase: Overlay weg, app-fremde Leiste unten
//      (Zurücksetzen · Tour ansehen · Ausgiebiger kennenlernen).
//   C) Dauerhaft (beide Phasen):
//      · Einstellungen-Kacheln aus TOUR_BESCHNITT.einstellungenAusblenden
//        per DOM verstecken (Titel+Sub-Paar → eindeutig).
//      · Karten aus nurAnsichtKarten bekommen einen Nur-Ansicht-Schleier
//        (pointer-events aus + Badge) — verhindert Re-Aktivieren
//        ausgeblendeter Bereiche über die Einstellungen.
//      · Sicherheitsnetz: verboteneNavTexte in Nav-/Tab-Kontexten verstecken.
//
// Anker-Suche ist TEXT-basiert (keine Klassen/IDs der App nötig) und
// damit robust gegen Minify + Mobile/Desktop-Unterschiede. Wird ein Anker
// nicht gefunden → zentrierte Karte mit Weiter (Tour bricht nie hart).
// Alle Inhalte/Anker: inhalte.js. Doku: TOUR_BAUANLEITUNG.md.
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  var LS_STATUS = "allesda:tour:status"; // fehlt = Tour zeigen · "frei" = freie Phase
  var LS_MODUS = "allesda:tour:modus";   // "hell"|"dunkel" — vom Pitch übergeben
  var Z = 100000; // Basis-z-index (über allem App-eigenen)

  // ── Hell/Dunkel (Bruch-Fix 05.07.2026) ────────────────────────────────────
  // Der Pitch übergibt die Wahl via localStorage; ohne Wert gilt die
  // Systemeinstellung. Die Tour-UI übersetzt ihre Dunkel-Farben zentral in
  // Hell-Pendants (Paletten = Pitch tokens.js LIGHT/DARK). Der Wächter hält
  // die Tour LIVE synchron zum App-Modus (Nutzer kann im Kopf umschalten).
  var istHell = false;
  var appSyncFertig = false; // true, sobald App den Wunschmodus erreicht hat
  var FARBMAP_HELL = {
    "#12121E": "#FFFFFF",              // Karten-/Blasen-Hintergrund
    "#F0F0FF": "#0F1022",              // Haupttext
    "#C9C9E8": "#4A5072",              // Fließtext
    "#A0A0CD": "#4A5072",              // Sub/Links
    "#7575A0": "#737896",              // gedämpft
    "#2A2A45": "#D8DCE8",              // Border
    "#20203A": "#E4E7F0",              // Kopf-Border
    "#252540": "#D8DCE8",              // Overlay-Border
    "#5A5A80": "#A0A6C0",              // Griff-Punkte
    "#07070C": "#ECEEF3",              // Vollflächen-Overlay (Rechtliches)
    "rgba(10,10,18,0.92)": "rgba(244,246,250,0.94)",  // Leiste
    "rgba(3,3,8,0.92)": "rgba(245,246,249,0.94)",     // Spotlight-Ausblendung
    "rgba(4,4,10,0.72)": "rgba(235,238,244,0.8)",     // Info-Karten-Deckel
    "rgba(0,0,0,0.55)": "rgba(15,16,34,0.18)"         // Schatten
  };
  function uebersetzeFarbe(wert) {
    if (!istHell || typeof wert !== "string") return wert;
    for (var k in FARBMAP_HELL) {
      if (wert.indexOf(k) >= 0) wert = wert.split(k).join(FARBMAP_HELL[k]);
    }
    return wert;
  }
  function ermittleStartModusHell() {
    var v = null;
    try { v = localStorage.getItem(LS_MODUS); } catch (e) {}
    if (v === "hell") return true;
    if (v === "dunkel") return false;
    try {
      return !(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch (e) { return false; }
  }
  // App-Modus am Kopf-Button ablesen: title="Dunkelmodus" existiert → App hell.
  function appIstHell() {
    if (document.querySelector('button[title="Dunkelmodus"]')) return true;
    if (document.querySelector('button[title="Hellmodus"]')) return false;
    return null; // App-Kopf (noch) nicht da
  }

  // ── Mini-Helfer ────────────────────────────────────────────────────────────
  function el(tag, css, text) {
    var d = document.createElement(tag);
    if (css) { for (var k in css) { d.style[k] = uebersetzeFarbe(css[k]); } }
    if (text) d.textContent = text;
    return d;
  }
  function sichtbar(n) {
    if (!n || !n.getBoundingClientRect) return false;
    var r = n.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    var st = window.getComputedStyle(n);
    return st.display !== "none" && st.visibility !== "hidden" && st.opacity !== "0";
  }
  function eigenerText(n) {
    // Nur direkte Textknoten (nicht die der Kinder)
    var s = "";
    for (var i = 0; i < n.childNodes.length; i++) {
      var c = n.childNodes[i];
      if (c.nodeType === 3) s += c.nodeValue;
    }
    return s.replace(/\s+/g, " ").trim();
  }
  function alleElemente(wurzel) {
    return (wurzel || document.body).querySelectorAll("*");
  }
  function istTourKnoten(n) {
    while (n) { if (n.__tour) return true; n = n.parentNode; }
    return false;
  }

  // ── Anker-Suche ────────────────────────────────────────────────────────────
  // {text:"…"}: sichtbares Element, dessen EIGENER Text exakt so lautet oder
  //   so beginnt; wir nehmen das mit der kleinsten Fläche (präzisester Treffer)
  //   und klettern zum klickbaren Wrapper hoch (max. 4 Ebenen).
  function findeText(text) {
    var best = null, bestA = Infinity;
    var bestExakt = null, bestExaktA = Infinity;
    var alle = alleElemente();
    for (var i = 0; i < alle.length; i++) {
      var n = alle[i];
      if (istTourKnoten(n) || !sichtbar(n)) continue;
      var t = eigenerText(n);
      if (!t) continue;
      // Exakte Treffer haben VORRANG (sonst gewinnt z. B. "Verwaltungsart"
      // gegen den Tab "Verwaltung", weil es mit dem Suchtext beginnt und
      // kleiner ist). "Beginnt mit" zaehlt nur, solange kein exakter da ist.
      if (t === text) {
        var r = n.getBoundingClientRect();
        var a = r.width * r.height;
        if (!bestExakt || a < bestExaktA) { bestExaktA = a; bestExakt = n; }
      } else if (t.indexOf(text) === 0) {
        var r2 = n.getBoundingClientRect();
        var a2 = r2.width * r2.height;
        if (a2 < bestA) { bestA = a2; best = n; }
      }
    }
    if (bestExakt) best = bestExakt;
    if (!best) return null;
    // Zum ganzen Eintrag hochklettern: solange Eltern (fast) nur diesen
    // Text tragen. cursor taugt nicht als Kriterium (erbt auf Kinder).
    // Echte <button>/<a>-Vorfahren gewinnen zusätzlich (max. 4 Ebenen).
    var n2 = best, p2 = best.parentElement, hoch = 0;
    while (p2 && hoch < 4) {
      var tag = (p2.tagName || "").toLowerCase();
      var pt = (p2.textContent || "").replace(/\s+/g, " ").trim();
      if (tag === "button" || tag === "a") { n2 = p2; break; }
      if (pt.length > text.length + 12) break;
      n2 = p2; p2 = p2.parentElement; hoch++;
    }
    return n2;
  }
  // Erkennt eine „ganze Karte" an den stabilen App-Markierungen.
  function istKarte(n) {
    if (!n || !n.getAttribute) return false;
    if (n.getAttribute("data-kb-item") === "1") return true;
    var id = n.id || "";
    if (id.indexOf("obj-") === 0) return true;          // Objektkarte
    if (id.indexOf("kon-") === 0) return true;          // Kontaktkarte (Liste)
    if (id.indexOf("vekontkarte-") === 0) return true;  // Kontaktgruppe am Objekt
    return false;
  }

  // {alleTexte:[…]}: kleinster sichtbarer Container, der ALLE Texte enthält.
  // Klettert danach zum klickbaren Vorfahren (Karte mit onClick), damit
  // „tippen"-Schritte ein sinnvolles Klickziel bekommen.
  function findeContainer(texte) {
    var best = null, bestA = Infinity;
    var alle = alleElemente();
    for (var i = 0; i < alle.length; i++) {
      var n = alle[i];
      if (istTourKnoten(n) || !sichtbar(n)) continue;
      var tc = n.textContent || "";
      var ok = true;
      for (var j = 0; j < texte.length; j++) {
        if (tc.indexOf(texte[j]) < 0) { ok = false; break; }
      }
      if (!ok) continue;
      var r = n.getBoundingClientRect();
      var a = r.width * r.height;
      if (a > 4 && a < bestA) { bestA = a; best = n; }
    }
    if (!best) return null;
    // Zur GANZEN Karte hochklettern: Avatare (Initialen), Badges und
    // Statuszeilen bringen nur wenig Zusatztext (+80 Zeichen Toleranz);
    // die Listen-Gruppe darüber enthält die nächste Karte (viel mehr Text)
    // → dort stoppt der Aufstieg. So umfasst der Spotlight die komplette
    // Kontakt-/Objekt-Karte, nicht nur den Textblock (Benny, 05.07.2026).
    // Zur GANZEN Karte: strukturell klettern. Die App markiert jede
    // klickbare Karte/Zeile mit data-kb-item="1" (Kontakte UND Objekte),
    // Objektkarten zusätzlich mit id="obj-…", Kontaktgruppen mit
    // id="vekontkarte-…". Das ist zuverlässiger als jede Flächen-/Text-
    // Heuristik (Benny: „immer die ganze Karte", 05.07.2026).
    var kandidat = istKarte(best) ? best : null;
    var n2 = best, hoch = 0;
    while (n2 && hoch < 8) {
      if (istKarte(n2)) { kandidat = n2; break; }
      n2 = n2.parentElement; hoch++;
    }
    if (kandidat) return kandidat;
    // Fallback (App-Markierung fehlt): eng am Textblock bleiben.
    return best;
  }
  function findeAnker(anker) {
    if (!anker) return null;
    if (anker.alleTexte) return findeContainer(anker.alleTexte);
    if (anker.text) return findeText(anker.text);
    return null;
  }

  // ── Overlay-Bausteine (Spotlight + Blocker + Sprechblase) ──────────────────
  var ov = { loch: null, blocker: [], blase: null, ziel: null, schrittIdx: 0, aktiv: false, blasePos: null };

  function raeumeOverlay() {
    if (ov.loch && ov.loch.parentNode) ov.loch.parentNode.removeChild(ov.loch);
    ov.loch = null;
    for (var i = 0; i < ov.blocker.length; i++) {
      var b = ov.blocker[i];
      if (b.parentNode) b.parentNode.removeChild(b);
    }
    ov.blocker = [];
    if (ov.blase && ov.blase.parentNode) ov.blase.parentNode.removeChild(ov.blase);
    ov.blase = null;
    ov.ziel = null;
  }

  function macheBlocker(x, y, w, h) {
    var b = el("div", {
      position: "fixed", left: x + "px", top: y + "px",
      width: Math.max(0, w) + "px", height: Math.max(0, h) + "px",
      zIndex: String(Z + 1), background: "transparent"
    });
    b.__tour = true;
    // Klicks schlucken (Sperren = Technik B)
    b.addEventListener("click", function (e) { e.stopPropagation(); e.preventDefault(); }, true);
    b.addEventListener("touchstart", function (e) { e.stopPropagation(); e.preventDefault(); }, { capture: true, passive: false });
    document.body.appendChild(b);
    return b;
  }

  function zeichneSpotlight(ziel, klickDurch) {
    // Optik: Loch-Div mit riesigem box-shadow als Abdunklung
    var r = ziel ? ziel.getBoundingClientRect() : null;
    var pad = 6;
    var x = r ? r.left - pad : window.innerWidth / 2;
    var y = r ? r.top - pad : window.innerHeight / 2;
    var w = r ? r.width + pad * 2 : 0;
    var h = r ? r.height + pad * 2 : 0;
    if (r) {
      // In den Viewport klemmen (3 px Kantenabstand), damit der Rahmen bei
      // randbündigen Zielen (Kopf, Seitenleiste, Hauptfenster) komplett
      // sichtbar bleibt und nicht über die Bildschirmkante läuft.
      var rand = 3;
      var x2 = Math.max(rand, x);
      var y2 = Math.max(rand, y);
      var rechts = Math.min(window.innerWidth - rand, x + w);
      var unten = Math.min(window.innerHeight - rand, y + h);
      x = x2; y = y2;
      w = Math.max(0, rechts - x2);
      h = Math.max(0, unten - y2);
    }

    if (!ov.loch) {
      ov.loch = el("div", {
        position: "fixed", zIndex: String(Z),
        borderRadius: "14px", pointerEvents: "none",
        boxShadow: "0 0 0 200vmax rgba(3,3,8,0.92)",
        transition: "left .25s ease, top .25s ease, width .25s ease, height .25s ease",
        border: "2px solid rgba(14,116,144,0.9)"
      });
      ov.loch.__tour = true;
      document.body.appendChild(ov.loch);
    }
    ov.loch.style.left = x + "px";
    ov.loch.style.top = y + "px";
    ov.loch.style.width = w + "px";
    ov.loch.style.height = h + "px";
    ov.loch.style.display = r ? "block" : "none";

    // Blocker neu legen: 4 Rechtecke um das Loch (nur wenn Loch existiert)
    for (var i = 0; i < ov.blocker.length; i++) {
      var b = ov.blocker[i];
      if (b.parentNode) b.parentNode.removeChild(b);
    }
    ov.blocker = [];
    var W = window.innerWidth, H = window.innerHeight;
    if (r) {
      ov.blocker.push(macheBlocker(0, 0, W, y));                       // oben
      ov.blocker.push(macheBlocker(0, y + h, W, H - y - h));           // unten
      ov.blocker.push(macheBlocker(0, y, x, h));                       // links
      ov.blocker.push(macheBlocker(x + w, y, W - x - w, h));           // rechts
      if (!klickDurch) {
        // „zeigen"-Schritt: auch das Loch nicht klickbar
        ov.blocker.push(macheBlocker(x, y, w, h));
      }
    } else {
      ov.blocker.push(macheBlocker(0, 0, W, H)); // Vollsperre (Karten-Schritt)
    }
  }

  function zeichneBlase(schritt, mitWeiter, ohneAnker, ausweichRect) {
    ov.blaseArgs = [schritt, mitWeiter, ohneAnker, ausweichRect]; // für Theme-Neuzeichnen
    if (ov.blase && ov.blase.parentNode) ov.blase.parentNode.removeChild(ov.blase);
    var blase = el("div", {
      position: "fixed", left: "50%", top: "50%",
      transform: "translate(-50%, -50%)",
      width: "calc(100% - 24px)", maxWidth: "440px",
      zIndex: String(Z + 2),
      background: "#12121E", color: "#F0F0FF",
      border: "1px solid #2A2A45", borderRadius: "16px",
      paddingBottom: "16px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    });
    blase.__tour = true;

    // Position: Die Blase bleibt IMMER dort, wo sie zuletzt war. Beim ersten
    // Erscheinen wird sie einmal platziert (mittig, etwas oberhalb der Mitte,
    // damit sie Tipp-Ziele im oberen Bereich seltener verdeckt) und diese
    // Position in ov.blasePos festgehalten. Ab dann springt sie NIE mehr —
    // weder bei Schrittwechsel noch beim Neuzeichnen. Verschiebt der Nutzer
    // sie, wird die neue Position gemerkt und beibehalten.
    if (!ov.blasePos) {
      // Startposition einmalig festlegen (px, nicht transform — dann ist sie
      // von Anfang an „fest" und Folgeschritte rechnen nicht neu).
      var startBreite = Math.min(440, window.innerWidth - 24);
      var startX = Math.round((window.innerWidth - startBreite) / 2);
      var startY = Math.round(window.innerHeight * 0.30);
      ov.blasePos = { x: startX, y: startY };
    }
    blase.style.left = ov.blasePos.x + "px";
    blase.style.top = ov.blasePos.y + "px";
    blase.style.transform = "none";

    var fortschritt = (ov.schrittIdx + 1) / TOUR_SCHRITTE.length;

    // ── Titelleiste (zugleich Zieh-Griff) ──
    var kopf = el("div", {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      gap: "10px", padding: "13px 16px 9px",
      cursor: "move", touchAction: "none",
      borderBottom: "1px solid #20203A", userSelect: "none", flexShrink: "0"
    });
    var titelWrap = el("div", { display: "flex", alignItems: "center", gap: "8px", minWidth: "0" });
    // kleines Griff-Symbol (sechs Punkte) als Hinweis „verschiebbar"
    titelWrap.appendChild(el("div", {
      fontSize: "13px", color: "#5A5A80", flexShrink: "0",
      letterSpacing: "1px", lineHeight: "1"
    }, "\u2807\u2807"));
    titelWrap.appendChild(el("div", {
      fontSize: "16px", fontWeight: "700", letterSpacing: "-0.01em",
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
    }, schritt.titel || ""));
    kopf.appendChild(titelWrap);
    blase.appendChild(kopf);
    macheZiehbar(blase, kopf);

    // ── Körper: feste Mindesthöhe (alle Blasen gleich groß). Text oben,
    // Buttons unten gepinnt. Kurze Texte → mehr Leerraum darunter. ──
    var body = el("div", {
      padding: "14px 16px 4px", display: "flex", flexDirection: "column",
      // Höhe am längsten Text ausgerichtet (Station „Alles am Objekt", ~6 Zeilen)
      minHeight: "150px"
    });
    body.appendChild(el("div", { fontSize: "14px", lineHeight: "1.5", color: "#C9C9E8", flex: "1 1 auto" }, schritt.text || ""));

    var reihe = el("div", { display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap", flexShrink: "0" });
    var buttons = schritt.buttons;
    if (!buttons) {
      buttons = [];
      if (mitWeiter || ohneAnker) buttons.push({ label: "Weiter", aktion: "weiter", primaer: true });
    }
    for (var i = 0; i < buttons.length; i++) {
      (function (bd) {
        var btn = el("button", {
          flex: "1 1 auto", minHeight: "44px", padding: "10px 14px",
          fontSize: "16px", fontWeight: bd.primaer ? "700" : "500",
          borderRadius: "999px", cursor: "pointer",
          border: bd.primaer ? "none" : "1px solid #2A2A45",
          background: bd.primaer ? "#0E7490" : "transparent",
          color: bd.primaer ? "#FFFFFF" : "#C9C9E8"
        }, bd.label);
        btn.__tour = true;
        btn.addEventListener("click", function () { fuehreAktionAus(bd.aktion); });
        reihe.appendChild(btn);
      })(buttons[i]);
    }
    if (reihe.childNodes.length > 0) body.appendChild(reihe);

    blase.appendChild(body);

    // Fortschritt: dezenter Strich wie im Pitch (2 px, füllt sich in Akzent)
    var balkenAussen = el("div", {
      margin: "12px 16px 0", height: "2px",
      background: "#2A2A45", borderRadius: "999px", overflow: "hidden"
    });
    balkenAussen.__tour = true;
    var balkenInnen = el("div", {
      height: "100%", background: "#0E7490", borderRadius: "999px",
      width: Math.round(fortschritt * 100) + "%",
      transition: "width 340ms ease"
    });
    balkenInnen.__tour = true;
    balkenAussen.appendChild(balkenInnen);
    blase.appendChild(balkenAussen);
    document.body.appendChild(blase);
    ov.blase = blase;
  }

  // ── Blase per Griff verschiebbar machen (Maus + Touch) ─────────────────────
  function macheZiehbar(blase, griff) {
    var zieht = false, startX = 0, startY = 0, boxX = 0, boxY = 0;
    function punkt(e) {
      if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    }
    function start(e) {
      zieht = true;
      var r = blase.getBoundingClientRect();
      // Auf feste px-Position umstellen (transform-Zentrierung auflösen)
      blase.style.left = r.left + "px";
      blase.style.top = r.top + "px";
      blase.style.transform = "none";
      boxX = r.left; boxY = r.top;
      var p = punkt(e);
      startX = p.x; startY = p.y;
      if (e.cancelable) e.preventDefault();
    }
    function bewege(e) {
      if (!zieht) return;
      var p = punkt(e);
      var nx = boxX + (p.x - startX);
      var ny = boxY + (p.y - startY);
      // In den sichtbaren Bereich klemmen (mind. 40px Griff greifbar lassen)
      var b = blase.getBoundingClientRect();
      var maxX = window.innerWidth - 60;
      var maxY = window.innerHeight - 44;
      if (nx < 60 - b.width) nx = 60 - b.width;
      if (nx > maxX) nx = maxX;
      if (ny < 0) ny = 0;
      if (ny > maxY) ny = maxY;
      blase.style.left = nx + "px";
      blase.style.top = ny + "px";
      if (e.cancelable) e.preventDefault();
    }
    function ende() {
      if (!zieht) return;
      zieht = false;
      var r = blase.getBoundingClientRect();
      ov.blasePos = { x: r.left, y: r.top }; // Position merken (schrittübergreifend)
    }
    griff.addEventListener("mousedown", start);
    window.addEventListener("mousemove", bewege);
    window.addEventListener("mouseup", ende);
    griff.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("touchmove", bewege, { passive: false });
    window.addEventListener("touchend", ende);
  }

  // ── Schritt-Steuerung ──────────────────────────────────────────────────────
  var sucheTimer = null;

  function zeigeSchritt(idx) {
    ov.schrittIdx = idx;
    if (idx >= TOUR_SCHRITTE.length) { fuehreAktionAus("freigeben"); return; }
    var s = TOUR_SCHRITTE[idx];
    raeumeOverlay();

    if (s.art === "karte") {
      zeichneSpotlight(null, false);
      zeichneBlase(s, false, false);
      return;
    }

    // Anker suchen — mit Retry (App rendert evtl. noch), max. ~3s
    var versuche = 0;
    function versuche_finden() {
      var ziel = findeAnker(s.anker);
      if (ziel) {
        // EINMALIG zum Ziel scrollen (weiter unten liegende Karten, z. B.
        // Firmen-Kontakte). Die Blase steht fest → kein Springen mehr; nur
        // der Spotlight wird nach dem Scroll gezeichnet.
        try { ziel.scrollIntoView({ block: "center" }); } catch (e) {}
        setTimeout(function () {
          ov.ziel = ziel;
          zeichneSpotlight(ziel, s.art === "tippen");
          zeichneBlase(s, s.art === "zeigen", false, null);
          if (s.art === "tippen") lauscheAufZielKlick(ziel);
        }, 180);
      } else if (versuche++ < 10) {
        sucheTimer = setTimeout(versuche_finden, 300);
      } else {
        // Fallback: Anker fehlt (App geändert?) → Karte mit Weiter
        zeichneSpotlight(null, false);
        zeichneBlase(s, false, true);
      }
    }
    versuche_finden();
  }

  function lauscheAufZielKlick(ziel) {
    // WICHTIG: Beim Tippen re-rendert React die Liste — das gemerkte
    // Ziel-Element wird aus dem DOM entfernt, sein Rect wird 0/0 und
    // contains() greift ins Leere. Deshalb: (a) Rect beim Registrieren
    // EINFRIEREN und dagegen prüfen, (b) zusätzlich pointerdown abhören,
    // das VOR dem Re-Render feuert. Sonst hängt die Tour in einer
    // Öffnen/Schließen-Schleife (Bug v0.18, Station 2).
    var fr = ziel.getBoundingClientRect();
    var frozen = { left: fr.left, top: fr.top, right: fr.right, bottom: fr.bottom };
    var erledigt = false;

    function treffer(e) {
      var x = e.clientX, y = e.clientY;
      if (x == null && e.touches && e.touches.length) { x = e.touches[0].clientX; y = e.touches[0].clientY; }
      if (x == null) return false;
      var imFrozen = (x >= frozen.left && x <= frozen.right && y >= frozen.top && y <= frozen.bottom);
      var imAktuell = false;
      try {
        var r2 = ziel.getBoundingClientRect();
        imAktuell = (r2.width > 0 && x >= r2.left && x <= r2.right && y >= r2.top && y <= r2.bottom);
      } catch (e2) {}
      var imZiel = false;
      try { imZiel = !!(ziel.contains && e.target && ziel.contains(e.target)); } catch (e3) {}
      return imFrozen || imAktuell || imZiel;
    }
    function handler(e) {
      if (erledigt) return;
      if (!ov.aktiv) { abmelden(); return; }
      if (!treffer(e)) return;
      erledigt = true;
      abmelden();
      // App klicken lassen, dann weiter (Render abwarten).
      setTimeout(function () { zeigeSchritt(ov.schrittIdx + 1); }, 550);
    }
    function abmelden() {
      document.removeEventListener("pointerdown", handler, true);
      document.removeEventListener("click", handler, true);
    }
    document.addEventListener("pointerdown", handler, true);
    document.addEventListener("click", handler, true);
  }

  function fuehreAktionAus(aktion) {
    if (aktion === "weiter") { zeigeSchritt(ov.schrittIdx + 1); return; }
    if (aktion === "freigeben") {
      ov.aktiv = false;
      if (sucheTimer) clearTimeout(sucheTimer);
      raeumeOverlay();
      try { localStorage.setItem(LS_STATUS, "frei"); } catch (e) {}
      zeigeLeiste("frei");
      return;
    }
    if (aktion === "kennenlernen") {
      if (typeof ZIEL_KENNENLERNEN === "string" && ZIEL_KENNENLERNEN) {
        window.location.href = ZIEL_KENNENLERNEN;
      } else {
        zeigeInfoKarte(KARTE_KENNENLERNEN);
      }
      return;
    }
  }

  // ── Info-Karte (Kennenlernen-Platzhalter, Reset-Bestätigung) ──────────────
  function zeigeInfoKarte(inhalt, buttons) {
    var deckel = el("div", {
      position: "fixed", left: "0", top: "0", right: "0", bottom: "0",
      zIndex: String(Z + 10), background: "rgba(4,4,10,0.72)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    });
    deckel.__tour = true;
    var karte = el("div", {
      background: "#12121E", color: "#F0F0FF",
      border: "1px solid #2A2A45", borderRadius: "16px",
      padding: "20px", maxWidth: "420px", width: "100%",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      boxShadow: "0 12px 40px rgba(0,0,0,0.55)"
    });
    karte.__tour = true;
    karte.appendChild(el("div", { fontSize: "17px", fontWeight: "700", marginBottom: "8px" }, inhalt.titel));
    karte.appendChild(el("div", { fontSize: "14px", lineHeight: "1.5", color: "#C9C9E8" }, inhalt.text));
    var reihe = el("div", { display: "flex", gap: "10px", marginTop: "16px" });
    var defs = buttons || [{ label: inhalt.schliessen || "Schließen", primaer: true, tue: function () { schliesse(); } }];
    function schliesse() { if (deckel.parentNode) deckel.parentNode.removeChild(deckel); }
    for (var i = 0; i < defs.length; i++) {
      (function (bd) {
        var btn = el("button", {
          flex: "1 1 auto", minHeight: "44px", padding: "10px 14px",
          fontSize: "16px", fontWeight: bd.primaer ? "700" : "500",
          borderRadius: "999px", cursor: "pointer",
          border: bd.primaer ? "none" : "1px solid #2A2A45",
          background: bd.primaer ? "#0E7490" : "transparent",
          color: bd.primaer ? "#FFFFFF" : "#C9C9E8"
        }, bd.label);
        btn.__tour = true;
        btn.addEventListener("click", function () { schliesse(); if (bd.tue) bd.tue(); });
        reihe.appendChild(btn);
      })(defs[i]);
    }
    karte.appendChild(reihe);
    deckel.appendChild(karte);
    document.body.appendChild(deckel);
  }

  // ── Freie Phase: die app-fremde Leiste unten ───────────────────────────────
  var leiste = null;
  // modus: "gefuehrt" = nur Schrift-Links (Tour beenden · Rechtliches)
  //        "frei"     = ein echter Button (Kennenlernen) + Schrift-Links
  //                     (Zurücksetzen · Tour ansehen · Rechtliches)
  function zeigeLeiste(modus) {
    if (!leiste) {
      leiste = el("div", {
        position: "fixed", left: "0", right: "0", bottom: "0",
        zIndex: String(Z + 3),
        display: "flex", flexDirection: "column", gap: "10px", alignItems: "stretch",
        padding: "12px 16px 36px",
        // Dezent statt dominant: leicht abgesetzter dunkler Streifen, dünne Linie
        background: "rgba(10,10,18,0.92)",
        borderTop: "1px solid #2A2A45",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      });
      leiste.__tour = true;
      document.body.appendChild(leiste);
    }
    leiste.__modus = modus || "frei";
    zeichneLeisteInhalt(leiste.__modus);
  }

  function zeichneLeisteInhalt(modus) {
    if (!leiste) return;
    while (leiste.firstChild) leiste.removeChild(leiste.firstChild);

    var reset = function () {
      zeigeInfoKarte(KARTE_RESET, [
        { label: KARTE_RESET.nein, primaer: false, tue: null },
        { label: KARTE_RESET.ja, primaer: true, tue: setzeAllesZurueck }
      ]);
    };
    var tourNochmal = function () {
      try { localStorage.removeItem(LS_STATUS); } catch (e) {}
      window.location.reload();
    };
    var recht = function () { zeigeRecht(); };
    var beenden = function () { fuehreAktionAus("freigeben"); };

    if (modus === "frei") {
      // Freie Phase / Weiche: EIN echter Button — die Sekundäraktionen
      // liegen alle in der festen Fußzeile ganz unten (s.u.).
      // Kompakt: Höhe wie der runde +-Button der App (~40 px), nicht mehr
      // bildschirmbreit — dominiert über Farbe, nicht über Masse.
      var primaerBtn = el("button", {
        alignSelf: "center", minHeight: "36px", minWidth: "min(420px, 70vw)",
        padding: "7px 40px",
        fontSize: "14px", fontWeight: "700", borderRadius: "999px",
        cursor: "pointer", border: "none",
        background: "#0E7490", color: "#FFFFFF",
        boxShadow: "0 1px 2px rgba(14,116,144,0.25)",
        WebkitTapHighlightColor: "transparent"
      }, LEISTE.kennenlernen);
      primaerBtn.__tour = true;
      primaerBtn.addEventListener("click", function () { fuehreAktionAus("kennenlernen"); });
      leiste.appendChild(primaerBtn);
    }
    // geführt: Leiste trägt nichts Eigenes — alle Aktionen in der Fußzeile.

    // ── Fußzeile: EINE Zeile ganz unten, alles im dezenten 11px-Stil ──
    // Links Version (nicht klickbar) · Mitte die Aktionen · rechts Rechtliches.
    // Feste Bildschirmkoordinaten wie im Pitch (bottom 6–8, ohne safe-area).
    var altFuss = document.getElementById("tour-fusszeile");
    if (altFuss && altFuss.parentNode) altFuss.parentNode.removeChild(altFuss);

    function fussLink(label, tue) {
      var a = el("div", {
        fontSize: "14px", fontWeight: "600", color: "#A0A0CD",
        cursor: "pointer", padding: "6px 4px", whiteSpace: "nowrap",
        WebkitTapHighlightColor: "transparent"
      }, label);
      a.__tour = true;
      a.addEventListener("click", tue);
      return a;
    }

    var fuss = el("div", {
      position: "fixed", left: "0", right: "0", bottom: "0",
      zIndex: String(Z + 4),
      display: "flex", alignItems: "center",
      padding: "0 12px 6px 10px",
      pointerEvents: "none", // nur die Kinder fangen Klicks
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    });
    fuss.id = "tour-fusszeile";
    fuss.__tour = true;

    // links: Version (wie Pitch: 11px, opacity .7, nicht klickbar)
    var ver = el("div", {
      fontSize: "11px", color: "#7575A0", opacity: "0.7",
      letterSpacing: "0.02em", userSelect: "none",
      padding: "6px 0", flexShrink: "0"
    }, "v" + (typeof TOUR_VERSION !== "undefined" ? TOUR_VERSION : ""));
    ver.__tour = true;
    fuss.appendChild(ver);

    // Mitte: Aktionen, absolut auf ECHTE Bildschirmmitte zentriert (nicht im
    // Restraum zwischen Version und Rechtliches — die sind ungleich breit).
    var mitte = el("div", {
      position: "absolute", left: "50%", transform: "translateX(-50%)",
      display: "flex", gap: "22px",
      justifyContent: "center", alignItems: "center",
      pointerEvents: "auto", whiteSpace: "nowrap"
    });
    mitte.__tour = true;
    if (modus === "gefuehrt") {
      mitte.appendChild(fussLink("Tour beenden", beenden));
    } else {
      mitte.appendChild(fussLink(LEISTE.zuruecksetzen, reset));
      mitte.appendChild(fussLink(LEISTE.tourNochmal, tourNochmal));
    }
    fuss.appendChild(mitte);

    // rechts: Rechtliches (wie Pitch: 11px, opacity .6)
    var rechtEck = el("div", {
      marginLeft: "auto",
      fontSize: "11px", color: "#7575A0", opacity: "0.6",
      letterSpacing: "0.02em", cursor: "pointer",
      padding: "6px 0 6px 4px", flexShrink: "0",
      pointerEvents: "auto",
      WebkitTapHighlightColor: "transparent"
    }, LEISTE.rechtliches);
    rechtEck.__tour = true;
    rechtEck.addEventListener("click", recht);
    fuss.appendChild(rechtEck);

    document.body.appendChild(fuss);

    // Auslauf an die echte Footer-Höhe anpassen (nach dem Rendern messen).
    passeAuslaufAn();
  }

  // Der App-Inhalt darf nicht hinter den Footer laufen. Die App scrollt auf
  // Mobile den Body nativ und reserviert unten Platz über die CSS-Variable
  // --ad-auslauf (DESIGN §33, default 62dvh). Statt das Body-Padding zu
  // überschreiben (das würde die App überschreiben/kaputt machen), heben wir
  // --ad-auslauf um die gemessene Footer-Höhe an — so rechnet die App selbst
  // den Platz ein und der letzte Inhalt lässt sich über den Footer schieben.
  function passeAuslaufAn() {
    // Nach dem Layout messen (zwei rAF, damit Flex/Wrap fertig ist).
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!leiste) return;
        var h = leiste.offsetHeight || 0;
        // etwas Luft über dem Footer, damit Inhalt nicht direkt anklebt
        var zusatz = h + 16;
        try {
          document.documentElement.style.setProperty("--ad-auslauf", "calc(62dvh + " + zusatz + "px)");
        } catch (e) {}
      });
    });
  }

  // ── Rechtliches-Overlay (Impressum + Datenschutz) ──────────────────────────
  // Plain-JS-Nachbau des Pitch-Overlays (recht.jsx). Inhalt aus inhalte.js.
  function zeigeRecht() {
    var k = (RECHT && RECHT.kontakt) || {};
    var deckel = el("div", {
      position: "fixed", left: "0", top: "0", right: "0", bottom: "0",
      zIndex: String(Z + 20), background: "#07070C",
      display: "flex", flexDirection: "column",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    });
    deckel.__tour = true;

    // Kopf mit Schließen
    var kopf = el("div", {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "max(16px, env(safe-area-inset-top)) 20px 12px",
      borderBottom: "1px solid #252540", flexShrink: "0"
    });
    kopf.appendChild(el("span", { fontSize: "16px", fontWeight: "700", color: "#F0F0FF" }, RECHT.titel));
    var zu = el("button", {
      background: "transparent", border: "none", color: "#A0A0CD",
      fontSize: "15px", cursor: "pointer", padding: "8px 4px",
      WebkitTapHighlightColor: "transparent"
    }, RECHT.schliessen);
    zu.__tour = true;
    zu.addEventListener("click", function () { if (deckel.parentNode) deckel.parentNode.removeChild(deckel); });
    kopf.appendChild(zu);
    deckel.appendChild(kopf);

    // Scrollbarer Inhalt
    var scroll = el("div", { flex: "1", overflowY: "auto", padding: "8px 22px max(28px, env(safe-area-inset-bottom))" });
    var innen = el("div", { maxWidth: "620px", margin: "0 auto" });

    function h2(text) { return el("div", { fontSize: "18px", fontWeight: "700", color: "#F0F0FF", marginTop: "28px", marginBottom: "8px" }, text); }
    function p(css) { var o = { fontSize: "14px", lineHeight: "1.6", color: "#A0A0CD", marginBottom: "8px" }; if (css) for (var x in css) o[x] = css[x]; return el("div", o); }
    function stark(text, extra) { var css = { fontWeight: "700", color: "#F0F0FF", marginTop: "12px" }; if (extra) for (var x in extra) css[x] = extra[x]; return p(css); }
    function wert(text) { return el("span", { color: "#F0F0FF" }, text); }

    innen.appendChild(h2("Impressum"));
    var ddg = p(); ddg.textContent = "Angaben gemäß § 5 DDG"; innen.appendChild(ddg);
    var adr = p();
    adr.appendChild(wert(k.name)); adr.appendChild(document.createElement("br"));
    adr.appendChild(wert(k.strasse)); adr.appendChild(document.createElement("br"));
    adr.appendChild(wert(k.ort));
    innen.appendChild(adr);
    var kont = p();
    var kb = el("strong", { color: "#F0F0FF" }, "Kontakt"); kont.appendChild(kb);
    kont.appendChild(document.createElement("br"));
    kont.appendChild(document.createTextNode("E-Mail: ")); kont.appendChild(wert(k.email));
    innen.appendChild(kont);
    var verantw = p();
    verantw.appendChild(document.createTextNode("Verantwortlich für den Inhalt: "));
    verantw.appendChild(wert(k.name));
    verantw.appendChild(document.createTextNode(", Anschrift wie oben."));
    innen.appendChild(verantw);

    innen.appendChild(h2("Datenschutzerklärung"));

    innen.appendChild(stark("1. Verantwortlicher"));
    var v1 = p();
    v1.appendChild(document.createTextNode("Verantwortlich für die Datenverarbeitung auf dieser Website ist "));
    v1.appendChild(wert(k.name));
    v1.appendChild(document.createTextNode(", "));
    v1.appendChild(wert(k.strasse + ", " + k.ort));
    v1.appendChild(document.createTextNode(", E-Mail "));
    v1.appendChild(wert(k.email));
    v1.appendChild(document.createTextNode("."));
    innen.appendChild(v1);

    innen.appendChild(stark("2. Hosting"));
    var v2 = p(); v2.textContent = "Diese Website wird bei GitHub Pages (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA) gehostet. Beim Aufruf der Seiten werden technisch notwendige Zugriffsdaten wie die IP-Adresse verarbeitet, um die Auslieferung der Seite zu ermöglichen und deren Sicherheit zu gewährleisten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer stabilen, sicheren Bereitstellung). Die Übermittlung in die USA erfolgt auf Grundlage der Standardvertragsklauseln.";
    innen.appendChild(v2);

    innen.appendChild(stark("3. Keine Cookies, kein Tracking"));
    var v3 = p(); v3.textContent = "Diese Demo setzt keine Cookies und verwendet keine Analyse- oder Tracking-Dienste. Die Beispieldaten der Tour werden ausschließlich lokal in Ihrem Browser gespeichert (localStorage), verlassen Ihr Gerät nicht und werden nicht an uns übertragen. Über die Schaltfläche Zurücksetzen oder das Leeren der Websitedaten sind sie jederzeit entfernt.";
    innen.appendChild(v3);

    innen.appendChild(stark("4. Ihre Rechte"));
    var v4 = p(); v4.textContent = "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie ein Beschwerderecht bei einer Aufsichtsbehörde. Wenden Sie sich dazu an die oben genannte Kontaktadresse.";
    innen.appendChild(v4);

    var stand = p({ fontSize: "12px", opacity: "0.7", marginTop: "20px" });
    stand.appendChild(document.createTextNode("Stand: "));
    stand.appendChild(wert(k.stand));
    stand.appendChild(document.createTextNode(". Diese Angaben werden ergänzt, sobald weitere Funktionen (z. B. die Anforderung eines Testzugangs) hinzukommen."));
    innen.appendChild(stand);

    scroll.appendChild(innen);
    deckel.appendChild(scroll);
    document.body.appendChild(deckel);
  }

  function setzeAllesZurueck() {
    try {
      // Aktuellen Anzeige-Modus über den Reset retten (sonst fiele die
      // Wahl vom Pitch/Nutzer zurück auf die Systemeinstellung).
      var modusJetzt = appIstHell();
      if (modusJetzt === null) modusJetzt = istHell;
      var loeschen = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf("allesda") === 0) loeschen.push(k);
      }
      for (var j = 0; j < loeschen.length; j++) localStorage.removeItem(loeschen[j]);
      localStorage.setItem(LS_MODUS, modusJetzt ? "hell" : "dunkel");
    } catch (e) {}
    window.location.reload();
  }

  // ── Dauer-Wächter: Einstellungen ausblenden, Nur-Ansicht, Sicherheitsnetz ──
  function versteckeEinstellKacheln() {
    var liste = (TOUR_BESCHNITT && TOUR_BESCHNITT.einstellungenAusblenden) || [];
    for (var i = 0; i < liste.length; i++) {
      var p = liste[i];
      // Kachel = kleinstes sichtbares Element, das Titel UND Sub enthält
      // und nicht viel mehr Text als beide zusammen trägt.
      var alle = alleElemente();
      var best = null, bestA = Infinity;
      var maxLen = p.titel.length + p.sub.length + 24;
      for (var j = 0; j < alle.length; j++) {
        var n = alle[j];
        if (istTourKnoten(n) || n.__tourVersteckt) continue;
        var tc = (n.textContent || "").replace(/\s+/g, " ").trim();
        if (tc.length > maxLen) continue;
        if (tc.indexOf(p.titel) < 0 || tc.indexOf(p.sub) < 0) continue;
        if (!sichtbar(n)) continue;
        var r = n.getBoundingClientRect();
        var a = r.width * r.height;
        if (a < bestA) { bestA = a; best = n; }
      }
      if (best) {
        // Zum Karten-Wrapper hochklettern, solange Eltern nicht mehr Text tragen
        var n2 = best;
        while (n2.parentElement) {
          var pt = (n2.parentElement.textContent || "").replace(/\s+/g, " ").trim();
          if (pt.length <= maxLen) n2 = n2.parentElement; else break;
        }
        n2.style.display = "none";
        n2.__tourVersteckt = true;
      }
    }
  }

  function legeNurAnsichtSchleier() {
    var titel = (TOUR_BESCHNITT && TOUR_BESCHNITT.nurAnsichtKarten) || [];
    for (var i = 0; i < titel.length; i++) {
      var t = titel[i];
      // Karten-Titel finden (eigener Text exakt = Titel)
      var alle = alleElemente();
      for (var j = 0; j < alle.length; j++) {
        var n = alle[j];
        if (istTourKnoten(n) || !sichtbar(n)) continue;
        if (eigenerText(n) !== t) continue;
        // Hochklettern bis zum Container, der Bedienelemente enthält (= Karte)
        var karte = n, hoch = 0;
        while (karte && hoch < 8) {
          if (karte.__tourSchleier) { karte = null; break; }
          if (karte.querySelector && karte.querySelector("button, input, select") &&
              (karte.textContent || "").indexOf(t) >= 0 && karte !== document.body) {
            break;
          }
          karte = karte.parentElement; hoch++;
        }
        if (!karte || karte === document.body || karte.__tourSchleier) continue;
        // Übersichts-Kachel (klein, ohne Bedienelemente) NICHT treffen:
        if (!karte.querySelector("button, input, select")) continue;
        karte.__tourSchleier = true;
        karte.style.position = karte.style.position || "relative";
        var deckel = el("div", {
          position: "absolute", left: "0", top: "0", right: "0", bottom: "0",
          zIndex: "50", background: "rgba(7,7,12,0.35)",
          borderRadius: "inherit", display: "flex",
          alignItems: "flex-start", justifyContent: "flex-end", padding: "8px"
        });
        deckel.__tour = true;
        deckel.addEventListener("click", function (e) { e.stopPropagation(); e.preventDefault(); }, true);
        var badge = el("div", {
          fontSize: "11px", fontWeight: "700", color: "#0B0B14",
          background: "#EAB308", borderRadius: "999px", padding: "4px 10px"
        }, TXT_NUR_ANSICHT);
        badge.__tour = true;
        deckel.appendChild(badge);
        karte.appendChild(deckel);
      }
    }
  }

  function sicherheitsnetz() {
    var verboten = (TOUR_BESCHNITT && TOUR_BESCHNITT.verboteneNavTexte) || [];
    var kontext = (TOUR_BESCHNITT && TOUR_BESCHNITT.navKontextTexte) || [];
    var alle = alleElemente();
    for (var i = 0; i < alle.length; i++) {
      var n = alle[i];
      if (istTourKnoten(n) || n.__tourVersteckt || !sichtbar(n)) continue;
      var t = eigenerText(n);
      if (!t || verboten.indexOf(t) < 0) continue;
      // Kontext prüfen: Eltern (bis 4 Ebenen) müssen ≥ 2 Kontext-Texte tragen
      var p = n.parentElement, tiefe = 0, istNav = false;
      while (p && tiefe < 4) {
        var tc = p.textContent || "";
        var treffer = 0;
        for (var j = 0; j < kontext.length; j++) {
          if (tc.indexOf(kontext[j]) >= 0) treffer++;
          if (treffer >= 2) break;
        }
        if (treffer >= 2) { istNav = true; break; }
        p = p.parentElement; tiefe++;
      }
      if (!istNav) continue;
      // Ganzen Nav-Eintrag verstecken: hochklettern, solange das Eltern-
      // Element (fast) nur diesen Text trägt. cursor/onclick taugen NICHT
      // als Kriterium (cursor erbt auf Kinder!) — Textumfang schon: der
      // Button trägt nur „ETV", die ganze Leiste trägt viel mehr.
      var ziel = n, p2 = n.parentElement, hoch = 0;
      while (p2 && hoch < 4) {
        var pt = (p2.textContent || "").replace(/\s+/g, " ").trim();
        if (pt.length > t.length + 12) break; // Eltern enthält mehr Einträge
        ziel = p2; p2 = p2.parentElement; hoch++;
      }
      ziel.style.display = "none";
      ziel.__tourVersteckt = true;
    }
  }

  // Theme wechseln + alle lebenden Tour-Elemente nachziehen.
  function setzeModusHell(neu) {
    if (istHell === neu) return;
    istHell = neu;
    // Spotlight-Ausblendung direkt patchen (Loch lebt über Schritte hinweg)
    if (ov.loch) {
      ov.loch.style.boxShadow = "0 0 0 200vmax " + uebersetzeFarbe("rgba(3,3,8,0.92)");
    }
    // Blase mit gemerkten Args neu zeichnen (alte entfernt sich selbst)
    if (ov.blase && ov.blaseArgs) {
      zeichneBlase(ov.blaseArgs[0], ov.blaseArgs[1], ov.blaseArgs[2], ov.blaseArgs[3]);
    }
    // Leiste: Container patchen + Inhalt (inkl. Fußzeile) neu zeichnen
    if (leiste) {
      leiste.style.background = uebersetzeFarbe("rgba(10,10,18,0.92)");
      leiste.style.borderTop = "1px solid " + uebersetzeFarbe("#2A2A45");
      zeichneLeisteInhalt(leiste.__modus || "frei");
    }
  }

  function waechter() {
    // Live-Sync: Tour-Theme folgt dem App-Modus (Kopf-Button der App).
    var h = appIstHell();
    if (h !== null && h !== istHell) { try { setzeModusHell(h); } catch (e) {} }
    // Aktuellen Modus NUR persistieren, wenn die anfängliche App-Umschaltung
    // abgeschlossen ist. Sonst überschreibt der Wächter die Pitch-Wahl mit dem
    // App-Default (dunkel), solange die programmatische Umschaltung noch läuft
    // (asynchron, mehrere 100 ms) — dann startete die Tour trotz Pitch=hell
    // dunkel (Bug bis v0.24).
    if (h !== null && appSyncFertig) {
      try { localStorage.setItem(LS_MODUS, h ? "hell" : "dunkel"); } catch (e) {}
    }
    try { versteckeEinstellKacheln(); } catch (e) {}
    try { legeNurAnsichtSchleier(); } catch (e) {}
    try { sicherheitsnetz(); } catch (e) {}
  }

  // ── Neupositionieren bei Scroll/Resize (geführte Phase) ────────────────────
  var rafGeplant = false;
  function neuLegen() {
    if (rafGeplant) return;
    rafGeplant = true;
    requestAnimationFrame(function () {
      rafGeplant = false;
      if (ov.aktiv && ov.ziel && ov.loch) {
        var s = TOUR_SCHRITTE[ov.schrittIdx];
        if (s && s.art !== "karte") zeichneSpotlight(ov.ziel, s.art === "tippen");
      }
    });
  }
  window.addEventListener("scroll", neuLegen, true);
  window.addEventListener("resize", neuLegen);

  // ── Start: auf App-Mount warten, dann Phase wählen ─────────────────────────
  function starteWennBereit() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(starteWennBereit, 200); return; }
    if (root.childNodes.length === 0) {
      var mo = new MutationObserver(function () {
        if (root.childNodes.length > 0) { mo.disconnect(); losGehts(); }
      });
      mo.observe(root, { childList: true });
      return;
    }
    losGehts();
  }

  // App auf den Wunsch-Modus schalten: programmatischer Klick auf den
  // Hell/Dunkel-Button im Kopf (Weg Y: App-Code bleibt unangetastet).
  // Die App startet immer dunkel — nur der Hell-Fall braucht den Klick.
  function schalteAppAufWunsch(wunschHell, versuch) {
    versuch = versuch || 0;
    var ist = appIstHell();
    if (ist === wunschHell) { appSyncFertig = true; return; } // Ziel erreicht
    if (ist !== null) {
      var btn = document.querySelector(wunschHell
        ? 'button[title="Hellmodus"]' : 'button[title="Dunkelmodus"]');
      if (btn) {
        try { btn.click(); } catch (e) {}
        // nach dem Klick prüfen, ob es gegriffen hat; Flag erst dann setzen
        setTimeout(function () {
          if (appIstHell() === wunschHell) appSyncFertig = true;
          else if (versuch < 12) schalteAppAufWunsch(wunschHell, versuch + 1);
          else appSyncFertig = true; // aufgeben, nicht ewig blockieren
        }, 250);
        return;
      }
    }
    if (versuch < 12) setTimeout(function () { schalteAppAufWunsch(wunschHell, versuch + 1); }, 300);
    else appSyncFertig = true;
  }

  function losGehts() {
    // Hell/Dunkel: Wunsch ermitteln (Pitch-Übergabe → sonst System),
    // Tour-UI sofort darauf stellen, App per Kopf-Button nachziehen.
    var wunschHell = ermittleStartModusHell();
    istHell = wunschHell;
    schalteAppAufWunsch(wunschHell, 0);

    // Die App markiert per Tastatur-Navigation ein „aktives" Element mit
    // outline:2px solid #3B82F6 (data-kb-aktiv, allesda_merged.jsx ~Z.1999).
    // In der Touch-Demo navigiert niemand per Tastatur → dieser blaue Ring
    // (z. B. um den +-Button) wirkt wie ein ungewollter Glow. Neutralisieren.
    // App-Regel nutzt !important, daher hier ebenfalls !important nötig.
    try {
      var st = document.createElement("style");
      st.id = "tour-kein-kb-ring";
      st.textContent = 'html body [data-kb-aktiv="1"]{outline:none !important;box-shadow:none !important;}';
      document.head.appendChild(st);
    } catch (e) {}

    // Dauer-Wächter: sofort + bei jeder DOM-Änderung (gedrosselt) + Sicherungs-Takt
    waechter();
    var moTimer = null;
    var mo = new MutationObserver(function () {
      if (moTimer) return;
      moTimer = setTimeout(function () { moTimer = null; waechter(); }, 250);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setInterval(waechter, 1500);

    var status = null;
    try { status = localStorage.getItem(LS_STATUS); } catch (e) {}
    if (status === "frei") {
      zeigeLeiste("frei");
    } else {
      ov.aktiv = true;
      zeigeLeiste("gefuehrt"); // Leiste schon während der Tour (Tour beenden · Rechtliches)
      setTimeout(function () { zeigeSchritt(0); }, 600);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", starteWennBereit);
  } else {
    starteWennBereit();
  }
})();
