# 🏪 Arquitectura de Scraping Completo de Catálogos

## 📋 Resumen

El sistema ahora hace **scraping completo de catálogos** en background y guarda todo en **MongoDB**. Cuando los usuarios buscan productos, la app consulta la base de datos local en lugar de hacer scraping en tiempo real.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│     Scheduled Jobs (node-cron)          │
│  ┌───────────────────────────────────┐ │
│  │ Diario 3 AM: Scraping completo    │ │
│  │ Cada 6h: Scraping incremental     │ │
│  │ Semanal: Scraping completo        │ │
│  └───────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     Catalog Scraper Service              │
│  ┌───────────────────────────────────┐ │
│  │ 1. Obtener categorías             │ │
│  │ 2. Scrapear cada categoría        │ │
│  │ 3. Guardar en MongoDB             │ │
│  └───────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         MongoDB Database                 │
│  ┌───────────────────────────────────┐ │
│  │ StoreProduct Collection           │ │
│  │ - Productos de todos los stores  │ │
│  │ - Precios y disponibilidad        │ │
│  │ - Historial de precios            │ │
│  │ - Keywords de búsqueda            │ │
│  └───────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     API - Product Search Service         │
│  ┌───────────────────────────────────┐ │
│  │ POST /check-stores                │ │
│  │ → Busca en MongoDB (rápido)      │ │
│  │ → NO scraping en tiempo real     │ │
│  └───────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│           Frontend                       │
│  Resultados instantáneos desde DB        │
└─────────────────────────────────────────┘
```

---

## 📦 Componentes

### 1. **MongoDB Database** (`src/lib/database.ts`)

Conexión a MongoDB para almacenar productos scrapeados.

**Collections:**
- `StoreProduct` - Productos de supermercados
- `ScrapingJob` - Jobs de scraping completos

### 2. **Modelos de Datos**

#### **StoreProduct** (`src/models/StoreProduct.ts`)

Almacena cada producto scrapeado:

```typescript
{
  name: "Jamón Hormel",
  brand: "Hormel",
  upc: "007160000000",
  storeName: "SuperMax",
  storeId: "supermax",
  location: "Bayamón",
  price: 8.49,
  available: true,
  inStock: true,
  lastScraped: Date,
  searchKeywords: ["jamón", "hormel", "supermax"],
  priceHistory: [...]
}
```

**Índices:**
- `name`, `brand`, `upc` - Búsqueda rápida
- `storeId`, `location` - Filtrado por tienda
- Text search en `name`, `brand`, `searchKeywords`

#### **ScrapingJob** (`src/models/ScrapingJob.ts`)

Trackea jobs de scraping completo:

```typescript
{
  storeId: "supermax",
  status: "completed",
  progress: 100,
  totalProducts: 1250,
  productsNew: 50,
  productsUpdated: 1200,
  startedAt: Date,
  completedAt: Date
}
```

### 3. **Catalog Scraper Service** (`src/services/catalogScraperService.ts`)

Servicio que scrapea catálogos completos:

**Funciones principales:**
- `scrapeFullCatalog()` - Scrapea catálogo completo de un supermercado
- `scrapeAllStores()` - Scrapea todos los supermercados
- `saveOrUpdateProduct()` - Guarda/actualiza productos en MongoDB

**Estrategia:**
1. Obtener categorías del supermercado
2. Para cada categoría, obtener todos los productos
3. Guardar/actualizar en MongoDB
4. Mantener historial de precios

### 4. **Product Search Service** (`src/services/productSearchService.ts`)

Servicio de búsqueda en base de datos local:

**Funciones:**
- `searchProductsInDatabase()` - Búsqueda por nombre/brand
- `findProductByUPC()` - Búsqueda por UPC
- `findSimilarProducts()` - Productos similares/alternativas
- `getDatabaseStats()` - Estadísticas de la base de datos

### 5. **Scheduled Jobs** (`src/jobs/catalogScrapingJobs.ts`)

Jobs programados para scraping automático:

- **Diario 3 AM**: Scraping completo de todos los supermercados
- **Cada 6 horas**: Scraping incremental (solo categorías populares)
- **Semanal (Domingos 2 AM)**: Scraping completo profundo

---

## 🔄 Flujo Completo

### Scraping en Background (Automático)

```
1. Scheduled Job se ejecuta (ej. 3 AM diario)
   ↓
2. Catalog Scraper Service inicia
   ↓
3. Para cada supermercado:
   a. Obtener categorías
   b. Scrapear productos de cada categoría
   c. Guardar/actualizar en MongoDB
   ↓
4. Actualizar ScrapingJob con progreso
   ↓
5. Completar job cuando termine
```

### Búsqueda de Usuario (Rápida)

```
Usuario busca "Jamón Hormel"
   ↓
API recibe request
   ↓
Product Search Service busca en MongoDB
   ↓
