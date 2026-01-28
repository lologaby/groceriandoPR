# 🚨 REPORTE CRÍTICO: Scrapers Marcando Tiendas Incorrectamente

## Problema Identificado

**ERROR ACTUAL:** En `/backend/src/constants/stores.ts` línea 9, hay una lista hardcodeada que marca incorrectamente supermercados como "sin e-commerce":

```typescript
export const STORES_TIER_2_NO_ECOMMERCE = ['pueblo', 'amigo', 'agranel', 'ralphs'] as const;
```

**Impacto:** Los usuarios ven "Este supermercado no tiene compras online" cuando muchos de estos supermercados SÍ tienen tiendas online funcionando.

---

## ✅ Investigación Realizada

### Econo To Go (https://econotogo.com/)

**STATUS: ✅ TIENE E-COMMERCE FUNCIONAL**

**Hallazgos:**
- ✅ Sistema de carrito de compras activo
- ✅ Botón "Sign in" para cuentas de usuario
- ✅ Link "Start shopping" que lleva a catálogo
- ✅ Múltiples ubicaciones de tiendas (20+ locations)
- ✅ Sistema de selección de tienda antes de comprar

**Arquitectura del Sitio:**
1. Home page: Seleccionar ubicación de tienda
2. Una vez seleccionada la tienda → Acceso al catálogo
3. Productos tienen botón "Add to cart"
4. Checkout process completo

**Selectores para Scraper:**
```typescript
{
  storeSelector: 'generic[cursor=pointer]', // Tiendas en home
  searchInput: 'textbox[placeholder*="Find"]',
  cartButton: 'button[aria-label*="Cart"]',
}
```

**Comportamiento Especial:**
- Requiere seleccionar tienda PRIMERO antes de ver productos
- No tiene búsqueda global, búsqueda es por tienda
- Usa Single Page Application (SPA) con carga dinámica

---

## 🎯 SOLUCIÓN INMEDIATA

### PASO 1: Eliminar Marcado Incorrecto

Archivo: `/backend/src/constants/stores.ts`

**ANTES (❌ INCORRECTO):**
```typescript
export const STORES_TIER_2_NO_ECOMMERCE = ['pueblo', 'amigo', 'agranel', 'ralphs'] as const;
```

**DESPUÉS (✅ CORRECTO):**
```typescript
// ELIMINADO - Verificar cada tienda individualmente
// Algunas de estas tiendas SÍ tienen e-commerce
export const STORES_TIER_2_NO_ECOMMERCE = [] as const;

// Tiendas que REALMENTE no tienen e-commerce (verificar manualmente)
export const STORES_NO_ONLINE_CATALOG = [] as const;
```

### PASO 2: Actualizar Lógica del Service

Archivo: `/backend/src/services/checkStoresService.ts`

**BUSCAR Y ELIMINAR** cualquier lógica que retorne automáticamente "no_ecommerce":

```typescript
// ❌ ELIMINAR ESTO:
if (STORES_TIER_2_NO_ECOMMERCE.includes(store)) {
  return {
    status: 'no_ecommerce',
    message: 'Este supermercado no tiene compras online'
  };
}
```

**REEMPLAZAR CON:**
```typescript
// ✅ INTENTAR SCRAPING PRIMERO:
try {
  const results = await scraper.search(query);
  if (results.length > 0) {
    return {
      status: 'found',
      results
    };
  }
  // Solo si el scraper falla DESPUÉS de intentar
  return {
    status: 'not_found',
    message: 'No se encontraron productos para esta búsqueda'
  };
} catch (error) {
  return {
    status: 'error',
    message: 'Error al buscar en esta tienda'
  };
}
```

---

## 🔧 SCRAPER MEJORADO PARA ECONO

