# 🛒 Filtrado de Productos - Solo Comida/Groceries

## 📋 Resumen

El sistema ahora **filtra automáticamente** todos los productos para asegurar que solo se muestren productos de **comida/groceries** que realmente se venden en supermercados. Se excluyen películas, electrónicos, ropa y otros productos no relacionados.

---

## ✅ Filtros Implementados

### 1. **Validación en Búsqueda de Productos** (`productDatabaseService.ts`)

Cuando se buscan productos en UPCitemdb o la base local:

- ✅ Filtra resultados para solo incluir comida/groceries
- ✅ Infiere categorías válidas si no están disponibles
- ✅ Rechaza productos con keywords inválidos (películas, electrónicos, etc.)

### 2. **Validación en Scraping de Catálogos** (`catalogScraperService.ts`)

Cuando se scrapean catálogos completos:

- ✅ Valida cada producto antes de guardarlo en MongoDB
- ✅ Solo guarda productos de comida/groceries
- ✅ Rechaza productos no relacionados (películas, etc.)
- ✅ Infiere categorías válidas automáticamente

### 3. **Validación en Búsqueda en Base de Datos** (`productSearchService.ts`)

Cuando se buscan productos en la base de datos local:

- ✅ Filtra resultados para solo mostrar comida/groceries
- ✅ Valida cada resultado antes de retornarlo
- ✅ Asegura consistencia en todos los endpoints

---

## 🔍 Cómo Funciona la Validación

### Keywords Válidos (Comida)

El sistema acepta productos que contengan:

- **Categorías**: Lácteos, Carnes, Frutas, Vegetales, Despensa, Bebidas, Panadería, etc.
- **Palabras clave**: comida, grocery, supermarket, food, eat, cook, ingredient, meal, snack, beverage
- **Productos específicos**: jamón, leche, arroz, aceite, azúcar, harina, huevo, pan, pasta, etc.
- **Marcas comunes en PR**: Goya, Tres Monjitas, Hormel, Heinz, Nestle, Kraft, etc.
- **Tamaños**: Patrones como "8 oz", "1 gal", "2 lb", etc.

### Keywords Inválidos (Rechazados)

El sistema rechaza productos que contengan:

- **Entretenimiento**: movie, película, dvd, blu-ray, video, film
- **Electrónica**: phone, tablet, laptop, computer, tv, camera, headphones
- **Ropa**: clothing, shirt, pants, shoes, clothes
- **Hogar**: furniture, appliance, tool
- **Juguetes**: toy, games, board game
- **Libros**: book, magazine
- **Deportes**: sports, equipment
- **Otros**: software, hardware, accessory

---

## 📊 Ejemplos

### ✅ Productos Aceptados

```
✅ "Jamón Hormel Original 8 oz"
✅ "Leche Tres Monjitas Entera 1 gal"
✅ "Arroz Canilla Goya 5 lb"
✅ "Aceite Mazola 48 oz"
✅ "Huevos Grade A Dozen"
✅ "Pan Bimbo Blanco"
✅ "Coca-Cola 12 pk"
✅ "Ketchup Heinz 20 oz"
```

### ❌ Productos Rechazados

```
❌ "The Avengers DVD"
❌ "iPhone 15 Pro Max"
❌ "Nike Running Shoes"
❌ "Samsung 55" TV"
❌ "Harry Potter Book"
❌ "PlayStation 5"
❌ "Laptop Dell XPS"
```

---

## 🔧 Implementación Técnica

### Función Principal: `isValidFoodProduct()`

```typescript
isValidFoodProduct(
  name: string,
  category?: string,
  description?: string
): boolean
```

**Lógica:**
1. Verifica que NO tenga keywords inválidos
2. Verifica categoría válida
3. Verifica keywords de comida
4. Verifica patrones comunes de productos de comida
5. Si no pasa ninguna validación, rechaza por seguridad

### Función de Filtrado: `filterFoodProducts()`

```typescript
filterFoodProducts<T>(products: T[]): T[]
```

Filtra un array de productos para solo incluir comida/groceries válidos.

### Función de Inferencia: `inferFoodCategory()`

```typescript
inferFoodCategory(name: string, existingCategory?: string): string
```

Infiere la categoría correcta basada en el nombre del producto si no está disponible.

---

## 📍 Dónde se Aplica

### 1. Búsqueda Inicial (`GET /api/products/search`)

```typescript
// En productDatabaseService.ts
const filtered = filterFoodProducts(mapped);
return filtered.slice(0, 20);
```

### 2. Scraping de Catálogos (`catalogScraperService.ts`)

```typescript
// Antes de guardar en MongoDB
if (!isValidFoodProduct(name, category, description)) {
  console.log(`⏭️ Producto rechazado (no es comida): ${name}`);
  return 'skipped';
}
```

### 3. Búsqueda en Base de Datos (`POST /api/products/check-stores`)

```typescript
// En productSearchService.ts
products = products.filter((product) =>
  isValidFoodProduct(product.name, product.category, product.description)
);
```

---

## 🧪 Testing

### Test Manual

```bash
# Buscar producto de comida (debe aparecer)
curl "http://localhost:3001/api/products/search?q=jamón"

# Buscar película (no debe aparecer)
curl "http://localhost:3001/api/products/search?q=avengers"

# Buscar electrónico (no debe aparecer)
curl "http://localhost:3001/api/products/search?q=iphone"
```

### Verificar en Base de Datos

```bash
mongosh mongodb://localhost:27017/groceriando

# Ver productos guardados (solo comida)
db.storeproducts.find().limit(10)

# Contar productos por categoría
db.storeproducts.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } }
])
```

---

## ⚙️ Configuración

Los filtros están **activados por defecto** y no requieren configuración adicional.

Si necesitas ajustar los filtros, edita:
- `backend/src/utils/productValidator.ts`
- Agrega/quita keywords en `VALID_CATEGORIES`, `INVALID_KEYWORDS`, `FOOD_KEYWORDS`

---

## 📝 Logs

El sistema registra cuando rechaza productos:

```
⏭️ Producto rechazado (no es comida): The Avengers DVD
⏭️ Producto rechazado (no es comida): iPhone 15 Pro Max
```

Esto ayuda a identificar productos que deberían ser aceptados pero están siendo rechazados incorrectamente.

---

## 🎯 Beneficios

### Para Usuarios

- ✅ Solo ven productos relevantes (comida/groceries)
- ✅ No se confunden con películas o electrónicos
- ✅ Búsquedas más precisas y rápidas

### Para el Sistema

- ✅ Base de datos más limpia
- ✅ Menos almacenamiento innecesario
- ✅ Búsquedas más rápidas (menos datos)

---

## 🔄 Actualización de Filtros

Si encuentras productos que deberían ser aceptados/rechazados:

1. Edita `backend/src/utils/productValidator.ts`
2. Agrega keywords a las listas apropiadas
3. Reinicia el servidor
4. Los nuevos filtros se aplicarán automáticamente

---

**Fecha:** Enero 28, 2026  
**Status:** ✅ **IMPLEMENTADO Y FUNCIONANDO**  
**Filtros:** Solo comida/groceries, sin películas ni productos no relacionados
