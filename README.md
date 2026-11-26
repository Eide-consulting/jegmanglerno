# jeg mangler

En norsk oppskriftsside for mat du kan lage uten en bestemt ingrediens,
bygget med Eleventy og utgangspunkt i
[Eide-consulting/Modern-web](https://github.com/Eide-consulting/Modern-web).

Du lager oppskriftene selv, eventuelt med KI utenfor nettsiden. Besøkende
leser ferdige oppskrifter og kan søke eller filtrere dem. Nettsiden har
ingen KI-motor, automatiske erstatningsforslag, database eller serverdel.
Prosjektet inneholder tre eksempeloppskrifter.

## Innhold

- [Kom i gang](#kom-i-gang)
- [Kommandoer og byggemapper](#kommandoer-og-byggemapper)
- [Legg inn en oppskrift](#legg-inn-en-oppskrift)
- [Oppdater eller slett en oppskrift](#oppdater-eller-slett-en-oppskrift)
- [Oppskriftsformat](#oppskriftsformat)
- [Publiser på webhotell](#publiser-på-webhotell)
- [Sikkerhet og skillet mellom lokalt og offentlig](#sikkerhet-og-skillet-mellom-lokalt-og-offentlig)
- [Prosjektstruktur](#prosjektstruktur)
- [Vanlige problemer](#vanlige-problemer)

## Kom i gang

Du trenger Node.js og npm. Bruk en vedlikeholdt LTS-versjon av Node.js;
Eleventy krever minst Node.js 18.

Kjør fra prosjektmappen:

```sh
npm ci
npm run serve
```

Åpne adressen som vises i terminalen, normalt http://localhost:8080/.
Hvis porten er opptatt, kan lokalserveren velge en annen port.
Stopp lokalserveren med Ctrl+C.

## Kommandoer og byggemapper

| Kommando | Formål | Resultat |
| --- | --- | --- |
| `npm ci` | Installer avhengighetene fra `package-lock.json`. | `node_modules/` |
| `npm run serve` | Lokal forhåndsvisning med oppskriftsverktøy. | `_preview/` |
| `npm run build` | Bygg den offentlige nettsiden uten oppskriftsverktøy. | `_site/` |
| `npm test` | Kjør tester for oppskriftsformat og publiseringsbygg. | Ingen publisering. |

**Bare innholdet i `_site/` skal lastes opp til webhotellet.**
`_preview/` er lokal forhåndsvisning og skal aldri publiseres.

## Legg inn en oppskrift

1. Start lokalserveren med `npm run serve`.
2. Åpne `/legg-inn/` på lokalserverens adresse.
3. Fyll inn navn, nettadresse, ingrediensen oppskriften er uten, kategori,
   beskrivelse, tid, porsjoner og illustrasjon.
4. Lim inn den ferdige oppskriften med ingredienser, fremgangsmåte,
   eventuelle tips og allergener.
5. Velg «Forhåndsvis teksten», og deretter «Last ned oppskriftsfil».
6. Flytt den nedlastede JSON-filen til `src/recipes/` i prosjektet.
7. Se oppskriften lokalt på `/oppskrift/<nettadresse>/`.
8. Bygg og last opp nettsiden som beskrevet under [Publiser på webhotell](#publiser-på-webhotell).

Verktøyet skriver ikke om oppskriften. Innholdet behandles som ren tekst,
ikke Markdown eller HTML. Linjeskift beholdes; innledende og avsluttende
blanktegn fjernes ved eksport.

Nedlastingen endrer verken prosjektet eller webhotellet. Skjemaet har
ingen automatisk lagring, så last ned filen før du lukker eller laster
siden på nytt.

## Oppdater eller slett en oppskrift

For å oppdatere: rediger den eksisterende JSON-filen, eller bruk
innleggingsverktøyet med samme nettadresse og erstatt den gamle filen
i `src/recipes/`. Bygg og last opp på nytt.

For å slette: fjern JSON-filen fra `src/recipes/`. Fjern også den gamle
oppskriftsmappen fra `_site/oppskrift/<nettadresse>/` og fra webhotellet.
Bygg og last opp på nytt.

Eleventy rydder ikke generelt bort alle sider som er fjernet fra
kildene. Vanlig filopplasting sletter heller ikke nødvendigvis gamle
filer på webhotellet. Ved endring av nettadressen gjelder samme opprydding
for den gamle adressen. Eventuelle videresendinger må settes opp på
webhotellet.

## Oppskriftsformat

Hver oppskrift ligger i en egen UTF-8-kodet JSON-fil i `src/recipes/`.
Det anbefales å bruke nettadressen som filnavn, for eksempel
`brun-saus-uten-kraft.json`. Filnavnet må ende med `.json`.

Se [`src/recipes/brun-saus-uten-kraft.json`](src/recipes/brun-saus-uten-kraft.json)
for et komplett eksempel. Alle feltene nedenfor er obligatoriske:

| Felt | Innhold og grenser |
| --- | --- |
| `title` | Oppskriftens navn, 1–120 tegn. |
| `slug` | Unik nettadresse, 1–120 tegn. Bare små bokstaver a–z, tall og enkeltstående bindestreker mellom ord. |
| `missingIngredient` | Ingrediensen oppskriften er uten, 1–60 tegn. Bruk små bokstaver og samme skrivemåte på tvers av oppskrifter, for eksempel `kraft`. |
| `description` | Kort beskrivelse til forsiden, 1–300 tegn. |
| `category` | Kategori som vises over tittelen, 1–60 tegn. |
| `minutes` | Tid i minutter, heltall mellom 1 og 1440. |
| `servings` | Antall porsjoner, heltall mellom 1 og 1440. |
| `illustration` | En av `kitchen`, `pancakes` eller `muffins`. |
| `content` | Hele oppskriften som ren tekst, 1–30000 tegn. |

I JSON lagres linjeskift som `\n`. Anførselstegn inne i tekst må
skrives som `\"`. Innleggingsverktøyet håndterer dette automatisk.

Oppskriftsfiler valideres under bygging. Ugyldig JSON, ugyldige felt
eller flere oppskrifter med samme `slug` stopper bygget.
Forsidens ingrediensfiltre hentes fra oppskriftsfilene.

## Publiser på webhotell

Nettsiden består av statiske filer. Webhotellet trenger ikke Node.js
eller npm; disse brukes bare lokalt for å bygge.

1. Lagre oppskriftsfilene i `src/recipes/`.
2. Kjør følgende fra prosjektmappen:

   ```sh
   npm test && npm run build
   ```

3. Fortsett bare hvis kommandoene fullfører uten feil.
4. Bruk SFTP/SCP eller webhotellets filbehandler til å laste opp
   **innholdet** i `_site/` til domenets webrot. Behold mappestrukturen:
   `index.html` skal ligge direkte i webroten, ikke i en ekstra
   `_site`-mappe.
5. Åpne forsiden og en oppskrift på domenet for å kontrollere opplastingen.
   `/legg-inn/` skal ikke vise innleggingsverktøyet.

Ikke last opp `_preview/`, `src/`, `node_modules/`, `.git/`,
`.env` eller hele prosjektmappen.

Prosjektet har ingen automatisk deploy eller lagrede
webhotellopplysninger. Webrot, overføringsmetode, HTTPS og bruk av
`404.html` må konfigureres hos webhotellleverandøren.
Ved eventuell CDN/bufring kan gamle sider også måtte fjernes fra cache.

### Hvis innleggingsverktøyet har vært offentlig tidligere

Slett disse gamle filene/mappene fra webhotellets webrot dersom de finnes:

```text
legg-inn/
assets/js/author.js
assets/js/recipe-tools.js
```

Last deretter opp det nye produksjonsbygget, inkludert den nye
`assets/js/app.js`. Oppryddingen i byggeprosessen gjelder lokale
byggemapper, ikke filer som allerede ligger på webhotellet.

## Sikkerhet og skillet mellom lokalt og offentlig

Innleggingsverktøyet aktiveres bare når Eleventy kjører i `serve`-modus,
som ved `npm run serve`. Lokal forhåndsvisning skrives til `_preview/`.
Vanlig bygging, også `--watch` uten `--serve`, utelater verktøyet.

Produksjonsbygget:

- utelater `src/author.njk` og lenken til `/legg-inn/`;
- kopierer ikke `author.js` eller `recipe-tools.js` til offentlig output;
- fjerner gamle innleggingsverktøyfiler fra den faktiske byggemappen;
- stopper med feil dersom disse innleggingsverktøyfilene likevel
  genereres i produksjonsbygget.

Skillet gjelder også ved overstyring av Eleventys output-mappe.
Bruk likevel standardkommandoene og publiser bare `_site/`.

Dette er **ikke innlogging eller tilgangskontroll**. Lokalserveren er et
utviklingsverktøy, ikke en beskyttet administrasjonstjeneste. Ikke
eksponer den mot internett eller del `_preview/` som offentlig nettside.
Et offentlig verktøy ville fortsatt ikke ha noen serverfunksjon som kan
skrive oppskrifter, men det skal ikke være del av publiseringsbygget.

Forhåndsvisningen bruker `textContent`. Publiserte oppskrifter
HTML-escapes av Nunjucks, slik at oppskriftstekst ikke tolkes som HTML
eller JavaScript. Felter og nettadresser valideres både ved eksport og
under bygging. Det er ingen API-nøkler som trengs for denne løsningen.

Dette beskytter ikke Git-kontoen, datamaskinen eller webhotellet.
Du må selv sikre publiseringstilgangene, bruke HTTPS og holde
avhengighetene oppdatert. Oppskriftenes innhold og allergenopplysninger
må vurderes før publisering; formatvalidering er ikke en matfaglig kontroll.

## Prosjektstruktur

```text
eleventy.config.js          Byggemoduser, maler og filkopiering
package.json               npm-kommandoer og avhengigheter
package-lock.json          Låste avhengigheter
src/
  _data/                   Oppskriftslasting og nettsteddata
  _includes/base.njk       Felles sidelayout
  recipes/                 Oppskrifter som JSON
  assets/css/style.css     Utseende og utskriftsstil
  assets/images/           Lokale SVG-illustrasjoner
  assets/js/app.js          Offentlig søk, filtre og utskrift
  assets/js/author.js       Lokalt innleggingsverktøy
  assets/js/recipe-tools.js Validering og eksportformat
  index.njk                Forside
  recipe.njk               Mal for hver oppskrift
  author.njk               Lokal /legg-inn/
  404.njk                  Feilside
test/                      Tester med Node.js sin testkjører
_preview/                  Generert lokalvisning; skal ikke publiseres
_site/                     Generert offentlig nettside
```

Testene dekker blant annet validering, norske nettadresser,
publisering fra JSON, HTML-escaping, separate byggemoduser,
gamle innleggingsverktøyfiler og overstyrte output-mapper.

## Vanlige problemer

### `/legg-inn/` finnes ikke

Det er forventet i produksjonsbygget. Start med `npm run serve` og
bruk lokalserverens adresse, ikke det offentlige domenet.

### Oppskriften vises ikke

Kontroller at den nedlastede filen faktisk er flyttet til
`src/recipes/` og har filendelsen `.json`. Se etter valideringsfeil
i terminalen. Bygg på nytt før opplasting; en fil i Nedlastinger-mappen
er ikke publisert.

### Byggingen stopper med «Publisering stoppet»

Ikke last opp et bygg som feiler. Meldingen betyr at innleggingsverktøyet
ble funnet i produksjonsoutput. Kontroller endringer i
`eleventy.config.js`, maler og filkopiering før du bygger på nytt.

### npm får tilgangsfeil i sin cache

Bruk prosjektets egen cache i stedet for å endre eierskap på globale filer:

```sh
npm ci --cache .npmcache
```

`.npmcache/` er ignorert av Git og skal ikke publiseres.
