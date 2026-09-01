/**
 * RSVP prijemnik za sajt „Jelena, Marko i Sofija" (08.11.2026.)
 * ---------------------------------------------------------------
 * Ovaj fajl se NE koristi na sajtu — nalepi ga u Google Apps Script
 * (uputstvo je u README.md, sekcija „RSVP forma").
 *
 * Svaka prijava sa sajta dodaje jedan red u tabelu.
 */

var SHEET_NAME    = 'Prijave';
var NOTIFY_EMAIL  = '';   // npr. 'marko@primer.com' — ostavi prazno ako ne želiš mejl

/* ---------- prijem prijave sa sajta ---------- */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // zamka za botove: ako je polje popunjeno, tiho odbaci
    if (data.website) return json({ ok: true });

    var sheet = getSheet();
    sheet.appendRow([
      new Date(),
      String(data.ime     || '').slice(0, 120),
      String(data.dolazak || '').slice(0, 40),
      String(data.gosti   || ''),
      String(data.poslato || '')
    ]);

    notify(data);
    return json({ ok: true });

  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/* ---------- otvaranje /exec adrese u browseru ---------- */
function doGet() {
  return json({ ok: true, message: 'RSVP endpoint radi.' });
}

/* ---------- pomoćne ---------- */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Vreme prijema', 'Ime i prezime', 'Dolazak', 'Broj gostiju', 'Poslato (sa sajta)']);
    sh.setFrozenRows(1);
    sh.setColumnWidth(2, 220);
  }
  return sh;
}

function notify(data) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'Nova prijava: ' + (data.ime || '?') + ' — ' + (data.dolazak || '?'),
      body: 'Ime: '     + (data.ime || '') + '\n' +
            'Dolazak: ' + (data.dolazak || '') + '\n' +
            'Gostiju: ' + (data.gosti || '') + '\n'
    });
  } catch (err) {
    // mejl nije uspeo, ali red je već upisan — ne prekidaj
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Pokreni ručno jednom da proveriš da tabela i zaglavlje postoje. */
function test() {
  getSheet();
  Logger.log('OK — list „' + SHEET_NAME + '" je spreman.');
}
