/* The pages account emails link to: "Email confirmed" and "Set a new password".
 *
 * GoTrue sends people here with the result in the URL fragment:
 *   #access_token=…&type=signup | recovery     on success
 *   #error=…&error_code=otp_expired&…           on an expired or used link
 * The token is read once and taken out of the address bar straight away, so
 * it is not left in history or in a screenshot.
 *
 * The new password goes to our own API, not to Supabase, so the site holds no
 * project key. */
(function () {
  var API = 'https://ziing-api-1034202494699.europe-west1.run.app';

  var T = {
    en: {
      confirmedTitle: 'Your email is confirmed',
      confirmedBody: 'Thank you. Open Goomee on your phone and sign in with your email and password.',
      confirmExpiredTitle: 'This link has expired',
      confirmExpiredBody: 'Confirmation links work once, for a limited time. Open Goomee, try to sign in, and tap “Send the email again” to get a new one.',
      resetTitle: 'Set a new password',
      resetIntro: 'Choose a new password for your Goomee account.',
      newPassword: 'New password',
      repeatPassword: 'Repeat the new password',
      hint: 'At least 8 characters.',
      save: 'Save new password',
      saving: 'Saving…',
      tooShort: 'The password needs at least 8 characters.',
      mismatch: 'The two passwords are not the same.',
      samePassword: 'That is your current password. Choose a different one.',
      resetDone: 'Your password is changed. Open Goomee and sign in with the new one.',
      resetExpiredTitle: 'This link has expired',
      resetExpiredBody: 'Reset links work once, for a limited time. In Goomee, tap “Forgot password?” to get a new one.',
      busy: 'Too many attempts. Wait a minute and try again.',
      failed: 'Something went wrong. Check your connection and try again.',
      showPassword: 'Show password',
      hidePassword: 'Hide password'
    },
    nl: {
      confirmedTitle: 'Je e-mailadres is bevestigd',
      confirmedBody: 'Bedankt. Open Goomee op je telefoon en log in met je e-mailadres en wachtwoord.',
      confirmExpiredTitle: 'Deze link is verlopen',
      confirmExpiredBody: 'Een bevestigingslink werkt één keer, en maar een tijdje. Open Goomee, probeer in te loggen en tik op ‘Stuur de e-mail opnieuw’ voor een nieuwe.',
      resetTitle: 'Kies een nieuw wachtwoord',
      resetIntro: 'Kies een nieuw wachtwoord voor je Goomee-account.',
      newPassword: 'Nieuw wachtwoord',
      repeatPassword: 'Herhaal het nieuwe wachtwoord',
      hint: 'Minstens 8 tekens.',
      save: 'Nieuw wachtwoord opslaan',
      saving: 'Bezig met opslaan…',
      tooShort: 'Het wachtwoord moet minstens 8 tekens hebben.',
      mismatch: 'De twee wachtwoorden zijn niet hetzelfde.',
      samePassword: 'Dat is je huidige wachtwoord. Kies een ander.',
      resetDone: 'Je wachtwoord is gewijzigd. Open Goomee en log in met het nieuwe.',
      resetExpiredTitle: 'Deze link is verlopen',
      resetExpiredBody: 'Een resetlink werkt één keer, en maar een tijdje. Tik in Goomee op ‘Wachtwoord vergeten?’ voor een nieuwe.',
      busy: 'Te veel pogingen. Wacht een minuut en probeer opnieuw.',
      failed: 'Er ging iets mis. Controleer je verbinding en probeer opnieuw.',
      showPassword: 'Wachtwoord tonen',
      hidePassword: 'Wachtwoord verbergen'
    },
    fr: {
      confirmedTitle: 'Votre adresse e-mail est confirmée',
      confirmedBody: 'Merci. Ouvrez Goomee sur votre téléphone et connectez-vous avec votre adresse e-mail et votre mot de passe.',
      confirmExpiredTitle: 'Ce lien a expiré',
      confirmExpiredBody: 'Un lien de confirmation ne fonctionne qu’une fois, pendant un temps limité. Ouvrez Goomee, essayez de vous connecter et touchez « Renvoyer l’e-mail » pour en recevoir un nouveau.',
      resetTitle: 'Choisir un nouveau mot de passe',
      resetIntro: 'Choisissez un nouveau mot de passe pour votre compte Goomee.',
      newPassword: 'Nouveau mot de passe',
      repeatPassword: 'Répétez le nouveau mot de passe',
      hint: 'Au moins 8 caractères.',
      save: 'Enregistrer le mot de passe',
      saving: 'Enregistrement…',
      tooShort: 'Le mot de passe doit comporter au moins 8 caractères.',
      mismatch: 'Les deux mots de passe ne sont pas identiques.',
      samePassword: 'C’est votre mot de passe actuel. Choisissez-en un autre.',
      resetDone: 'Votre mot de passe a été modifié. Ouvrez Goomee et connectez-vous avec le nouveau.',
      resetExpiredTitle: 'Ce lien a expiré',
      resetExpiredBody: 'Un lien de réinitialisation ne fonctionne qu’une fois, pendant un temps limité. Dans Goomee, touchez « Mot de passe oublié ? » pour en recevoir un nouveau.',
      busy: 'Trop de tentatives. Attendez une minute et réessayez.',
      failed: 'Une erreur est survenue. Vérifiez votre connexion et réessayez.',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe'
    },
    de: {
      confirmedTitle: 'Deine E-Mail-Adresse ist bestätigt',
      confirmedBody: 'Danke. Öffne Goomee auf deinem Handy und melde dich mit deiner E-Mail-Adresse und deinem Passwort an.',
      confirmExpiredTitle: 'Dieser Link ist abgelaufen',
      confirmExpiredBody: 'Ein Bestätigungslink funktioniert nur einmal und nur eine Zeit lang. Öffne Goomee, versuche dich anzumelden, und tippe auf „E-Mail erneut senden“, um einen neuen zu bekommen.',
      resetTitle: 'Neues Passwort festlegen',
      resetIntro: 'Wähle ein neues Passwort für dein Goomee-Konto.',
      newPassword: 'Neues Passwort',
      repeatPassword: 'Neues Passwort wiederholen',
      hint: 'Mindestens 8 Zeichen.',
      save: 'Neues Passwort speichern',
      saving: 'Wird gespeichert…',
      tooShort: 'Das Passwort braucht mindestens 8 Zeichen.',
      mismatch: 'Die beiden Passwörter sind nicht gleich.',
      samePassword: 'Das ist dein aktuelles Passwort. Wähle ein anderes.',
      resetDone: 'Dein Passwort ist geändert. Öffne Goomee und melde dich mit dem neuen an.',
      resetExpiredTitle: 'Dieser Link ist abgelaufen',
      resetExpiredBody: 'Ein Link zum Zurücksetzen funktioniert nur einmal und nur eine Zeit lang. Tippe in Goomee auf „Passwort vergessen?“, um einen neuen zu bekommen.',
      busy: 'Zu viele Versuche. Warte eine Minute und versuche es noch einmal.',
      failed: 'Etwas ist schiefgelaufen. Prüfe deine Verbindung und versuche es noch einmal.',
      showPassword: 'Passwort anzeigen',
      hidePassword: 'Passwort verbergen'
    }
  };

  var code = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').slice(0, 2).toLowerCase();
  var lang = T[code] ? code : 'en';
  var t = T[lang];
  document.documentElement.lang = lang;

  function params() {
    var out = {};
    var raw = (location.hash || '').replace(/^#/, '') + '&' + (location.search || '').replace(/^\?/, '');
    raw.split('&').forEach(function (pair) {
      if (!pair) return;
      var i = pair.indexOf('=');
      var k = decodeURIComponent(i < 0 ? pair : pair.slice(0, i));
      var v = i < 0 ? '' : decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '));
      out[k] = v;
    });
    return out;
  }

  var p = params();
  // Out of the address bar before anything else happens.
  if (location.hash || location.search) {
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
  }

  function text(id, value) { var el = document.getElementById(id); if (el) el.textContent = value; }
  function show(id, visible) { var el = document.getElementById(id); if (el) el.hidden = !visible; }
  document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t[el.getAttribute('data-t')]; });

  var page = document.body.getAttribute('data-account-page');

  if (page === 'confirmed') {
    var failed = p.error || p.error_code;
    text('title', failed ? t.confirmExpiredTitle : t.confirmedTitle);
    text('body', failed ? t.confirmExpiredBody : t.confirmedBody);
    document.title = (failed ? t.confirmExpiredTitle : t.confirmedTitle) + ' | Goomee';
    return;
  }

  if (page !== 'reset') return;
  document.title = t.resetTitle + ' | Goomee';
  var token = p.access_token;

  if (!token || p.error || p.error_code || (p.type && p.type !== 'recovery')) {
    text('title', t.resetExpiredTitle);
    text('body', t.resetExpiredBody);
    show('reset-form', false);
    return;
  }

  var form = document.getElementById('reset-form');

  // Show or hide what was typed. Each field has its own eye button; the
  // label says what a press will do, in the page's language.
  form.querySelectorAll('.pw-toggle').forEach(function (btn) {
    var input = document.getElementById(btn.getAttribute('data-toggle'));
    btn.setAttribute('aria-label', t.showPassword);
    btn.title = t.showPassword;
    btn.addEventListener('click', function () {
      var showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.setAttribute('aria-pressed', String(!showing));
      btn.setAttribute('aria-label', showing ? t.showPassword : t.hidePassword);
      btn.title = showing ? t.showPassword : t.hidePassword;
      input.focus();
    });
  });
  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type=submit]');

  function say(message, ok) {
    status.textContent = message;
    status.className = 'form-status ' + (ok ? 'is-ok' : 'is-err');
    status.hidden = false;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var password = form.elements.password.value;
    if (password.length < 8) return say(t.tooShort, false);
    if (password !== form.elements.repeat.value) return say(t.mismatch, false);

    button.disabled = true;
    button.textContent = t.saving;
    status.hidden = true;

    fetch(API + '/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token, password: password })
    }).then(function (resp) {
      if (resp.status === 204) {
        form.querySelectorAll('.field').forEach(function (f) { f.hidden = true; });
        button.hidden = true;
        token = null;
        return say(t.resetDone, true);
      }
      return resp.json().catch(function () { return {}; }).then(function (body) {
        var codeName = (body && body.detail && body.detail.code) || '';
        if (resp.status === 401 || resp.status === 403) {
          text('title', t.resetExpiredTitle);
          text('body', t.resetExpiredBody);
          form.hidden = true;
        } else if (codeName === 'same_password') {
          say(t.samePassword, false);
        } else if (resp.status === 422) {
          say(t.tooShort, false);
        } else if (resp.status === 429) {
          say(t.busy, false);
        } else {
          say(t.failed, false);
        }
      });
    }).catch(function () {
      say(t.failed, false);
    }).then(function () {
      button.disabled = false;
      button.textContent = t.save;
    });
  });
})();
