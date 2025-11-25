# PowerShell Script - Ver Logs del Backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Diagnóstico VICMAN - Logs Backend" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buscar contenedor del backend
Write-Host "🔍 Buscando contenedor backend..." -ForegroundColor Yellow
$containers = docker ps -a --format "{{.Names}}" | Select-String "backend|vicman"

if ($containers) {
    Write-Host "✅ Contenedores encontrados:" -ForegroundColor Green
    $containers | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
    Write-Host ""
    
    # Tomar el primero
    $containerName = $containers[0].ToString()
    
    Write-Host "📋 Mostrando logs de: $containerName" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Mostrar últimas 100 líneas
    docker logs $containerName --tail=100
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "🔍 Análisis:" -ForegroundColor Yellow
    Write-Host ""
    
    # Buscar errores
    $logs = docker logs $containerName --tail=100 2>&1
    
    if ($logs -match "Error|ERROR|Failed|FAILED|Exception") {
        Write-Host "❌ SE ENCONTRARON ERRORES:" -ForegroundColor Red
        $logs | Select-String "Error|ERROR|Failed|FAILED|Exception" | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Red
        }
    } else {
        Write-Host "✅ No se encontraron errores evidentes" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "✅ Verificar si el backend inició:" -ForegroundColor Yellow
    if ($logs -match "Application successfully started|Nest application successfully started") {
        Write-Host "   ✅ BACKEND INICIÓ CORRECTAMENTE" -ForegroundColor Green
    } else {
        Write-Host "   ❌ BACKEND NO INICIÓ - Ver errores arriba" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ No se encontró ningún contenedor backend" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Contenedores activos:" -ForegroundColor Yellow
    docker ps -a --format "table {{.Names}}\t{{.Status}}"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Presiona Enter para salir..."
Read-Host
