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
    nachsatz: "Das Wesentliche wird strukturiert erfasst, der Rest sauber verwahrt." },

  { id: "kern", typ: "text",
    eyebrow: "Alles an einem Ort",
    text: "Objekt und Kontakt bilden den Kern. Alles andere hängt daran: Eigentümer, Mieter, Einheiten, Dokumente, Termine, Zähler, Verteilerschlüssel." },

  { id: "zersplittert", typ: "stark",
    stark: "Heute zahlen mittelgroße Verwaltungen oft drei bis fünf Anbietern gleichzeitig.",
    nachsatz: "Eines für die Verwaltung, eines für die Kommunikation, eines für die Versammlung, eines für die Ablage." },

  { id: "einort", typ: "stark",
    stark: "AllesDa denkt es als einen Ort.",
    nachsatz: "Zentral, verknüpft, griffbereit." },

  { id: "darstellung", typ: "darstellung",
    eyebrow: "Passt sich Ihnen an",
    text: "Sie entscheiden, wie Ihre Daten aussehen: als Karten mit vielen Informationen — oder als Liste, so übersichtlich wie gewohnt. Ein Fingertipp genügt." },

  { id: "warum", typ: "stark",
    stark: "Wer verwaltet, verwaltet drei Dinge: Daten. Informationen. Kommunikation.",
    nachsatz: "Sind sie griffbereit und verbunden, wird aus Verwalten Übersicht — die Grundlage für gute Entscheidungen." },

  { id: "abschluss", typ: "abschluss",
    zeilen: [
      "Klingt gut in der Theorie?",
      "Sehen Sie selbst, wie es sich anfühlt — an einem echten Bestand, den Sie frei erkunden können."
    ],
    knopf: "Selbst ausprobieren" }
];
