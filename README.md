# Jelena, Marko i Sofija — 08.11.2026.

Jednostrani sajt za venčanje i Sofijin prvi rođendan.
Čist HTML/CSS/JS, bez build-a i bez npm-a. Hostuje se besplatno na GitHub Pages.

```
index.html        sav tekst (ovde menjaj priču, FAQ, poruke)
real/index.html   ista strana, placeholder slike (vidi sekciju 6)
css/style.css     dizajn
js/config.js      datum, adresa, telefoni, hoteli, RSVP link  ← ovde menjaj podatke
js/main.js        logika (odbrojavanje, kalendar, forma, animacije)
img/              prave fotografije (vidi img/README.md)
img-stock/        placeholder fotografije sa Pexels-a, za /real
apps-script/      kod za Google tabelu sa prijavama
```

---

## 1. Pokretanje lokalno

```bash
cd wedding
python3 -m http.server 8000
```

Otvori <http://localhost:8000>. (Ne otvaraj `index.html` duplim klikom — mapa i
fontovi rade lošije preko `file://`.)

---

## 2. Šta OBAVEZNO promeniti pre deljenja

Sve je u `js/config.js`, označeno sa `TODO`:

1. **Adresa restorana** — `venue.address`, `venue.city`, `venue.mapQuery`.
   Trenutno stoji ono što je nađeno pretragom (*Divine Sala, Živojina Lazića
   Solunca, Grdica, Kraljevo*). **Proveri da „Navigacija" vodi na pravo mesto**
   pre nego što pošalješ link gostima.
2. **Telefoni** — `contacts`. Sada su `+381 60 000 0000` (placeholder).
3. **RSVP link** — `rsvpEndpoint` (vidi sekciju 3).
4. **Hoteli** — `hotels`: proveri nazive i dodaj telefone.

Opciono: tekst „Naše priče" i Sofijine sekcije u `index.html` (traži `TODO`),
i slike u `img/` (vidi `img/README.md`).

---

## 3. RSVP forma → Google tabela

Dok je `rsvpEndpoint` prazan, forma radi u **demo režimu**: ponaša se normalno,
ispisuje podatke u konzolu browsera, ali ništa ne šalje. Kad budeš spreman:

1. Napravi novu **Google tabelu** (sheets.new).
2. U njoj: **Extensions → Apps Script**.
3. Obriši sve iz `Code.gs` i nalepi sadržaj `apps-script/Code.gs` iz ovog repoa.
4. (Opciono) upiši svoj mejl u `NOTIFY_EMAIL` da dobijaš obaveštenje za svaku prijavu.
5. **Deploy → New deployment → Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**  ← bez ovoga forma ne radi
6. Odobri dozvole kad Google pita (klikni *Advanced → Go to project*).
7. Kopiraj **Web app URL** (završava se na `/exec`) i nalepi ga u
   `js/config.js` → `rsvpEndpoint`.
8. Otvori tu `/exec` adresu u browseru — treba da piše `{"ok":true,...}`.

> **Najčešća greška:** kad kasnije promeniš `Code.gs`, moraš ponovo
> **Deploy → Manage deployments → Edit (olovka) → Version: New version → Deploy**.
> Bez nove verzije Google i dalje servira stari kod i izgleda kao da je forma „pukla".

Prijave stižu u list **„Prijave"**: vreme, ime, dolazi/ne dolazi, broj gostiju.

---

## 4. Objavljivanje na GitHub Pages

```bash
git add -A
git commit -m "Sajt za vencanje"
gh repo create wedding --public --source=. --push     # ili napravi repo na github.com
```

Pa na GitHubu: **Settings → Pages → Source: Deploy from a branch →
Branch: `main`, folder: `/ (root)` → Save**.

Za minut-dva sajt je na `https://<korisnik>.github.io/wedding/`.

Fajl `.nojekyll` je već tu i sprečava da GitHub pokušava Jekyll obradu.

### Svoj domen (opciono)

```bash
echo "vencanje.example.rs" > CNAME
```

Pa kod registrara napravi `CNAME` zapis ka `<korisnik>.github.io`
(ili `A` zapise na GitHub IP adrese), i u **Settings → Pages** upiši domen.

---

## 6. Dve verzije sajta: `/` i `/real`

Sajt postoji u dve verzije. **Tekst, dizajn, forma i podaci su im identični** —
razlikuju se samo fotografije:

