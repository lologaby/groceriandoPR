# 🚀 Setup Rápido - Scraping Completo de Catálogos

## ✅ Lo que se Implementó

Tu app ahora hace **scraping completo de catálogos** en background y guarda todo en **MongoDB**. Los usuarios buscan en la base de datos local, no en tiempo real.

---

## 🏃 Inicio Rápido

### 1. Instalar MongoDB

**Opción A: Docker (Recomendado)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Opción B: MongoDB Atlas (Cloud - Gratis)**
1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea cuenta y cluster gratuito
3. Obtén connection string
4. Copia a `MONGODB_URI` en `.env`

### 2. Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
```

Edita `.env`:
```bash
MONGODB_URI=mongodb://localhost:27017/groceriando
# O MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/groceriando

# Opcional: Scraping al iniciar (solo primera vez)
SCRAPE_ON_START=false
```

### 3. Iniciar Servidor

```bash
npm run dev
```

Deberías ver:
```
[MongoDB] ✅ Conectado exitosamente
[Catalog Scraping Jobs] ✅ Jobs programados iniciados:
  - Scraping completo diario: 3:00 AM
  - Scraping incremental: Cada 6 horas
  - Scraping completo semanal: Domingos 2:00 AM
```

---

## 🧪 Probar el Sistema

### Test 1: Verificar Base de Datos Vacía

```bash
# Conectar a MongoDB
mongosh mongodb://localhost:27017/groceriando

# Ver productos (debería estar vacío inicialmente)
db.storeproducts.countDocuments()
# Resultado: 0
```

### Test 2: Ejecutar Scraping Manual (Primera Vez)

```bash
# El scraping se ejecutará automáticamente según el schedule
# O puedes ejecutarlo manualmente creando un endpoint temporal

# Por ahora, espera a que se ejecute automáticamente a las 3 AM
# O modifica el schedule para que se ejecute más pronto
```

### Test 3: Buscar Productos (Después de Scraping)

```bash
# Buscar en base de datos
curl -X POST http://localhost:3001/api/products/check-stores \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "leche",
    "userLocation": "Bayamón"
  }'
```

**Respuesta:**
```json
{
  "productName": "leche",
  "results": [
    {
      "storeName": "SuperMax",
      "location": "Bayamón",
      "price": 3.99,
      "available": true,
      "status": "found"
    },
    ...
  ],
  "source": "database"
}
```

### Test 4: Ver Estadísticas

```bash
curl http://localhost:3001/api/products/stats
```

**Respuesta:**
```json
{
  "totalProducts": 12500,
  "productsByStore": {
    "supermax": 3200,
    "econo": 2800
  },
  "lastScraped": "2026-01-28T03:00:00Z"
}
```

---

## 📊 Flujo Completo

### Scraping Automático

```
1. Scheduled Job se ejecuta (3 AM diario)
   ↓
2. Scrapea TODOS los productos de TODOS los supermercados
   ↓
3. Guarda en MongoDB
   ↓
4. Usuarios buscan → Consultan MongoDB (rápido)
```

### Búsqueda de Usuario

```
Usuario busca "Jamón"
   ↓
API busca en MongoDB
   ↓
Retorna resultados INMEDIATAMENTE (< 100ms)
   ↓
Usuario ve precios de todos los supermercados
```

---

## 🔧 Comandos Útiles

### Ver Base de Datos

```bash
# Conectar
mongosh mongodb://localhost:27017/groceriando

# Ver productos
db.storeproducts.find().limit(10)

# Contar productos
db.storeproducts.countDocuments()

# Productos por store
db.storeproducts.aggregate([
  { $group: { _id: "$storeId", count: { $sum: 1 } } }
])

# Buscar producto
db.storeproducts.find({ name: /jamón/i })

# Ver jobs de scraping
db.scrapingjobs.find().sort({ createdAt: -1 }).limit(5)
```

### Limpiar Base de Datos

```bash
mongosh mongodb://localhost:27017/groceriando

# Eliminar todos los productos
db.storeproducts.deleteMany({})

# Eliminar productos de un store específico
db.storeproducts.deleteMany({ storeId: "supermax" })

# Eliminar productos antiguos (> 7 días)
db.storeproducts.deleteMany({
  lastScraped: { $lt: new Date(Date.now() - 7*24*60*60*1000) }
})
```

---

## 🐛 Troubleshooting

### MongoDB no conecta

```bash
# Verificar que MongoDB está corriendo
docker ps | grep mongo

# O verificar conexión
mongosh mongodb://localhost:27017/groceriando
```

### Scraping no se ejecuta

```bash
# Verificar logs del servidor
# Deberías ver:
[Catalog Scraping Jobs] ✅ Jobs programados iniciados

# Verificar jobs en MongoDB
mongosh mongodb://localhost:27017/groceriando
db.scrapingjobs.find().sort({ createdAt: -1 }).limit(5)
```

### Base de datos vacía

```bash
# El scraping se ejecuta automáticamente según el schedule
# Para ejecutar manualmente, espera al schedule o:
# 1. Cambia el schedule temporalmente
# 2. O crea endpoint para ejecutar manualmente
```

---

## 📝 Próximos Pasos

### Frontend (Actualizar)

El frontend NO necesita cambios - la API sigue siendo la misma. Solo que ahora busca en MongoDB en lugar de hacer scraping.

### Mejoras Futuras

- [ ] Dashboard de scraping jobs
- [ ] Endpoint para ejecutar scraping manual
- [ ] WebSockets para progreso en tiempo real
- [ ] Analytics de productos más buscados

---

## ✅ Checklist de Setup

- [ ] MongoDB instalado y corriendo
- [ ] `MONGODB_URI` configurado
- [ ] Servidor iniciado sin errores
- [ ] Scheduled jobs iniciados (ver logs)
- [ ] Base de datos lista para recibir datos
- [ ] Esperar scraping automático o ejecutar manualmente

---

**¡Listo!** Tu app ahora scrapea catálogos completos en background y los usuarios buscan en la base de datos local. 🚀

**Fecha:** Enero 28, 2026  
**Status:** ✅ **IMPLEMENTADO Y LISTO PARA USAR**
