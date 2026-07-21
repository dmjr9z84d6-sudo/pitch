// ═══════════════════════════════════════════════════════════════════════════
// inhalte.js — Feature-Tour AllesDa: ALLE Texte + Konfiguration
// ---------------------------------------------------------------------------
// Diese Datei ist die EINZIGE, die für Text-/Inhaltsänderungen angefasst
// werden muss. Logik lebt in tour.js, Seed in seed.js.
// Hochzählen bei jeder Änderung: TOUR_VERSION (Cache-Buster).
// ═══════════════════════════════════════════════════════════════════════════

var TOUR_VERSION = "0.29";

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
  // ── Folie 1: Willkommen ────────────────────────────────────────────────────
  {
    id: "willkommen", art: "karte",
    titel: "Willkommen bei AllesDa",
    text: "Das hier ist die echte App — mit einem Beispiel-Objekt zum Anfassen. Wir zeigen Ihnen, wo Sie was finden, welche Möglichkeiten wir Ihnen bieten und wie alles zusammenhängt. Danach dürfen Sie frei erkunden: Es wird nichts gespeichert, Sie können nichts kaputt machen.",
    buttons: [
      { label: "Frei erkunden", aktion: "freigeben" },
      { label: "Tour starten", aktion: "weiter", primaer: true }
    ]
  },

  // ── Station 1: Bereiche zeigen (3× Spotlight + Weiter) ─────────────────────
  {
    id: "s1-kopf", art: "zeigen",
    anker: { alleTexte: ["AllesDa", "Suchen"] },
    titel: "Station 1 — Der Kopf",
    text: "Ganz oben finden Sie die Suche über den gesamten Bestand, den Wechsel zwischen Hell und Dunkel, den Kalender und Ihre Einstellungen."
  },
  {
    id: "s1-schnellzugriff", art: "zeigen",
    anker: { alleTexte: ["Objekte", "Kontakte", "Kalender"] },
    titel: "Station 1 — Der Schnellzugriff",
    text: "Ihre Bereiche, immer griffbereit. Welche hier liegen und in welcher Reihenfolge, passen Sie nach Ihren Wünschen und Bedürfnissen in den Einstellungen an."
  },
  {
    id: "s1-hauptfenster", art: "zeigen",
    anker: { alleTexte: ["Legende", "VE-001", "Einstellen"] },
    titel: "Station 1 — Das Hauptfenster",
    text: "Hier arbeiten Sie: oben der Kopf des Bereichs — teils mit Filter-Pillen oder „Neu anlegen“ —, dann die Karten oder die Liste, in der Mitte das Detailfenster."
  },

  // ── Station 2: Kontakte (Nutzer tippt selbst) ──────────────────────────────
  {
    id: "s2-oeffnen", art: "tippen",
    anker: { text: "Kontakte" },
    titel: "Station 2 — Die Menschen dahinter",
    text: "Eigentümer, Mieter, Firmen — alle an einem Ort. Tippen Sie auf „Kontakte“."
  },
  {
    id: "s2-karte", art: "zeigen",
    anker: { alleTexte: ["Andreas Lindqvist", "a.lindqvist@example.com"] },
    titel: "Die Kontakt-Karte",
    text: "Jeder Kontakt ist eine Karte. Am Avatar erkennen Sie sofort, wen Sie vor sich haben: rund bei Personen, abgerundet bei Firmen."
  },
  {
    id: "s2-person", art: "tippen",
    anker: { alleTexte: ["Andreas Lindqvist", "a.lindqvist@example.com"] },
    titel: "Eine Person ansehen",
    text: "Tippen Sie auf die Karte von Andreas Lindqvist."
  },
  {
    id: "s2-person-detail", art: "zeigen",
    anker: { alleTexte: ["Andreas Lindqvist", "Rollen"] },
    titel: "Rollen und Objekt — sauber verknüpft",
    text: "Jede Person trägt ihre Rollen sichtbar: Eigentümer, Mieter, Nießbraucher. Und sie weiß, zu welchem Objekt und welcher Einheit sie gehört — ein Tipp bringt Sie hin."
  },
  {
    id: "s2-zurueck", art: "tippen",
    anker: { text: "Zurück" },
    titel: "Zurück zur Liste",
    text: "Tippen Sie auf „Zurück“, um wieder zur Kontaktliste zu kommen."
  },
  {
    id: "s2-firma", art: "tippen",
    anker: { alleTexte: ["Heizungsbau Förster GmbH", "service@foerster.example.com"] },
    titel: "Und jetzt eine Firma",
    text: "Tippen Sie auf die Karte der Heizungsbau Förster GmbH."
  },
  {
    id: "s2-firma-detail", art: "zeigen",
    anker: { alleTexte: ["Heizungsbau Förster GmbH", "Vertr"] },
    titel: "Firmen mit allem, was dazugehört",
    text: "Bei Firmen nehmen Sie Mitarbeiter als Ansprechpartner auf. Verträge und Zuständigkeiten legen Sie hier an und verwalten sie — alles am Kontakt, nichts verstreut."
  },

  // ── Station 3: Das Objekt (Nutzer tippt selbst) ────────────────────────────
  {
    id: "s3-oeffnen", art: "tippen",
    anker: { text: "Objekte" },
    titel: "Station 3 — Das Objekt",
    text: "Das Herzstück. Tippen Sie auf „Objekte“."
  },
  {
    id: "s3-karte", art: "zeigen",
    anker: { alleTexte: ["VE-001", "WEG Lessingstraße"] },
    titel: "Die Objekt-Karte",
    text: "Jedes Objekt ist eine Karte — mit Icons für die Belegung und einer Statusanzeige, die Sie sofort auf Überfälliges hinweist."
  },
  {
    id: "s3-tippen", art: "tippen",
    anker: { alleTexte: ["VE-001", "WEG Lessingstraße"] },
    titel: "Öffnen Sie das Objekt",
    text: "Tippen Sie auf VE-001 — die WEG Lessingstraße 22 in Leipzig."
  },
  {
    id: "s3-tabs", art: "zeigen",
    anker: { alleTexte: ["Liegenschaft", "Verwaltung"] },
    titel: "Vier Tabs — alles am Objekt",
    text: "Liegenschaft, Verwaltung, Legionellen und Kontakte: Jeder Tab bündelt seinen Bereich. Nichts liegt verstreut, alles hat seinen festen Platz."
  },
  {
    id: "s3-liegenschaft", art: "zeigen",
    anker: { alleTexte: ["Stammdaten", "Haus 1"] },
    titel: "Liegenschaft",
    text: "Die Stammdaten der Liegenschaft, das Haus mit seinen Einheiten und Räumen, Zugang und Schließanlage, die Technik — alles hier."
  },
  {
    id: "s3-verwaltung", art: "tippen",
    anker: { text: "Verwaltung" },
    titel: "Weiter zur Verwaltung",
    text: "Tippen Sie auf „Verwaltung“."
  },
  {
    id: "s3-verwaltung-info", art: "karte",
    titel: "Verwaltung",
    text: "Verwalter-Stammdaten und Bestellung, Versicherungen, Verträge, Verteilerschlüssel — die ganze Verwaltungsseite des Objekts, übersichtlich beieinander.",
    buttons: [{ label: "Weiter", aktion: "weiter", primaer: true }]
  },
  {
    id: "s3-legionellen", art: "tippen",
    anker: { text: "Legionellen" },
    titel: "Und die Legionellen?",
    text: "Tippen Sie auf „Legionellen“."
  },
  {
    id: "s3-legionellen-info", art: "karte",
    titel: "Legionellen — automatisch im Blick",
    text: "Legionellen werden erst dann Thema, wenn in der Technik eine zentrale Wasserversorgung angelegt ist. Die Prüftermine entstehen von selbst und landen im Kalender — Sie tragen nichts doppelt ein.",
    buttons: [{ label: "Weiter", aktion: "weiter", primaer: true }]
  },

  // ── Station 4: Der Kalender (Nutzer tippt selbst) ──────────────────────────
  {
    id: "s4-oeffnen", art: "tippen",
    anker: { text: "Kalender" },
    titel: "Station 4 — Nichts mehr verpassen",
    text: "Der Kreis schließt sich. Tippen Sie auf „Kalender“."
  },
  {
    id: "s4-info", art: "karte",
    titel: "Fristen denken mit",
    text: "Die Übersicht je Objekt oder die Timeline nach Zeitablauf: ETV-Termine, Verwalterbestellung, Prüfungen — alle Fristen entstehen automatisch aus Ihren Objektdaten und landen hier.",
    buttons: [{ label: "Weiter", aktion: "weiter", primaer: true }]
  },

  // ── Letzte Folie: Weiche ────────────────────────────────────────────────────
  {
    id: "weiche", art: "karte",
    titel: "Das war der Überblick",
    text: "Schauen Sie sich frei um — tippen Sie, wohin Sie wollen. Es wird nichts gespeichert. Unten finden Sie jederzeit den Weg, AllesDa ausgiebiger kennenzulernen.",
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
