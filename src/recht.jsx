// ═══════════════════════════════════════════════════════════════════════════
// recht.js — Impressum + Datenschutz für den Pitch.
//
// ▼▼▼  HIER DEINE DATEN EINTRAGEN — nur diesen Block anfassen.  ▼▼▼
// Alles zwischen den Anführungszeichen "..." ersetzen. Rest der Datei
// unverändert lassen. Nach dem Ändern muss pitch.js neu gebaut werden
// (Claude Bescheid geben oder Datei hochladen).
// ═══════════════════════════════════════════════════════════════════════════

export const KONTAKT = {
  name:    "Benjamin Goltz",
  strasse: "Schwanheimerstr.16/2",
  ort:     "69421 Eberbach",
  email:   "recht@allesda.one",
  stand:   "Juli 2026"          // z. B. "Juli 2026"
};

// ═══════════════════════════════════════════════════════════════════════════
// ▲▲▲  AB HIER NICHTS MEHR ÄNDERN — nur Darstellung.  ▲▲▲
// ═══════════════════════════════════════════════════════════════════════════

import React from "react";

// ── Rechtliches-Overlay: Impressum + Datenschutz ────────────────────────────
// Vollflächiges, scrollbares Overlay im aktuellen Thema. Zieht Name/Anschrift/
// E-Mail/Stand aus dem KONTAKT-Block oben.
export default function RechtOverlay({ t, accent, onClose }) {
  const k = KONTAKT;
  const h2 = { fontSize: 18, fontWeight: 700, color: t.text, marginTop: 28, marginBottom: 8 };
  const p = { fontSize: 14, lineHeight: 1.6, color: t.sub, marginBottom: 8 };
  const wert = { color: t.text };
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
            <span style={wert}>{k.name}</span><br />
            <span style={wert}>{k.strasse}</span><br />
            <span style={wert}>{k.ort}</span>
          </div>
          <div style={p}>
            <strong style={{ color: t.text }}>Kontakt</strong><br />
            E-Mail: <span style={wert}>{k.email}</span>
          </div>
          <div style={p}>
            Verantwortlich für den Inhalt: <span style={wert}>{k.name}</span>, Anschrift wie oben.
          </div>

          <div style={h2}>Datenschutzerklärung</div>

          <div style={{ ...p, fontWeight: 700, color: t.text, marginTop: 12 }}>1. Verantwortlicher</div>
          <div style={p}>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist
            {" "}<span style={wert}>{k.name}</span>, <span style={wert}>{k.strasse}, {k.ort}</span>,
            E-Mail <span style={wert}>{k.email}</span>.
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
            Stand: <span style={wert}>{k.stand}</span>. Diese Angaben werden ergänzt,
            sobald weitere Funktionen (z. B. die Anforderung eines Testzugangs) hinzukommen.
          </div>

        </div>
      </div>
    </div>
  );
}
