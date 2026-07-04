# TOUR_BAUANLEITUNG — Wie die Feature-Tour die echte App steuert

**Stand:** 04.07.2026 · Tour v0.1 · gebaut gegen App v13.43
**Ort:** Repo `dmjr9z84d6-sudo/pitch`, Ordner `tour/` → live unter `allesda.one/tour/`

> **Zweck:** Diese Datei ist das Gedächtnis der Tour. Wenn die Haupt-App sich
> ändert, steht hier, welche Annahmen die Tour über die App macht — und was
> beim Update geprüft/angepasst werden muss. Neue Tour auf veränderte App
> ansetzen = diese Datei + TOUR_Beschnitt_Spec an Claude geben.

---

## 1. Dateien und ihre Rollen

| Datei | Rolle | Wann anfassen |
|---|---|---|
| `index.html` | Hülle: lädt inhalte → seed → tour | praktisch nie |
| `inhalte.js` | ALLE Texte, Stationen, Beschnitt-Konfig, `TOUR_VERSION` | bei jeder Text-/Inhaltsänderung (Version hochzählen!) |
| `seed.js` | schreibt Fake-Bestand + Beschnitt-Settings in localStorage, lädt dann `AllesDa.js` | bei neuen Menüpunkten/Tabs der App (Vorlagen-Listen!) |
| `tour.js` | Overlay-Engine (Spotlight, Sperren, Wächter, Leiste) | nur bei Verhaltens-Änderungen |
| `daten.json` | Fake-Bestand (Bennys Musterobjekt, Format lt. Datenformat-Spec) | wenn Demo-Daten sich ändern |
| `AllesDa.js` | **KOPIE** des echten Bundles | **bei jedem Haupt-App-Update mitziehen!** |

## 2. Grundprinzip (Weg Y — entschieden 04.07.2026)

Die **echte, unveränderte App** läuft. Die Tour steuert sie ausschließlich
von außen über drei Hebel:

### Hebel 1: localStorage-Seed (seed.js)
Die App liest beim Start:
- `allesda:settings` — wird per `Object.assign({}, DEFAULT_SETTINGS, gespeichert)`
  über die Defaults gelegt (`storage.ladeSettings`, utils-icons.jsx). Ein
  **Teilobjekt genügt**. Die Tour seedet:
  - `kacheln[]` (Hauptmenü): `aktiv:false` blendet Menüpunkt aus — die App
    filtert selbst (`SeitenleisteKacheln`/`KategorieKacheln` in liegenschaft.jsx:
    `settings.kacheln.filter(k => k.aktiv)`).
  - `objektTabs[]` (Objekt-Detail-Tabs): `aktiv:false` blendet Tab aus
    (`VEDetail` in objektansicht.jsx). `liegenschaft`+`verwaltung` sind
    `fix:true` (immer sichtbar).
- `allesda:daten` — Struktur `{ kontakte, ves, freieTermine }`
  (siehe `storage.speichereDaten`-Aufruf in allesda_merged.jsx).
  Die Tour extrahiert `kontakte`+`ves` aus `daten.json` und setzt
  `freieTermine: []`.
- `allesda:schema` = "1".
- Eigener Marker `allesda:tour:geseedet`: verhindert Re-Seed bei jedem
  Laden (Nutzer-Klicks bleiben in der Browser-Session erhalten).

**Reset** = alle Keys mit Präfix `allesda` löschen + reload → seedet frisch.

### Hebel 2: DOM-Wächter (tour.js, läuft dauerhaft)
Für alles, was die App NICHT per Config kann:
- **Einstellungen-Übersichtskacheln verstecken:** Die Sektionsliste
  `SEKTIONEN` (einstellungen.jsx ~Z.3740) ist hart kodiert. Die Tour
  erkennt Kacheln am **Titel+Sub-Paar** (beides muss in einem kleinen
  Element stehen) und setzt `display:none`. Paare stehen in
  `inhalte.js → einstellungenAusblenden`.
