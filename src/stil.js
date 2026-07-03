// ═══════════════════════════════════════════════════════════════════════════
// stil.js — Zentrale Typo- & Abstands-Grundlage für den Pitch.
// Richtung: "Zurückhaltend-edel" (Variante A). EIN Ort für die Maße, damit
// alle Folien dieselbe Formsprache sprechen (§76 aufs Design angewandt).
//
// Prinzip: kleiner, leiser, mehr Raum. Text läuft schmal (ch-Begrenzung).
// Farben gedämpft — kein hartes Weiß, sondern weiches Grau-Weiß.
// ═══════════════════════════════════════════════════════════════════════════

// Gedämpftes „Weiß" für Fließtext — statt t.text (das ist voller Kontrast).
// Nimmt die Theme-Textfarbe, aber leicht zurückgenommen über Opazität am Element.
export function stilTexte(t, accent) {
  return {
    // Überzeile (eyebrow): leise, klein, gesperrt.
    eyebrow: {
      fontSize: 12, fontWeight: 600, letterSpacing: "0.12em",
      textTransform: "uppercase", color: accent, opacity: 0.9,
      marginBottom: 26
    },
    // Großer Kernsatz — edel: kleiner als vorher, leichteres Gewicht.
    stark: {
      fontSize: 22, fontWeight: 500, lineHeight: 1.5,
      letterSpacing: "-0.005em", color: t.text, opacity: 0.94,
      whiteSpace: "pre-line",
      maxWidth: "26ch"
    },
    // Fließtext (text-Folien).
    text: {
      fontSize: 19, fontWeight: 400, lineHeight: 1.6,
      color: t.text, opacity: 0.9, maxWidth: "30ch",
      whiteSpace: "pre-line"
    },
    // Nachsatz — leiser, kleiner, schmaler.
    nachsatz: {
      fontSize: 15, fontWeight: 400, lineHeight: 1.65,
      color: t.sub, marginTop: 24, maxWidth: "34ch"
    },
    // Marke (Auftakt) — Name kräftig in Akzentfarbe, Endung kleiner + dezent.
    markeName: { fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em", color: accent },
    markeEndung: { fontSize: 30, fontWeight: 300, letterSpacing: "-0.02em", color: t.muted },
    // Auftakt-Zeilen (unter der Marke).
    auftaktZeile: { fontSize: 21, fontWeight: 400, lineHeight: 1.5, color: t.text, opacity: 0.9 },
    // Frage über dem Schalter — edel, nicht wuchtig.
    frage: { fontSize: 25, fontWeight: 500, letterSpacing: "-0.005em", color: t.text, opacity: 0.95 },
    // Schalter-Beschreibung.
    beschrTitel: { fontSize: 19, fontWeight: 600, color: t.text, opacity: 0.95 },
    beschrZeile: { fontSize: 15, fontWeight: 400, lineHeight: 1.55, color: t.sub, maxWidth: "30ch", marginTop: 6 },
    // Abschluss.
    abschlussStark: { fontSize: 21, fontWeight: 500, lineHeight: 1.5, color: t.text, opacity: 0.95, maxWidth: "26ch" },
    abschlussSub: { fontSize: 16, fontWeight: 400, lineHeight: 1.6, color: t.sub, maxWidth: "34ch" }
  };
}
