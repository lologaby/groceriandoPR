# 🚀 Guía Completa de Deployment - GitHub + Vercel (Cloud)

## 📋 Resumen

Esta guía te llevará paso a paso para hacer deploy completo de tu app en la nube:

- **Frontend**: Vercel (React/Vite)
- **Backend**: Railway o Render (Node.js con workers)
- **MongoDB**: MongoDB Atlas (cloud)
- **Redis**: Upstash (cloud)

---

## 🎯 Arquitectura Cloud

```
┌─────────────────┐
│   GitHub Repo   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ Vercel │ │ Railway  │
│(Frontend)│ │(Backend) │
└────────┘ └──────────┘
    │         │
    │         ├──► MongoDB Atlas
    │         └──► Upstash Redis
    │
    └──► API calls
```

---

## 📦 Paso 1: Preparar Repositorio GitHub

### 1.1 Crear `.gitignore` (si no existe)

```bash
# En la raíz del proyecto
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/
*.log

# Environment variables
.env
.env.local
.env.production
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Debug
debug/
*.png
*.html

# Misc
.cache/
.temp/
EOF
```

### 1.2 Crear `README.md` para GitHub

```bash
# Ya existe, pero asegúrate de que tenga información básica
```

### 1.3 Inicializar Git y Push a GitHub

```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "Initial commit: Groceriando PR app"

# Crear repo en GitHub (ve a github.com y crea uno nuevo)
# Luego:
git remote add origin https://github.com/TU_USUARIO/groceriando.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Paso 2: Configurar MongoDB Atlas (Cloud)

### 2.1 Crear Cuenta y Cluster

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea cuenta gratuita
3. Crea un **Free Cluster** (M0)
4. Elige región cercana (ej: `us-east-1`)
5. Espera a que se cree (~5 minutos)

### 2.2 Configurar Acceso

1. **Database Access**:
   - Crea usuario: `groceriando-user`
   - Password: Genera una segura (guárdala)
   - Database User Privileges: `Atlas admin`

2. **Network Access**:
   - Agrega IP: `0.0.0.0/0` (permite desde cualquier lugar)
   - O agrega IPs específicas de Railway/Render

### 2.3 Obtener Connection String

1. Ve a **Database** → **Connect**
2. Elige **Connect your application**
3. Copia el connection string:
   ```
   mongodb+srv://groceriando-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Reemplaza `<password>` con tu password real
5. Agrega nombre de base de datos:
   ```
   mongodb+srv://groceriando-user:TU_PASSWORD@cluster0.xxxxx.mongodb.net/groceriando?retryWrites=true&w=majority
   ```

**Guarda este string** - lo necesitarás para Railway/Render.

---

## 🔴 Paso 3: Configurar Upstash Redis (Cloud)

### 3.1 Crear Cuenta y Database

1. Ve a https://upstash.com
2. Crea cuenta (puedes usar GitHub)
3. Ve a **Redis** → **Create Database**
4. Nombre: `groceriando-redis`
5. Tipo: **Regional** (elige región cercana)
6. Tier: **Free** (10,000 requests/día)

### 3.2 Obtener Credentials

