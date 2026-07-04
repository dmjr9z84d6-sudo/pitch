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
import { DARK, LIGHT, ACCENT, RAD, DESKTOP_MIN_WIDTH, PITCH_VERSION } from "./tokens.js";
import { KARTEN, AUFTAKT_HELLDUNKEL, MARKE } from "./inhalte.js";
import { stilTexte } from "./stil.js";
import Lichtschalter from "./Lichtschalter.jsx";
import Vorschau from "./Vorschau.jsx";

// System-Präferenz Hell/Dunkel auslesen (Start-Grundeinstellung).
function systemDunkel() {
  const mm = typeof window !== "undefined" && window.matchMedia;
  if (!mm) return true;
  const q = window.matchMedia("(prefers-color-scheme: dark)");
  return (q && q.matches) || false;
}

// ── Rechtliches-Overlay: Impressum + Datenschutz ────────────────────────────
// Vollflächiges, scrollbares Overlay im aktuellen Thema. Platzhalter [ ... ]
// trägt Benny selbst ein — echte Personendaten gehören nicht in den Quellcode
// des öffentlichen Repos, bis sie bewusst gesetzt werden.
function RechtOverlay({ t, accent, onClose }) {
  const h2 = { fontSize: 18, fontWeight: 700, color: t.text, marginTop: 28, marginBottom: 8 };
  const p = { fontSize: 14, lineHeight: 1.6, color: t.sub, marginBottom: 8 };
  const platz = { color: accent };
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, background: t.bg,
      display: "flex", flexDirection: "column",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Kopf mit Schließen */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "max(16px, env(safe-area-inset-top)) 20px 12px",
        borderBottom: `1px solid ${t.border}`, flexShrink: 0
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Rechtliches</span>
        <button onClick={onClose} style={{
          background: "transparent", border: "none", color: t.sub,
          fontSize: 15, cursor: "pointer", padding: "8px 4px",
          WebkitTapHighlightColor: "transparent"
        }}>Schließen</button>
      </div>
      {/* Scrollbarer Inhalt */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 22px max(28px, env(safe-area-inset-bottom))" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>

          <div style={h2}>Impressum</div>
          <div style={p}>Angaben gemäß § 5 DDG</div>
          <div style={p}>
            <span style={platz}>[Vorname Nachname]</span><br />
            <span style={platz}>[Straße und Hausnummer]</span><br />
            <span style={platz}>[PLZ Ort]</span>
          </div>
          <div style={p}>
            <strong style={{ color: t.text }}>Kontakt</strong><br />
            E-Mail: <span style={platz}>[deine-adresse@allesda.one]</span>
          </div>
          <div style={p}>
            Verantwortlich für den Inhalt: <span style={platz}>[Vorname Nachname]</span>, Anschrift wie oben.
          </div>

          <div style={h2}>Datenschutzerklärung</div>

          <div style={{ ...p, fontWeight: 700, color: t.text, marginTop: 12 }}>1. Verantwortlicher</div>
          <div style={p}>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist
            <span style={platz}> [Vorname Nachname]</span>, <span style={platz}>[Anschrift]</span>,
            E-Mail <span style={platz}>[deine-adresse@allesda.one]</span>.
          </div>

          <div style={{ ...p, fontWeight: 700, color: t.text, marginTop: 12 }}>2. Hosting</div>
          <div style={p}>
            Diese Website wird bei GitHub Pages (GitHub, Inc., 88 Colin P. Kelly Jr. Street,
            San Francisco, CA 94107, USA) gehostet. Beim Aufruf der Seiten werden technisch
            notwendige Zugriffsdaten wie die IP-Adresse verarbeitet, um die Auslieferung der
            Seite zu ermöglichen und deren Sicherheit zu gewährleisten. Rechtsgrundlage ist
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer stabilen, sicheren
            Bereitstellung). Die Übermittlung in die USA erfolgt auf Grundlage der
            Standardvertragsklauseln.
          </div>

          <div style={{ ...p, fontWeight: 700, color: t.text, marginTop: 12 }}>3. Keine Cookies, kein Tracking</div>
          <div style={p}>
            Diese Website setzt keine Cookies und verwendet keine Analyse- oder
            Tracking-Dienste. Es werden keine personenbezogenen Profile gebildet.
          </div>

          <div style={{ ...p, fontWeight: 700, color: t.text, marginTop: 12 }}>4. Ihre Rechte</div>
          <div style={p}>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
            Verarbeitung, Datenübertragbarkeit und Widerspruch sowie ein Beschwerderecht bei
            einer Aufsichtsbehörde. Wenden Sie sich dazu an die oben genannte Kontaktadresse.
          </div>

          <div style={{ ...p, fontSize: 12, opacity: 0.7, marginTop: 20 }}>
            Stand: <span style={platz}>[Monat Jahr]</span>. Diese Angaben werden ergänzt,
            sobald weitere Funktionen (z. B. die Anforderung eines Testzugangs) hinzukommen.
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PitchApp() {
  // Hell/Dunkel — Start aus System-Präferenz.
  const [modus, setModus] = React.useState(systemDunkel() ? "dunkel" : "hell");
  const t = modus === "dunkel" ? DARK : LIGHT;
  const accent = ACCENT;
  const stil = stilTexte(t, accent);

  // Aktuelle Karte. 0 = Lichtschalter-Auftakt, dann KARTEN[0..].
  // Gesamtzahl der Screens = 1 (Lichtschalter) + KARTEN.length.
  const gesamt = KARTEN.length + 1;
  const [screen, setScreen] = React.useState(0);

  // Rechtliches-Overlay (Impressum + Datenschutz) — dezenter Link unten rechts.
  const [zeigeRecht, setZeigeRecht] = React.useState(false);

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
      {/* Versionsnummer — dezent unten links, zur Cache-Kontrolle. */}
      <div style={{
        position: "fixed", left: 10, bottom: 8, zIndex: 50,
        fontSize: 11, color: t.sub, opacity: 0.75,
        letterSpacing: "0.02em", pointerEvents: "none", userSelect: "none"
      }}>v{PITCH_VERSION}</div>
      {/* „Rechtliches" — dezent unten rechts, spiegelbildlich zur Version.
          Öffnet das Impressum-/Datenschutz-Overlay. */}
      <button onClick={() => setZeigeRecht(true)} style={{
        position: "fixed", right: 12, bottom: 6, zIndex: 50,
        background: "transparent", border: "none",
        fontSize: 11, color: t.sub, opacity: 0.6,
        letterSpacing: "0.02em", cursor: "pointer",
        padding: "6px 4px", WebkitTapHighlightColor: "transparent"
      }}>Rechtliches</button>
      {zeigeRecht ? <RechtOverlay t={t} accent={accent} onClose={() => setZeigeRecht(false)} /> : null}
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

      {/* Bühne: aktueller Screen. ALLE Screens echt vertikal zentriert, aber
          optisch einen Tick nach oben (paddingBottom hebt die Mitte an) — wirkt
          sonst zu tief. Gleiche Logik für Handy und Monitor. */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "0 28px", paddingBottom: "8vh",
        minHeight: 0, position: "relative"
      }}>
        {/* Fade-Wrapper: key erzwingt sanftes Ein-Gleiten bei jedem Folienwechsel. */}
        <div key={screen} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", animation: "pitchFade 380ms ease" }}>
          {screen === 0
            ? <AuftaktHellDunkel modus={modus} onWaehle={setModus} t={t} accent={accent} stil={stil} />
            : <KartenScreen karte={KARTEN[screen - 1]} t={t} accent={accent} stil={stil} />}
        </div>

        {/* Zurück + Weiter — Pfeile in Cyan, kein Kreis. Zurück nur ab Folie 1,
            Weiter auf allen außer der letzten. Wischen bleibt zusätzlich. */}
        <div style={{ position: "absolute", right: "clamp(12px, 5vw, 52px)", bottom: 6, display: "flex", gap: 8 }}>
          {screen > 0 ? (
            <button
              onClick={zurueck}
              aria-label="Zurück"
              style={{
                background: "transparent", border: "none",
                color: t.muted, fontSize: 34, lineHeight: 1,
                padding: 12, cursor: "pointer",
                WebkitTapHighlightColor: "transparent"
              }}
            >
              ←
            </button>
          ) : null}
          {screen < gesamt - 1 ? (
            <button
              onClick={vor}
              aria-label="Weiter"
              style={{
                background: "transparent", border: "none",
                color: accent, fontSize: 34, lineHeight: 1,
                padding: 12, cursor: "pointer",
                WebkitTapHighlightColor: "transparent"
              }}
            >
              →
            </button>
          ) : null}
        </div>
      </div>

      {/* Fußzeile: dezenter Fortschrittsstrich */}
      <div style={{ padding: "0 28px max(26px, env(safe-area-inset-bottom))" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", height: 2, background: t.border, borderRadius: RAD.pill, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: accent, borderRadius: RAD.pill,
            width: ((screen + 1) / gesamt * 100) + "%",
            transition: "width 340ms ease"
          }} />
        </div>
      </div>
    </div>
  );
}