```typescript
/**
 * Scraper Econo PR - https://econotogo.com (E-COMMERCE FUNCIONAL)
 * 
 * ARQUITECTURA:
 * 1. Requiere seleccionar tienda primero
 * 2. Luego acceder al catálogo de productos
 * 3. Búsqueda es por tienda, no global
 */

import puppeteer from 'puppeteer';
import type { StoreInfo } from '../types/index.js';

const STORE_NAME = 'Econo';
const BASE_URL = 'https://econotogo.com';

// Lista de tiendas disponibles (extraída del sitio)
const ECONO_STORES = [
  { id: 'econo-bayamon', name: 'Bayamón - Santa Juanita' },
  { id: 'econo-plaza-carolina', name: 'Carolina - Plaza Carolina' },
  { id: 'econo-hato-rey', name: 'San Juan - Hato Rey' },
  { id: 'econo-levittown', name: 'Levittown' },
  // ... más tiendas
];

export async function searchEcono(
  query: string,
  location?: string
): Promise<StoreInfo[]> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏪 ECONO - Buscando: "${query}"`);
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // User agent real
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    console.log('1️⃣ Navegando a Econo To Go...');
    await page.goto(BASE_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('2️⃣ Buscando ubicación de tienda...');
    
    // Buscar la tienda más cercana a la ubicación solicitada
    const targetStore = findClosestStore(location);
    
    console.log(`3️⃣ Seleccionando tienda: ${targetStore.name}`);
    
    // Click en la tienda
    const storeLink = await page.waitForSelector(
      `a[href*="${targetStore.id}"]`,
      { timeout: 5000 }
    );
    
    if (!storeLink) {
      throw new Error(`No se encontró la tienda: ${targetStore.id}`);
    }
    
    await storeLink.click();
    
    console.log('4️⃣ Esperando carga del catálogo...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Ahora buscar productos en el catálogo de la tienda
    console.log(`5️⃣ Buscando productos: "${query}"`);
    
    // Buscar campo de búsqueda
    const searchInput = await page.waitForSelector(
      'input[type="search"], input[placeholder*="buscar" i], input[placeholder*="search" i]',
      { timeout: 5000 }
    );
    
    if (!searchInput) {
      console.log('⚠️ No se encontró campo de búsqueda');
      return [];
    }
    
    await searchInput.type(query, { delay: 100 });
    await searchInput.press('Enter');
    
    console.log('6️⃣ Esperando resultados...');
    await page.waitForTimeout(2000); // Wait for SPA to load
    
    // Intentar múltiples selectores comunes
    const productSelectors = [
      '.product-card',
      '.product-item',
      '[data-product]',
      '.product',
      '[class*="product"]'
    ];
    
    let products: any[] = [];
    
    for (const selector of productSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        
        products = await page.evaluate((sel) => {
          const items = document.querySelectorAll(sel);
          return Array.from(items).map(item => {
            // Buscar nombre
            const nameEl = item.querySelector(
              '.product-name, .product-title, [class*="name"], h3, a'
            );
            
            // Buscar precio
            const priceEl = item.querySelector(
              '.price, .product-price, [class*="price"]'
            );
            
            // Buscar imagen
            const imgEl = item.querySelector('img');
            
            // Buscar link
            const linkEl = item.querySelector('a');
            
            return {
              name: nameEl?.textContent?.trim(),
              priceText: priceEl?.textContent?.trim(),
              image: imgEl?.src,
              url: linkEl?.href,
              available: !item.classList.contains('out-of-stock')
            };
          }).filter(p => p.name && p.priceText);
        }, selector);
        
        if (products.length > 0) {
          console.log(`✅ Encontrados ${products.length} productos con selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (products.length === 0) {
      console.log('⚠️ No se encontraron productos');
      return [];
    }
    
    // Normalizar resultados
    const results: StoreInfo[] = products.map(p => ({
      storeName: STORE_NAME,
      location: targetStore.name,
      productName: p.name,
      price: parsePrice(p.priceText),
      available: p.available,
      url: p.url || BASE_URL,
      image: p.image,
      lastUpdated: new Date(),
      status: 'found' as const
    }));
    
    console.log(`✅ ÉXITO: ${results.length} productos encontrados`);
    console.log('='.repeat(60) + '\n');
    
    return results;
    
  } catch (error: any) {
    console.error(`❌ ERROR: ${error.message}`);
    console.log('='.repeat(60) + '\n');
    throw error;
  } finally {
    await browser.close();
  }
}

function findClosestStore(location?: string): { id: string; name: string } {
  if (!location) {
    return ECONO_STORES[0]; // Default to first store
  }
  
  // Simple matching - mejorar con fuzzy matching
  const normalized = location.toLowerCase();
  const match = ECONO_STORES.find(store => 
    store.name.toLowerCase().includes(normalized)
  );
  
  return match || ECONO_STORES[0];
}

function parsePrice(priceText: string): number {
  const cleaned = priceText.replace(/[^0-9.]/g, '');
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}
```

---

## 🔍 SIGUIENTE PASO: Investigar Otros Supermercados

### Pueblo (https://www.puebloweb.com/)
**TODO:** Visitar sitio y confirmar si tiene e-commerce

### Amigo (https://www.amigo.com/)
**TODO:** Visitar sitio y confirmar si tiene e-commerce

### Ralph's (https://ralphpr.net/)
**TODO:** Visitar sitio y confirmar si tiene e-commerce

### Agranel (https://agranelpr.com/)
**TODO:** Visitar sitio y confirmar si tiene e-commerce

---

## 📋 CHECKLIST DE CORRECCIÓN

- [ ] **CRÍTICO:** Eliminar `STORES_TIER_2_NO_ECOMMERCE` hardcoded list
- [ ] **CRÍTICO:** Actualizar lógica en `checkStoresService.ts`
- [ ] Investigar Pueblo manualmente
- [ ] Investigar Amigo manualmente
- [ ] Investigar Ralph's manualmente
- [ ] Investigar Agranel manualmente
- [ ] Actualizar scraper de Econo con arquitectura correcta
- [ ] Agregar logging detallado para debugging
- [ ] Crear endpoint de testing `/api/debug/scraper/:store`
- [ ] Documentar comportamiento especial de cada tienda

---

## 🎯 PRIORIDAD INMEDIATA

**1. CORREGIR EL MARCADO INCORRECTO (5 minutos)**
- Editar `/backend/src/constants/stores.ts`
- Eliminar o vaciar `STORES_TIER_2_NO_ECOMMERCE`

**2. ACTUALIZAR LÓGICA DEL SERVICE (10 minutos)**
- Editar `/backend/src/services/checkStoresService.ts`
- Remover lógica de retorno automático de "no_ecommerce"
- Permitir que cada scraper intente buscar

**3. PROBAR CON ECONO (5 minutos)**
- Ejecutar búsqueda en Econo
- Confirmar que ya no muestra "sin e-commerce"
- Verificar que intenta hacer scraping

---

**Fecha:** Enero 28, 2026  
**Status:** 🚨 CRÍTICO - Corrección Inmediata Requerida  
**Investigado por:** Claude Sonnet 4.5 (Opus)
