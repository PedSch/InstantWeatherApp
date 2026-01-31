# Cómo solucionar 404 DEPLOYMENT_NOT_FOUND en Vercel

El error **404: NOT_FOUND / Code: DEPLOYMENT_NOT_FOUND** significa que **no hay ningún deployment** en esa URL. No es un fallo de la app; Vercel no tiene nada que servir.

## Pasos para solucionarlo

### 1. Abre el proyecto en Vercel

1. Entra en [vercel.com/dashboard](https://vercel.com/dashboard).
2. Abre el proyecto **instant-weather-app-rho** (o el nombre que tenga).

### 2. Revisa la pestaña Deployments

- **Si no hay deployments** → hay que hacer el primer deploy (paso 3).
- **Si el último deployment está en rojo (Failed)** → el build falló. Haz clic en ese deployment y abre **Building** para ver el error en los logs. Corrige el error (por ejemplo `npm install` o `npm run build`) y vuelve a desplegar.

### 3. Configuración del proyecto (Settings → General)

En **Build & Development Settings** comprueba:

| Campo | Valor esperado |
|-------|----------------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | (vacío o `npm install`) |

Si **Framework Preset** está en "Other", pon **Build Command** = `npm run build` y **Output Directory** = `dist`.

### 4. Crear un deployment

**Opción A — Desde Git (recomendado)**

1. En **Settings → Git**, asegúrate de que el repo está conectado.
2. Haz un push a la rama que Vercel usa (p. ej. `main`): eso lanza un nuevo deploy.
3. O en **Deployments** → botón **Redeploy** en el último deployment.

**Opción B — Desde la CLI**

En la raíz del proyecto:

```bash
npm install
npx vercel --prod
```

(Si es la primera vez, ejecuta antes `npx vercel` para enlazar el proyecto.)

### 5. Comprobar que el build pasa en local

Antes de confiar en Vercel, verifica que el build funciona en tu máquina:

```bash
npm install
npm run build
```

Si falla, corrige el error (dependencias, Node, etc.). Cuando `npm run build` termine bien, un nuevo deploy en Vercel debería generar un deployment y la URL dejará de dar 404.

---

**Resumen:** El 404 se soluciona cuando existe **al menos un deployment en estado Ready (verde)**. Revisa los deployments y los logs de build en el dashboard de Vercel.
