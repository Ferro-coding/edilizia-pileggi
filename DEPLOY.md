# Deploy — Pileggi Immobiliare

**Il push su GitHub NON pubblica il sito.** GitHub Pages non è attivo su questo
repo: GitHub serve solo da versionamento. La pubblicazione è un upload manuale
via SSH sul server qui sotto.

## Server

| | |
|---|---|
| Host | `root@2.28.32.247` (accesso con chiave SSH, nessuna password) |
| URL pubblico | https://pileggi.2-28-32-247.sslip.io |
| Document root | `/opt/edilizia-pileggi/web` |
| Config Nginx | `/etc/nginx/sites-enabled/edilizia-pileggi` |
| Certificato | Let's Encrypt via Certbot (rinnovo automatico) |
| Log | `/var/log/nginx/edilizia-pileggi.{access,error}.log` |
| Backup | `/opt/edilizia-pileggi/backup/web-<data>.tar.gz` |

Il document root **non è un repo git**: non esiste `git pull` sul server, i file
si copiano da qui con `scp`.

## Backend form email

Il form contatti non parla con un dominio esterno: Nginx fa da reverse proxy
sulle rotte `/api` e `/admin` verso `127.0.0.1:3020`, dove gira un container
Docker. Per questo in `js/gateway.js` la costante `GATEWAY_URL` è **vuota**
(percorsi relativi, nessun CORS da configurare). Non reintrodurre un URL
assoluto: romperebbe il form.

## Pubblicare le modifiche

Da Git Bash, nella cartella del progetto. Prima il backup, poi l'upload dei soli
file toccati, poi la verifica.

```bash
# 1. Backup del sito attualmente online (sempre, prima di toccare qualsiasi cosa)
ssh root@2.28.32.247 \
  'mkdir -p /opt/edilizia-pileggi/backup && tar czf /opt/edilizia-pileggi/backup/web-$(date +%Y%m%d-%H%M%S).tar.gz -C /opt/edilizia-pileggi web'

# 2. Upload (aggiungi o togli i file secondo cosa hai modificato)
scp index.html collabora.html root@2.28.32.247:/opt/edilizia-pileggi/web/
scp css/style.css              root@2.28.32.247:/opt/edilizia-pileggi/web/css/
scp js/main.js js/gateway.js   root@2.28.32.247:/opt/edilizia-pileggi/web/js/

# 3. Verifica che il server abbia esattamente i file locali (gli hash devono coincidere)
md5sum index.html collabora.html css/style.css js/main.js
ssh root@2.28.32.247 'cd /opt/edilizia-pileggi/web && md5sum index.html collabora.html css/style.css js/main.js'

# 4. Verifica che il sito risponda
curl -o /dev/null -w "%{http_code}\n" https://pileggi.2-28-32-247.sslip.io/
```

Nginx serve file statici: **non serve riavviarlo** dopo un upload. Va ricaricato
(`nginx -t && systemctl reload nginx`) solo se si modifica la sua configurazione.

Cartella `assets/`: Nginx la serve con `Cache-Control: max-age=2592000` (30
giorni). Se sostituisci un'immagine mantenendo lo stesso nome, i browser che
l'hanno già vista continueranno a mostrare la vecchia per un mese — meglio
caricarla con un nome nuovo.

## Ripristino

```bash
ssh root@2.28.32.247
ls /opt/edilizia-pileggi/backup/                       # scegli l'archivio
cd /opt/edilizia-pileggi && tar xzf backup/web-<data>.tar.gz
```

## Checklist

1. `git commit` delle modifiche
2. `git push` (versionamento — il sito online non cambia)
3. Backup + `scp` + verifica hash (passi sopra) — **questo pubblica**
4. Aprire il sito con **Ctrl+F5**: `index.html` non ha cache, ma CSS e JS sì
