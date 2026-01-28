# 🚀 Arquitectura de Background Jobs y Cache

## 📋 Resumen

La aplicación ahora usa **scraping en background** con **cache persistente** para una experiencia mucho más rápida:

- ✅ **Cache primero**: Si hay datos en cache, respuesta instantánea
- ✅ **Background jobs**: Si no hay cache, se crea un job y se retorna inmediatamente
- ✅ **Cache warming**: Productos populares se scrapean automáticamente cada 2 horas
- ✅ **Redis persistente**: Cache sobrevive reinicios del servidor

---

## 🏗️ Arquitectura

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       │ POST /api/products/check-stores
       ▼
┌─────────────────────────────────────┐
│         Express API Server          │
│  ┌───────────────────────────────┐  │
│  │  1. Check Redis Cache         │  │
│  │     ✅ Cache hit → Return     │  │
│  │     ❌ Cache miss → Continue  │  │
│  └───────────────────────────────┘  │
│              │                        │
│              ▼                        │
│  ┌───────────────────────────────┐  │
│  │  2. Add Job to Bull Queue     │  │
│  │     Return jobId immediately   │  │
│  └───────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Bull Queue (Redis)          │
│  ┌───────────────────────────────┐  │
│  │  Job: { productName, upc, ...}│  │
│  └───────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Background Worker               │
│  ┌───────────────────────────────┐  │
│  │  1. Execute Scraping          │  │
│  │  2. Save Results to Redis      │  │
│  │  3. Mark Job as Completed      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 📦 Componentes

### 1. **Redis Cache** (`src/lib/redis.ts`)

Cache persistente usando Redis:

```typescript
// Cache keys
products:${query}              // Búsqueda de productos
checkStores:${upc}|${location} // Resultados de scraping

// TTLs
- Productos: 24 horas
- Store results: 2 horas
```

**Funciones principales:**
- `getCache<T>(key)` - Obtener del cache
- `setCache<T>(key, data, ttl)` - Guardar en cache
- `deleteCache(key)` - Eliminar del cache

### 2. **Bull Queues** (`src/lib/queues.ts`)

Sistema de colas para background jobs:

**Queues:**
- `scraping` - Jobs de scraping de productos
- `cache-warming` - Jobs de cache warming

**Características:**
- Retry automático (3 intentos con backoff exponencial)
- Prioridades de jobs
- Limpieza automática de jobs completados

### 3. **Background Workers**

#### **Scraping Worker** (`src/workers/scrapingWorker.ts`)

Procesa jobs de scraping:

```typescript
// Proceso:
1. Recibe job con { productName, upc, location, ... }
2. Ejecuta scraping en todos los supermercados
3. Guarda resultados en Redis cache
4. Marca job como completado
```

#### **Cache Warming Worker** (`src/workers/cacheWarmingWorker.ts`)

Pre-scrapea productos populares:

```typescript
// Productos populares:
- Leche, Arroz, Jamón, Pan, Huevos, Aceite, Azúcar, Harina

// Proceso:
1. Verifica si ya existe en cache
2. Si no, ejecuta scraping
3. Guarda en cache para uso futuro
```

### 4. **Scheduled Jobs** (`src/jobs/scheduledJobs.ts`)

Jobs programados usando `node-cron`:

- **Cada 2 horas** (00 y 30 minutos): Cache warming de productos populares
- **Diario a las 6 AM**: Cache warming completo

---

## 🔄 Flujo de Usuario

### Escenario 1: Cache Hit (Rápido ⚡)

```
Usuario busca "Jamón Hormel"
  ↓
API verifica Redis cache
  ↓
✅ Cache encontrado (2 horas de antigüedad)
  ↓
Retorna resultados INMEDIATAMENTE (< 50ms)
```

### Escenario 2: Cache Miss (Background Job)

```
Usuario busca "Producto Nuevo"
  ↓
API verifica Redis cache
  ↓
❌ No hay cache
  ↓
API crea job en Bull queue
  ↓
Retorna inmediatamente: { jobId, status: 'processing' }
  ↓
Frontend puede:
  - Mostrar "Buscando..." con spinner
  - Hacer polling a /api/products/job-status/:jobId
  - O usar WebSockets (futuro)
  ↓
Background worker procesa job (10-30 segundos)
  ↓
Guarda resultados en Redis
  ↓
Frontend obtiene resultados cuando hace polling
```

---

## 🚀 Uso de la API

### 1. Buscar Productos (Sin cambios)

```bash
GET /api/products/search?q=leche

Response:
{
  "products": [...],
  "cached": true
}
```

