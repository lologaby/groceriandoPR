/**
 * Validador de Productos de Comida/Groceries
 * Filtra productos para asegurar que solo sean comida/groceries de supermercados
 */

/**
 * Categorías válidas de comida/groceries
 */
const VALID_CATEGORIES = [
  // Lácteos
  'dairy',
  'lácteos',
  'milk',
  'leche',
  'cheese',
  'queso',
  'yogurt',
  'yogur',
  'butter',
  'mantequilla',
  'cream',
  'crema',
  
  // Carnes
  'meat',
  'carne',
  'poultry',
  'pollo',
  'beef',
  'res',
  'pork',
  'cerdo',
  'ham',
  'jamón',
  'bacon',
  'tocino',
  'sausage',
  'salchicha',
  
  // Frutas y Vegetales
  'produce',
  'frutas',
  'vegetables',
  'vegetales',
  'fruits',
  'fresh',
  'fresco',
  
  // Despensa
  'pantry',
  'despensa',
  'groceries',
  'groceria',
  'food',
  'comida',
  'canned',
  'enlatado',
  'canned goods',
  'dry goods',
  'baking',
  'horneo',
  'spices',
  'especias',
  'condiments',
  'condimentos',
  
  // Bebidas
  'beverages',
  'bebidas',
  'drinks',
  'juice',
  'jugo',
  'soda',
  'refresco',
  'water',
  'agua',
  
  // Panadería
  'bakery',
  'panadería',
  'bread',
  'pan',
  'pastry',
  'pasteles',
  
  // Congelados
  'frozen',
  'congelado',
  'frozen foods',
  
  // Snacks
  'snacks',
  'botanas',
  'chips',
  'papas',
  'cookies',
  'galletas',
  'crackers',
  'galletas saladas',
  
  // Cereales
  'cereal',
  'cereales',
  'breakfast',
  'desayuno',
  
  // Aceites y Grasas
  'oils',
  'aceites',
  'cooking oil',
  'aceite de cocinar',
  
  // Granos y Legumbres
  'grains',
  'granos',
  'rice',
  'arroz',
  'beans',
  'frijoles',
  'pasta',
  'pastas',
  'noodles',
  'fideos',
  
  // Azúcar y Endulzantes
  'sugar',
  'azúcar',
  'sweeteners',
  'endulzantes',
  
  // Harina y Horno
  'flour',
  'harina',
  'baking supplies',
  'suministros de horneo',
  
  // General
  'general',
  'general grocery',
  'supermarket',
  'supermercado',
] as const;

/**
 * Palabras clave que indican que NO es comida
 */
const INVALID_KEYWORDS = [
  // Entretenimiento
  'movie',
  'película',
  'dvd',
  'blu-ray',
  'video',
  'film',
  'cinema',
  
  // Electrónica
  'electronics',
  'electrónica',
  'phone',
  'teléfono',
  'tablet',
  'laptop',
  'computer',
  'computadora',
  'tv',
  'television',
  'televisión',
  'headphones',
  'audífonos',
  'speaker',
  'altavoz',
  'camera',
  'cámara',
  
  // Ropa
  'clothing',
  'ropa',
  'shirt',
  'camisa',
  'pants',
  'pantalones',
  'shoes',
  'zapatos',
  'clothes',
  
  // Hogar
  'furniture',
  'muebles',
  'appliance',
  'electrodoméstico',
  'tool',
  'herramienta',
  
  // Juguetes
  'toy',
  'juguete',
  'games',
  'juegos',
  'board game',
  'juego de mesa',
  
  // Libros
  'book',
  'libro',
  'magazine',
  'revista',
  
  // Deportes
  'sports',
  'deportes',
  'equipment',
  'equipo',
  
  // Mascotas (comida de mascotas sí, pero otros productos no)
  'pet food',
  'comida de mascota',
  'dog food',
  'comida de perro',
  'cat food',
  'comida de gato',
  
  // Otros
  'software',
  'hardware',
  'accessory',
  'accesorio',
] as const;

/**
 * Palabras clave que indican que SÍ es comida
 */
const FOOD_KEYWORDS = [
  'food',
  'comida',
  'grocery',
  'groceria',
  'supermarket',
  'supermercado',
  'eat',
  'comer',
  'cook',
  'cocinar',
  'recipe',
  'receta',
  'ingredient',
  'ingrediente',
  'meal',
  'comida',
  'snack',
  'botana',
  'beverage',
  'bebida',
  'drink',
  'beber',
] as const;

