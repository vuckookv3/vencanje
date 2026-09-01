/* =============================================================
   PODACI ZA SAJT  —  ovde se menja sve što nije tekst
   -------------------------------------------------------------
   Tekstove (priča, FAQ, poruke) menjaj u index.html.
   Ovde menjaj datum, adresu, telefone, hotele i RSVP link.
   ============================================================= */

window.CONFIG = {

  /* --- Ko se venčava ------------------------------------------------ */
  couple: {
    bride: 'Jelena',
    groom: 'Marko',
    child: 'Sofija'
  },

  /* --- Datum i vreme -----------------------------------------------
     Skup zvanica: 8. novembar 2026. u 15:00, srpsko vreme (CET, +01:00).
     Format mora ostati ovakav (ISO 8601 sa vremenskom zonom).          */
  startsAt: '2026-11-08T15:00:00+01:00',
  endsAt:   '2026-11-09T01:00:00+01:00',   // procena kraja, koristi se samo za kalendar
  ceremonyAt: '2026-11-08T16:00:00+01:00', // građansko venčanje

  /* --- Rok za potvrdu dolaska --------------------------------------- */
  rsvpDeadline: '2026-10-20',

  /* --- Mesto -------------------------------------------------------- */
  venue: {
    name: 'Restoran DIVINE',
    // TODO: PROVERI ADRESU I BROJ pre nego što podeliš sajt sa gostima.
    // Nađeno pretragom: Divine Sala, Živojina Lazića Solunca, Grdica, Kraljevo.
    address: 'Živojina Lazića Solunca, Grdica',
    city: '36000 Kraljevo',
    // Ovaj tekst ide u Google/Apple Maps pretragu — proveri da vodi na pravo mesto.
    mapQuery: 'Divine Sala, Živojina Lazića Solunca, Kraljevo',
    // TODO: proveri broj restorana (nađeno: +381 66 333-228)
    phone: '+381 66 333 228'
  },

  /* --- Kontakt telefoni za dugmiće ispod forme ----------------------
     TODO: zameni pravim brojevima. Format: +381 pa broj bez nule.
     Viber i WhatsApp linkovi se prave sami od ovog broja.              */
  contacts: [
    { name: 'Jelena', phone: '+381 60 155 3983' },
    { name: 'Marko',  phone: '+381 69 575 6772' }
  ],

  /* --- RSVP ---------------------------------------------------------
     TODO: nalepi /exec adresu Google Apps Script web app-a.
     Uputstvo je u README.md → "RSVP forma".
     Dok je prazno, forma radi u "demo" režimu: ispisuje podatke u
     konzolu i prikazuje poruku uspeha, ali ništa ne šalje.             */
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbyNnOxIJdAJTWHdzbI5x3nEzvxt5_Ub414iAoHPU-X0pWIc2PyDkxvVi7gc4Bem8OoOKA/exec',

  /* --- Smeštaj u Kraljevu -------------------------------------------
     TODO: proveri nazive, cene i telefone; dodaj ili obriši kartice.
     phone: '' → dugme "Pozovi" se ne prikazuje.                        */
  hotels: [
    {
      name: 'Hotel Kraljevo',
      note: 'U samom centru, 10 minuta autom do restorana.',
      phone: '',
      mapQuery: 'Hotel Kraljevo, Kraljevo'
    },
    {
      name: 'Hotel Turist',
      note: 'Blizu centra, povoljno i praktično za jedno noćenje.',
      phone: '',
      mapQuery: 'Hotel Turist, Kraljevo'
    },
    {
      name: 'Apartmani u centru',
      note: 'Ima ih dosta na Booking.com i Airbnb — najbolje rezervisati ranije.',
      phone: '',
      mapQuery: 'apartmani Kraljevo centar'
    }
  ]
};
