// ═══════════════════════════════════════════════════════════════════════════
// inhalte.js — Alle Texte des Pitch, getrennt vom Layout.
// So kannst du Formulierungen schleifen, ohne im Code zu wühlen.
// Reihenfolge = Reihenfolge der wischbaren Karten.
// Stand: KONZEPT_Onboarding_AllesDa_01_07_2026_01.md
// ═══════════════════════════════════════════════════════════════════════════

// Der Hell/Dunkel-Auftakt (Karte 0) wird gesondert gerendert (Lichtschalter),
// hat aber auch Text:
export const AUFTAKT_HELLDUNKEL = {
  frage: "Wie darf es heute sein?",
  hell: { symbol: "☀️", titel: "Hell", zeile: "Klar, freundlich und luftig." },
  dunkel: { symbol: "🌙", titel: "Dunkel", zeile: "Elegant, augenschonend und fokussiert." }
};

// Die inhaltlichen Karten. eyebrow = kleine Überzeile, titel, absaetze[].
// „stark" hebt den Kernsatz hervor (größer/betont).
export const KARTEN = [
  {
    id: "auftakt",
    typ: "auftakt",
    marke: "AllesDa",
    zeilen: [
      "Verwaltung beginnt nicht mit der Software.",
      "Sie beginnt mit dem Objekt."
    ]
  },
  {
    id: "einzigartig",
    typ: "text",
    eyebrow: "Jedes Objekt ist einzigartig",
    absaetze: [
      "Kein Objekt gleicht dem anderen. Erbbaurecht, Untergemeinschaft, eine gewerbliche Einheit neben der Wohnung, die WG im dritten Stock — die Wirklichkeit kennt keine Vorlage.",
      "Die meisten Programme zwingen Ihr Objekt in ihr Raster. Was nicht ins Feld passt, geht verloren oder landet in einer Notiz, die niemand wiederfindet."
    ],
    stark: "AllesDa macht es umgekehrt: Die App passt sich dem Objekt an — nicht das Objekt der App.",
    nachsatz: "Das Wesentliche wird strukturiert erfasst, der Rest sauber verwahrt. So bilden Sie Ihre Wirklichkeit ab, nicht eine vereinfachte Version davon."
  },
  {
    id: "einort",
    typ: "text",
    eyebrow: "Alles an einem Ort",
    absaetze: [
      "Objekt und Kontakt bilden den Kern. Alles andere hängt daran: Eigentümer und Mieter, Einheiten und Sondernutzungsrechte, Dokumente, Termine, Zähler, Verteilerschlüssel.",
      "Heute liegt das oft verstreut über mehrere Programme — eines für die Verwaltung, eines für die Kommunikation, eines für die Versammlung, eines für die Ablage. Mittelgroße Verwaltungen zahlen dafür regelmäßig drei bis fünf verschiedenen Anbietern gleichzeitig."
    ],
    stark: "AllesDa denkt es als einen Ort.",
    nachsatz: "Zentral, verknüpft, griffbereit."
  },
  {
    id: "darstellung",
    typ: "darstellung", // Karte 3 — hier kommen später die echten Bausteine
    eyebrow: "Passt sich Ihnen an",
    absaetze: [
      "Und AllesDa passt sich nicht nur dem Objekt an, sondern auch Ihnen.",
      "Sie entscheiden, wie Ihre Daten aussehen: als Karten mit vielen Informationen auf einen Blick — oder als Liste, so übersichtlich, wie Sie es aus Ihrem gewohnten Programm kennen. Ein Fingertipp genügt."
    ]
  },
  {
    id: "warum",
    typ: "text",
    eyebrow: "Warum das zählt",
    stark: "Wer verwaltet, verwaltet in Wahrheit drei Dinge: Daten. Informationen. Kommunikation.",
    absaetze: [
      "Sind die griffbereit und miteinander verbunden, wird aus Verwalten Übersicht — und aus Übersicht die Grundlage für gute Entscheidungen. Ohne verlässliche Datenbasis bleibt jede Entscheidung ein Ratespiel."
    ]
  },
  {
    id: "abschluss",
    typ: "abschluss",
    zeilen: [
      "Klingt gut in der Theorie?",
      "Sehen Sie selbst, wie es sich anfühlt — an einem echten Bestand mit Objekten, Einheiten und Kontakten, den Sie frei erkunden können."
    ],
    knopf: "Selbst ausprobieren"
  }
];
