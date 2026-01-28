# 🚀 Deployment Guide - GitHub + Vercel

Guía paso a paso para hacer deploy completo de Groceriando en la nube usando GitHub y Vercel.

---

## 📋 Prerrequisitos

- ✅ Cuenta de GitHub
- ✅ Cuenta de Vercel (gratis)
- ✅ Cuenta de Railway o Render (para backend)
- ✅ Cuenta de MongoDB Atlas (gratis)
- ✅ Cuenta de Upstash Redis (gratis)

---

## 🎯 Paso 1: Preparar Repositorio en GitHub

### 1.1 Crear Repositorio en GitHub

1. Ve a **https://github.com/new**
2. **Repository name**: `groceriando`
3. **Description**: "Lista de compras inteligente para supermercados de Puerto Rico"
4. **Visibility**: 
   - ✅ **Public** (recomendado para portfolio)
   - ✅ **Private** (si prefieres mantenerlo privado)
5. **NO marques**:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click **Create repository**

### 1.2 Configurar Git Local

```bash
cd /home/aberrios/groceriando

# Verificar que estás en la rama main
git branch
# Si estás en master, cambia a main:
git branch -M main

# Configurar remote (reemplaza TU_USUARIO con tu username)
git remote set-url origin https://github.com/TU_USUARIO/groceriando.git

# Verificar remote
git remote -v
```

### 1.3 Hacer Push Inicial

```bash
# Agregar todos los archivos
git add -A

# Commit
git commit -m "Initial commit: Groceriando PR app"

# Push a GitHub
git push -u origin main
```

**Si pide autenticación**:
- **Username**: Tu username de GitHub
- **Password**: Usa un **Personal Access Token** (no tu password)
  - Crear token: https://github.com/settings/tokens
  - Scope: ✅ `repo`
  - Copiar token y usarlo como password

---

## 🗄️ Paso 2: Configurar MongoDB Atlas

### 2.1 Crear Cluster

1. Ve a **https://www.mongodb.com/cloud/atlas**
2. Crea cuenta gratuita
3. Click **Build a Database**
4. Elige **FREE** (M0)
5. **Cloud Provider**: AWS
6. **Region**: Elige la más cercana (ej: `us-east-1`)
7. **Cluster Name**: `groceriando-cluster` (o deja default)
8. Click **Create**

### 2.2 Configurar Acceso

**Database Access**:
1. Click **Database Access** → **Add New Database User**
2. **Authentication Method**: Password
3. **Username**: `groceriando-user`
4. **Password**: Genera una segura (guárdala)
5. **Database User Privileges**: `Atlas admin`
6. Click **Add User**

**Network Access**:
1. Click **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (`0.0.0.0/0`)
3. Click **Confirm**

### 2.3 Obtener Connection String

1. Click **Database** → **Connect**
2. Elige **Connect your application**
3. **Driver**: Node.js
4. **Version**: 5.5 or later
5. Copia el connection string:
   ```
   mongodb+srv://groceriando-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Reemplaza** `<password>` con tu password real
7. **Agrega** nombre de base de datos al final:
   ```
   mongodb+srv://groceriando-user:TU_PASSWORD@cluster0.xxxxx.mongodb.net/groceriando?retryWrites=true&w=majority
   ```

**Guarda este string** - lo necesitarás para Railway.

---

## 🔴 Paso 3: Configurar Upstash Redis

### 3.1 Crear Database

1. Ve a **https://upstash.com**
2. Crea cuenta (puedes usar GitHub)
3. Click **Redis** → **Create Database**
4. **Name**: `groceriando-redis`
5. **Type**: **Regional**
6. **Region**: Elige la más cercana
7. **Tier**: **Free** (10,000 requests/día)
8. Click **Create**

### 3.2 Obtener Credentials

1. Una vez creado, ve a **Details**
2. Copia:
   - **UPSTASH_REDIS_REST_URL**: `https://xxxxx.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: `AXxxxxx...`

**Guarda estos valores** - los necesitarás para Railway.

---

## 🚂 Paso 4: Deploy Backend en Railway

### 4.1 Crear Cuenta y Proyecto

1. Ve a **https://railway.app**
2. Crea cuenta (usa **Sign in with GitHub**)
3. Click **New Project**
4. Selecciona **Deploy from GitHub repo**
5. Autoriza Railway a acceder a tus repos
6. Selecciona el repo `groceriando`
7. Railway detectará automáticamente el proyecto

### 4.2 Configurar Build Settings

Railway debería detectar automáticamente, pero verifica:

