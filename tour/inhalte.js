// ═══════════════════════════════════════════════════════════════════════════
// inhalte.js — Feature-Tour AllesDa: ALLE Texte + Konfiguration
// ---------------------------------------------------------------------------
// Diese Datei ist die EINZIGE, die für Text-/Inhaltsänderungen angefasst
// werden muss. Logik lebt in tour.js, Seed in seed.js.
// Hochzählen bei jeder Änderung: TOUR_VERSION (Cache-Buster).
// ═══════════════════════════════════════════════════════════════════════════

var TOUR_VERSION = "0.17";

// ── Ziel des Buttons „Ausgiebiger kennenlernen" ─────────────────────────────
// Leer = Hinweis-Karte "in Kürze" (bis Lead-Capture/Phase 4 steht).
// Später: URL zum Code-/Anmeldeschritt eintragen, z. B. "../anmelden/".
var ZIEL_KENNENLERNEN = "";

// ── Beschnitt: was die Tour aus der echten App ausblendet ───────────────────
// (Entspricht TOUR_Beschnitt_Spec — Stand 04.07.2026, Bennys Markierungen.)
var TOUR_BESCHNITT = {
  // Hauptmenü (settings.kacheln → aktiv). true = sichtbar in der Tour.
  menue: {
    objekte: true, kontakte: true, kalender: true, beschluss: true,
    technik: true, statistik: true,
    etv: false, auftraege: false, kommunikation: false, finanzen: false,
    dokumente: false, listen: false, fotos: false, schnelleingabe: false
  },
  // Objekt-Detail-Tabs (settings.objektTabs → aktiv).
  objektTabs: {
    liegenschaft: true, verwaltung: true, legionellen: true, kontakte: true,
    te: false, dokumente: false, bilder: false, historie: false
  },
  // Einstellungen-Übersichtskacheln, die das Overlay per DOM versteckt.
  // Erkennung über Titel+Untertitel-Paar (beides muss in der Kachel stehen).
  einstellungenAusblenden: [
    { titel: "Mein Profil",     sub: "Name, Anrede, Kontaktdaten" },
    { titel: "Kalender",        sub: "Wochenstart, KW, Termin-Bezeichnungen" },
    { titel: "Dokumente",       sub: "Dokument-Karten, Anzeige" },
    { titel: "Suche",           sub: "Welche Bereiche durchsucht werden" },
    { titel: "Tastatur",        sub: "Kürzel anpassen und drucken" },
    { titel: "Hausverwaltung",  sub: "Name und Stammdaten" },
    { titel: "Daten",           sub: "Import, Export, Backup" }
  ],
  // Einstellungs-Karten, die sichtbar bleiben, aber NUR ZUR ANSICHT sind
  // (sonst könnte man ausgeblendete Bereiche wieder aktivieren).
  // Erkennung über den Karten-Titel.
  nurAnsichtKarten: ["Schnellzugriff", "Objekt-Tabs"],
  // Layout-Vorgaben (Desktop). Werden von seed.js in die App-Settings
  // geschrieben. Schlüssel = Erscheinungsbild-Sektion der App.
  //   festeSpalten     : Karten-Übersicht mit fester Spaltenzahl (true)
  //   kartenSpalten    : Anzahl Karten-Spalten (1 = einreihig)
  //   detailMinBreite  : Breite des Detailfensters in px (400…1400)
  //   kartenMaxBreite  : max. Kartenbreite in px (240…480, optional)
  layout: {
    festeSpalten: true,
    kartenSpalten: 1,
    detailMinBreite: 1200
  },
  // Sicherheitsnetz: Nav-/Tab-Einträge mit exakt diesem Text werden immer
  // versteckt, falls sie doch auftauchen (z. B. nach Einstellungs-Klicks).
  verboteneNavTexte: [
    "ETV", "Vorgänge", "Kommunikation", "Finanzen", "Dokumente",
    "Listengenerator", "Fotos", "Schnelleingabe", "TE", "Bilder", "Historie"
  ],
  // Kontext-Erkennung fürs Sicherheitsnetz: ein Kandidat wird nur versteckt,
  // wenn sein Umfeld mind. 2 dieser Texte enthält (= Navigations-/Tab-Leiste).
  navKontextTexte: ["Objekte", "Kontakte", "Kalender", "Liegenschaft", "Verwaltung", "Beschlusssammlung", "Technik", "Statistik", "Legionellen"]
};

// ── Texte: Nur-Ansicht-Badge ────────────────────────────────────────────────
var TXT_NUR_ANSICHT = "Nur Ansicht (Demo)";

