#!/usr/bin/env python3
"""
Gradi produkcijsku verziju sajta iz `src/`.

    src/index.html     ->  index.html
    src/css/style.css  ->  css/style.css
    src/js/main.js     ->  js/main.js
    src/js/config.js   ->  js/config.js

Skida SVE komentare i visak praznih redova. Kod ostaje citljiv (ne minifikuje
se) — samo bez komentara, da se ne isporucuje interna dokumentacija.

Slike i snimci (`img/`, `media/`) se ne diraju: u njima nema sta da se skida.

Pokreni posle svake izmene u `src/`:

    python3 build.py

Ono sto je u korenu (index.html, css/, js/) je IZLAZ i prepisuje se — ne
menjaj te fajlove rucno, izmene idu u `src/`. GitHub Pages sluzi koren, pa
izlaz mora da bude u git-u (nije u .gitignore).
"""

import hashlib
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))

# Redosled je bitan: css i js se grade PRVI, da bi im se znao otisak kad
# se u html upisu `?v=` oznake. Zato je index.html poslednji.
JOBS = [
    ('src/css/style.css', 'css/style.css',  'css'),
    ('src/js/config.js',  'js/config.js',   'js'),
    ('src/js/main.js',    'js/main.js',     'js'),
    ('src/index.html',    'index.html',     'html'),
]

# Posle `return` i drustva `/` pocinje regex, a ne deljenje.
JS_KEYWORDS = {
    'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete',
    'void', 'throw', 'case', 'do', 'else', 'yield', 'await',
}


def tidy(text):
    """Skida prazan prostor koji ostane iza komentara."""
    text = re.sub(r'[ \t]+$', '', text, flags=re.M)   # repovi na krajevima redova
    text = re.sub(r'\n{3,}', '\n\n', text)            # najvise jedan prazan red
    return text.strip() + '\n'


def strip_js(src):
    """Skida // i /* */ komentare, ali NE dira stringove i regex literale.

    Stringovi se citaju PRVI — zato `https://` unutar stringa nikad ne bude
    procitan kao komentar. Regex literal se prepoznaje po prethodnom tokenu
    (posle `(`, `=`, `,`, ili kljucne reci `/` pocinje regex; posle imena,
    broja ili `)` je deljenje).
    """
    out = []
    i, n = 0, len(src)
    prev_char = ''        # zadnji znacajan znak
    prev_word = ''        # zadnja rec, ako je prethodni znak deo imena

    def regex_allowed():
        if prev_char == '':
            return True
        if prev_char in ')]}':
            return False
        if prev_char.isalnum() or prev_char in '_$':
            return prev_word in JS_KEYWORDS
        return True

    while i < n:
        c = src[i]

        # ---- komentar u jednom redu -------------------------------------
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            i = n if j == -1 else j            # \n ostaje, red se ne spaja
            continue

        # ---- blok komentar ----------------------------------------------
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            if j == -1:
                raise SyntaxError('nezatvoren /* komentar')
            # komentar se ponasa kao prazan prostor; ako je bio preko vise
            # redova, ostavi jedan \n da se redovi ne spoje u jedan
            out.append('\n' if '\n' in src[i:j] else ' ')
            i = j + 2
            continue

        # ---- string ('...' ili "...") -----------------------------------
        if c == '"' or c == "'":
            q = c
            out.append(c)
            i += 1
            while i < n:
                if src[i] == '\\':
                    out.append(src[i:i + 2])
                    i += 2
                    continue
                out.append(src[i])
                if src[i] == q:
                    i += 1
                    break
                i += 1
            prev_char, prev_word = q, ''
            continue

        # ---- template literal -------------------------------------------
        if c == '`':
            out.append(c)
            i += 1
            while i < n:
                if src[i] == '\\':
                    out.append(src[i:i + 2])
                    i += 2
                    continue
                out.append(src[i])
                if src[i] == '`':
                    i += 1
                    break
                i += 1
            prev_char, prev_word = '`', ''
            continue

        # ---- regex literal ----------------------------------------------
        if c == '/' and regex_allowed():
            out.append(c)
            i += 1
            in_class = False
            while i < n:
                ch = src[i]
                if ch == '\\':
                    out.append(src[i:i + 2])
                    i += 2
                    continue
                out.append(ch)
                i += 1
                if ch == '[':
                    in_class = True
                elif ch == ']':
                    in_class = False
                elif ch == '/' and not in_class:
                    break
                elif ch == '\n':
                    break                      # nije bio regex; ne davi se
            while i < n and (src[i].isalpha()):
                out.append(src[i])
                i += 1
            prev_char, prev_word = '/', ''
            continue

        # ---- obican znak -------------------------------------------------
        out.append(c)
        if not c.isspace():
            if c.isalnum() or c in '_$':
                prev_word = (prev_word + c) if (prev_char.isalnum() or prev_char in '_$') else c
            else:
                prev_word = ''
            prev_char = c
        i += 1

    return tidy(''.join(out))


