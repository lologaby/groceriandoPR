# 🎨 UI Components Guide

Guía completa de los componentes UI disponibles en la aplicación.

## 📦 Ubicación

Todos los componentes UI reutilizables están en:
```
frontend/src/components/ui/
```

## 🧩 Componentes Disponibles

### 1. Button

Botón moderno con múltiples variantes y animaciones.

#### Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  // + todas las props de HTMLButtonElement
}
```

#### Uso
```tsx
import { Button } from './components/ui/Button';
import { Plus } from 'lucide-react';

// Primary button
<Button variant="primary" onClick={handleClick}>
  Guardar
</Button>

// Con icono
<Button variant="primary" icon={<Plus className="w-4 h-4" />}>
  Agregar
</Button>

// Loading state
<Button loading={isLoading}>
  Procesando...
</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="md">Mediano</Button>
<Button size="lg">Grande</Button>
```

#### Variantes
- **primary**: Azul vibrante, para acciones principales
- **secondary**: Gris neutro, para acciones secundarias
- **ghost**: Transparente con hover, para acciones terciarias
- **danger**: Rojo, para acciones destructivas

---

### 2. Card

Contenedor con estilos consistentes y opción de glassmorphism.

#### Props
```typescript
interface CardProps {
  hover?: boolean;
  glass?: boolean;
  // + todas las props de HTMLDivElement con motion
}
```

#### Uso
```tsx
import { Card } from './components/ui/Card';

// Card básico
<Card className="p-6">
  <h2>Título</h2>
  <p>Contenido...</p>
</Card>

// Con hover effect
<Card hover className="p-6">
  Clickeable card
</Card>

// Glassmorphism
<Card glass className="p-6">
  Contenido con efecto glass
</Card>
```

---

### 3. Input

Input field moderno con soporte para iconos y validación.

#### Props
```typescript
interface InputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // + todas las props de HTMLInputElement
}
```

#### Uso
```tsx
import { Input } from './components/ui/Input';
import { Search, Mail } from 'lucide-react';

// Input básico
<Input
  label="Nombre"
  placeholder="Ingresa tu nombre"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Con icono izquierdo
<Input
  label="Email"
  type="email"
  leftIcon={<Mail className="w-5 h-5" />}
  placeholder="tu@email.com"
/>

// Con error
<Input
  label="Contraseña"
  type="password"
  value={password}
  error="La contraseña debe tener al menos 8 caracteres"
/>

// Con icono derecho (ej: búsqueda)
<Input
  placeholder="Buscar..."
  leftIcon={<Search className="w-5 h-5" />}
/>
```

---

### 4. Badge

Etiqueta pequeña para indicar estados o categorías.

#### Props
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  className?: string;
}
```

#### Uso
```tsx
import { Badge } from './components/ui/Badge';

<Badge variant="success">En stock</Badge>
<Badge variant="warning">Requiere membresía</Badge>
<Badge variant="danger">Agotado</Badge>
<Badge variant="primary">Nuevo</Badge>
```

#### Variantes
- **default**: Gris neutro
- **success**: Verde (disponible, activo, etc.)
- **warning**: Naranja (advertencias, requiere atención)
- **danger**: Rojo (errores, no disponible)
- **primary**: Azul (destacado, marca)

---

### 5. Spinner

Indicador de carga animado.

#### Props
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### Uso
```tsx
import { Spinner } from './components/ui/Spinner';

<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

// En un contenedor
<div className="flex items-center gap-3">
  <Spinner />
  <span>Cargando...</span>
</div>
```

---

### 6. EmptyState

Componente para mostrar estados vacíos con estilo consistente.

#### Props
```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

#### Uso
```tsx
import { EmptyState } from './components/ui/EmptyState';
import { PackageSearch } from 'lucide-react';

<EmptyState
  icon={PackageSearch}
  title="No hay resultados"
  description="Intenta con otro término de búsqueda"
  action={{
    label: 'Limpiar búsqueda',
    onClick: () => setQuery('')
  }}
/>
```

---

### 7. Skeleton Loaders

Placeholders animados mientras carga el contenido.

#### Componentes
- `Skeleton`: Básico genérico
- `ProductCardSkeleton`: Para cards de producto
- `StoreCardSkeleton`: Para cards de tienda

#### Uso
```tsx
import { 
  Skeleton, 
  ProductCardSkeleton, 
  StoreCardSkeleton 
} from './components/ui/Skeleton';

// Skeleton genérico
<Skeleton className="h-20 w-full" />
<Skeleton className="h-6 w-3/4" />

// Skeletons específicos
{isLoading && (
  <>
    <ProductCardSkeleton />
    <ProductCardSkeleton />
    <ProductCardSkeleton />
  </>
)}

{isLoading && (
  <>
    <StoreCardSkeleton />
    <StoreCardSkeleton />
  </>
)}
```

---

### 8. ThemeToggle

Toggle para cambiar entre light y dark mode.

#### Uso
```tsx
import { ThemeToggle } from './components/ui/ThemeToggle';

