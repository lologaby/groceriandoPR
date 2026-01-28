# 🔧 Setup de GitHub - Paso a Paso

## ⚠️ Problema Actual

El repositorio `https://github.com/lologaby/groceriando.git` no existe aún en GitHub.

---

## ✅ Solución: Crear Repositorio en GitHub

### Opción 1: Crear desde GitHub Web (Recomendado)

1. **Ve a GitHub**: https://github.com/new
2. **Repository name**: `groceriando`
3. **Description**: "Lista de compras inteligente para supermercados de Puerto Rico"
4. **Visibility**: 
   - ✅ **Public** (si quieres que sea público)
   - ✅ **Private** (si quieres que sea privado)
5. **NO marques**:
   - ❌ Add a README file (ya tienes uno)
   - ❌ Add .gitignore (ya tienes uno)
   - ❌ Choose a license (opcional)
6. Click **Create repository**

### Opción 2: Crear desde GitHub CLI

```bash
# Si tienes GitHub CLI instalado
gh repo create groceriando --public --source=. --remote=origin --push
```

---

## 🚀 Después de Crear el Repositorio

Una vez creado el repositorio en GitHub, ejecuta:

```bash
cd /home/aberrios/groceriando

# Verificar que el remote está correcto
git remote -v

# Debería mostrar:
# origin	https://github.com/lologaby/groceriando.git

# Si no, actualízalo:
git remote set-url origin https://github.com/lologaby/groceriando.git

# Cambiar a rama main (si estás en master)
git branch -M main

# Hacer push
git push -u origin main
```

---

## 🔐 Si Necesitas Autenticación

### GitHub Personal Access Token

Si GitHub te pide autenticación:

1. Ve a: https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Nombre: `groceriando-local`
4. Selecciona scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click **Generate token**
6. **Copia el token** (solo se muestra una vez)

### Usar Token en Git

```bash
# Cuando Git pida username/password:
# Username: lologaby
# Password: [pega el token aquí]
```

O configurar Git para usar el token:

```bash
git config --global credential.helper store
# Luego al hacer push, ingresa el token como password
```

---

## ✅ Verificación

Después del push exitoso:

1. Ve a: https://github.com/lologaby/groceriando
2. Deberías ver todos tus archivos
3. El repositorio está listo para deployment

---

## 📝 Comandos Completos

```bash
# 1. Crear repo en GitHub (web) primero
# https://github.com/new

# 2. Luego ejecutar:
cd /home/aberrios/groceriando
git remote set-url origin https://github.com/lologaby/groceriando.git
git branch -M main
git push -u origin main
```

---

**¡Listo!** Una vez creado el repo en GitHub, podrás hacer push sin problemas.
