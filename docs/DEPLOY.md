# Deploy y panel

El sitio se publica en **Cloudflare Workers (static assets)**: cada push a `main` (incluidos los cambios que se guardan desde el panel) construye el sitio y lo publica en unos minutos. El panel `/admin` usa el Worker de autenticación que ya existe: `https://sveltia-cms-auth.almarweb.workers.dev`.

Todos los comandos son para **Git Bash en Windows**.

## 1. Subir el repositorio a GitHub

1. En GitHub, creá el repositorio vacío `aleyufra/rosalumayorista` (sin README ni .gitignore).
2. En Git Bash, desde la carpeta del proyecto:

```bash
cd /c/dev/rosalu
git add -A
git commit -m "Sitio inicial de Rosalu"
git branch -M main
git remote add origin https://github.com/aleyufra/rosalumayorista.git
git push -u origin main
```

## 2. Conectar Cloudflare (Workers Builds)

1. Entrá a https://dash.cloudflare.com > **Workers & Pages** > **Create** > **Import a repository**.
2. Elegí GitHub, autorizá la cuenta `aleyufra` y seleccioná `rosalumayorista`.
3. Configuración del build:
   - **Project name:** `rosalumayorista` (tiene que coincidir con `name` en `wrangler.jsonc`).
   - **Production branch:** `main`.
   - **Build command:** `pnpm build`
   - **Deploy command:** `pnpm exec wrangler deploy`
4. En **Settings > Build > Variables**, agregá `NODE_VERSION` = `24`.
   - Si el build falla por la versión de pnpm, agregá también `PNPM_VERSION` = `12.15.0`.
5. Guardá y desplegá. El sitio queda en `https://rosalumayorista.almarweb.workers.dev`.

`wrangler.jsonc` ya tiene lo necesario: sirve `dist/`, usa `404.html` para las rutas que no existen y respeta `public/_headers` (caché larga para `/_astro/*`, `noindex` para `/admin/`).

### Deploy manual (para probar sin GitHub)

```bash
pnpm exec wrangler login
pnpm deploy
```

### Probar en local igual que en Cloudflare

```bash
pnpm build
pnpm exec wrangler dev
```

Abrí http://localhost:8787.

## 3. Autenticación del panel

Sveltia CMS todavía no permite iniciar sesión con GitHub sin un intermediario (PKCE no está implementado para GitHub), así que se usa el Worker `sveltia-cms-auth`. Ya está desplegado; solo hay que revisar tres cosas.

1. **Dominio permitido.** En Cloudflare > Workers & Pages > `sveltia-cms-auth` > **Settings > Variables and Secrets**, editá `ALLOWED_DOMAINS` y sumá el dominio del sitio, separado por coma si ya había otros:

   ```
   rosalumayorista.almarweb.workers.dev
   ```

2. **Variables de GitHub.** En el mismo lugar tienen que estar `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET` (este último como secreto).
3. **OAuth App de GitHub.** En https://github.com/settings/developers > OAuth Apps, la app que usa ese Worker tiene que tener:
   - **Authorization callback URL:** `https://sveltia-cms-auth.almarweb.workers.dev/callback`

   Si el Worker ya atiende otro sitio, la misma OAuth App sirve para este.

`public/admin/config.yml` ya apunta a ese Worker (`base_url`).

## 4. Invitar a la dueña o encargada

1. Ella necesita una cuenta de GitHub (gratis, en https://github.com/signup).
2. En el repositorio: **Settings > Collaborators > Add people**, buscá su usuario y dale permiso **Write**.
3. Le llega un mail de invitación: tiene que aceptarlo.
4. Desde ese momento entra a `https://rosalumayorista.almarweb.workers.dev/admin/` con **Iniciar sesión con GitHub**.

Pasale la guía [CMS-GUIDE.md](CMS-GUIDE.md).

## 5. Dominio propio (cuando exista)

1. En Cloudflare > `rosalumayorista` > **Settings > Domains & Routes** > **Add > Custom domain**. Workers pide que el dominio use los DNS de Cloudflare.
2. Cambiá la URL en `astro.config.mjs`, `public/robots.txt` y `public/admin/config.yml` (ver [PENDING.md](PENDING.md)).
3. Sumá el dominio a `ALLOWED_DOMAINS` del Worker de autenticación.

## Por qué Workers y no Pages

Las dos opciones son gratis para este sitio. Cloudflare recomienda Workers para proyectos nuevos, los requests a archivos estáticos son ilimitados y queda en el mismo panel que el Worker de autenticación. Pages no necesita `wrangler.jsonc` pero ya no recibe funciones nuevas.
