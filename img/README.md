# Slike

Sve slike su **privremene** (Pexels, besplatna licenca). Zameni ih svojim
fotografijama — zadrži ista imena fajlova i ništa u kodu ne treba menjati.

| Fajl | Gde se vidi | Preporučena veličina | Šta treba da bude na slici |
|---|---|---|---|
| `hero.jpg` | Prva slika, cela širina ekrana | 1500–1800 px široko (pejzaž) | Vas dvoje. Ostavi prazniji **levi deo** — tu stoji krem kartica sa imenima. |
| `story.jpg` | Sekcija „Naša priča" | 1000–1200 px široko (portret) | Vas dvoje, topliji kadar. Seče se na 4:5. |
| `sofija.jpg` | Sekcija „Sofija" | 1000–1200 px široko (portret) | Sofija. Seče se u oblik kapije (zaobljeno gore). |
| `band-1.jpg` | Traka posle „Naše priče" | 1500–1800 px široko (pejzaž) | Detalj — cveće, prstenje, dekoracija. |
| `band-2.jpg` | Traka pre RSVP forme | 1500–1800 px široko (pejzaž) | Tamniji, večernji kadar (preko njega ide citat). |
| `band-3.jpg` | Traka pre „Lokacije" | 1500–1800 px široko (pejzaž) | Sala / ambijent restorana. |
| `texture.jpg` | Podloga sekcije „Poziv" i mape | bilo koja | Tekstura papira. Ne menjaj bez potrebe. |

## Pre nego što ubaciš svoje slike

Smanji ih — telefoni troše mobilni internet. Cilj: **do 400 KB po slici**.
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
