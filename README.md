# Eco — Frontend

Interfaz web de **Eco**, una app de finanzas personales: resumen del patrimonio, cuentas y tarjetas con sus
subcuentas, movimientos, personas, categorías, planes recurrentes, obligaciones (quién te debe / a quién debes)
y financiamientos en cuotas. Todo se registra y se edita desde la interfaz, y los datos viven en la API.

Hecho con **React** + **Vite** (JavaScript). La API está en
[eco-app-backend](https://github.com/ssamucr/eco-app-backend); sin ella corriendo, la app no muestra datos.

## Requisitos

- Node.js 20.19 o superior (o 22.12+)
- La API de Eco corriendo (por defecto en `http://localhost:8000`)

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>. El puerto es fijo porque la API solo acepta peticiones de ese origen.

Para apuntar a otra dirección de la API, copia `.env.example` como `.env` y cambia `VITE_API_URL`.

## Inicio de sesión y despliegue

En producción la API exige un token de **Supabase Auth**. Para activarlo define `VITE_SUPABASE_URL` y
`VITE_SUPABASE_PUBLISHABLE_KEY` (la clave *publishable* es pública por diseño; lo que protege tus datos es el
token, que la API verifica). Sin esas variables, la app no pide inicio de sesión: es el modo de desarrollo local,
con la API corriendo con `ECO_AUTH_DESACTIVADA=1`.

Se despliega en **Vercel** (`vercel.json` ya redirige todas las rutas a la app). Configura allí las tres variables
`VITE_*`; `VITE_API_URL` debe ser la dirección pública de la API.

## Scripts

| Comando           | Qué hace                              |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Servidor de desarrollo                |
| `npm run build`   | Compilación de producción en `dist/`  |
| `npm run preview` | Sirve la compilación para probarla    |

La carpeta `diseno-referencia/` guarda el diseño original de las pantallas, solo como referencia.