- **Nur-Ansicht-Schleier:** Karten „Schnellzugriff" und „Objekt-Tabs"
  (in den Einstellungen) enthalten Schalter, mit denen man ausgeblendete
  Bereiche REAKTIVIEREN könnte. Die Tour legt einen halbtransparenten,
  klickschluckenden Deckel mit Badge „Nur Ansicht (Demo)" darüber.
  Erkennung: Karten-Titel (exakter eigener Text) → hochklettern zum
  Container mit Bedienelementen.
- **Sicherheitsnetz:** Falls doch ein verbotener Nav-/Tab-Eintrag
  auftaucht (Race, Re-Render, Einstellungs-Trick), versteckt der Wächter
  jedes Element, dessen exakter Text in `verboteneNavTexte` steht UND
  dessen Umfeld (≤4 Eltern-Ebenen) mind. 2 Texte aus `navKontextTexte`
  enthält (= es ist wirklich eine Navigations-/Tab-Leiste, keine
  zufällige Karte).
- Takt: MutationObserver (250 ms gedrosselt) + 1,5-s-Intervall.

### Hebel 3: Overlay (geführte Phase, Technik C+B)
- **Spotlight:** ein Div mit riesigem `box-shadow` als Abdunklung
  (Loch = das Div selbst, `pointer-events:none`).
- **Sperren:** 4 transparente Blocker-Divs um das Loch schlucken alle
  Klicks. Bei „tippen"-Schritten bleibt NUR das Loch frei → Nutzer kann
  nur das Ziel anklicken. Bei „zeigen"-Schritten deckt ein 5. Blocker
  auch das Loch (nichts klickbar, nur Weiter-Button).
- **Anker-Suche ist rein TEXT-basiert** (keine App-Klassen/IDs nötig →
  überlebt Minify und Mobile/Desktop-Unterschiede):
  - `{text:"…"}` → sichtbares Element, dessen eigener Text exakt so
    lautet/beginnt; kleinste Fläche gewinnt; hochklettern zum klickbaren
    Wrapper.
  - `{alleTexte:[…]}` → kleinster sichtbarer Container, der alle Texte
    enthält.
  - **Fallback:** Anker nicht gefunden (10 Versuche à 300 ms) →
    zentrierte Karte mit Weiter-Button. Die Tour bricht NIE hart.
- Klick-Erkennung bei „tippen": capture-Listener prüft, ob der Klick im
  Ziel-Rect lag → 400 ms warten (App-Render) → nächster Schritt.

## 3. Phasen & Zustand

- `allesda:tour:status` fehlt → geführte Tour startet (Willkommens-Karte).
- `= "frei"` → freie Phase: kein Overlay, nur die **app-fremde Leiste**
  unten (bewusst helle, warme Farben — Kontrast zur dunklen App):
  `Zurücksetzen` (mit Bestätigung) · `Tour ansehen` (Status löschen +
  reload) · `Ausgiebiger kennenlernen` (primär).
- „Ausgiebiger kennenlernen": solange `ZIEL_KENNENLERNEN` (inhalte.js)
  leer ist → Platzhalter-Karte („Testzugang im Aufbau"). Sobald
  Lead-Capture (Phase 4) steht: URL eintragen, fertig.

## 4. Update-Checkliste bei Haupt-App-Änderung

1. **`AllesDa.js` neu kopieren** (aus test- oder AllesDa-Repo-Root) → `tour/AllesDa.js`.
2. **Neue Menüpunkte?** → `seed.js` Vorlage `KACHELN` ergänzen (id/label/
   icon/farbe/reihenfolge aus `DEFAULT_SETTINGS.kacheln`, datenmodell.js)
   UND in `inhalte.js → TOUR_BESCHNITT.menue` entscheiden: true/false.
3. **Neue Objekt-Tabs?** → analog `OBJEKT_TABS` in seed.js +
   `TOUR_BESCHNITT.objektTabs`.
4. **Einstellungen-Sektionen geändert?** → Titel+Sub-Paare in
   `inhalte.js → einstellungenAusblenden` gegen `SEKTIONEN`
   (einstellungen.jsx) abgleichen. Neue „gefährliche" Karten (Schalter,
   die Ausgeblendetes reaktivieren) → `nurAnsichtKarten` ergänzen.