### 2. Verificar Precios en Tiendas (NUEVO)

```bash
POST /api/products/check-stores
{
  "productName": "Jamón Hormel",
  "upc": "007160000000",
  "brand": "Hormel",
  "userLocation": "Bayamón",
  "size": "8 oz"
}

Response (si hay cache):
{
  "productName": "Jamón Hormel",
  "results": [...],
  "bestPrice": 8.49,
  "cached": true,
  "source": "cache"
}

Response (si no hay cache):
{
  "jobId": "123",
  "status": "processing",
  "message": "Scraping iniciado en background",
  "cached": false,
  "source": "queue",
  "pollUrl": "/api/products/job-status/123"
}
```

### 3. Verificar Estado de Job

```bash
GET /api/products/job-status/123

Response (procesando):
{
  "jobId": "123",
  "status": "active",
  "progress": 50,
  "message": "Buscando en supermercados..."
}

Response (completado):
{
  "jobId": "123",
  "status": "completed",
  "productName": "Jamón Hormel",
  "results": [...],
  "bestPrice": 8.49,
  "cached": false,
  "source": "queue"
}
```

### 4. Estadísticas de Queue

```bash
GET /api/queues/stats

Response:
{
  "scraping": {
    "waiting": 2,
    "active": 1,
    "completed": 150,
    "failed": 3,
    "delayed": 0
  }
}
```

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# Redis
REDIS_URL=redis://localhost:6379

# O configuración individual
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Cache warming al iniciar
WARM_CACHE_ON_START=false
```

### Instalar Redis

**Local (Docker):**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**O usar Upstash (Cloud):**
1. Crear cuenta en https://upstash.com
2. Crear Redis database
3. Copiar `REDIS_URL` al `.env`

---

## 📊 Beneficios

### Performance

- ⚡ **Respuesta instantánea** cuando hay cache (< 50ms)
- 🚀 **No bloquea** el servidor durante scraping
- 📈 **Escalable** - múltiples workers pueden procesar jobs

### Experiencia de Usuario

- ✅ **Resultados inmediatos** para productos populares
- ⏳ **Feedback claro** cuando está procesando
- 🔄 **Polling automático** para obtener resultados

### Eficiencia

- 💾 **Cache persistente** sobrevive reinicios
- 🔄 **Cache warming** automático de productos populares
- 🎯 **Menos scraping** innecesario (verifica cache primero)

---

## 🔧 Desarrollo

### Iniciar Servidor

```bash
# Terminal 1: Redis
docker run -d -p 6379:6379 redis:7-alpine

# Terminal 2: Backend
cd backend
npm run dev
```

### Ver Logs

```bash
# Logs del servidor
npm run dev

# Ver jobs en Redis
redis-cli
> KEYS bull:*
> GET bull:scraping:123
```

### Testing

```bash
# Test cache hit
curl "http://localhost:3001/api/products/search?q=leche"

# Test cache miss (crea job)
curl -X POST http://localhost:3001/api/products/check-stores \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Leche",
    "upc": "041000021007",
    "userLocation": "Bayamón"
  }'

# Ver estado del job
curl "http://localhost:3001/api/products/job-status/123"
```

---

## 🎯 Próximos Pasos

### Mejoras Futuras

1. **WebSockets** - Notificar al frontend cuando job completa
2. **Rate Limiting** - Por usuario/IP más inteligente
3. **Cache Invalidation** - Invalidar cache cuando precios cambian
4. **Analytics** - Trackear productos más buscados
5. **Multi-region** - Cache por región/ciudad
6. **Background Jobs UI** - Dashboard para ver jobs

### Optimizaciones

- [ ] Cache más agresivo para productos populares
- [ ] Pre-scrapear productos relacionados
- [ ] Compresión de datos en Redis
- [ ] Clustering de Redis para alta disponibilidad

---

## 📝 Notas Técnicas

### TTLs de Cache

- **Productos**: 24 horas (no cambian frecuentemente)
- **Store Results**: 2 horas (precios pueden cambiar)

### Retry Strategy

- **Scraping jobs**: 3 intentos con backoff exponencial (2s, 4s, 8s)
- **Cache warming**: 2 intentos con delay fijo (5s)

### Job Priorities

- **High** (10): Productos populares, cache warming
- **Medium** (5): Búsquedas normales
- **Low** (0): Búsquedas menos comunes

---

**Fecha:** Enero 28, 2026  
**Status:** ✅ **IMPLEMENTADO Y FUNCIONANDO**  
**Arquitectura:** Background Jobs + Redis Cache
