#!/usr/bin/env bash
# Deploy the GitHub sign-in Worker to auth.daisy-lab.ir.
# Reads CLOUDFLARE_API_TOKEN, GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET from .env.
#   bash scripts/deploy-auth.sh
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
for v in CLOUDFLARE_API_TOKEN GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET; do
  [ -n "${!v:-}" ] || { echo "✗ $v is missing from .env" >&2; exit 1; }
done
cd auth-worker
W="npx -y wrangler@4"
$W whoami
$W deploy
# Secrets are sent over stdin, never on the command line.
printf '{"GITHUB_CLIENT_ID":"%s","GITHUB_CLIENT_SECRET":"%s"}' "$GITHUB_CLIENT_ID" "$GITHUB_CLIENT_SECRET" | $W secret bulk
echo "✓ Deployed. Test: https://auth.daisy-lab.ir/auth?provider=github&site_id=daisy-lab.ir"
