#!/bin/bash
# Bash Script - Ver Logs del Backend

echo "========================================"
echo "  Diagnóstico VICMAN - Logs Backend"
echo "========================================"
echo ""

echo "🔍 Buscando contenedor backend..."
CONTAINER=$(docker ps -a --format "{{.Names}}" | grep -i "backend\|vicman" | head -n1)

if [ -z "$CONTAINER" ]; then
    echo "❌ No se encontró ningún contenedor backend"
    echo ""
    echo "📋 Contenedores disponibles:"
    docker ps -a --format "table {{.Names}}\t{{.Status}}"
    exit 1
fi

echo "✅ Contenedor encontrado: $CONTAINER"
echo ""
echo "📋 Mostrando logs..."
echo "========================================"
echo ""

docker logs "$CONTAINER" --tail=100

echo ""
echo "========================================"
echo "🔍 Análisis de Errores:"
echo ""

# Buscar errores
if docker logs "$CONTAINER" --tail=100 2>&1 | grep -i "error\|failed\|exception"; then
    echo "❌ SE ENCONTRARON ERRORES (ver arriba)"
else
    echo "✅ No se encontraron errores evidentes"
fi

echo ""
echo "✅ Verificar inicio del backend:"
if docker logs "$CONTAINER" --tail=100 2>&1 | grep -i "successfully started"; then
    echo "   ✅ BACKEND INICIÓ CORRECTAMENTE"
else
    echo "   ❌ BACKEND NO INICIÓ"
fi

echo ""
echo "========================================"
