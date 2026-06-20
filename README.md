# IVT-systeem — tabellen + chatbot

Statische site die de vier IVT-scenariotabellen toont, met een Botpress-chatbot die bezoekers uitlegt hoe ze de tabellen lezen.

## Inhoud

- `index.html` — één pagina met vier tabbladen (Gunstregeling, Standaardregeling, Tijdlijn met/zonder gunst).
- `style.css` — opmaak (mobile-first, autiwiki-patroon).
- `app.js` — laadt de TSV's, rendert tabellen, tab-switching, rij-filter.
- `data/*.tsv` — de vier scenariotabellen (gekopieerd uit de generator-output).
- `botpress-kennisbank.md` — gesanitiseerde, PII-vrije kennisbank voor upload naar Botpress.

## Data-flow (single source of truth)

```
gen_ivt_schema.py  ─┐
                    ├─→  *.tsv  ─→  data/  ─→  app.js (fetch + render)
gen_ivt_timeline.py ─┘
```

De TSV's worden gegenereerd door (in `~/INFO/voor-karel/werk-inkomen/`):
- `gen_ivt_schema.py` → `ivt_schema_gunst.tsv` + `ivt_schema_standaard.tsv`
- `gen_ivt_timeline.py` → `ivt_tijdlijn_met_gunst.tsv` + `ivt_tijdlijn_zonder_gunst.tsv`

**Wijzig nooit de TSV's met de hand.** Wil je de tabellen aanpassen, pas dan de generator aan en draai `sync-data.sh` (hieronder).

## Tabellen bijwerken

```bash
./sync-data.sh
```

Kopieert de vier TSV's van `~/INFO/voor-karel/werk-inkomen/` naar `data/`. Draai dit na elke wijziging aan de generators.

## Lokaal bekijken

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Gewoon `index.html` openen via `file://` werkt niet — `fetch()` blokkeert dat. Gebruik dus een server of GitHub Pages.)

## Deploy (GitHub Pages)

1. Push naar de `gh-pages` branch (of activeer Pages op de `main` branch, `/root` folder).
2. GitHub Pages serveert de statische bestanden automatisch.
3. Verifieer met `curl` dat de tabellen laden: `curl -s https://<user>.github.io/ivt-systeem/data/ivt_schema_gunst.tsv | head -2`.

## Botpress integreren

1. Upload `botpress-kennisbank.md` naar je Botpress-bot als kennisbank-document.
2. Embed de webchat-widget: voeg het Botpress-`<script>`-snippet toe in `index.html` op de plek van `<div id="botpress-widget"></div>` (HITL: Karel levert de embed-keys na het aanmaken/instellen van de bot).

## Mandates

- **PII-vrij:** geen namen, geen dossiernummers, geen verwijzingen naar personen/instellingen. De kennisbank bevat enkel de generieke systeemmechaniek.
- **Geen secrets:** de service-account-sleutel voor Google Sheets staat nergens in deze repo. De site leest enkel lokale TSV's.
- **Cijfers 2026** — bij indexatie: generators aanpassen, `sync-data.sh` draaien, opnieuw deployen.