def strip_css(src):
    """Skida /* */ komentare. CSS stringove cita prvo, kao i JS."""
    out = []
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            if j == -1:
                raise SyntaxError('nezatvoren /* komentar')
            out.append('\n' if '\n' in src[i:j] else ' ')
            i = j + 2
            continue
        if c == '"' or c == "'":
            q = c
            out.append(c)
            i += 1
            while i < n:
                if src[i] == '\\':
                    out.append(src[i:i + 2])
                    i += 2
                    continue
                out.append(src[i])
                if src[i] == q:
                    i += 1
                    break
                i += 1
            continue
        out.append(c)
        i += 1
    return tidy(''.join(out))


def strip_html(src):
    """Skida <!-- --> komentare, ali cuva <script> i <style> netaknute.

    Bez toga bi `<!--` u JS stringu (ili bilo koje `-->`) pomerilo granice
    komentara i pojelo pola dokumenta.
    """
    keep = []

    def stash(m):
        keep.append(m.group(0))
        return '\x00%d\x00' % (len(keep) - 1)

    guarded = re.sub(r'<(script|style)\b[^>]*>.*?</\1\s*>', stash, src,
                     flags=re.S | re.I)
    guarded = re.sub(r'<!--.*?-->', '', guarded, flags=re.S)
    restored = re.sub(r'\x00(\d+)\x00', lambda m: keep[int(m.group(1))], guarded)
    return tidy(restored)


def add_versions(html, versions):
    """Lepi `?v=<otisak>` na css i js u <link> i <script>.

    Bez ovoga gost koji je vec bio na sajtu posle izmene dobija staru css/js
    iz keša — pola sajta novo, pola staro. Otisak se racuna od SADRZAJA
    izgradjenog fajla, pa se adresa menja tacno onda kad se fajl promeni,
    i nijedan put vise.
    """
    for rel_out, ver in versions.items():
        pat = r'((?:href|src)=")(' + re.escape(rel_out) + r')(")'
        html = re.sub(pat, r'\1\2?v=' + ver + r'\3', html)
    return html


STRIPPERS = {'html': strip_html, 'css': strip_css, 'js': strip_js}


MANIFEST = os.path.join(ROOT, '.build-manifest.json')


def digest(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def load_manifest():
    try:
        with open(MANIFEST, encoding='utf-8') as fh:
            return json.load(fh)
    except (IOError, ValueError):
        return {}


def check_not_edited(p_out, rel_out, manifest, force):
    """Cuva od tihog gubitka posla.

    U izlazu nema komentara (pa ni natpisa „ne diraj ovaj fajl") — takav je
    dogovor. Zato se posle svakog build-a pamti otisak svakog izlaza. Ako se
    otisak na disku razlikuje od zapamcenog, taj fajl je menjan RUCNO u
    korenu — build bi to prepisao bez traga, pa radije stane.

    Vreme izmene se namerno NE gleda: izlaz je uvek noviji od izvora (tek
    je zapisan), pa bi provera po vremenu pucala na svakom pokretanju.
    """
    if force or rel_out not in manifest or not os.path.exists(p_out):
        return
    current = digest(open(p_out, encoding='utf-8').read())
    if current != manifest[rel_out]:
        sys.exit(
            '\nSTOP: `%s` je menjan rucno.\n'
            'Taj fajl je IZLAZ build-a i bio bi prepisan bez traga.\n'
            'Prebaci izmene u `src/`, pa pokreni ponovo.\n'
            'Ako izmene ne trebaju:  python3 build.py --force\n' % rel_out
        )


def main():
    force = '--force' in sys.argv
    manifest = load_manifest()
    fresh = {}
    versions = {}
    total_in = total_out = 0
    for rel_src, rel_out, kind in JOBS:
        p_src = os.path.join(ROOT, rel_src)
        p_out = os.path.join(ROOT, rel_out)
        if not os.path.exists(p_src):
            sys.exit('nema %s — da li si ga premestio u src/?' % rel_src)
        check_not_edited(p_out, rel_out, manifest, force)

        text = open(p_src, encoding='utf-8').read()
        built = STRIPPERS[kind](text)
        if kind == 'html':
            built = add_versions(built, versions)

        os.makedirs(os.path.dirname(p_out) or '.', exist_ok=True)
        with open(p_out, 'w', encoding='utf-8') as fh:
            fh.write(built)
        fresh[rel_out] = digest(built)
        if kind != 'html':
            versions[rel_out] = fresh[rel_out][:8]

        a, b = len(text.encode()), len(built.encode())
        total_in += a
        total_out += b
        print('  %-18s %7.1f KB -> %7.1f KB  (-%.0f%%)'
              % (rel_out, a / 1024, b / 1024, (a - b) / a * 100))

    with open(MANIFEST, 'w', encoding='utf-8') as fh:
        json.dump(fresh, fh, indent=2, sort_keys=True)

    print('  %-18s %7.1f KB -> %7.1f KB  (-%.0f%%)'
          % ('ukupno', total_in / 1024, total_out / 1024,
             (total_in - total_out) / total_in * 100))


if __name__ == '__main__':
    main()