5. **Stations-Anker prüfen:** Texte wie "VE-001", "Liegenschaft",
   "Objekte" müssen in der App noch so heißen. Bei Umbenennung →
   `TOUR_SCHRITTE`-Anker in inhalte.js anpassen.
6. **`TOUR_VERSION` hochzählen** (inhalte.js) — Cache-Buster für alle
   Skripte + AllesDa.js.
7. Test auf echtem iPhone: Tour durchspielen + freie Phase + Reset.

## 5. Bekannte Annahmen über die App (v13.43)

| Annahme | Quelle | Bricht wenn… |
|---|---|---|
| localStorage-Keys `allesda:settings/daten/schema` | utils-icons.jsx ~Z.625 | Keys umbenannt werden |
| Settings-Merge via Object.assign (Teilobjekt ok) | utils-icons.jsx `ladeSettings` | Laden strenger validiert |
| Daten-Struktur `{kontakte, ves, freieTermine}` | allesda_merged.jsx ~Z.1620 | Struktur erweitert wird (dann Seed ergänzen) |
| Menü filtert `kacheln[].aktiv` | liegenschaft.jsx ~Z.8189 | Filter-Logik geändert wird |
| Tabs filtern `objektTabs[].aktiv`, liegenschaft/verwaltung fix | objektansicht.jsx ~Z.1258 | Tab-Mechanik umgebaut wird |
| Einstellungs-Kacheln tragen Titel+Sub als Text | einstellungen.jsx `SEKTIONEN` | Kachel-Layout radikal anders |
| App mountet in `#root`, blendet `#ladeIndikator` aus | mount.jsx | Mount-Ziel umbenannt |
| Legionellen-Tab nur bei zentralem Warmwasser | objektansicht.jsx | — (Verhalten der App, Tour egal) |

## 5.5 Test-Referenzen (JSDOM, 04.07.2026)

- Smoke-Test (Tour-Mechanik gegen künstliches DOM): 22/22 grün.
- Integrationstest (echte AllesDa.js v13.43 + Tour-Seed): **129 Knoten**
  bei gemounteter App mit Musterbestand (leere App = 120), ERR=0,
  alle gestrichenen Menüpunkte fehlen im DOM, VE-001 sichtbar.
- **Lektion cursor-Vererbung:** `cursor:pointer` erbt auf Kind-Elemente —
  taugt daher NICHT, um den klickbaren Wrapper eines Texts zu finden
  (man landet am Text-span statt am Button). Stattdessen text-basiert
  klettern: hoch, solange das Eltern-Element (fast) nur diesen Text trägt
  (`länge ≤ text + 12`). So umgesetzt in `findeText` + `sicherheitsnetz`.

## 5.6 Änderungen v0.2 (04.07.2026)

- **Sprechblase mittig + verschiebbar:** Startet zentriert (statt fix
  unten). Titelleiste ist Zieh-Griff (Maus + Touch). Verschobene Position
  bleibt über Schritte erhalten (`ov.blasePos`). Bei „tippen"-Schritten
  weicht die Blase automatisch dem Spotlight aus (unter/über dem Ziel),
  damit der Klick aufs Ziel frei bleibt.
- **Layout-Seed (echte App-Settings):** `inhalte.js → TOUR_BESCHNITT.layout`
  setzt beim Seed `festeSpalten:true`, `kartenSpalten:1` (einreihige
  Karten-Spalte) und `detailMinBreite:1040` (breites Detailfenster).
  Schlüssel stammen aus der Erscheinungsbild-Sektion (einstellungen.jsx
  ~Z.567/574/616). Werte hier zentral änderbar — kein App-Code nötig.
  Wirkt nur auf Desktop (≥900 px); auf dem iPhone ist die App ohnehin
  einspaltig.

## 5.7 Änderungen v0.3 (04.07.2026)

- **Erkunden-Leiste zweizeilig:** Die primäre Aktion „Ausgiebiger
  kennenlernen" steht oben in voller Breite; darunter eine umbrechende
  Reihe mit den sekundären Aktionen (Zurücksetzen · Tour ansehen ·
  Rechtliches). Behebt das Abschneiden am iPhone-Rand. Body-Padding
  unten auf 108 px erhöht.
