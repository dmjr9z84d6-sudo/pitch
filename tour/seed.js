// ═══════════════════════════════════════════════════════════════════════════
// seed.js — Feature-Tour AllesDa: Seed + App-Loader
// ---------------------------------------------------------------------------
// Läuft VOR der App. Ablauf:
//   1. daten.json holen (der Fake-Bestand — Bennys Musterobjekt)
//   2. Wenn noch nicht geseedet: localStorage befüllen
//      · "allesda:daten"    = { kontakte, ves, freieTermine }
//      · "allesda:settings" = Teil-Settings (kacheln + objektTabs mit
//        aktiv-Flags aus TOUR_BESCHNITT). Die App legt gespeicherte Werte
//        über ihre Defaults (Object.assign in ladeSettings) — ein
//        Teilobjekt genügt, der Rest kommt aus der App selbst.
//   3. AllesDa.js dynamisch nachladen (erst NACH dem Seed, sonst startet
//      die App leer).
//
// „Nichts wird wirklich gespeichert": alles lebt nur im localStorage des
// Browsers. Cache/Websitedaten leeren = Demo startet frisch. Der Reset-
// Button in der Tour-Leiste macht dasselbe gezielt (allesda:* löschen).
//
// ⚠️ Die kacheln-/objektTabs-Einträge unten spiegeln DEFAULT_SETTINGS aus
// src/datenmodell.js (id/label/icon/farbe/reihenfolge). Bei App-Updates
// mit neuen Menüpunkten/Tabs: Liste abgleichen (siehe TOUR_BAUANLEITUNG).
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  var K = {
    daten:    "allesda:daten",
    settings: "allesda:settings",
    schema:   "allesda:schema",
    geseedet: "allesda:tour:geseedet"
  };

  // ── Vorlage: Hauptmenü-Kacheln (aus DEFAULT_SETTINGS, datenmodell.js) ──────
  var KACHELN = [
    { id: "objekte",        label: "Objekte",           icon: "building", farbe: "#06B6D4", reihenfolge: 0 },
    { id: "kontakte",       label: "Kontakte",          icon: "users",    farbe: "#A855F7", reihenfolge: 1 },
    { id: "kalender",       label: "Kalender",          icon: "calendar", farbe: "#F59E0B", reihenfolge: 2 },
    { id: "etv",            label: "ETV",               icon: "calendar", farbe: "#8B5CF6", reihenfolge: 3 },
    { id: "beschluss",      label: "Beschlusssammlung", icon: "document", farbe: "#F97316", reihenfolge: 4 },
    { id: "auftraege",      label: "Vorgänge",          icon: "ticket",   farbe: "#EF4444", reihenfolge: 5 },
    { id: "kommunikation",  label: "Kommunikation",     icon: "mail",     farbe: "#0EA5E9", reihenfolge: 6 },
    { id: "finanzen",       label: "Finanzen",          icon: "chart",    farbe: "#22C55E", reihenfolge: 7 },
    { id: "technik",        label: "Technik",           icon: "wrench",   farbe: "#10B981", reihenfolge: 8 },
    { id: "dokumente",      label: "Dokumente",         icon: "document", farbe: "#64748B", reihenfolge: 9 },
    { id: "statistik",      label: "Statistik",         icon: "chart",    farbe: "#6366F1", reihenfolge: 10 },
    { id: "listen",         label: "Listengenerator",   icon: "sort",     farbe: "#0E7490", reihenfolge: 11 },
    { id: "fotos",          label: "Fotos",             icon: "paint",    farbe: "#EC4899", reihenfolge: 12 },
    { id: "schnelleingabe", label: "Schnelleingabe",    icon: "plus",     farbe: "#0080FF", reihenfolge: 13 },
    { id: "legionellen",    label: "Legionellen",       icon: "drop",     farbe: "#06B6D4", reihenfolge: 14 },
    { id: "te",             label: "Teilungserklärung", icon: "badge",    farbe: "#A855F7", reihenfolge: 15 },
    { id: "historie",       label: "Historie",          icon: "clock",    farbe: "#F97316", reihenfolge: 16 },
    { id: "schreibtisch",   label: "Schreibtisch",      icon: "check",    farbe: "#6366F1", reihenfolge: 17 }
  ];

  // ── Vorlage: Objekt-Detail-Tabs (aus DEFAULT_SETTINGS) ─────────────────────
  var OBJEKT_TABS = [
    { id: "liegenschaft", label: "Liegenschaft", icon: "building", fix: true,  reihenfolge: 0 },
    { id: "verwaltung",   label: "Verwaltung",   icon: "document", fix: true,  reihenfolge: 1 },
    { id: "legionellen",  label: "Legionellen",  icon: "drop",     fix: false, reihenfolge: 2 },
    { id: "te",           label: "TE",           icon: "badge",    fix: false, reihenfolge: 3 },
    { id: "dokumente",    label: "Dokumente",    icon: "document", fix: false, reihenfolge: 4 },
    { id: "kontakte",     label: "Kontakte",     icon: "users",    fix: false, reihenfolge: 5 },
    { id: "bilder",       label: "Bilder",       icon: "paint",    fix: false, reihenfolge: 6 },
    { id: "historie",     label: "Historie",     icon: "calendar", fix: false, reihenfolge: 7 }
  ];

  function baueSettings() {
    var m = (TOUR_BESCHNITT && TOUR_BESCHNITT.menue) || {};
    var ot = (TOUR_BESCHNITT && TOUR_BESCHNITT.objektTabs) || {};
    var lay = (TOUR_BESCHNITT && TOUR_BESCHNITT.layout) || {};
    var s = {
      kacheln: KACHELN.map(function (k) {
        return { id: k.id, label: k.label, icon: k.icon, farbe: k.farbe,
                 reihenfolge: k.reihenfolge, aktiv: m[k.id] === true };
      }),
      objektTabs: OBJEKT_TABS.map(function (t) {
        return { id: t.id, label: t.label, icon: t.icon, fix: t.fix,
                 reihenfolge: t.reihenfolge,
                 aktiv: t.fix ? true : ot[t.id] === true };
      })
    };
    // Layout-Vorgaben (Desktop): einreihige Karten-Spalte + breites Detail.
    // Schlüssel stammen aus der Erscheinungsbild-Sektion (einstellungen.jsx):
    // festeSpalten, kartenSpalten (1–5), detailMinBreite (400–1400).
    if (lay.festeSpalten != null)   s.festeSpalten = lay.festeSpalten;
    if (lay.kartenSpalten != null)  s.kartenSpalten = lay.kartenSpalten;
    if (lay.detailMinBreite != null) s.detailMinBreite = lay.detailMinBreite;
    if (lay.kartenMaxBreite != null) s.kartenMaxBreite = lay.kartenMaxBreite;
    return s;
  }

  function seedeWennNoetig(rohdaten) {
    // Signatur der aktuellen Seed-Konfiguration. Ändert sich die (neue
    // Layout-Werte, andere Kachel-/Tab-Auswahl, neue TOUR_VERSION), wird
    // automatisch NEU geseedet — ohne dass der Nutzer „Zurücksetzen" muss.
    // So schlägt die Marker-Falle bei künftigen Änderungen nicht mehr zu.
    var signatur = "";
    try {
      signatur = TOUR_VERSION + "|" + JSON.stringify(baueSettings());
    } catch (e) { signatur = TOUR_VERSION; }

    var gespeichert = null;
    try { gespeichert = localStorage.getItem(K.geseedet); } catch (e) {}
    if (gespeichert === signatur) return; // exakt dieser Seed liegt schon → nichts tun

    try {
      var daten = {
        kontakte: (rohdaten && rohdaten.kontakte) || [],
        ves: (rohdaten && rohdaten.ves) || [],
        freieTermine: []
      };
      localStorage.setItem(K.daten, JSON.stringify(daten));
      localStorage.setItem(K.settings, JSON.stringify(baueSettings()));
      localStorage.setItem(K.schema, "1");
      localStorage.setItem(K.geseedet, signatur);
    } catch (e) {
      // localStorage voll/gesperrt: App startet dann leer — Tour zeigt
      // trotzdem ihre Karten (Anker-Fallback greift).
      try { console.warn("Tour-Seed fehlgeschlagen:", e); } catch (e2) {}
    }
  }

  function ladeApp() {
    var s = document.createElement("script");
    s.src = "AllesDa.js?v=" + encodeURIComponent(TOUR_VERSION);
    document.body.appendChild(s);
  }

  function start() {
    fetch("daten.json?v=" + encodeURIComponent(TOUR_VERSION))
      .then(function (r) { return r.json(); })
      .then(function (json) { seedeWennNoetig(json); })
      .catch(function (e) {
        try { console.warn("daten.json nicht ladbar:", e); } catch (e2) {}
      })
      .then(function () { ladeApp(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
