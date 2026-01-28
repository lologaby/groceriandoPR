# ✅ Checklist de Deployment

## Pre-Deployment

- [ ] Código está en GitHub
- [ ] `.gitignore` está configurado correctamente
- [ ] No hay secrets en el código
- [ ] TypeScript compila sin errores (`npm run build`)
- [ ] Tests pasan (si los hay)

## MongoDB Atlas

- [ ] Cuenta creada
- [ ] Cluster Free creado (M0)
- [ ] Usuario de base de datos creado
- [ ] Network Access configurado (`0.0.0.0/0` o IPs específicas)
- [ ] Connection string obtenido y guardado
- [ ] Base de datos `groceriando` creada

## Upstash Redis

- [ ] Cuenta creada
- [ ] Database Redis creada
- [ ] REST URL obtenida
- [ ] REST TOKEN obtenido
- [ ] Credentials guardados de forma segura

## Railway (Backend)

- [ ] Cuenta creada y conectada a GitHub
- [ ] Proyecto creado desde GitHub repo
- [ ] Root directory configurado (`backend` o raíz)
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Variables de entorno configuradas:
  - [ ] `MONGODB_URI`
  - [ ] `REDIS_URL` o `REDIS_HOST` + `REDIS_PASSWORD`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
  - [ ] `FRONTEND_URL` (opcional)
- [ ] `nixpacks.toml` creado para Puppeteer
- [ ] Deploy exitoso
- [ ] Health check funciona (`/health`)
- [ ] Logs se ven correctamente

## Vercel (Frontend)

- [ ] Cuenta creada y conectada a GitHub
- [ ] Proyecto creado desde GitHub repo
- [ ] Framework detectado (Vite)
- [ ] Root directory configurado (`frontend` o raíz)
- [ ] Build command configurado
- [ ] Output directory configurado (`dist`)
- [ ] Variables de entorno configuradas:
  - [ ] `VITE_API_URL` (URL del backend en Railway)
- [ ] Deploy exitoso
- [ ] App carga correctamente
- [ ] API calls funcionan

## Post-Deployment

- [ ] Frontend puede llamar al backend
- [ ] CORS está configurado correctamente
- [ ] Búsqueda de productos funciona
- [ ] Scraping funciona (si aplica)
- [ ] MongoDB está recibiendo datos
- [ ] Redis está funcionando
- [ ] Logs están disponibles
- [ ] Errores se manejan correctamente

## Opcional

- [ ] Dominio personalizado configurado
- [ ] SSL/HTTPS funcionando (automático en Vercel/Railway)
- [ ] Analytics configurado
- [ ] Monitoring configurado
- [ ] Backups configurados (MongoDB Atlas)
- [ ] CI/CD configurado (GitHub Actions)

## Verificación Final

- [ ] App funciona end-to-end
- [ ] Usuarios pueden buscar productos
- [ ] Usuarios pueden ver precios
- [ ] Usuarios pueden agregar a Notion (si aplica)
- [ ] Performance es aceptable
- [ ] No hay errores en consola
- [ ] Mobile funciona correctamente

---

**Fecha de Deployment**: _______________
**URL Frontend**: https://________________.vercel.app
**URL Backend**: https://________________.railway.app
**MongoDB Cluster**: ________________
**Redis Database**: ________________

---

## Notas

- Guarda todas las URLs y credentials de forma segura
- Documenta cualquier configuración especial
- Mantén un backup de las variables de entorno
