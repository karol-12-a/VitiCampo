# VitiCampo

PWA para gestión vitivinícola (órdenes de trabajo, bitácora offline, diagnóstico IA) lista para desplegar en Vercel.

Instrucciones rápidas:

1. Copiar `.env.example` a `.env.local` y completar tus valores reales:

```bash
copy .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=https://gestor-de-vinedos.vercel.app
POLAR_SECRET_KEY=tu_secret_key
POLAR_WEBHOOK_SECRET=tu_webhook_secret
NEXT_PUBLIC_POLAR_PRODUCT_ID=tu_polar_product_id
```

2. Ejecutar `npm install`.
3. Ejecutar `npm run dev`.
4. Para producción, desplegar en Vercel. Asegurate de configurar las mismas variables en el panel de Vercel (incluyendo `SUPABASE_SERVICE_KEY`).

Demo seguro (sin afectar producción):

- Para desplegar una instancia de demo aislada en Vercel, crea un nuevo proyecto o subdominio y configura la variable de entorno `DEMO_MODE=true` en ese proyecto. Con `DEMO_MODE=true` la app simulará las pasarelas de pago y devolverá URLs mock, evitando cualquier operación real en pasarelas externas.
- No uses la misma URL ni las mismas variables de entorno que la producción cuando publiques la demo.

Stripe (facturación por organización)

- Regístrate en Stripe y crea un `price` (plan) para suscripciones.
- Añade estas variables en Vercel / `.env.local`:

```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx
```

- Rutas disponibles:
	- `POST /api/orgs/create` : crea organización y usuario owner.
	- `POST /api/stripe/create-checkout` : crea sesión Stripe Checkout (necesita `org_id` y `price_id`).
	- `POST /api/stripe/webhook` : webhook para actualizar estado de suscripción en Supabase.

Polar.sh (opcional - tu cuenta de empresa)

Si utilizás Polar.sh como proveedor de pagos (Polar usa Stripe internamente pero gestiona cuentas para ti), activa Polar en Vercel y en `.env.local` con estas variables:

```
POLAR_SECRET_KEY=polar_sk_xxx
POLAR_WEBHOOK_SECRET=polar_wh_xxx
NEXT_PUBLIC_USE_POLAR=true
NEXT_PUBLIC_POLAR_PRODUCT_ID=polar_prod_xxx
```

Rutas disponibles para Polar:
- `POST /api/polar/create-checkout` : crea sesión de checkout en Polar (necesita `org_id` y `product_id`).
- `POST /api/polar/webhook` : webhook para actualizaciones de suscripción (configurá la URL en Polar dashboard).

Nota: ajustá la implementación de `app/api/polar/*` si Polar tiene campos distintos en su API. El código entrega una implementación genérica que deberás parametrizar con los nombres de campos exactos según la doc de Polar.

Completa KYC en Stripe para recibir payouts a tu cuenta bancaria.

Supabase - Inicializar esquema y datos de ejemplo:

1. En el dashboard de Supabase, abre la sección SQL y ejecuta el contenido de `supabase/init.sql` para crear las tablas.

2. Exporta tus variables de entorno localmente y ejecuta el script de seed con Node (Node 18+):

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://yourproject.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"
node scripts/seed.mjs
```

En Windows PowerShell usa `setx` o `$Env:` según prefieras.

Mercados de pago

La plantilla soporta integración con proveedores como Stripe o Polar.sh. Para usar Polar, agrega las variables indicadas más arriba y configura el webhook en el dashboard de Polar.
