# Betrieb Zukunft – YouTube-/Google-Ads (freigegeben)

Ziel: kostenloses Erstgespräch. Sprecher: Theo (ElevenLabs, eleven_v4), Take 1, +5 % Tempo. 118 BPM, Sie-Ansprache.

| Spot | Länge | Formate | Sprechtext |
|---|---|---|---|
| A | 30 s (überspringbar) | 16:9, 9:16 (Shorts) | Personaldienstleister? Sie zahlen jeden Monat Tausende für Software, die Ihnen nicht gehört. / Betrieb Zukunft zeigt Ihnen, wie Sie Ihre eigene bauen. / Bewerbermanagement, WhatsApp-Bot, Stundenzettel, digitale Einstellung, KI-Agenten – zugeschnitten auf Ihren Betrieb. / Bei einem Personaldienstleister in Hamburg: statt rund viertausend Euro im Monat – selbst gebaut unter fünfhundert. / Betrieb Zukunft. Jetzt kostenloses Erstgespräch buchen. |
| B | 15 s (auch nicht überspringbar) | 16:9 | Personaldienstleister? Schluss mit teurer Software, die Ihnen nicht gehört. / Bewerbermanagement, WhatsApp-Bot, Stundenzettel – selbst gebaut, zugeschnitten auf Ihren Betrieb. / Betrieb Zukunft. Jetzt kostenloses Erstgespräch buchen. |
| C | 6 s (Bumper) | 16:9 | Software, die Ihnen gehört. Betrieb Zukunft. |

Regeln für YouTube: Hook + Zielgruppe ab Bild 1, Marke im Bild ab Bild 1 und gesprochen bis 0:06; kein QR-Code (Klick läuft über den Anzeigen-Link); 9:16 hält unteres Viertel und rechten Rand für die Shorts-Bedienelemente frei.

Bauen: `python3 tools/make_ad_timing.py` → `node render/ad_render.js <a|b|c> <169|916> out/ad_x.mp4` → `python3 audio/ad_audio.py <spot>` → `audio/ad_mix.sh <spot>`.
