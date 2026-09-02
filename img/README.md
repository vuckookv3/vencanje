# Slike

Prave fotografije: `hero.jpg`, `story.jpg`, `sofija.jpg` i `band-3.jpg` (sala). Ostale su **privremene**
(Pexels, besplatna licenca) — zameni ih svojim: zadrži ista imena fajlova i
ništa u kodu ne treba menjati.

Slike ne moraju biti tačno u dole navedenim proporcijama — `object-fit: cover`
sam kadrira. Bitno je da glavni motiv nije skroz na ivici.

| Fajl | Gde se vidi | Preporučena veličina | Šta treba da bude na slici |
|---|---|---|---|
| `hero.jpg` | Prva slika, cela širina ekrana | **prava fotografija** (1200×900, 4:3) | Jelena, Marko i Sofija ispod rascvetalog drveta. Kadar i `object-position: 52% 58%` su izračunati tako da porodica ostane cela u kadru i desno od krem kartice — ako menjaš sliku, proveri oba. |
| `story.jpg` | Sekcija „Naša priča" | **prava fotografija** (960×1200, 4:5) | Kadrirano iz pejzažne slike — puna visina, odrezano levo/desno da utičnice ostanu van kadra. |
| `sofija.jpg` | Sekcija „Sofija" | **prava fotografija** (1000×1250, 4:5) | Sofija. Seče se u oblik kapije (zaobljeno gore) — ostavi malo prostora iznad glave da je luk ne „odseče". |
| `band-1.jpg` | Traka posle „Naše priče" | 1500–1800 px široko (pejzaž) | Detalj — cveće, prstenje, dekoracija. |
| `band-2.jpg` | Traka pre RSVP forme | 1500–1800 px široko (pejzaž) | Tamniji, večernji kadar (preko njega ide citat). |
| `band-3.jpg` | Traka pre „Lokacije" | **prava fotografija sale** (800×800) | Svečana sala restorana DIVINE. Ako nađeš verziju u većoj rezoluciji (1600 px+), zameni je — na velikim ekranima je trenutna malo mekša. |
| `texture.jpg` | Podloga sekcije „Poziv" i mape | bilo koja | Tekstura papira. Ne menjaj bez potrebe. |

## Pre nego što ubaciš svoje slike

Smanji ih — telefoni troše mobilni internet. Cilj: **do 300 KB po slici**.

Ovo je sada važnije nego ranije: sve slike se učitavaju odmah sa stranom (da ne
„uskaču" pri skrolovanju), pa se njihova veličina sabira na prvom otvaranju.
Trenutno je to ~1,3 MB ukupno.
Na Macu, iz ovog foldera:

```bash
# smanji na 1800px širine i snimi kao JPG kvaliteta ~72
sips -Z 1800 hero.jpg --out hero.jpg
```

`sips` samo menja dimenzije — za pravu kompresiju koristi squoosh.app ili
ImageOptim, pa vrati fajl u ovaj folder pod istim imenom.

Ako promeniš proporcije slike, u `index.html` ispravi i `width`/`height`
na odgovarajućem `<img>` tagu (sprečava „poskakivanje" strane pri učitavanju).

Trenutno stanje: sve slike zajedno ~1.1 MB (`du -sh .`).