1. Una vez creado, ve a **Details**
2. Copia:
   - **UPSTASH_REDIS_REST_URL**: `https://xxxxx.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: `AXxxxxx...`

**Guarda estos valores** - los necesitarás para Railway/Render.

---

## 🚂 Paso 4: Deploy Backend en Railway

### 4.1 Crear Cuenta Railway

1. Ve a https://railway.app
2. Crea cuenta (puedes usar GitHub)
3. Conecta tu cuenta de GitHub

### 4.2 Crear Nuevo Proyecto

1. Click **New Project**
2. Selecciona **Deploy from GitHub repo**
3. Elige tu repo `groceriando`
4. Railway detectará automáticamente el proyecto

### 4.3 Configurar Build Settings

Railway debería detectar automáticamente, pero verifica:

1. **Root Directory**: `/backend` (o deja vacío si backend está en raíz)
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Watch Paths**: `backend/**`

Si Railway no detecta automáticamente, crea `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4.4 Configurar Variables de Entorno

En Railway, ve a **Variables** y agrega:

```bash
# Server
PORT=3001
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=mongodb+srv://groceriando-user:TU_PASSWORD@cluster0.xxxxx.mongodb.net/groceriando?retryWrites=true&w=majority

# Upstash Redis
REDIS_URL=redis://default:TU_TOKEN@TU_REDIS_URL.upstash.io:6379
# O si Upstash te da REST URL:
REDIS_HOST=TU_REDIS_URL.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=TU_TOKEN

# Scraping (opcional)
SCRAPE_ON_START=false
WARM_CACHE_ON_START=false

# Puppeteer (para Railway)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 4.5 Configurar Puppeteer en Railway

Railway necesita Chromium para Puppeteer. Agrega a `backend/package.json`:

```json
{
  "scripts": {
    "postinstall": "node node_modules/puppeteer/install.js || true"
  }
}
```

O crea `backend/nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ['nodejs-18_x', 'chromium']

[phases.install]
cmds = ['npm install']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm start'
```

### 4.6 Deploy

1. Railway automáticamente hará deploy cuando hagas push a GitHub
2. Ve a **Settings** → **Generate Domain** para obtener URL del backend
3. Copia la URL (ej: `https://groceriando-backend.railway.app`)

**Guarda esta URL** - la necesitarás para Vercel.

---

## 🌐 Paso 5: Deploy Frontend en Vercel

### 5.1 Crear Cuenta Vercel

1. Ve a https://vercel.com
2. Crea cuenta (puedes usar GitHub)
3. Conecta tu cuenta de GitHub

### 5.2 Crear Nuevo Proyecto

1. Click **Add New** → **Project**
2. Importa tu repo `groceriando`
3. Vercel detectará automáticamente que es Vite

### 5.3 Configurar Build Settings

Vercel debería detectar automáticamente, pero verifica:

- **Framework Preset**: Vite
- **Root Directory**: `frontend` (o deja vacío si frontend está en raíz)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Si necesitas configurar manualmente, crea `vercel.json` en la raíz:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://groceriando-backend.railway.app/api/$1"
    }
  ]
}
```

### 5.4 Configurar Variables de Entorno

En Vercel, ve a **Settings** → **Environment Variables**:

```bash
# API URL del backend (Railway)
VITE_API_URL=https://groceriando-backend.railway.app

# O si prefieres usar proxy (ver vercel.json arriba)
# No necesitas esta variable si usas rewrites
```

### 5.5 Actualizar Frontend para Usar Variable de Entorno

Verifica que `frontend/src/constants/api.ts` use la variable:

```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

### 5.6 Deploy

1. Click **Deploy**
2. Vercel automáticamente hará build y deploy
3. Obtendrás una URL como: `https://groceriando.vercel.app`

---

## 🔧 Paso 6: Configurar CORS en Backend

Asegúrate de que el backend acepte requests de Vercel:

En `backend/src/index.ts`, verifica que CORS esté configurado:

```typescript
import cors from 'cors';

const app = express();

// Permitir requests de Vercel
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://groceriando.vercel.app',
    'https://*.vercel.app', // Cualquier subdominio de Vercel
  ],
  credentials: true,
}));
```

O más permisivo para desarrollo:

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://groceriando.vercel.app']
    : true,
  credentials: true,
}));
```

---

## 🔄 Paso 7: Configurar CI/CD Automático

### 7.1 GitHub Actions (Opcional)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm install
      - name: Build
        run: cd backend && npm run build
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: groceriando-backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Build
        run: cd frontend && npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

**Nota**: Railway y Vercel hacen auto-deploy con GitHub, así que esto es opcional.

---

## ✅ Paso 8: Verificar Deployment

### 8.1 Verificar Backend

```bash
# Health check
curl https://groceriando-backend.railway.app/health

# Debe retornar:
{
  "ok": true,
  "service": "groceriando-api",
  "redis": "connected",
  "mongodb": "connected"
}
```

### 8.2 Verificar Frontend

1. Ve a `https://groceriando.vercel.app`
2. Deberías ver la app funcionando
3. Prueba buscar un producto
4. Verifica que las llamadas a la API funcionen

### 8.3 Verificar Logs

**Railway**:
- Ve a tu proyecto en Railway
- Click en **Deployments** → **View Logs**
- Deberías ver logs del servidor

**Vercel**:
- Ve a tu proyecto en Vercel
- Click en **Deployments** → **View Function Logs**
- Deberías ver logs del build

---

## 🔐 Paso 9: Configurar Dominio Personalizado (Opcional)

### 9.1 Vercel (Frontend)

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio (ej: `groceriando.com`)
3. Sigue las instrucciones para configurar DNS
4. Vercel te dará registros DNS a agregar

### 9.2 Railway (Backend)

1. Ve a **Settings** → **Networking**
2. Agrega dominio personalizado
3. Configura DNS según instrucciones

---

## 📊 Paso 10: Monitoreo y Logs

### 10.1 Railway Logs

- Ve a Railway → Tu proyecto → **Deployments** → **View Logs**
- Puedes ver logs en tiempo real
- Útil para debugging

### 10.2 Vercel Analytics

- Ve a Vercel → Tu proyecto → **Analytics**
- Ve métricas de performance
- Errores y requests

### 10.3 MongoDB Atlas Monitoring

- Ve a MongoDB Atlas → **Metrics**
- Ve uso de base de datos
- Performance y conexiones

### 10.4 Upstash Monitoring

- Ve a Upstash → Tu database → **Metrics**
- Ve requests y uso
- Límites del plan free

---

## 🐛 Troubleshooting

### Backend no conecta a MongoDB

```bash
# Verifica:
1. MONGODB_URI está correcto en Railway
2. IP de Railway está en Network Access de MongoDB
3. Usuario y password son correctos
```

### Backend no conecta a Redis

```bash
# Verifica:
1. REDIS_URL está correcto en Railway
2. Si usas Upstash REST, usa REDIS_HOST y REDIS_PASSWORD
3. Redis database está activo en Upstash
```

### Frontend no puede llamar al backend

```bash
# Verifica:
1. VITE_API_URL está configurado en Vercel
2. CORS está configurado en backend
3. URL del backend es correcta
```

### Puppeteer no funciona en Railway

```bash
# Agrega a Railway variables:
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# O usa nixpacks.toml (ver arriba)
```

### Build falla en Vercel

```bash
# Verifica:
1. Root directory está correcto
2. Build command es correcto
3. Dependencies están en package.json
4. TypeScript compila sin errores
```

---

## 📝 Checklist de Deployment

- [ ] Repo en GitHub creado y código pusheado
- [ ] MongoDB Atlas cluster creado y connection string obtenido
- [ ] Upstash Redis creado y credentials obtenidos
- [ ] Railway proyecto creado y backend deployado
- [ ] Variables de entorno configuradas en Railway
- [ ] Backend health check funciona
- [ ] Vercel proyecto creado y frontend deployado
- [ ] Variable VITE_API_URL configurada en Vercel
- [ ] Frontend puede llamar al backend
- [ ] App funciona end-to-end
- [ ] Logs están disponibles
- [ ] Dominio personalizado configurado (opcional)

---

## 💰 Costos Estimados

### Plan Free (Suficiente para empezar)

- **Vercel**: Gratis (hasta cierto límite)
- **Railway**: $5/mes (500 horas gratis, luego $0.01/hora)
- **MongoDB Atlas**: Gratis (512MB storage)
- **Upstash Redis**: Gratis (10,000 requests/día)

**Total**: ~$5/mes o menos

### Plan Escalado

- **Vercel Pro**: $20/mes
- **Railway**: Pay-as-you-go
- **MongoDB Atlas**: Desde $9/mes
- **Upstash Redis**: Desde $0.20/100K requests

---

## 🚀 Próximos Pasos

1. **Monitoreo**: Configura alertas en Railway/Vercel
2. **Backups**: Configura backups automáticos en MongoDB Atlas
3. **CDN**: Vercel ya incluye CDN automático
4. **SSL**: Automático en Vercel y Railway
5. **Analytics**: Agrega Google Analytics o similar

---

**¡Listo!** Tu app está completamente deployada en la nube. 🎉

**Fecha:** Enero 28, 2026  
**Status:** ✅ **GUÍA COMPLETA DE DEPLOYMENT**
