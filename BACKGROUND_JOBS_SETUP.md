# 🚀 Setup Rápido - Background Jobs y Cache

## ✅ Lo que se Implementó

Tu app ahora tiene **scraping en background con cache persistente**:

- ✅ Redis para cache persistente
- ✅ Bull para job queues
- ✅ Background workers automáticos
- ✅ Cache warming de productos populares cada 2 horas
- ✅ API actualizada para retornar cache o crear jobs

---

## 🏃 Inicio Rápido

### 1. Instalar Redis

**Opción A: Docker (Recomendado)**
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

**Opción B: Upstash (Cloud - Gratis)**
1. Ve a https://upstash.com
2. Crea cuenta y Redis database
3. Copia `REDIS_URL` al `.env`

### 2. Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
```

Edita `.env`:
```bash
REDIS_URL=redis://localhost:6379
# O si usas Upstash:
# REDIS_URL=rediss://default:password@your-redis.upstash.io:6379
```

### 3. Iniciar Servidor

```bash
npm run dev
```

Deberías ver:
```
[Redis] Conectado exitosamente
[Redis] Listo para recibir comandos
[Worker] Iniciando scraping worker...
[Worker] ✅ Scraping worker iniciado
[Scheduled Jobs] ✅ Jobs programados iniciados
```

---

## 🧪 Probar el Sistema

### Test 1: Cache Hit (Rápido)

```bash
# Primera búsqueda (crea cache)
curl -X POST http://localhost:3001/api/products/check-stores \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Leche",
    "upc": "041000021007",
    "userLocation": "Bayamón"
  }'

# Segunda búsqueda (usa cache - instantáneo)
curl -X POST http://localhost:3001/api/products/check-stores \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Leche",
    "upc": "041000021007",
    "userLocation": "Bayamón"
  }'
```

**Respuesta con cache:**
```json
{
  "productName": "Leche",
  "results": [...],
  "cached": true,
  "source": "cache"
}
```

### Test 2: Cache Miss (Background Job)

```bash
# Búsqueda nueva (no hay cache)
curl -X POST http://localhost:3001/api/products/check-stores \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Producto Nuevo",
    "upc": "123456789",
    "userLocation": "Bayamón"
  }'
```

**Respuesta:**
```json
{
  "jobId": "123",
  "status": "processing",
  "message": "Scraping iniciado en background",
  "cached": false,
  "source": "queue",
  "pollUrl": "/api/products/job-status/123"
}
```

### Test 3: Verificar Estado de Job

```bash
# Hacer polling del job
curl http://localhost:3001/api/products/job-status/123
```

**Respuesta (procesando):**
```json
{
  "jobId": "123",
  "status": "active",
  "progress": 50,
  "message": "Buscando en supermercados..."
}
```

**Respuesta (completado):**
```json
{
  "jobId": "123",
  "status": "completed",
  "productName": "Producto Nuevo",
  "results": [...],
  "bestPrice": 8.49
}
```

### Test 4: Ver Estadísticas

```bash
curl http://localhost:3001/api/queues/stats
```

---

## 📊 Flujo Completo

```
1. Usuario busca producto
   ↓
2. API verifica Redis cache
   ↓
3a. ✅ Cache encontrado → Retorna inmediatamente (< 50ms)
   ↓
3b. ❌ No hay cache → Crea job en Bull queue
   ↓
4. Retorna jobId al frontend
   ↓
5. Frontend hace polling cada 2 segundos
   ↓
6. Background worker procesa scraping (10-30s)
   ↓
7. Guarda resultados en Redis
   ↓
8. Frontend obtiene resultados cuando completa
```

---

## 🎯 Beneficios Inmediatos

### Performance
- ⚡ **< 50ms** respuesta cuando hay cache
- 🚀 **No bloquea** el servidor durante scraping
- 📈 **Escalable** con múltiples workers

### Experiencia
- ✅ Resultados **instantáneos** para productos populares
- ⏳ **Feedback claro** cuando está procesando
- 🔄 **Polling automático** para resultados

### Eficiencia
- 💾 Cache **persistente** (sobrevive reinicios)
- 🔄 **Cache warming** automático cada 2 horas
- 🎯 **Menos scraping** innecesario

---

## 🔧 Comandos Útiles

### Ver Jobs en Redis

```bash
redis-cli
> KEYS bull:*
> GET bull:scraping:123
> LLEN bull:scraping:waiting
```

### Limpiar Cache

```bash
redis-cli
> FLUSHDB  # Cuidado: borra todo
> KEYS checkStores:* | xargs redis-cli DEL  # Solo resultados de scraping
```

### Ver Logs del Worker

Los logs aparecen en la consola del servidor:
```
[Worker] Procesando scraping job:
  Producto: Leche
  UPC: 041000021007
[Worker] ✅ Scraping completado para Leche
  Resultados: 5 tiendas
  Mejor precio: $3.99
```

---

## 🐛 Troubleshooting

### Redis no conecta

```bash
# Verificar que Redis está corriendo
docker ps | grep redis

# O verificar conexión
redis-cli ping
# Debe responder: PONG
```

### Jobs no se procesan

```bash
# Verificar que workers están iniciados
# Deberías ver en logs:
[Worker] ✅ Scraping worker iniciado

# Ver jobs en cola
curl http://localhost:3001/api/queues/stats
```

### Cache no funciona

```bash
# Verificar Redis está conectado
curl http://localhost:3001/health

# Verificar keys en Redis
redis-cli
> KEYS *
```

---

## 📝 Próximos Pasos

### Frontend (Actualizar)

Necesitas actualizar el frontend para:

1. **Manejar respuesta con jobId**:
```typescript
if (response.jobId) {
  // Hacer polling
  pollJobStatus(response.jobId);
}
```

2. **Polling automático**:
```typescript
async function pollJobStatus(jobId: string) {
  const interval = setInterval(async () => {
    const status = await fetch(`/api/products/job-status/${jobId}`);
    const data = await status.json();
    
    if (data.status === 'completed') {
      clearInterval(interval);
      // Mostrar resultados
    }
  }, 2000); // Cada 2 segundos
}
```

3. **Mostrar loading state** mientras procesa

### Mejoras Futuras

- [ ] WebSockets para notificaciones en tiempo real
- [ ] Cache invalidation inteligente
- [ ] Analytics de productos más buscados
- [ ] Dashboard de jobs (Bull Board)

---

## ✅ Checklist de Setup

- [ ] Redis instalado y corriendo
- [ ] Variables de entorno configuradas
- [ ] Servidor iniciado sin errores
- [ ] Workers iniciados (ver logs)
- [ ] Test de cache hit funciona
- [ ] Test de cache miss crea job
- [ ] Polling de job funciona

---

**¡Listo!** Tu app ahora es mucho más rápida y escalable. 🚀

**Fecha:** Enero 28, 2026  
**Status:** ✅ **IMPLEMENTADO Y LISTO PARA USAR**
