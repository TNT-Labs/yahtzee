#!/bin/bash
# Script per aggiornare automaticamente la versione della PWA

# Trova la directory dello script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Genera versione basata su timestamp (garantisce che sia sempre crescente)
VERSION=$(date +%s)

echo "Aggiornamento versione a: $VERSION"

# Aggiorna sw.js
sed -i "s/const CACHE_VERSION = [0-9]*;/const CACHE_VERSION = $VERSION;/" sw.js
echo "Aggiornato sw.js"

# Aggiorna manifest.json (versione leggibile con data)
READABLE_VERSION=$(date +"%Y.%m.%d.%H%M")
sed -i "s/\"version\": \".*\"/\"version\": \"$READABLE_VERSION\"/" manifest.json
echo "Aggiornato manifest.json a versione $READABLE_VERSION"

# Aggiunge i file modificati a git se stiamo facendo un commit
if [ -n "$GIT_INDEX_FILE" ]; then
    git add sw.js manifest.json 2>/dev/null || true
fi

echo "Versione aggiornata con successo!"
