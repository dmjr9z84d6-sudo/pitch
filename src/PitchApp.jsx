// ═══════════════════════════════════════════════════════════════════════════
// PitchApp.jsx — Der Pitch-Flow (Stufe 1).
// Wischbare Vollbild-Karten: Lichtschalter-Auftakt → 4 Karten → Abschluss.
// Seiten-Punkte, „Überspringen" oben rechts, Zurückwischen. System-Start
// für Hell/Dunkel. Karte „darstellung" (Karte 3) zeigt vorerst einen Platz-
// halter — die echten Bausteine VEKachel/VEListenZeile kommen als nächster
// Bau-Schritt hinein.
//
// Coding-Regeln (Safari/iOS): kein ?., keine IIFE in JSX, Werte vor return
// als const, dvh statt vh, Inputs ≥16px.
// ═══════════════════════════════════════════════════════════════════════════
import React from "react";
import { DARK, LIGHT, ACCENT, RAD, DESKTOP_MIN_WIDTH } from "./tokens.js";
import { KARTEN, AUFTAKT_HELLDUNKEL, MARKE } from "./inhalte.js";
import Lichtschalter from "./Lichtschalter.jsx";

// System-Präferenz Hell/Dunkel auslesen (Start-Grundeinstellung).
function systemDunkel() {
  const mm = typeof window !== "undefined" && window.matchMedia;
  if (!mm) return true;
  const q = window.matchMedia("(prefers-color-scheme: dark)");
  return (q && q.matches) || false;
}