| adresa | fotografije | folder |
|---|---|---|
| `/` | prave — vi, Sofija, sala | `img/` |
| `/real` | placeholder sa Pexels-a | `img-stock/` |

Sve ostalo — `css/`, `js/`, `config.js`, `favicon.svg` — dele obe verzije, pa se
menja na jednom mestu.

### Ako menjaš tekst, menjaj ga u OBA fajla

`index.html` i `real/index.html` su dva nezavisna fajla. Promena teksta, sekcije
ili FAQ-a u jednom **ne prelazi sama** u drugi. Najlakše: promeni `index.html`,
pa isti taj deo prekopiraj u `real/index.html`.

Razlikuju se **samo** u ovih pet stvari (ništa drugo ne treba menjati):

| | `index.html` | `real/index.html` |
|---|---|---|
| putanje do css/js/favicon | `css/style.css` | `../css/style.css` |
| folder sa slikama | `img/…` | `../img-stock/…` |
| `<body>` | `<body>` | `<body class="v-stock">` |
| traka sa salom | `class="band band--venue"` | `class="band band--dark"` |
| `alt` i `width`/`height` na 4 slike | opis pravih slika | opis placeholdera |

Klasa `v-stock` na `<body>`-ju je bitna: zbog nje hero na `/real` dobija svoj
kadar i filter (u `css/style.css` traži `v-stock`). Bez nje bi placeholder hero
bio kadriran kao porodična fotografija.

Ako ti se dupliranje ikad smori: kada zameniš i preostale dve placeholder slike
svojim, `/real` verovatno više nije potrebna — obriši folder `real/`,
`img-stock/` i `v-stock` pravilo iz CSS-a.

> **Pre nego što pošalješ link gostima:** `/` je verzija sa privatnim
> fotografijama. Ako gosti treba da vide onu drugu, ili zameni slike u `img/`,
> ili mi reci pa da obrnemo — da `/` bude pristojna verzija, a šala na drugoj adresi.

---

## 5. Sitnice koje je dobro znati

- **Odbrojavanje** čita `startsAt` iz configa. Kad datum prođe, samo se
  zameni porukom — ne prikazuje negativne brojeve.
- **„Dodaj u kalendar"** vodi direktno na Google kalendar, bez menija. Link se
  pravi iz `config.js` (datum, mesto), pa se datum menja samo na jednom mestu.
  Isprobane su i `.ics` i `webcal://` opcije za Apple/Outlook — na iPhone-u su
  završavale kao fajl bez imena ili nisu radile — pa su izbačene.
  *Napomena:* da bi gost sačuvao događaj, mora biti prijavljen na Google račun.
  Ako se pokaže da je to problem za goste sa iPhone-a, `.ics` opcija se može
  vratiti.
- **Sve fotografije se učitavaju odmah** sa stranom (nema `loading="lazy"`), pa
  ne „uskaču" dok gost skroluje. Cena: ~1,3 MB slika na prvo otvaranje. Hero
  ima `fetchpriority="high"` i `preload`, pa se on i dalje prvi pojavi.
  Zato je važno da slike u `img/` ostanu male — vidi `img/README.md`.
- **Mapa** je jedini izuzetak: ne učitava se odmah (~800 KB) nego kada gost
  skroluje blizu sekcije „Lokacija".
- **„Već ste potvrdili"** se pamti u `localStorage` tog telefona. Nije zaključano:
  postoji dugme „Prijavi ponovo".
- **Animacije** se same isključuju ako gost u telefonu ima uključeno
  *Reduce Motion*.
- **Bez predloga za prevod:** u `index.html` je `<meta name="google" content="notranslate">`,
  pa Chrome ne izbacuje traku „Prevedi stranu?" gostima čiji je telefon na
  engleskom/nemačkom. Gost i dalje može ručno da prevede ako želi (desni klik →
  Prevedi). Ako želiš da i to onemogućiš, dodaj `translate="no"` na `<html>` tag —
  ali onda rodbina iz inostranstva nema opciju prevoda.
- Slike su privremene, sa Pexels-a (besplatna licenca, bez obaveze potpisa).
- **Keširanje:** posle promene u `config.js` ili slikama, GitHub Pages i
  browseri gostiju drže staru verziju još ~10 minuta. Ako ti treba da se
  promena vidi odmah (npr. ispravka adrese), u `index.html` promeni
  `<script src="js/config.js">` u `js/config.js?v=2` (pa `v=3` sledeći put).
