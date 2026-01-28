# Groceriando 🇵🇷

App de **lista de compras** para Puerto Rico que se integra con **Notion**. Buscas productos en una base externa → eliges uno → la app busca en supermercados de PR dónde lo venden y a qué precio → comparas y agregas a tu lista en Notion.

## Flujo (importante)

1. **Buscar** → Resultados de **base de productos** (UPCitemdb o fallback local). **No** se hace scraping.
2. **Tocar "Ver dónde comprar"** → **Ahí** se ejecuta el scraping en SuperMax, Econo, Walmart, Selectos, etc.
3. **Comparar** precios y disponibilidad por tienda.
4. **Agregar a Notion** con la tienda elegida, precios y link.

## Stack

- **Frontend:** React, TypeScript, Tailwind CSS, React Query, React Router, Vite
- **Backend:** Node.js, Express, TypeScript
- **Productos:** UPCitemdb API + fallback local (JSON)
- **Listas:** Notion API
- **Scraping:** Puppeteer (SuperMax, Econo, Walmart, Selectos). Costco y Sam's Club → 🔐 Requiere membresía (en desarrollo). Pueblo, Amigo, Agranel, Ralph's sin e‑commerce → "Verificar en tienda".

## Requisitos

- Node.js 18+
- npm 9+
- Cuenta Notion + integración + base compartida con la integración

## Setup

```bash
git clone <repo>
cd groceriando
npm install
```

### Variables de entorno

**Backend** (`backend/.env`):

```env
PORT=3001
# Opcional:
NOTION_API_KEY=secret_xxx
NOTION_DATABASE_ID=xxx
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

**Frontend:** En dev el proxy envía `/api` al backend. En producción, `VITE_API_URL` si el API está en otro origen.

### Notion

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) → Nueva integración (Internal).
2. Copia el **Internal Integration Token** (API Key).
3. Crea la base "🛒 Lista de Compras" con las propiedades indicadas abajo y **comparte la base** con la integración.
4. Database ID = fragmento de la URL de la base (entre el workspace y `?v=`).

Configura **API Key** y **Database ID** en la pestaña **Notion** de la app.

### Ejecutar

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)  
- Backend: [http://localhost:3001](http://localhost:3001)

## Uso

1. **Buscar:** Escribe algo (ej. *Jamón Hormel*, *arroz*), pulsa **Buscar**. Salen productos de la base (UPCitemdb o local).
2. **Ver dónde comprar:** Toca un producto → "🏪 Ver dónde comprar". La app busca en supermercados (solo en ese momento).
3. **Comparar:** Ves precios por tienda, mejor precio, recomendaciones (mejor precio unitario, cercanía) y "Agregar a mi lista" / "Ver en tienda".
4. **Agregar a Notion:** Elige tienda, cantidad y notas en el modal → **Agregar a Notion**.

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/products/search?q=...` | Búsqueda en base de productos (cache 24 h). |
| `POST` | `/api/products/check-stores` | Scraping por producto + ubicación (cache 2 h). Body: `productName`, `upc`, `brand?`, `userLocation`, `size?`. Rate limit: 5 req/min. |
| `POST` | `/api/notion/add-item` | Añade ítem a Notion. Body: `notionApiKey`, `databaseId`, `productData`. |
| `GET`  | `/api/notion/list` | Lista ítems no comprados. Query: `notionApiKey`, `databaseId`. |
| `PATCH`| `/api/notion/mark-purchased/:pageId` | Marca comprado. Body: `notionApiKey`. |

## Base de productos

- **UPCitemdb** (trial): `https://api.upcitemdb.com/prod/trial/search?s=...`. Límite ~100 req/día.
- **Fallback:** `backend/src/services/productDatabaseLocal.ts` — productos locales (JSON). Puedes ampliarlo.

Cache de búsquedas: **24 h** en memoria.

## Scraping

- **Con e‑commerce:** SuperMax (supermaxonline.com), Econo, Walmart, Selectos. Scrapers en `backend/src/scrapers/`.
- **Sin e‑commerce:** Pueblo, Amigo, Agranel, Ralph's. Se muestra "Verificar disponibilidad en tienda".
- **Check-stores:** Solo al tocar "Ver dónde comprar". Rate limit, timeout 15 s por tienda, retry con backoff. Cache **2 h** por `(upc, ubicación)`.

## Notion — propiedades de la base

| Propiedad | Tipo | Uso |
|-----------|------|-----|
| Producto | Title | Nombre |
| Marca | Text | Marca |
| UPC | Text | Código de barras |
| Categoría | Select | General, Lácteos, Carnes, … |
| Cantidad | Number | Unidades |
| ✅ Comprado | Checkbox | Marcado al comprar |
| Mejor Precio | Number | Precio del ítem agregado |
| Dónde Comprar | Select | SuperMax, Econo, … |
| Ubicación | Select | Bayamón, San Juan, … |
| Precio SuperMax, Precio Econo, … | Number | Por tienda |
| Disponible en | Multi-select | Tiendas donde está |
| Link Producto | URL | Enlace en la tienda elegida |
| Última Actualización | Date | Fecha de verificación |
| Notas | Text | Opcional |

## Código

- **ESLint + Prettier:** `npm run lint`, `npm run format`.
- Estructura: `hooks/`, `utils/`, `constants/`, componentes con `ProductCard`, `StoreCard`, `StoreLoadingIndicator`, `AlternativeSuggestions`.
- TypeScript strict. Comentarios en español.

## Licencia

MIT.