/**
 * Validar si un producto es de comida/groceries
 */
export function isValidFoodProduct(
  name: string,
  category?: string,
  description?: string
): boolean {
  const searchText = `${name} ${category || ''} ${description || ''}`.toLowerCase();
  
  // 1. Verificar que NO tenga keywords inválidos
  for (const keyword of INVALID_KEYWORDS) {
    if (searchText.includes(keyword.toLowerCase())) {
      return false;
    }
  }
  
  // 2. Verificar categoría válida
  if (category) {
    const categoryLower = category.toLowerCase();
    for (const validCat of VALID_CATEGORIES) {
      if (categoryLower.includes(validCat.toLowerCase())) {
        return true;
      }
    }
  }
  
  // 3. Verificar keywords de comida en el nombre/descripción
  for (const keyword of FOOD_KEYWORDS) {
    if (searchText.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  // 4. Verificar patrones comunes de productos de comida
  const foodPatterns = [
    /\d+\s*(oz|lb|kg|g|ml|l|gal|qt|ct|pack|unidad)/i, // Tamaños comunes de comida
    /(jamón|ham|leche|milk|arroz|rice|aceite|oil|azúcar|sugar|harina|flour|huevo|egg)/i,
    /(goya|tres monjitas|hormel|heinz|nestle|kraft|general mills)/i, // Marcas de comida comunes en PR
  ];
  
  for (const pattern of foodPatterns) {
    if (pattern.test(searchText)) {
      return true;
    }
  }
  
  // 5. Si no pasa ninguna validación, rechazar por seguridad
  return false;
}

/**
 * Filtrar array de productos para solo incluir comida/groceries
 */
export function filterFoodProducts<T extends { name: string; category?: string; description?: string }>(
  products: T[]
): T[] {
  return products.filter((product) =>
    isValidFoodProduct(product.name, product.category, product.description)
  );
}

/**
 * Validar nombre de producto para asegurar que sea comida
 */
export function isValidProductName(name: string): boolean {
  const nameLower = name.toLowerCase();
  
  // Rechazar si contiene keywords inválidos
  for (const keyword of INVALID_KEYWORDS) {
    if (nameLower.includes(keyword.toLowerCase())) {
      return false;
    }
  }
  
  // Aceptar si contiene keywords de comida o patrones comunes
  for (const keyword of FOOD_KEYWORDS) {
    if (nameLower.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  // Verificar patrones de comida
  const foodPatterns = [
    /\d+\s*(oz|lb|kg|g|ml|l|gal|qt|ct|pack|unidad)/i,
    /(jamón|ham|leche|milk|arroz|rice|aceite|oil|azúcar|sugar|harina|flour|huevo|egg|pollo|chicken|carne|meat|queso|cheese|pan|bread|pasta|spaghetti|frijol|bean|salsa|sauce|ketchup|mayo|mayonnaise)/i,
  ];
  
  return foodPatterns.some((pattern) => pattern.test(nameLower));
}

/**
 * Obtener categoría de comida basada en el nombre del producto
 */
export function inferFoodCategory(name: string, existingCategory?: string): string {
  if (existingCategory && VALID_CATEGORIES.some(cat => existingCategory.toLowerCase().includes(cat.toLowerCase()))) {
    return existingCategory;
  }
  
  const nameLower = name.toLowerCase();
  
  // Inferir categoría basada en keywords
  if (nameLower.match(/(leche|milk|queso|cheese|yogurt|mantequilla|butter|crema|cream)/i)) {
    return 'Lácteos';
  }
  if (nameLower.match(/(jamón|ham|carne|meat|pollo|chicken|res|beef|cerdo|pork|bacon|tocino)/i)) {
    return 'Carnes';
  }
  if (nameLower.match(/(arroz|rice|frijol|bean|pasta|spaghetti|fideo|noodle)/i)) {
    return 'Despensa';
  }
  if (nameLower.match(/(aceite|oil|azúcar|sugar|harina|flour|sal|salt)/i)) {
    return 'Despensa';
  }
  if (nameLower.match(/(pan|bread|pastel|cake|galleta|cookie)/i)) {
    return 'Panadería';
  }
  if (nameLower.match(/(refresco|soda|jugo|juice|agua|water|bebida|drink)/i)) {
    return 'Bebidas';
  }
  if (nameLower.match(/(cereal|breakfast|desayuno)/i)) {
    return 'Cereales';
  }
  if (nameLower.match(/(huevo|egg)/i)) {
    return 'Lácteos';
  }
  
  return 'General';
}
