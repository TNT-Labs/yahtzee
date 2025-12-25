# Aggiornamento Automatico Versione PWA

Questo progetto include un sistema di versioning automatico per la Progressive Web App.

## Come Funziona

### Automatico (Raccomandato)
Ad ogni `git commit`, il **pre-commit hook** esegue automaticamente lo script `update-version.sh` che:
- Aggiorna `CACHE_VERSION` in `sw.js` con un timestamp Unix
- Aggiorna `version` in `manifest.json` con una versione leggibile (es. 2025.12.25.1508)
- Aggiunge automaticamente i file modificati al commit

**Non devi fare nulla!** Ogni commit avrà automaticamente una nuova versione.

### Manuale
Se vuoi aggiornare manualmente la versione senza fare un commit:
```bash
bash update-version.sh
```

## Come gli Utenti Ricevono gli Aggiornamenti

Quando un utente apre l'app:
1. Il service worker controlla ogni 60 secondi se c'è una nuova versione
2. Se rileva un aggiornamento, scarica i nuovi file
3. Ricarica automaticamente la pagina
4. L'utente vede subito la nuova versione

## File Coinvolti
- `update-version.sh` - Script che aggiorna le versioni
- `.git/hooks/pre-commit` - Hook che esegue lo script ad ogni commit
- `sw.js` - Contiene CACHE_VERSION (timestamp)
- `manifest.json` - Contiene version (data leggibile)
- `script.js` - Gestisce il controllo aggiornamenti lato client
