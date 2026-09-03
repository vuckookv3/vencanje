# Jelena, Marko i Sofija — 08.11.2026.

Jednostrani sajt za venčanje i Sofijin prvi rođendan.
Čist HTML/CSS/JS, bez npm-a i bez ijedne zavisnosti. Hostuje se besplatno na
GitHub Pages. Jedini „build" je `build.py` — obična Python skripta.

**Menja se ono u `src/`. Ono u korenu je izlaz i prepisuje se.**

```
src/index.html      sav tekst (ovde menjaj priču, poruke)   ← MENJAJ OVDE
src/css/style.css   dizajn                                   ← MENJAJ OVDE
src/js/config.js    datum, adresa, telefoni, hoteli, RSVP    ← MENJAJ OVDE
src/js/main.js      logika (odbrojavanje, kalendar, forma)   ← MENJAJ OVDE

build.py            skida komentare i pravi verziju za goste
index.html          IZLAZ — ne diraj, prepisuje se
css/, js/           IZLAZ — ne diraj, prepisuju se

img/                fotografije (vidi img/README.md)
media/              video koverte, intro video, muzika
apps-script/        kod za Google tabelu sa prijavama
```

### Kako se pravi verzija za goste

```bash
python3 build.py
```

Skida sve komentare (~37% manje koda) i na `css`/`js` linkove zalepi otisak
sadržaja (`style.css?v=1cd467c2`), da gostima koji su već bili na sajtu ne
ostane stara verzija u kešu.

GitHub Pages služi koren, pa **izlaz mora da ide u git** zajedno sa `src/`.
Redosled je uvek: izmeni `src/` → `python3 build.py` → commit.

Ako slučajno izmeniš fajl u korenu, build to primeti i stane pre nego što
prepiše izmene (pamti otisak svakog izlaza u `.build-manifest.json`).

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

Sve je u `src/js/config.js`, označeno sa `TODO`:

1. **Adresa restorana** — `venue.address`, `venue.city`, `venue.mapQuery`.
   Trenutno stoji ono što je nađeno pretragom (*Divine Sala, Živojina Lazića
   Solunca, Grdica, Kraljevo*). **Proveri da „Navigacija" vodi na pravo mesto**
   pre nego što pošalješ link gostima.
2. **Telefoni** — `contacts`. Sada su `+381 60 000 0000` (placeholder).
3. **RSVP link** — `rsvpEndpoint` (vidi sekciju 3).
4. **Hoteli** — `hotels`: proveri nazive i dodaj telefone.

Opciono: tekst „Naše priče" i Sofijine sekcije u `src/index.html` (traži `TODO`),
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
   `src/js/config.js` → `rsvpEndpoint`.
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
- **Lebdeće dugme „Potvrdi dolazak"** (dole na ekranu) pojavi se kad gost
  skroluje do sekcije „Program", a sakrije se kad stigne do same forme. U
  hero-u namerno NEMA RSVP dugmeta — da gost prvo vidi stranu, a ne da
  jednim klikom preskoči sve. Kome se ne čeka, prečica je i dalje u meniju.
  Gost koji je već potvrdio (pamti se u `localStorage`) ne vidi traku.
  Prag i logika: `src/js/main.js` → `initRsvpBar`.
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
- **Bez predloga za prevod:** u `src/index.html` je `<meta name="google" content="notranslate">`,
  pa Chrome ne izbacuje traku „Prevedi stranu?" gostima čiji je telefon na
  engleskom/nemačkom. Gost i dalje može ručno da prevede ako želi (desni klik →
  Prevedi). Ako želiš da i to onemogućiš, dodaj `translate="no"` na `<html>` tag —
  ali onda rodbina iz inostranstva nema opciju prevoda.
- Slike su privremene, sa Pexels-a (besplatna licenca, bez obaveze potpisa).
- **Keširanje:** `build.py` sam lepi otisak sadržaja na `css` i `js`
  (`config.js?v=ce3347fa`), pa gost posle tvoje izmene odmah dobija novu
  verziju — ne treba više ručno dizati `?v=2`. Za **slike** to i dalje ne
  važi: ako zameniš sliku pod istim imenom, keš zna da je drži još ~10
  minuta; ili sačekaj, ili je nazovi drugačije.