// ── Auftakt-Screen: Lichtschalter als Star. Überschrift oben, Schalter Mitte,
//    Beschreibung darunter (ohne zweiten Mond). Der Weiter-Pfeil liegt als
//    runder Button auf Bühnen-Ebene unten rechts (siehe PitchApp). ──────────
function AuftaktHellDunkel({ modus, onWaehle, t, accent, stil }) {
  const istDunkel = modus === "dunkel";
  const hd = AUFTAKT_HELLDUNKEL;
  const aktiv = istDunkel ? hd.dunkel : hd.hell;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Frage — edel, nicht wuchtig. Mehr Luft nach unten. */}
      <div style={{ ...stil.frage, textAlign: "center", marginBottom: 92 }}>
        {hd.frage}
      </div>

      {/* Der Star: Schalter */}
      <Lichtschalter modus={modus} onWaehle={onWaehle} t={t} accent={accent} gross />

      {/* Beschreibung — nur Text, KEIN zweiter Mond. Feste Höhe für Ruhe. */}
      <div style={{ height: 96, marginTop: 68, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        <div key={istDunkel ? "d" : "h"} style={{ textAlign: "center", animation: "pitchFade 420ms ease" }}>
          <div style={stil.beschrTitel}>{aktiv.titel}</div>
          <div style={{ ...stil.beschrZeile, marginTop: 10 }}>{aktiv.zeile}</div>
        </div>
      </div>
    </div>
  );
}

