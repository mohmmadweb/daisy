# auth-worker

GitHub sign-in for the DAISY Lab content manager (`https://daisy-lab.ir/admin/`).

It is an unmodified copy of [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) (MIT), deployed as a Cloudflare Worker on `https://auth.daisy-lab.ir`. GitHub's OAuth flow needs a server that keeps the client secret; this Worker is that server. It stores nothing.

Setup steps are in `GUIDE-fa.md` (section «ورود و پنل مدیریت»). In short:

1. GitHub → Settings → Developer settings → OAuth Apps → New:
   homepage `https://daisy-lab.ir`, callback `https://auth.daisy-lab.ir/callback`.
2. Cloudflare → Workers & Pages → Create → Import a repository → `mohmmadweb/daisy`, root directory `auth-worker`.
3. Add the secrets `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to the Worker.

Update: copy `src/index.js` from the upstream repository.