// ── Die geführte Tour: Stationen ────────────────────────────────────────────
// Schritt-Typen:
//   art:"karte"   — zentrierte Karte, keine App-Hervorhebung
//   art:"zeigen"  — Spotlight auf Anker, Weiter-Button
//   art:"tippen"  — Spotlight auf Anker, Nutzer tippt selbst aufs Ziel
// Anker-Arten:
//   anker:{alleTexte:[...]}  — kleinster Container, der ALLE Texte enthält
//   anker:{text:"..."}       — Element, dessen Text exakt so beginnt
// Wird ein Anker nicht gefunden, zeigt die Tour den Text als zentrierte
// Karte mit Weiter-Button (bricht nie hart — wichtig bei App-Updates).
var TOUR_SCHRITTE = [
  {
    id: "willkommen", art: "karte",
    titel: "Willkommen bei AllesDa",
    text: "Das hier ist die echte App — mit einem Beispiel-Objekt zum Anfassen. In vier kurzen Stationen zeigen wir Ihnen, wie alles zusammenhängt. Danach dürfen Sie frei herumklicken: Es wird nichts gespeichert, Sie können nichts kaputt machen.",
    buttons: [
      { label: "Tour starten", aktion: "weiter", primaer: true },
      { label: "Lieber gleich frei erkunden", aktion: "freigeben" }
    ]
  },
  {
    id: "orientierung", art: "zeigen",
    anker: { alleTexte: ["Objekte", "Kontakte", "Kalender"] },
    titel: "Station 1 — So finden Sie sich zurecht",
    text: "Alles Wichtige liegt in klar benannten Bereichen: Objekte, Kontakte, Kalender und mehr. Keine verschachtelten Menüs — ein Tipp, und Sie sind da."
  },
  {
    id: "objekt-oeffnen", art: "tippen",
    anker: { text: "Objekte" },
    titel: "Station 2 — Das Objekt",
    text: "Das Herzstück. Tippen Sie auf „Objekte\"."
  },
  {
    id: "objekt-karte", art: "tippen",
    anker: { alleTexte: ["VE-001", "WEG Lessingstraße"] },
    titel: "Ihr Objekt auf einen Blick",
    text: "Jedes Objekt ist eine Karte. Tippen Sie auf VE-001 — die WEG Lessingstraße 22 in Leipzig."
  },
  {
    id: "objekt-tabs", art: "zeigen",
    anker: { alleTexte: ["Liegenschaft", "Verwaltung"] },
    titel: "Alles am Objekt — nichts verstreut",
    text: "Haus, Einheiten und Räume unter „Liegenschaft\". Verwalterbestellung, ETV-Fristen, Versicherungen und Verträge unter „Verwaltung\". Sogar die Legionellen-Prüfung hat ihren festen Platz. Die App passt sich dem Objekt an — nicht umgekehrt."
  },
  {
    id: "kontakt-oeffnen", art: "tippen",
    anker: { text: "Kontakte" },
    titel: "Station 3 — Die Menschen dahinter",
    text: "Eigentümer, Mieter, Firmen — alle an einem Ort. Tippen Sie auf „Kontakte\"."
  },
  {
    id: "kontakte", art: "zeigen",
    anker: { alleTexte: ["Lindqvist"] },
    titel: "Personen und Firmen, sauber verknüpft",
    text: "Jeder Kontakt trägt seine Rollen sichtbar als farbige Kürzel: Eigentümer, Mieter, Nießbraucher. Und jeder Kontakt weiß, zu welchem Objekt und welcher Einheit er gehört — ein Tipp bringt Sie hin."
  },
  {
    id: "kalender-oeffnen", art: "tippen",
    anker: { text: "Kalender" },
    titel: "Station 4 — Nichts mehr verpassen",
    text: "Der Kreis schließt sich. Tippen Sie auf „Kalender\"."
  },
  {
    id: "kalender", art: "karte",
    titel: "Fristen denken mit",
    text: "ETV-Termine, Verwalterbestellung, Prüfungen — die Fristen entstehen automatisch aus Ihren Objektdaten und landen hier. Sie tragen nichts doppelt ein.",
    buttons: [{ label: "Weiter", aktion: "weiter", primaer: true }]
  },
  {
    id: "weiche", art: "karte",
    titel: "Das war der Überblick",
    text: "Und jetzt Sie: Schauen Sie sich frei um — tippen Sie, wohin Sie wollen. Es wird nichts gespeichert. Unten finden Sie jederzeit den Weg, AllesDa ausgiebiger kennenzulernen.",
    buttons: [
      { label: "Frei erkunden", aktion: "freigeben", primaer: true }
    ]
  }
];

// ── Freie Phase: die app-fremde Leiste unten ────────────────────────────────
var LEISTE = {
  zuruecksetzen: "Zurücksetzen",
  tourNochmal: "Tour ansehen",
  kennenlernen: "Ausgiebiger kennenlernen",
  rechtliches: "Rechtliches"
};

// ── Rechtliches-Overlay (Impressum + Datenschutz) ───────────────────────────
// Inhaltlich identisch zur Pitch-App (recht.jsx). Kontaktdaten HIER pflegen
// (müssen mit der Pitch-App übereinstimmen). Bei Änderung TOUR_VERSION hoch.
var RECHT = {
  titel: "Rechtliches",
  schliessen: "Schließen",
  kontakt: {
    name:    "Benjamin Goltz",
    strasse: "Schwanheimerstr.16/2",
    ort:     "69421 Eberbach",
    email:   "recht@allesda.one",
    stand:   "Juli 2026"
  }
};

// ── Karte „Ausgiebiger kennenlernen" (solange ZIEL_KENNENLERNEN leer) ───────
var KARTE_KENNENLERNEN = {
  titel: "Schön, dass Sie mehr wollen",
  text: "Der persönliche Testzugang mit eigenem Bestand ist gerade im Aufbau. Schauen Sie bald wieder vorbei — oder erkunden Sie die Demo so lange, wie Sie mögen.",
  schliessen: "Zurück zur Demo"
};

// ── Karte „Zurücksetzen" (Bestätigung) ──────────────────────────────────────
var KARTE_RESET = {
  titel: "Alles auf Anfang?",
  text: "Ihre Klicks und Änderungen in der Demo werden verworfen, das Beispiel-Objekt startet frisch.",
  ja: "Ja, zurücksetzen",
  nein: "Abbrechen"
};