// ── Wortmarke: hebt jedes „AllesDa" im Text farbig hervor (§76: ein Aussehen
//    für die Marke, egal wo sie im Text steht). Gibt ein Array aus Text +
//    farbigen <span> zurück. Kein ?. (iOS-Regel).
function mitWortmarke(text, accent, muted) {
  if (!text || text.indexOf("AllesDa") === -1) return text;
  const teile = text.split("AllesDa");
  const out = [];
  for (let i = 0; i < teile.length; i++) {
    let stueck = teile[i];
    if (i > 0) {
      out.push(
        <span key={"m" + i} style={{ color: accent, fontWeight: 700 }}>AllesDa</span>
      );
      // Folgt direkt ".one", wird es als dezente Logo-Endung gesetzt
      // (wie markeEndung im Auftakt: leicht + muted).
      if (stueck.indexOf(".one") === 0) {
        out.push(
          <span key={"e" + i} style={{ color: muted, fontWeight: 300 }}>.one</span>
        );
        stueck = stueck.slice(4);
      }
    }
    if (stueck) out.push(stueck);
  }
  return out;
}

// Färbt einen Teilsatz (karte.akzent) in Akzentfarbe. Der Text davor/danach
// läuft weiter durch mitWortmarke (AllesDa/.one-Behandlung bleibt erhalten).
function mitAkzent(text, akzent, accent, muted) {
  const i = akzent && text ? text.indexOf(akzent) : -1;
  if (i === -1) return mitWortmarke(text, accent, muted);
  const davor = text.slice(0, i);
  const danach = text.slice(i + akzent.length);
  const out = [];
  if (davor) out.push(<span key="v">{mitWortmarke(davor, accent, muted)}</span>);
  out.push(<span key="a" style={{ color: accent }}>{akzent}</span>);
  if (danach) out.push(<span key="n">{mitWortmarke(danach, accent, muted)}</span>);
  return out;
}