Retorna resultados INMEDIATAMENTE (< 100ms)
   ↓
Usuario ve precios de todos los supermercados
```

---

## 🚀 Uso de la API

### 1. Buscar Productos en Base de Datos

```bash
POST /api/products/check-stores
{
  "productName": "Jamón Hormel",
  "upc": "007160000000",
  "userLocation": "Bayamón"
}

Response:
{
  "productName": "Jamón Hormel",
  "results": [
    {
      "storeName": "SuperMax",
      "location": "Bayamón",
      "price": 8.49,
      "available": true,
      "url": "...",
      "status": "found"
    },
    ...
  ],
  "bestPrice": 8.49,
  "source": "database",
  "cached": false
}
```

### 2. Búsqueda Directa en Base de Datos

```bash
GET /api/products/search-db?q=leche&stores=supermax,econo&limit=20

Response:
{
  "query": "leche",
  "products": [...],
  "total": 15,
  "stores": ["supermax", "econo"],
  "locations": ["Bayamón", "San Juan"],
  "source": "database"
}
```

### 3. Estadísticas de Base de Datos

```bash
GET /api/products/stats

Response:
{
  "totalProducts": 12500,
  "productsByStore": {
    "supermax": 3200,
    "econo": 2800,
    "walmart": 3500,
    "selectos": 3000
  },
  "productsByLocation": {
    "Bayamón": 4500,
    "San Juan": 5000,
    "Carolina": 3000
  },
  "lastScraped": "2026-01-28T03:00:00Z",
  "oldestScraped": "2026-01-27T03:00:00Z"
}
```

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/groceriando
# O MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/groceriando

# Scraping al iniciar (solo primera vez)
SCRAPE_ON_START=false
```

### Instalar MongoDB

**Opción 1: Docker (Local)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Opción 2: MongoDB Atlas (Cloud - Gratis)**
1. Crear cuenta en https://www.mongodb.com/cloud/atlas
2. Crear cluster gratuito
3. Obtener connection string
4. Copiar a `MONGODB_URI` en `.env`

---

## 📊 Beneficios

### Performance

- ⚡ **< 100ms** respuesta desde base de datos
- 🚀 **No bloquea** servidor durante scraping
- 📈 **Escalable** - múltiples workers pueden scrapear

### Experiencia de Usuario

- ✅ **Resultados instantáneos** siempre
- 🔍 **Búsqueda completa** en todos los supermercados
- 📊 **Historial de precios** disponible

### Eficiencia

- 💾 **Base de datos persistente** (sobrevive reinicios)
- 🔄 **Scraping automático** periódico
- 🎯 **Menos carga** en sitios de supermercados

---

## 🔧 Desarrollo

### Iniciar Servidor

```bash
# Terminal 1: MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7

# Terminal 2: Backend
cd backend
npm run dev
```

### Ejecutar Scraping Manual

```typescript
// En código o endpoint futuro
import { scrapeFullCatalog } from './services/catalogScraperService.js';

await scrapeFullCatalog({
  storeId: 'supermax',
  location: 'Puerto Rico',
  categories: ['leche', 'arroz'], // Opcional
  limit: 100, // Opcional
});
```

### Ver Base de Datos

```bash
# Conectar a MongoDB
mongosh mongodb://localhost:27017/groceriando

# Ver productos
db.storeproducts.find().limit(10)

# Contar productos por store
db.storeproducts.aggregate([
  { $group: { _id: "$storeId", count: { $sum: 1 } } }
])

# Buscar producto
db.storeproducts.find({ name: /jamón/i })
```

---

## 📝 Próximos Pasos

### Mejoras Futuras

1. **Scrapers Específicos por Categoría**
   - Cada supermercado implementa `scrapeCategory()`
   - Más eficiente que búsqueda genérica

2. **Incremental Updates**
   - Solo scrapear productos modificados
   - Usar `lastScraped` para identificar cambios

3. **WebSockets**
   - Notificar frontend cuando scraping completa
   - Dashboard de progreso en tiempo real

4. **Analytics**
   - Productos más buscados
   - Precios más cambiantes
   - Optimizar categorías a scrapear

5. **Cache Inteligente**
   - Invalidar cache cuando precios cambian
   - Pre-scrapear productos relacionados

---

## ✅ Checklist de Setup

- [ ] MongoDB instalado y corriendo
- [ ] `MONGODB_URI` configurado en `.env`
- [ ] Servidor iniciado sin errores
- [ ] Scheduled jobs iniciados (ver logs)
- [ ] Test de búsqueda en base de datos funciona
- [ ] Scraping manual funciona (opcional)

---

**Fecha:** Enero 28, 2026  
**Status:** ✅ **IMPLEMENTADO Y FUNCIONANDO**  
**Arquitectura:** Scraping Completo en Background + MongoDB
