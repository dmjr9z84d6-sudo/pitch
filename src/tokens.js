// ═══════════════════════════════════════════════════════════════════════════
// tokens.js — Design-Tokens für die Pitch-App.
// Werte 1:1 aus AllesDa constants.js übernommen, damit der Pitch dieselbe
// Farbwelt spricht wie die App selbst (Cyan-Akzent, Dark/Light-Paletten, Radien).
// ═══════════════════════════════════════════════════════════════════════════

// Pitch-Version — bei jeder Lieferung hochzählen. Dient der Cache-Kontrolle
// (unauffällig unten links sichtbar).
export const PITCH_VERSION = "0.15";

export const DARK = {
  bg: "#07070C", surface: "#0D0D16", card: "#13131F", border: "#252540",
  text: "#F0F0FF", sub: "#A0A0CD", muted: "#7575A0", header: "#0D0D14"
};

export const LIGHT = {
  bg: "#ECEEF3", surface: "#F4F6FA", card: "#FFFFFF", border: "#D8DCE8",
  text: "#0F1022", sub: "#4A5072", muted: "#737896", header: "#FFFFFF"
};

export const ACCENT = "#0E7490"; // Objekte (Cyan) — Leitfarbe von AllesDa

export const RAD = { sm: 6, ms: 8, md: 9, ml: 10, lg: 12, xl: 16, pill: 999, full: "50%" };

// Schwelle schmal ↔ breit — identisch zu AllesDa, damit der Lichtschalter
// dieselbe Layout-Grenze nutzt (hochkant vs. breit).
export const DESKTOP_MIN_WIDTH = 900;
