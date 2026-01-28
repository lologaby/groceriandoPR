# 🔴 Setup de Redis - Desarrollo Local

## ⚠️ Problema Actual

Redis no está corriendo localmente, causando errores de conexión. El sistema ahora tiene **fallback automático a cache en memoria**, pero para mejor performance deberías tener Redis corriendo.

---

## ✅ Solución Rápida: Usar Cache en Memoria (Sin Redis)

El sistema ahora funciona **sin Redis** usando cache en memoria como fallback. Solo verás un warning:

```
[Redis] ⚠️ No disponible, usando cache en memoria
```

**La app funcionará normalmente**, solo que el cache no persistirá entre reinicios del servidor.

---

## 🚀 Opción 1: Instalar Redis Localmente (Recomendado)

### Linux (Ubuntu/Debian)

```bash
# Instalar Redis
sudo apt update
sudo apt install redis-server

# Iniciar Redis
sudo systemctl start redis-server

# Habilitar al iniciar sistema
sudo systemctl enable redis-server

# Verificar que está corriendo
redis-cli ping
# Debe responder: PONG
```

### macOS

```bash
# Con Homebrew
brew install redis

# Iniciar Redis
brew services start redis

# O manualmente
redis-server

# Verificar
redis-cli ping
```

### Docker (Más Fácil)

```bash
# Correr Redis en Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Verificar
docker ps | grep redis
redis-cli ping
```

---

## ☁️ Opción 2: Usar Upstash Redis (Cloud)

Si prefieres no instalar Redis localmente, puedes usar Upstash Redis incluso en desarrollo:

1. Ve a https://upstash.com
2. Crea cuenta y Redis database
3. Copia **REST URL** y **REST TOKEN**
4. Agrega a `backend/.env`:

```bash
REDIS_URL=redis://default:TU_TOKEN@TU_REDIS_URL.upstash.io:6379
```

O configuración individual:

```bash
REDIS_HOST=TU_REDIS_URL.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=TU_TOKEN
```

---

## 🔧 Opción 3: Desactivar Redis Completamente

Si no quieres usar Redis en absoluto, agrega a `backend/.env`:

```bash
REDIS_ENABLED=false
```

El sistema usará cache en memoria automáticamente.

---

## ✅ Verificar Setup

### Con Redis Local

```bash
# Verificar que Redis está corriendo
redis-cli ping
# Debe responder: PONG

# Verificar en la app
curl http://localhost:3001/health
# Debe mostrar: "redis": "connected"
```

### Sin Redis (Cache en Memoria)

```bash
# Verificar en la app
curl http://localhost:3001/health
# Debe mostrar: "redis": "memory-fallback"
```

---

## 📊 Diferencias

### Con Redis
- ✅ Cache persiste entre reinicios
- ✅ Mejor para producción
- ✅ Compartido entre múltiples instancias

### Sin Redis (Memoria)
- ✅ Funciona inmediatamente
- ✅ No requiere instalación
- ⚠️ Cache se pierde al reiniciar
- ⚠️ No compartido entre instancias

---

## 🐛 Troubleshooting

### Redis no inicia

```bash
# Ver logs
sudo journalctl -u redis-server

# O si usas Docker
docker logs redis
```

### Puerto 6379 ocupado

```bash
# Ver qué está usando el puerto
sudo lsof -i :6379

# O cambiar puerto en .env
REDIS_URL=redis://localhost:6380
```

### Redis se desconecta frecuentemente

```bash
# Verificar configuración
redis-cli CONFIG GET timeout

# Aumentar timeout si es necesario
redis-cli CONFIG SET timeout 300
```

---

## 📝 Variables de Entorno

### Desarrollo Local (Redis Local)

```bash
# backend/.env
REDIS_URL=redis://localhost:6379
# O dejar vacío para usar default
```

### Desarrollo con Upstash

```bash
# backend/.env
REDIS_URL=redis://default:token@xxxxx.upstash.io:6379
```

### Desactivar Redis

```bash
# backend/.env
REDIS_ENABLED=false
```

---

## ✅ Estado Actual

El sistema ahora:
- ✅ Funciona **sin Redis** (cache en memoria)
- ✅ Se conecta a Redis si está disponible
- ✅ Fallback automático si Redis falla
- ✅ No spamea logs de errores

**Puedes seguir desarrollando sin instalar Redis**, pero para mejor performance te recomiendo instalarlo.

---

**Fecha:** Enero 28, 2026  
**Status:** ✅ **FALLBACK IMPLEMENTADO - FUNCIONA SIN REDIS**
