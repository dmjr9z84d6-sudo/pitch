// ═══════════════════════════════════════════════════════════════════════════
// inhalte.js — Alle Texte des Pitch, getrennt vom Layout.
// Prinzip: EINE Idee pro Folie. Lieber mehr, schlanke Folien als volle Screens.
// Stand: 02.07.2026 — konsequent aufgeteilt.
// ═══════════════════════════════════════════════════════════════════════════

export const AUFTAKT_HELLDUNKEL = {
  frage: "Wie darf es heute sein?",
  hell: { symbol: "☀️", titel: "Hell", zeile: "Klar, freundlich und luftig." },
  dunkel: { symbol: "🌙", titel: "Dunkel", zeile: "Elegant, augenschonend und fokussiert." }
};

// Marke: Name dominant, .one als dezenter Zusatz.
export const MARKE = { name: "AllesDa", endung: ".one" };

// Folien-Typen:
//   "auftakt"     — Marke + zwei ruhige Zeilen
//   "text"        — eyebrow + kurzer Fließtext (max. 1 Absatz)
//   "stark"       — ein einziger großer Kernsatz, viel Luft
//   "darstellung" — plus Live-Vorschau Karten⇆Liste
//   "abschluss"   — Sog + Button
export const KARTEN = [
  {
    id: "auftakt",
    typ: "auftakt",
    zeilen: [
      "Verwaltung beginnt nicht mit der Software.",
      "Sie beginnt mit dem Objekt."
    ]
  },

  { id: "einzigartig", typ: "text",
    eyebrow: "Jedes Objekt ist einzigartig",
    text: "Erbbaurecht, Untergemeinschaft, eine gewerbliche Einheit neben der Wohnung, die WG im dritten Stock — die Wirklichkeit kennt keine Vorlage." },

  { id: "raster", typ: "text",
    eyebrow: "Das Problem",
    text: "Die meisten Programme zwingen Ihr Objekt in ihr Raster. Was nicht ins Feld passt, geht verloren oder landet in einer Notiz, die niemand wiederfindet." },

  { id: "umgekehrt", typ: "stark",
    stark: "AllesDa macht es umgekehrt: Die App passt sich dem Objekt an — nicht das Objekt der App.",
    aussage: "Strukturiert erfassen, sauber verwahren." },

  { id: "kern", typ: "text",
    eyebrow: "Alles an einem Ort",
    text: "Vom Eigentümer bis zum Zählerstand — alles hängt am Objekt. Verbunden statt verstreut." },

  { id: "zersplittert", typ: "stark",
    stark: "Heute liegt vieles verstreut über mehrere Programme an unterschiedlichen Orten.",
    aussage: "Verwaltung darf einfacher sein." },

  { id: "einort", typ: "stark",
    stark: "AllesDa.one denkt anders, alles an einem Ort.",
    aussage: "Zentral, verknüpft, griffbereit." },

  { id: "darstellung-text", typ: "text",
    eyebrow: "Passt sich Ihnen an",
    text: "Sie entscheiden, wie Ihre Daten aussehen: als Karten mit vielen Informationen — oder als Liste, so übersichtlich wie gewohnt." },

  { id: "darstellung-live", typ: "darstellung",
    ueberschrift: "oder" },

  { id: "warum", typ: "stark",
    stark: "Wer verwaltet, verwaltet drei Dinge: Daten. Informationen. Kommunikation.",
    nachsatz: "Sind sie griffbereit und verbunden, wird aus Verwalten Übersicht — die Grundlage für gute Entscheidungen.",
    aussage: "Gute Verwaltung verbindet Menschen." },

  { id: "abschluss", typ: "abschluss",
    zeilen: [
      "Klingt gut in der Theorie?",
      "Sehen Sie selbst, wie es sich anfühlt — an einem echten Bestand, den Sie frei erkunden können."
    ],
    knopf: "Selbst ausprobieren" }
];
