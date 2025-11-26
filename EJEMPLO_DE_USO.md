# Ejemplo de Uso: Manifests Centralizados

## Antes (Problema)

```bash
# Script tenía lista hardcodeada:
CRATES=(
"agentic-jujutsu"
"agentic-payments"
"agentic-robotics-core"
...
# 100+ líneas manuales
)
```

**Problemas:**
- ❌ Si descubres un nuevo crate, debes editar el script manualmente
- ❌ Los archivos ya descargados (`.crate`) no influían automáticamente
- ❌ `crates.dynamic.txt` se creaba al descubrir pero no se usaba después
- ❌ Confusión: ¿Cuál es la fuente única de verdad?

---

## Ahora (Solución)

### Ejemplo: Ejecutar descubrimiento

```bash
cd crates
bash download_ruvnet_crates.sh --discover
```

**¿Qué sucede?**

1. **Lee manifest existente** (si existe):
   ```
   crates.dynamic.txt (28 crates iniciales)
   ```

2. **Descubre nuevos** vía crates.io API:
   ```
   Descubre: 8 crates nuevos desde API
   ```

3. **Auto-detecta locales**:
   ```
   Encuentra 20 archivos *.crate en la carpeta
   Extrae nombres: agentic-jujutsu, bit-parallel-search, ...
   ```

4. **Fusiona todo**:
   ```
   28 (existentes) + 8 (nuevos) + 20 (detectados)
   Elimina duplicados → 28 total (sin cambios netos en este caso)
   ```

5. **Guarda manifest actualizado**:
   ```
   crates.dynamic.txt ← Ahora el source of truth
   ```

6. **Descarga solo lo que falta**:
   ```
   Descarga: qudag-cli-0.5.0.crate (nuevo)
             qudag-crypto-0.5.1.crate (nuevo)
             qudag-exchange-core-0.4.0.crate (nuevo)
             qudag-exchange-standalone-cli-0.3.1.crate (nuevo)
   ```

---

### Verificar el manifest

```bash
cat crates.dynamic.txt
```

**Output:**
```
agentic-jujutsu
agentic-payments
agentic-robotics-core
agentic-robotics-node
bit-parallel-search
claude-parser
conformal-prediction
cuda-rust-wasm
daa-ai
daa-chain
... (28 total)
```

**Características:**
- ✅ Un crate por línea
- ✅ Sin versiones (el script consulta la última automáticamente)
- ✅ Legible y editable manualmente
- ✅ Determinista: siempre el mismo orden

---

### Agregar un crate manualmente

Si quieres agregar `intrinsic-dim` que se descubrió pero falta:

```bash
echo "intrinsic-dim" >> crates.dynamic.txt
bash download_ruvnet_crates.sh
```

El script:
1. Lee `crates.dynamic.txt` → incluye `intrinsic-dim`
2. Intenta descargar `intrinsic-dim` en su última versión
3. Si falla (403, no existe), lo advierte pero continúa

---

### Remover un crate

Si no quieres cierto crate:

```bash
# Editar manualmente (eliminar línea)
nano crates.dynamic.txt

# O con sed
sed -i '' '/intrinsic-dim/d' crates.dynamic.txt

# La próxima ejecución ya no lo intentará descargar
bash download_ruvnet_crates.sh
```

---

## Lo mismo funciona para NPM

```bash
cd npmjs
bash download_ruvnet_packages.sh --discover
```

**Output:**
```
Discovering packages from npm registry for user: ruvnet ...
  Discovered 100 packages from npm registry
  Total packages (merged): 155
Checking: agenticsjs
  Up-to-date: agenticsjs@1.0.5
Checking: @ruv/sparc-ui
  Up-to-date: @ruv/sparc-ui@0.1.4
...
Checking: neural-trader
  Downloading: neural-trader@2.6.3
npm notice 📦  neural-trader@2.6.3
...
All npm package downloads complete!
```

Manifest actualizado:
```bash
cat packagelist.dynamic.txt | head -20
```
```
@agentic-robotics/cli
@agentic-robotics/core
@agentics.org/agentic-mcp
@agentics.org/sparc2
@foxruv/iris
@neural-trader/core
@neural-trader/mcp-protocol
@neural-trader/backtesting
...
```

---

## Ventajas Prácticas

| Tarea | Antes | Ahora |
|-------|-------|-------|
| **Agregar paquete** | Editar script (80+ líneas) | `echo "pkg-name" >> manifest.txt` |
| **Ver qué se trackea** | Grep en script (~200 líneas) | `cat packagelist.dynamic.txt` |
| **Descubrir nuevos** | Manual, arriesgado | `./script --discover` |
| **Auditar cambios** | Diff script (complejo) | `git diff packagelist.dynamic.txt` |
| **Desplegar a producción** | Riesgo de perder info | Manifest es versionado en git |

---

## Flujo de Trabajo Recomendado

### Semanal / Mensual:

```bash
# 1. Descubrir y descargar nuevos
cd /ruv_downloads
cd npmjs && ./download_ruvnet_packages.sh --discover
cd ../crates && ./download_ruvnet_crates.sh --discover

# 2. Verificar cambios
git status
git diff npmjs/packagelist.dynamic.txt
git diff crates/crates.dynamic.txt

# 3. Commit
git add -f npmjs/packagelist.dynamic.txt crates/crates.dynamic.txt
git commit -m "Update: discover new packages/crates $(date +%Y-%m-%d)"
git push origin main
```

### Resultado:

- ✅ Manifests siempre sincronizados
- ✅ Historial completo en git (auditrable)
- ✅ Nuevos archivos (`.tgz`, `.crate`) listos para uso
- ✅ Sin cambios frágiles en scripts
- ✅ Reproducible y mantenible

