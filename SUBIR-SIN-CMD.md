# Subir A Netlify Sin CMD

Usa esta carpeta:

`C:\Users\emilio\Documents\Codex\2026-05-29\i-want-you-to-do-literally\outputs\netlify-x402-deploy`

## Paso 1: Crear Repo En GitHub

1. Entra a GitHub.
2. Crea un repositorio nuevo, por ejemplo `codex-audit-agent`.
3. Elige `Add files` -> `Upload files`.
4. Arrastra TODO el contenido de esta carpeta, no la carpeta como tal:
   - `netlify.toml`
   - `README.md`
   - carpeta `public`
   - carpeta `netlify`
5. Commit.

## Paso 2: Importar En Netlify

1. En Netlify: `Add new project`.
2. Elige `Import an existing project`.
3. Conecta GitHub.
4. Selecciona el repo `codex-audit-agent`.
5. Configura:
   - Build command: vacio
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
6. Deploy.

## Paso 3: Pegar URL Aqui

Cuando Netlify termine, pega aqui la URL:

`https://TU-SITE.netlify.app`

Con esa URL verifico `/health`, `/audit`, y preparo el registro para discovery x402.

## Por Que No Drag And Drop

Netlify recomienda Git, CLI o API para funciones. Drag and drop sirve muy bien para archivos estaticos, pero este proyecto necesita Functions para que `/audit` pueda responder `402 Payment Required`.