// ── Inhalts-Screen: rendert eine Folie je nach Typ ──────────────────────────
function KartenScreen({ karte, t, accent, stil }) {
  const typ = karte.typ;

  if (typ === "auftakt") {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ marginBottom: 32 }}>
          <span style={stil.markeName}>{MARKE.name}</span>
          <span style={stil.markeEndung}>{MARKE.endung}</span>
        </div>
        {karte.zeilen.map((z, i) => (
          <div key={i} style={stil.auftaktZeile}>{z}</div>
        ))}
      </div>
    );
  }

  // Pointe: Kernsatz in Weiß (einheitlicher stark-Stil), darunter die
  // farbige Wortmarke als stiller Absender.
  if (typ === "pointe") {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={stil.stark}>{karte.zeile}</div>
        <div style={{ marginTop: 40 }}>
          <span style={{ ...stil.markeName, fontSize: 32 }}>{MARKE.name}</span>
          <span style={{ ...stil.markeEndung, fontSize: 23 }}>{MARKE.endung}</span>
        </div>
      </div>
    );
  }

  if (typ === "abschluss") {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {karte.zeilen.map((z, i) => (
          <div key={i} style={{ ...(i === 0 ? stil.abschlussStark : stil.abschlussSub), marginBottom: 16 }}>{z}</div>
        ))}
        <button
          onClick={() => { /* Später: Sprung in die Spielwiese (Stufe 2). */ }}
          style={{
            marginTop: 24, background: accent, color: "#FFFFFF",
            border: "none", borderRadius: RAD.xl,
            fontSize: 17, fontWeight: 600, padding: "15px 38px",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            boxShadow: "0 6px 18px rgba(14,116,144,0.28)"
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

  // Die frühere Überzeile wird zur Schluss-Aussage UNTER dem Text (Dramaturgie:
  // erst der Inhalt/Beweis, dann die Aussage als leise Pointe). Gleiche Optik
  // wie die alte eyebrow, nur Abstand nach oben statt unten. Text-Folien nutzen
  // `eyebrow`, stark-Folien optional `aussage`.
  const schlussText = karte.eyebrow || karte.aussage || null;
  const schlussStil = { ...stil.eyebrow, marginBottom: 0, marginTop: 28 };
  const schluss = schlussText ? (
    <div style={schlussStil}>{schlussText}</div>
  ) : null;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {istStark ? (
        <div style={stil.stark}>{mitAkzent(karte.stark, karte.akzent, accent, t.muted)}</div>
      ) : null}

      {karte.text ? (
        <p style={{ ...stil.text, margin: 0 }}>{mitWortmarke(karte.text, accent, t.muted)}</p>
      ) : null}

      {karte.nachsatz ? (
        <p style={{ ...stil.nachsatz, marginBottom: 0 }}>{karte.nachsatz}</p>
      ) : null}

      {/* Darstellungs-Folie: nur die Überschrift („oder") + der Live-Baustein.
          Sonst: Schluss-Aussage am Ende. */}
      {istDarstellung ? (
        <>
          <div style={{ fontSize: 22, fontWeight: 500, color: t.text, opacity: 0.9, textAlign: "center", marginBottom: 24 }}>
            {karte.ueberschrift || ""}
          </div>
          <Vorschau t={t} accent={accent} />
        </>
      ) : (
        schluss
      )}
    </div>
  );
}
