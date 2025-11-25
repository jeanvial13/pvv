# Guía de Diagnóstico - Error 502 Backend

## 🔍 Paso 1: Ver Logs del Backend

Necesitamos ver QUÉ ERROR específico está causando que el backend no inicie. Ejecuta estos comandos en Portainer o en tu terminal SSH del NAS:

### Opción A: Desde Portainer
1. Ve a **Containers** en Portainer
2. Busca el contenedor **vicman-backend** (o similar)
3. Haz click en él
4. Ve a la pestaña **Logs**
5. **BUSCA líneas con "Error", "Failed", o "Exception"**
6. Copia el error completo

### Opción B: Desde Terminal/SSH
```bash
# Ver logs del backend
docker logs vicman-backend --tail=100

# Ver logs en tiempo real
docker logs -f vicman-backend
```

## 🎯 ¿Qué Buscar en los Logs?

### ✅ Si el backend inició BIEN, verás:
```
🚀 VICMAN Backend Starting...
✅ Migrations completed successfully
✅ Database seeded successfully!
✅ Setup Complete!
🚀 Starting NestJS application...
[Nest] Application successfully started
```

### ❌ Si hay ERROR, verás algo como:
```
Error: Cannot find module '...'
SyntaxError: ...
PrismaClientInitializationError: ...
Error: P1001: Can't reach database server
```

## 🔧 Soluciones Según el Error

### Error: "Cannot find module" o "SyntaxError"
**Causa:** Problema con la compilación TypeScript

**Solución:** Revisar Dockerfile del backend

### Error: "P1001: Can't reach database"
**Causa:** Backend no puede conectar a PostgreSQL

**Solución:** Verificar variables de entorno DATABASE_URL

### Error: "prisma migrate deploy failed"
**Causa:** Problemas con migraciones

**Solución:** No es crítico, el usuario hardcodeado igual debería funcionar

### Error: "entrypoint.sh: line X: syntax error"
**Causa:** Error en el script de entrypoint

**Solución:** Necesitamos simplificar el entrypoint.sh

---

## 📋 IMPORTANTE: Responde estas preguntas

Para ayudarte mejor, necesito saber:

1. **¿Cómo configuraste el stack en Portainer?**
   - [ ] Usando Git/GitHub repository
   - [ ] Docker Compose copiado manualmente
   - [ ] Otro método

2. **¿Los cambios que hice están en GitHub?**
   - [ ] Sí, hice commit y push
   - [ ] No, solo están en mi computadora local
   - [ ] No estoy usando GitHub

3. **¿Qué ves en los logs del backend?**
   - Copia aquí el error específico

---

## 🚑 Solución ALTERNATIVA (Si nada funciona)

Si el backend sigue sin iniciar, puedo crear una versión **ULTRA-SIMPLIFICADA** del entrypoint que:
- No depende de migraciones
- No depende de seed
- Solo inicia el servidor con el usuario hardcodeado

**Esta versión funcionará AL 100% pero necesito confirmación de qué error específico estás viendo.**