- **Rechtliches in der Tour:** Impressum + Datenschutz als Plain-JS-
  Overlay (`zeigeRecht` in tour.js), inhaltlich identisch zur Pitch-App
  (recht.jsx). Kontaktdaten stehen in `inhalte.js → RECHT.kontakt` und
  MÜSSEN mit der Pitch-App übereinstimmen — bei Adress-/E-Mail-Änderung
  beide Stellen pflegen. Datenschutz-Abschnitt 3 um den Hinweis ergänzt,
  dass die Demo-Daten nur lokal im Browser-localStorage liegen und das
  Gerät nicht verlassen.

## 5.8 Änderungen v0.4 (04.07.2026)

- **Seed-Signatur statt Einmal-Marker (wichtig):** Der Marker
  `allesda:tour:geseedet` speichert jetzt eine Signatur aus TOUR_VERSION +
  den Seed-Settings. Ändert sich die Konfiguration (neue Layout-Werte,
  andere Kachel-/Tab-Auswahl, neue Version), wird beim nächsten Laden
  automatisch NEU geseedet — der Nutzer muss NICHT „Zurücksetzen".
  Behebt die Marker-Falle: bisher blieben Settings-Änderungen bei allen
  hängen, die die Tour schon einmal geöffnet hatten (der alte Marker
  blockierte jedes Neu-Schreiben). Innerhalb derselben ausgelieferten
  Version bleibt die Signatur konstant → Nutzer-Klicks in der freien
  Phase gehen NICHT verloren.
- **Detailbreite 1040 → 1200:** Nachweislich steuert `detailMinBreite`
  die Detailbreite 1:1 über `passendeMasterSpalten` (utils-icons.jsx
  ~Z.199) im `MasterDetailRahmen` — ein Wert wirkt auf ALLE Detailkarten
  (Objekte, Kontakte, Kalender, Statistik …). Belegt per Direktaufruf:
  detailMinBreite=1200 → Detailbreite 1200 px bei 1850 px Fensterbreite.

## 5.9 Änderungen v0.5 (04.07.2026)

- **Leiste entschärft + zwei Modi:** Der dominante goldene Streifen ist
  weg. Neu ein dezenter dunkler Streifen (halbtransparent + blur).
  - *Geführte Phase:* Leiste schon während der Tour sichtbar, nur zwei
    klickbare Schrift-Links: „Tour beenden" · „Rechtliches". KEIN großer
    Button. In der Sprechblase bleibt nur „Weiter".
  - *Freie Phase / ab Weiche:* EIN echter Button „Ausgiebiger
    kennenlernen" (voll breit), darunter Schrift-Links „Zurücksetzen ·
    Tour ansehen · Rechtliches".
  - Sekundäraktionen sind jetzt klickbare Schrift (kein Button-Rahmen).
  - `zeigeLeiste(modus)` + `zeichneLeisteInhalt(modus)` in tour.js.
