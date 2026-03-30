/* ═══════════ PILEGGI IMMOBILIARE — EMAIL GATEWAY ═══════════ */
/* Integrazione con il gateway Flask su PythonAnywhere */

(function () {
    // ⚠️ CONFIGURA questi due valori:
    var GATEWAY_URL = "https://TUOUSERNAME.pythonanywhere.com"; // URL del gateway
    var SITE_KEY = "pileggi"; // Chiave sito (mappa al destinatario nel gateway)

    var forms = [
        { id: "contact-form", status: "contact-form-status", label: "Invia Messaggio" },
        { id: "collabora-form", status: "collabora-form-status", label: "Invia Candidatura" }
    ];

    forms.forEach(function (cfg) {
        var form = document.getElementById(cfg.id);
        if (!form) return;

        var statusEl = document.getElementById(cfg.status);
        var btn = form.querySelector('button[type="submit"]');

        function showStatus(text, isError) {
            if (!statusEl) return;
            statusEl.textContent = text;
            statusEl.style.color = isError ? "#f87171" : "#4ade80";
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var fileInput = form.querySelector('input[type="file"]');
            var hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
            var fetchOptions;

            if (hasFile) {
                // Multipart/form-data per inviare l'allegato
                var formData = new FormData(form);
                // Rinomina il file input in "attachment" per il gateway
                var file = fileInput.files[0];
                formData.delete(fileInput.name || "file");
                formData.append("attachment", file, file.name);
                formData.set("_landing", window.location.hostname + window.location.pathname);
                formData.set("_site", SITE_KEY);
                fetchOptions = { method: "POST", body: formData };
            } else {
                // JSON semplice senza allegati
                var data = {};
                new FormData(form).forEach(function (v, k) {
                    if (typeof v === "string") data[k] = v;
                });
                data._landing = window.location.hostname + window.location.pathname;
                data._site = SITE_KEY;
                fetchOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                };
            }

            if (btn) {
                btn.disabled = true;
                btn.textContent = "Invio in corso...";
            }
            showStatus("", false);

            fetch(GATEWAY_URL + "/api/send", fetchOptions)
                .then(function (r) {
                    return r.json().then(function (json) {
                        if (!r.ok) throw new Error(json.error || r.statusText);
                        return json;
                    });
                })
                .then(function (res) {
                    if (res.success) {
                        showStatus("Messaggio inviato! Ti risponderemo al piu presto.", false);
                        form.reset();
                    } else {
                        showStatus(res.error || "Errore nell'invio.", true);
                    }
                })
                .catch(function (err) {
                    showStatus(err.message || "Errore di rete. Riprova.", true);
                })
                .finally(function () {
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = cfg.label;
                    }
                });
        });
    });
})();