export default function PitchApp() {
  // Hell/Dunkel — Start aus System-Präferenz.
  const [modus, setModus] = React.useState(systemDunkel() ? "dunkel" : "hell");
  const t = modus === "dunkel" ? DARK : LIGHT;
  const accent = ACCENT;

  // Aktuelle Karte. 0 = Lichtschalter-Auftakt, dann KARTEN[0..].
  // Gesamtzahl der Screens = 1 (Lichtschalter) + KARTEN.length.
  const gesamt = KARTEN.length + 1;
  const [screen, setScreen] = React.useState(0);

  // Touch-Wischen.
  const startRef = React.useRef(null);
  const onTouchStart = (e) => {
    const tch = (e.touches && e.touches[0]) || null;
    startRef.current = tch ? { x: tch.clientX, y: tch.clientY } : null;
  };
  const onTouchEnd = (e) => {
    const s = startRef.current;
    if (!s) return;
    const tch = (e.changedTouches && e.changedTouches[0]) || null;
    if (!tch) return;
    const dx = tch.clientX - s.x;
    const dy = tch.clientY - s.y;
    // Nur horizontale Wische zählen (vertikal = Scrollen).
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) vor();
      else zurueck();
    }
    startRef.current = null;
  };

  const vor = () => setScreen(s => Math.min(s + 1, gesamt - 1));
  const zurueck = () => setScreen(s => Math.max(s - 1, 0));
  const zumAbschluss = () => setScreen(gesamt - 1);

  // Tastatur (Desktop): Pfeile.
  React.useEffect(() => {
    const fn = (e) => {
      if (e.key === "ArrowRight") vor();
      else if (e.key === "ArrowLeft") zurueck();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [gesamt]);

  const buehneStyle = {
    position: "fixed", inset: 0,
    background: t.bg, color: t.text,
    transition: "background 420ms ease, color 420ms ease",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex", flexDirection: "column",
    overflow: "hidden"
  };

  // „Überspringen" oben rechts — nur wenn nicht schon am Abschluss.
  const zeigeSkip = screen < gesamt - 1;

  return (
    <div style={buehneStyle} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Kopfzeile: Überspringen */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "max(16px, env(safe-area-inset-top)) 18px 0" }}>
        {zeigeSkip ? (
          <button
            onClick={zumAbschluss}
            style={{
              background: "transparent", border: "none",
              color: t.muted, fontSize: 16, cursor: "pointer",
              padding: "8px 4px", WebkitTapHighlightColor: "transparent"
            }}
          >
            Überspringen
          </button>
        ) : <div style={{ height: 36 }} />}
      </div>

      {/* Bühne: aktueller Screen */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px", minHeight: 0 }}>
        {screen === 0
          ? <AuftaktHellDunkel modus={modus} onWaehle={setModus} onWeiter={vor} t={t} accent={accent} />
          : <KartenScreen karte={KARTEN[screen - 1]} t={t} accent={accent} />}
      </div>

      {/* Fußzeile: Seiten-Punkte */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "0 0 max(28px, env(safe-area-inset-bottom))" }}>
        {Array.from({ length: gesamt }).map((_, i) => {
          const aktiv = i === screen;
          return (
            <button
              key={i}
              onClick={() => setScreen(i)}
              aria-label={"Zu Abschnitt " + (i + 1)}
              style={{
                width: aktiv ? 22 : 8, height: 8, padding: 0,
                borderRadius: RAD.pill, border: "none",
                background: aktiv ? accent : t.border,
                cursor: "pointer", transition: "width 260ms ease, background 260ms ease",
                WebkitTapHighlightColor: "transparent"
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Auftakt-Screen: Lichtschalter + Frage + aktive Beschreibung ─────────────
function AuftaktHellDunkel({ modus, onWaehle, onWeiter, t, accent }) {
  const istDunkel = modus === "dunkel";
  const hd = AUFTAKT_HELLDUNKEL;
  const aktiv = istDunkel ? hd.dunkel : hd.hell;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 56 }}>
      <div style={{ fontSize: 27, fontWeight: 600, letterSpacing: "-0.01em", textAlign: "center" }}>
        {hd.frage}
      </div>

      <Lichtschalter modus={modus} onWaehle={onWaehle} t={t} accent={accent} />

      {/* Nur die aktive Beschreibung. Feste Höhe → Button springt nicht.
          key erzwingt sanftes Neu-Einblenden beim Wechsel. */}
      <div style={{ height: 108, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        <div
          key={istDunkel ? "d" : "h"}
          style={{ textAlign: "center", maxWidth: 260, animation: "pitchFade 420ms ease" }}
        >
          <div style={{ fontSize: 30, marginBottom: 10 }}>{aktiv.symbol}</div>
          <div style={{ fontSize: 19, fontWeight: 600, color: t.text }}>{aktiv.titel}</div>
          <div style={{ fontSize: 15, color: t.sub, lineHeight: 1.5, marginTop: 4 }}>{aktiv.zeile}</div>
        </div>
      </div>

      <button
        onClick={onWeiter}
        style={{
          background: accent, color: "#FFFFFF",
          border: "none", borderRadius: RAD.xl,
          fontSize: 17, fontWeight: 600, padding: "15px 46px",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
          boxShadow: "0 6px 20px rgba(14,116,144,0.30)"
        }}
      >
        Weiter
      </button>
    </div>
  );
}

// ── Inhalts-Screen: rendert eine Folie je nach Typ ──────────────────────────
function KartenScreen({ karte, t, accent }) {
  const typ = karte.typ;

  if (typ === "auftakt") {
    return (
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{ marginBottom: 26 }}>
          <span style={{ fontSize: 42, fontWeight: 700, color: accent, letterSpacing: "-0.02em" }}>{MARKE.name}</span>
          <span style={{ fontSize: 42, fontWeight: 400, color: t.muted, letterSpacing: "-0.02em" }}>{MARKE.endung}</span>
        </div>
        {karte.zeilen.map((z, i) => (
          <div key={i} style={{ fontSize: 25, fontWeight: 500, lineHeight: 1.45, color: t.text }}>{z}</div>
        ))}
      </div>
    );
  }

  if (typ === "abschluss") {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        {karte.zeilen.map((z, i) => (
          <div key={i} style={{ fontSize: i === 0 ? 23 : 18, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? t.text : t.sub, lineHeight: 1.55, marginBottom: 16 }}>{z}</div>
        ))}
        <button
          onClick={() => { /* Später: Sprung in die Spielwiese (Stufe 2). */ }}
          style={{
            marginTop: 26, background: accent, color: "#FFFFFF",
            border: "none", borderRadius: RAD.xl,
            fontSize: 18, fontWeight: 600, padding: "16px 40px",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            boxShadow: "0 8px 24px rgba(14,116,144,0.35)"
          }}
        >
          {karte.knopf}
        </button>
      </div>
    );
  }

  // Gemeinsamer Rahmen für text / stark / darstellung.
  const istDarstellung = typ === "darstellung";
  const istStark = typ === "stark";

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
      {karte.eyebrow ? (
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: accent, marginBottom: 22 }}>
          {karte.eyebrow}
        </div>
      ) : null}

      {istStark ? (
        <div style={{ fontSize: 27, fontWeight: 600, lineHeight: 1.4, color: t.text, letterSpacing: "-0.01em" }}>
          {karte.stark}
        </div>
      ) : null}

      {karte.text ? (
        <p style={{ fontSize: 20, lineHeight: 1.6, color: t.text, margin: 0, fontWeight: 400 }}>{karte.text}</p>
      ) : null}

      {karte.nachsatz ? (
        <p style={{ fontSize: 16.5, lineHeight: 1.6, color: t.sub, margin: "22px 0 0" }}>{karte.nachsatz}</p>
      ) : null}

      {istDarstellung ? (
        <div style={{
          marginTop: 28, border: `1px dashed ${t.border}`, borderRadius: RAD.lg,
          padding: "28px 20px", textAlign: "center", color: t.muted, fontSize: 14.5
        }}>
          Hier erscheint die Live-Vorschau: Karten ⇆ Liste
          <div style={{ fontSize: 13, marginTop: 6, color: t.muted }}>
            (echte AllesDa-Bausteine — kommt im nächsten Bau-Schritt)
          </div>
        </div>
      ) : null}
    </div>
  );
}
