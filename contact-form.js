// Shared by contact.html and wholesale.html.
// - Shows a message when the form Worker sends the visitor back with ?error=...
// - Stops the form from submitting before the Turnstile check has finished.
(function () {
    var form = document.querySelector('form[action="/api/contact"]');
    var notice = document.getElementById('formError');
    if (!form || !notice) return;

    var phones = 'Virginia City (406) 843-5688 or Ennis (406) 682-4990';
    var messages = {
        spam: "We couldn't confirm you're not a robot. Please try again.",
        invalid: 'Some of your details look incorrect. Please check the form and try again.',
        send: "We couldn't send your message right now. Please try again in a few minutes, or call us: " + phones + '.'
    };

    function showError(text) {
        notice.textContent = text;
        notice.hidden = false;
        notice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    var error = new URLSearchParams(window.location.search).get('error');
    if (error) {
        showError(messages[error] || messages.send);
        // Drop ?error so a refresh doesn't show the notice again.
        history.replaceState(null, '', window.location.pathname);
    }

    var button = form.querySelector('button[type="submit"]');
    var buttonLabel = button.textContent;

    form.addEventListener('submit', function (event) {
        var token = form.querySelector('[name="cf-turnstile-response"]');
        if (!token || !token.value) {
            event.preventDefault();
            showError('Please wait a moment for the security check to finish, then press Send again. If this keeps happening, call us: ' + phones + '.');
            return;
        }
        notice.hidden = true;
        button.disabled = true;
        button.textContent = 'Sending…';
    });

    // If the visitor comes back with the Back button, don't leave the button stuck.
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            button.disabled = false;
            button.textContent = buttonLabel;
        }
    });
})();
