#!/bin/bash
# Cron job: cada 5 min hace git pull. Nginx sirve archivos directos del repo
# en read-only, asi que un pull con cambios queda visible al instante (no hace
# falta reiniciar el container).
set -e
cd "$(dirname "$0")/.."
git pull --quiet --rebase --autostash