1. Click en tu servicio → **Settings**
2. **Root Directory**: `/backend` (si backend está en subdirectorio)
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`

Si Railway no detecta automáticamente, crea `railway.json` en la raíz:

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

### 4.3 Configurar Variables de Entorno

En Railway, ve a tu servicio → **Variables** y agrega:

```bash
# Server
PORT=3001
NODE_ENV=production

# MongoDB Atlas (del Paso 2.3)
MONGODB_URI=mongodb+srv://groceriando-user:TU_PASSWORD@cluster0.xxxxx.mongodb.net/groceriando?retryWrites=true&w=majority

# Upstash Redis (del Paso 3.2)
REDIS_URL=redis://default:TU_TOKEN@xxxxx.upstash.io:6379
# O configuración individual:
REDIS_HOST=xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=TU_TOKEN

# Frontend URL (para CORS)
FRONTEND_URL=https://groceriando.vercel.app

# Scraping (opcional)
SCRAPE_ON_START=false
WARM_CACHE_ON_START=false

# Puppeteer (para Railway)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
```

### 4.4 Obtener URL del Backend

1. En Railway, ve a **Settings** → **Networking**
2. Click **Generate Domain**
3. Copia la URL (ej: `https://groceriando-backend.railway.app`)

**Guarda esta URL** - la necesitarás para Vercel.

### 4.5 Verificar Deployment

```bash
# Health check
curl https://groceriando-backend.railway.app/health

# Debe retornar:
{
  "ok": true,
  "redis": "connected",
  "mongodb": "connected"
}
```

---

## 🌐 Paso 5: Deploy Frontend en Vercel

### 5.1 Crear Cuenta y Proyecto

1. Ve a **https://vercel.com**
2. Crea cuenta (usa **Sign in with GitHub**)
3. Click **Add New** → **Project**
4. **Import Git Repository**: Selecciona `groceriando`
5. Click **Import**

### 5.2 Configurar Build Settings

Vercel debería detectar automáticamente Vite, pero verifica:

- **Framework Preset**: Vite
- **Root Directory**: `frontend` (si frontend está en subdirectorio)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Si necesitas configurar manualmente, el archivo `vercel.json` ya está creado.

### 5.3 Configurar Variables de Entorno

En Vercel, ve a **Settings** → **Environment Variables**:

```bash
# Backend API URL (del Paso 4.4)
VITE_API_URL=https://groceriando-backend.railway.app
```

**Importante**: Agrega esta variable para todos los ambientes:
- ✅ Production
- ✅ Preview
- ✅ Development

### 5.4 Deploy

1. Click **Deploy**
2. Vercel automáticamente:
   - Instalará dependencias
   - Hará build
   - Deployará la app
3. Obtendrás una URL como: `https://groceriando.vercel.app`

### 5.5 Verificar Deployment

1. Ve a tu URL de Vercel
2. Deberías ver la app funcionando
3. Prueba buscar un producto
4. Verifica que las llamadas al API funcionen

---

## ✅ Paso 6: Verificación Final

### 6.1 Verificar Backend

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

### 6.2 Verificar Frontend

1. Ve a `https://groceriando.vercel.app`
2. Busca un producto (ej: "leche")
3. Selecciona un producto
4. Verifica que muestra resultados de supermercados

### 6.3 Verificar Logs

**Railway**:
- Ve a Railway → Tu proyecto → **Deployments** → **View Logs**
- Deberías ver logs del servidor sin errores

**Vercel**:
- Ve a Vercel → Tu proyecto → **Deployments** → **View Function Logs**
- Deberías ver logs del build exitoso

---

## 🔄 Paso 7: CI/CD Automático

### 7.1 GitHub → Railway (Backend)

Railway automáticamente hace deploy cuando haces push a `main`:
- ✅ Push a `main` → Railway detecta cambios
- ✅ Automáticamente hace build y deploy
- ✅ No necesitas hacer nada manual

### 7.2 GitHub → Vercel (Frontend)

Vercel automáticamente hace deploy cuando haces push a `main`:
- ✅ Push a `main` → Vercel detecta cambios
- ✅ Automáticamente hace build y deploy
- ✅ No necesitas hacer nada manual

### 7.3 Workflow Recomendado

```bash
# 1. Hacer cambios localmente
git add .
git commit -m "Descripción de cambios"
git push origin main

# 2. Railway y Vercel automáticamente hacen deploy
# 3. Espera 2-5 minutos
# 4. Verifica que los cambios están en producción
```

---

## 🐛 Troubleshooting

### Backend no conecta a MongoDB

