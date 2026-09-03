# Slike

Prave fotografije: `hero.jpg`, `story.jpg`, `sofija.jpg` i `band-3.jpg` (sala). Ostale su **privremene**
(Pexels, besplatna licenca) — zameni ih svojim: zadrži ista imena fajlova i
ništa u kodu ne treba menjati.

Slike ne moraju biti tačno u dole navedenim proporcijama — `object-fit: cover`
sam kadrira. Bitno je da glavni motiv nije skroz na ivici.

| Fajl | Gde se vidi | Preporučena veličina | Šta treba da bude na slici |
|---|---|---|---|
| `hero.jpg` | Prva slika, cela širina ekrana | **prava fotografija** (1200×900, 4:3) | Jelena i Marko pored bazena. Kadar i `object-position: 57% 25%` su izračunati tako da oba lica ostanu u kadru i desno od svetle kartice — ako menjaš sliku, proveri oba, i to na 2560×1080 (najmanje mesta iznad glava) i na 360×800 (najuži prozor). |
| `story.jpg` | Sekcija „Naša priča" | **prava fotografija** (856×1070, 4:5) | Jelena i Marko na brodu. Izrezano iz Instagram screenshot-a — bez statusne trake, imena profila, značke „1/8", lajkova i komentara. |
| `sofija.jpg` | Sekcija „Sofija" | **prava fotografija** (860×1075, 4:5) | Sofija. Seče se u oblik kapije (zaobljeno gore) — ostavi prostor iznad glave I centriraj lice po horizontali, inače luk odseče kosu sa strane. |
| `band-2.jpg` | Traka pre RSVP forme | 1500–1800 px široko (pejzaž) | Tamniji, večernji kadar (preko njega ide citat). |
| `band-3.jpg` | Traka pre „Lokacije" | **prava fotografija** (1537×1023) | Svečana sala restorana DIVINE, spremna za svadbu. |
| `texture.jpg` | Podloga sekcije „Poziv" i mape | bilo koja | Tekstura papira. Ne menjaj bez potrebe. |

## Pre nego što ubaciš svoje slike

Smanji ih — telefoni troše mobilni internet. Cilj: **do 300 KB po slici**.

Ovo je sada važnije nego ranije: sve slike se učitavaju odmah sa stranom (da ne
„uskaču" pri skrolovanju), pa se njihova veličina sabira na prvom otvaranju.
Trenutno je to ~1,0 MB ukupno.
Na Macu, iz ovog foldera:

```bash
# smanji na 1800px širine i snimi kao JPG kvaliteta ~72
sips -Z 1800 hero.jpg --out hero.jpg
```

`sips` samo menja dimenzije — za pravu kompresiju koristi squoosh.app ili
ImageOptim, pa vrati fajl u ovaj folder pod istim imenom.

Ako promeniš proporcije slike, u `index.html` ispravi i `width`/`height`
na odgovarajućem `<img>` tagu (sprečava „poskakivanje" strane pri učitavanju).

Trenutno stanje: sve slike zajedno ~1.0 MB (`du -sh .`).
