# Betrieb Zukunft – Stilrahmen „Editorial Grid“

**Vorbild:** Swiss-Plakate (Müller-Brockmann) trifft moderne Produktfilme (Stripe, Linear): Magazin-Layout, freigestellte Menschen, echte UI aus Code.

## Farben (aus dem Logo)
| Token | Hex | Einsatz |
|---|---|---|
| Papier | `#F3F2EC` | Grund, mit Korn und weichem Licht oben rechts |
| Tinte | `#052835` | Schrift, Linien |
| Signal | `#2C8964` | nur eine Sache pro Bild: Zahl, aktives Wort, Haken |
| Signal hell | `#8FD18D` | Akzent auf dunklen Flächen |
| Panel | `#0B534E → #041F2A` | dunkle Bildfelder für Menschen |

## Schrift
- **Archivo Expanded** (wdth 112–118 %, 700–800): Zahlen und Headlines, greift die breite Logo-Schrift auf
- **Inter** (500–600): Untertitel, UI
- **JetBrains Mono** (500, Versalien, +14 % Laufweite): Labels, Kapitel, URL

## Raster
1920×1080, 12 Spalten à 122 px, 24 px Spaltenabstand, 96 px Rand. Linien sichtbar (Tinte 7,5 %), Passkreuze an den Randecken.

## Formen
Harte Rechtecke für Bildfelder, Pillen (46 px) für Module, Karten mit 14 px Radius und geschichteten weichen Schatten. Menschen brechen oben aus ihrem Feld aus.

## Bewegung
- Nichts linear: Einrasten mit Nachfedern (back/spring), Versatz 40–60 ms zwischen Elementen
- Drei Ebenen mit Parallaxe: Raster langsam, Panels mittel, Menschen/UI schnell
- Zahlen zählen mit Easing, Durchstreichen zeichnet sich in 0,35 s
- Übergänge: harter Schnitt, Maske (Rasterfeld öffnet sich), Spalten-Wischen, Match Cut – nie zweimal derselbe hintereinander
- Schnitte auf Wort oder Takt (118 BPM)
- Untertitel immer unten links, aktives Wort in Signalgrün (LinkedIn spielt stumm ab)
