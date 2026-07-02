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
import { KARTEN, AUFTAKT_HELLDUNKEL } from "./inhalte.js";
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
          ? <AuftaktHellDunkel modus={modus} onWaehle={setModus} t={t} accent={accent} />
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

// ── Auftakt-Screen: Lichtschalter + Frage + zwei Beschreibungen ─────────────
function AuftaktHellDunkel({ modus, onWaehle, t, accent }) {
  const istDunkel = modus === "dunkel";
  const hd = AUFTAKT_HELLDUNKEL;

  const beschr = (aktiv, symbol, titel, zeile) => (
    <div style={{ textAlign: "center", opacity: aktiv ? 1 : 0.4, transition: "opacity 420ms ease", maxWidth: 180 }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{symbol}</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: t.text }}>{titel}</div>
      <div style={{ fontSize: 13.5, color: t.sub, lineHeight: 1.4, marginTop: 2 }}>{zeile}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em", textAlign: "center" }}>
        {hd.frage}
      </div>
      <Lichtschalter modus={modus} onWaehle={onWaehle} t={t} accent={accent} />
      <div style={{ display: "flex", gap: 28, justifyContent: "center", alignItems: "flex-start" }}>
        {beschr(!istDunkel, hd.hell.symbol, hd.hell.titel, hd.hell.zeile)}
        {beschr(istDunkel, hd.dunkel.symbol, hd.dunkel.titel, hd.dunkel.zeile)}
      </div>
    </div>
  );
}

// ── Inhalts-Screen: rendert eine Karte je nach Typ ──────────────────────────
function KartenScreen({ karte, t, accent }) {
  const typ = karte.typ;

  if (typ === "auftakt") {
    return (
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: accent, letterSpacing: "-0.02em", marginBottom: 20 }}>
          {karte.marke}
        </div>
        {karte.zeilen.map((z, i) => (
          <div key={i} style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.4, color: t.text }}>{z}</div>
        ))}
      </div>
    );
  }

  if (typ === "abschluss") {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        {karte.zeilen.map((z, i) => (
          <div key={i} style={{ fontSize: i === 0 ? 22 : 17, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? t.text : t.sub, lineHeight: 1.5, marginBottom: 14 }}>{z}</div>
        ))}
        <button
          onClick={() => { /* Später: Sprung in die Spielwiese (Stufe 2). */ }}
          style={{
            marginTop: 22, background: accent, color: "#FFFFFF",
            border: "none", borderRadius: RAD.xl,
            fontSize: 18, fontWeight: 600, padding: "16px 34px",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            boxShadow: "0 8px 24px rgba(14,116,144,0.35)"
          }}
        >
          {karte.knopf}
        </button>
      </div>
    );
  }

  // Typ „darstellung" (Karte 3) — Platzhalter für die echten Bausteine.
  const istDarstellung = typ === "darstellung";

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", width: "100%" }}>
      {karte.eyebrow ? (
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>
          {karte.eyebrow}
        </div>
      ) : null}

      {karte.stark && !karte.absaetze ? (
        <div style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.45, color: t.text, marginBottom: 16 }}>{karte.stark}</div>
      ) : null}

      {karte.absaetze ? karte.absaetze.map((p, i) => (
        <p key={i} style={{ fontSize: 17, lineHeight: 1.6, color: t.sub, margin: "0 0 14px" }}>{p}</p>
      )) : null}

      {karte.stark && karte.absaetze ? (
        <div style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.45, color: t.text, margin: "18px 0 10px" }}>{karte.stark}</div>
      ) : null}

      {karte.nachsatz ? (
        <p style={{ fontSize: 17, lineHeight: 1.6, color: t.sub, margin: "0" }}>{karte.nachsatz}</p>
      ) : null}

      {istDarstellung ? (
        <div style={{
          marginTop: 22, border: `1px dashed ${t.border}`, borderRadius: RAD.lg,
          padding: "26px 20px", textAlign: "center", color: t.muted, fontSize: 14.5
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