**Síntomas**: Health check muestra `mongodb: disconnected`

**Solución**:
1. Verifica `MONGODB_URI` en Railway Variables
2. Verifica que el password en la URL es correcto
3. Verifica Network Access en MongoDB Atlas (debe tener `0.0.0.0/0`)
4. Verifica que el usuario existe en Database Access

### Backend no conecta a Redis

**Síntomas**: Health check muestra `redis: memory-fallback`

**Solución**:
1. Verifica `REDIS_URL` en Railway Variables
2. Verifica que Upstash Redis está activo
3. Verifica que el token es correcto
4. El sistema funcionará con cache en memoria si Redis falla

### Frontend no puede llamar al backend

**Síntomas**: Errores CORS o 404 en el navegador

**Solución**:
1. Verifica `VITE_API_URL` en Vercel Variables
2. Verifica que la URL del backend es correcta
3. Verifica CORS en backend (debe permitir dominio de Vercel)
4. Verifica que el backend está corriendo (health check)

### Build falla en Vercel

**Síntomas**: Build error en Vercel

**Solución**:
1. Verifica que `Root Directory` está configurado (`frontend`)
2. Verifica que `Build Command` es correcto (`npm run build`)
3. Verifica que `Output Directory` es correcto (`dist`)
4. Revisa logs de build en Vercel para ver error específico

### Puppeteer no funciona en Railway

**Síntomas**: Scraping falla con errores de Chromium

**Solución**:
1. Verifica que `nixpacks.toml` existe en `backend/`
2. Verifica variables de Puppeteer en Railway
3. Revisa logs en Railway para ver error específico

---

## 📊 Monitoreo

### Railway Logs

- Ve a Railway → Tu proyecto → **Deployments** → **View Logs**
- Logs en tiempo real del backend
- Útil para debugging

### Vercel Analytics

- Ve a Vercel → Tu proyecto → **Analytics**
- Métricas de performance
- Errores y requests

### MongoDB Atlas Monitoring

- Ve a MongoDB Atlas → **Metrics**
- Uso de base de datos
- Performance y conexiones

### Upstash Monitoring

- Ve a Upstash → Tu database → **Metrics**
- Requests y uso
- Límites del plan free

---

## 💰 Costos

### Plan Free (Suficiente para empezar)

- **Vercel**: Gratis (hasta cierto límite)
- **Railway**: $5/mes (500 horas gratis, luego $0.01/hora)
- **MongoDB Atlas**: Gratis (512MB storage)
- **Upstash Redis**: Gratis (10,000 requests/día)

**Total**: ~$5/mes o menos

---

## 🔐 Seguridad

### Variables de Entorno

- ✅ **NUNCA** commitees `.env` a GitHub
- ✅ Usa Variables de Entorno en Railway/Vercel
- ✅ Rota tokens periódicamente

### CORS

- ✅ Backend solo acepta requests de tu dominio de Vercel
- ✅ No uses `*` en producción

### MongoDB

- ✅ Usa contraseñas fuertes
- ✅ Limita Network Access a IPs necesarias
- ✅ Rota credenciales periódicamente

---

## 📝 Checklist Final

- [ ] Repo creado en GitHub
- [ ] Código pusheado a GitHub
- [ ] MongoDB Atlas cluster creado
- [ ] MongoDB connection string obtenido
- [ ] Upstash Redis creado
- [ ] Redis credentials obtenidos
- [ ] Railway proyecto creado
- [ ] Variables de entorno configuradas en Railway
- [ ] Backend deployado en Railway
- [ ] Backend health check funciona
- [ ] Vercel proyecto creado
- [ ] Variable `VITE_API_URL` configurada en Vercel
- [ ] Frontend deployado en Vercel
- [ ] App funciona end-to-end
- [ ] Logs están disponibles

---

## 🎉 ¡Listo!

Tu app está completamente deployada en la nube:

- ✅ **Frontend**: `https://groceriando.vercel.app`
- ✅ **Backend**: `https://groceriando-backend.railway.app`
- ✅ **MongoDB**: MongoDB Atlas (cloud)
- ✅ **Redis**: Upstash (cloud)
- ✅ **CI/CD**: Automático con GitHub

**Cada vez que hagas push a `main`, Railway y Vercel automáticamente harán deploy de los cambios.**

---

## 📚 Recursos Adicionales

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Upstash Docs**: https://docs.upstash.com

---

**Fecha:** Enero 28, 2026  
**Status:** ✅ **GUÍA COMPLETA DE DEPLOYMENT**