- **„Ausgiebiger kennenlernen" erst ab der Weiche:** Während der 10
  Stationen taucht der Button nicht auf; er erscheint mit der freien
  Phase (Weiche-Blase hat nur noch „Frei erkunden" → freigeben).
- **Sprechblasen gleich groß:** Feste Mindesthöhe (150 px Body), am
  längsten Text ausgerichtet (Station „Alles am Objekt"). Text oben,
  „Weiter" unten gepinnt; kurze Texte haben mehr Leerraum. Der frühere
  „Tour beenden"-Link IN der Blase ist raus (steht jetzt in der Leiste).

## 5.10 Änderungen v0.6 (04.07.2026)

- **Sprechblase springt nicht mehr:** Sie wird EINMAL platziert (mittig,
  bei 30 % Höhe) und bleibt exakt dort — über alle Schritte. Verschiebt
  der Nutzer sie, wird die Position gemerkt und beibehalten. Zwei
  Sprungquellen entfernt: (1) das automatische `scrollIntoView` bei jedem
  Schritt (verschob das App-Layout), (2) das „Ausweichen zum Tipp-Ziel"
  (positionierte die Blase je Schritt neu). Der Spotlight legt sich jetzt
  dorthin, wo das Ziel steht; die Blase bleibt fest.
- **Tipp-Bug VE-001 behoben:** „VE-001" steht doppelt im DOM (Listenkarte
  + Detail-Header). Station-4-Anker jetzt `alleTexte:["VE-001","WEG
  Lessingstraße"]` → trifft eindeutig die Listenkarte (nur sie hat den
  Adresszusatz). `findeContainer` klettert zum klickbaren Wrapper.
  Klick-Erkennung akzeptiert jetzt Rect-Treffer ODER `contains(target)`,
  Render-Wartezeit 400 → 550 ms.
- **Beschlusssammlung-Farbe:** war `#F59E0B` = identisch zu Kalender →
  jetzt `#F97316` (Orange), klar unterscheidbar. Steht in seed.js
  (KACHELN). Bei App-seitiger Default-Änderung hier nachziehen.

## 5.11 Änderungen v0.7 (04.07.2026)

- **App-Inhalt läuft nicht mehr hinter den Footer:** Statt das Body-
  Padding zu setzen (das die App mit ihrem eigenen `padding-bottom`
  überschrieb → Inhalt verschwand hinter dem Footer), hebt die Tour jetzt
  die CSS-Variable `--ad-auslauf` (DESIGN §33, Scroll-Auslauf, default
  62dvh) um die gemessene Footer-Höhe an — per inline-style auf `<html>`,
  der die App-CSS-Regel schlägt. So rechnet die App selbst den Platz ein;
  der letzte Inhalt lässt sich über den Footer schieben. Messung per
  doppeltem rAF nach dem Footer-Rendern (`passeAuslaufAn`).
- **Footer weiter runter (Handy):** unteres Padding der Leiste von
  10 px auf 22 px über der safe-area erhöht — Inhalt klebt nicht mehr am
  Display-Rand / Home-Indicator.

## 5.12 Änderungen v0.8 (04.07.2026)

- **Versionsnummer im Footer:** Dezent unten links (`v0.8`), Stil wie im
  Pitch (fontSize 11, opacity 0.7). Liest `TOUR_VERSION` aus inhalte.js,
  in beiden Leisten-Modi sichtbar — praktisch zur Cache-Kontrolle beim
  Testen (sieht man sofort, ob die neue Version geladen ist).

## 5.13 Änderungen v0.9 (04.07.2026)

- **Rechtliches wie im Pitch:** Aus den mittigen Link-Reihen entfernt und
  als dezentes Element unten RECHTS platziert — spiegelbildlich zur
  Versionsnummer links, exakt mit den Pitch-Werten (fontSize 11, opacity
  0.6, right 12, bottom 6). In beiden Phasen sichtbar. Die zentrale
  Link-Reihe zeigt jetzt: geführt = „Tour beenden"; frei = „Zurücksetzen
  · Tour ansehen".

## 5.14 Änderungen v0.10 (04.07.2026)

- **Version + Rechtliches ganz nach unten (wie Pitch):** Beide vorher
  `position:absolute` IN der Leiste → saßen höher. Jetzt `position:fixed`
  am echten Bildschirmrand, an document.body gehängt (IDs tour-version /
  tour-rechtliches, alte Instanzen werden beim Neuzeichnen entfernt).
  bottom: 8 px (Version) / 6 px (Rechtliches) + safe-area, exakt wie im
  Pitch. Leisten-Padding unten auf 32 px erhöht, damit die zentrale
  Link-Reihe nicht mit Version/Rechtliches am Rand kollidiert.

## 6. Offene Punkte (Stand v0.1)

- ⬜ Sprechblasen-Texte sind ENTWÜRFE — mit Benny iterieren (nur inhalte.js).
- ⬜ Begriff „Bereichsleiste" vs. „Menüleiste" offen — Texte sagen neutral „Bereiche".
- ⬜ `ZIEL_KENNENLERNEN` leer bis Lead-Capture (Phase 4) steht.
- ⬜ Station 3 ankert auf „Lindqvist" (Kontaktliste) — auf iPhone prüfen,
  ob die Kontaktkarte beim Screenwechsel sichtbar ist; ggf. Anker ändern.
- ⬜ Pitch-App: Button „Reinschauen" auf `./tour/` verlinken (separater Schritt).