// En el header o navbar
<ThemeToggle />
```

El componente usa el hook `useTheme` internamente para manejar el estado.

---

## 🎨 Design Tokens

### Colores

```css
/* Primary */
primary-50 to primary-900

/* Success */
success-50 to success-900

/* Warning */
warning-50 to warning-900

/* Neutral */
neutral-50 to neutral-950

/* Específicos */
text-primary: neutral-900 (light) / neutral-100 (dark)
text-secondary: neutral-600 (light) / neutral-400 (dark)
border: neutral-200 (light) / neutral-800 (dark)
```

### Espaciado

Basado en múltiplos de 4px:
```
xs: 0.5rem (8px)
sm: 0.75rem (12px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

### Border Radius

```
sm: 0.5rem (8px)
md: 0.75rem (12px)
lg: 1rem (16px)
xl: 1.5rem (24px)
2xl: 2rem (32px)
full: 9999px
```

### Shadows

```
sm: Elevación mínima
md: Elevación normal (cards)
lg: Elevación media (modals)
xl: Elevación alta (tooltips)
2xl: Elevación máxima
```

---

## 🎭 Animaciones

### Framer Motion Patterns

#### Page Transitions
```tsx
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

<motion.div
  initial="initial"
  animate="animate"
  exit="exit"
  variants={pageVariants}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

#### List Stagger
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

#### Hover Effects
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

---

## 🌙 Dark Mode

### useTheme Hook

```tsx
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
    </div>
  );
}
```

### Estilos Dark Mode

Usar las clases `dark:` de Tailwind:
```tsx
<div className="bg-white dark:bg-neutral-900">
  <h1 className="text-neutral-900 dark:text-neutral-100">
    Título
  </h1>
  <p className="text-neutral-600 dark:text-neutral-400">
    Descripción
  </p>
</div>
```

---

## 🎯 Utility Classes Custom

### Glassmorphism
```tsx
<div className="glass">
  Contenido con efecto glass
</div>
```

### Gradient Text
```tsx
<h1 className="gradient-text">
  Título con gradiente
</h1>
```

### Shimmer Loading
```tsx
<div className="shimmer h-20 w-full rounded-lg" />
```

---

## 📱 Responsive Design

### Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Uso
```tsx
<div className="
  text-sm sm:text-base md:text-lg lg:text-xl
  p-4 md:p-6 lg:p-8
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
  Contenido responsive
</div>
```

---

## 🔔 Toast Notifications (Sonner)

```tsx
import { toast } from 'sonner';

// Success
toast.success('Título', {
  description: 'Descripción adicional'
});

// Error
toast.error('Error', {
  description: 'Mensaje de error'
});

// Con acción
toast.success('Guardado', {
  description: 'Cambios guardados correctamente',
  action: {
    label: 'Ver',
    onClick: () => navigate('/list')
  }
});

// Con ícono personalizado
toast.success('Completado', {
  icon: <CheckCircle className="w-5 h-5" />
});
```

---

## ♿ Accesibilidad

### ARIA Labels
```tsx
<button aria-label="Cerrar modal">
  <X className="w-5 h-5" />
</button>

<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Título del Modal</h2>
</div>
```

### Keyboard Navigation
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Elemento clickeable
</div>
```

---

## 🎨 Iconos (Lucide React)

Todos los iconos vienen de `lucide-react`:

```tsx
import {
  Search,
  ShoppingCart,
  User,
  Settings,
  Plus,
  X,
  Check,
  AlertCircle,
  // ... y muchos más
} from 'lucide-react';

// Uso
<Search className="w-5 h-5" />
<Plus className="w-4 h-4 text-primary-600" />
```

Iconos comunes:
- **Navigation**: Menu, X, ArrowLeft, ArrowRight, Home
- **Actions**: Plus, Minus, Edit, Trash, Save, Download
- **Status**: Check, X, AlertCircle, Info, CheckCircle
- **Shopping**: ShoppingCart, Package, Store, DollarSign
- **UI**: Search, Filter, Eye, Settings, Bell

---

## 🚀 Best Practices

### 1. Consistencia
Usa siempre los componentes UI en lugar de crear nuevos estilos.

### 2. Composición
Combina componentes pequeños para crear componentes complejos.

```tsx
<Card className="p-6">
  <div className="flex items-center gap-3 mb-4">
    <Badge variant="success">Nuevo</Badge>
    <h2>Título</h2>
  </div>
  <p className="text-neutral-600">Contenido...</p>
  <Button variant="primary" className="mt-4">
    Acción
  </Button>
</Card>
```

### 3. Responsive
Siempre piensa en mobile-first.

### 4. Dark Mode
Siempre incluye estilos para dark mode desde el inicio.

### 5. Accesibilidad
Incluye ARIA labels, keyboard navigation, y focus states.

### 6. Performance
Usa React.memo y useMemo para componentes pesados.

---

## 📚 Recursos

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Sonner Toast](https://sonner.emilkowal.ski/)
- [React Query Docs](https://tanstack.com/query/latest)

---

**Última actualización**: Enero 28, 2026
