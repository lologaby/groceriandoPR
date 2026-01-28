# ⚡ Quick Start - Deployment en 10 Minutos

## 🎯 Resumen Rápido

1. **GitHub**: Push código
2. **MongoDB Atlas**: Crear cluster (5 min)
3. **Upstash**: Crear Redis (2 min)
4. **Railway**: Deploy backend (3 min)
5. **Vercel**: Deploy frontend (2 min)

**Total**: ~15 minutos

---

## 📋 Checklist Rápido

### ✅ Paso 1: GitHub (2 min)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/groceriando.git
git push -u origin main
```

### ✅ Paso 2: MongoDB Atlas (5 min)

1. https://www.mongodb.com/cloud/atlas → Crear cuenta
2. Crear **Free Cluster** (M0)
3. **Database Access** → Crear usuario
4. **Network Access** → Agregar `0.0.0.0/0`
5. **Connect** → Copiar connection string
6. Formato: `mongodb+srv://user:pass@cluster.mongodb.net/groceriando`

### ✅ Paso 3: Upstash Redis (2 min)

1. https://upstash.com → Crear cuenta
2. **Redis** → **Create Database**
3. Nombre: `groceriando-redis`
4. Copiar **REST URL** y **REST TOKEN**

### ✅ Paso 4: Railway Backend (3 min)

1. https://railway.app → Crear cuenta (GitHub)
2. **New Project** → **Deploy from GitHub**
3. Selecciona repo `groceriando`
4. **Variables** → Agregar:

```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/groceriando
REDIS_URL=redis://default:token@xxxxx.upstash.io:6379
NODE_ENV=production
PORT=3001
```

5. Railway auto-deploy
6. Copiar URL del backend (ej: `https://groceriando-backend.railway.app`)

### ✅ Paso 5: Vercel Frontend (2 min)

1. https://vercel.com → Crear cuenta (GitHub)
2. **Add New** → **Project**
3. Importar repo `groceriando`
4. **Settings** → **Environment Variables**:

```bash
VITE_API_URL=https://groceriando-backend.railway.app
```

5. **Deploy**
6. ¡Listo! Tu app está en `https://groceriando.vercel.app`

---

## 🔧 Configuración Rápida

### Archivos Necesarios (Ya Creados)

- ✅ `vercel.json` - Configuración de Vercel
- ✅ `railway.json` - Configuración de Railway
- ✅ `backend/nixpacks.toml` - Puppeteer en Railway
- ✅ `.env.production.example` - Ejemplos de variables

### Variables de Entorno Mínimas

**Railway (Backend)**:
```bash
MONGODB_URI=...
REDIS_URL=...
NODE_ENV=production
```

**Vercel (Frontend)**:
```bash
VITE_API_URL=https://tu-backend.railway.app
```

---

## ✅ Verificar Deployment

### Backend Health Check

```bash
curl https://tu-backend.railway.app/health
```

Debería retornar:
```json
{
  "ok": true,
  "redis": "connected",
  "mongodb": "connected"
}
```

### Frontend

1. Ve a `https://tu-app.vercel.app`
2. Busca un producto
3. Verifica que funcione

---

## 🐛 Problemas Comunes

### Backend no conecta

- ✅ Verifica `MONGODB_URI` y `REDIS_URL` en Railway
- ✅ Verifica Network Access en MongoDB Atlas
- ✅ Verifica logs en Railway

### Frontend no llama al backend

- ✅ Verifica `VITE_API_URL` en Vercel
- ✅ Verifica CORS en backend
- ✅ Verifica URL del backend en Railway

### Puppeteer no funciona

- ✅ Verifica `nixpacks.toml` en backend
- ✅ Verifica logs en Railway
- ✅ Agrega variables de Puppeteer si es necesario

---

## 📚 Documentación Completa

Para más detalles, ver: `DEPLOYMENT_GUIDE.md`

---

**¡Listo!** Tu app está en la nube. 🚀
