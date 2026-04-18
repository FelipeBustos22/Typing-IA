# Seguridad del proyecto

Este documento explica las medidas de seguridad aplicadas en el proyecto para proteger tanto la aplicación en produccion como la maquina del desarrollador.

---

## Por que importa la seguridad de las dependencias

Cuando ejecutas `npm install`, estas descargando y ejecutando codigo de cientos de paquetes escritos por terceros. Si alguno de esos paquetes esta comprometido (por un atacante que tomo control de la cuenta del autor, por ejemplo), puede:

- **En tu maquina:** robar credenciales, tokens, claves SSH, variables de entorno, o instalar malware silenciosamente durante la instalacion.
- **En produccion:** inyectar codigo malicioso que se ejecuta en el navegador de los usuarios (XSS), redirigir peticiones, o exfiltrar datos.

Las medidas que se describen aqui reducen esa superficie de ataque.

---

## Medidas aplicadas

### 1. Versiones exactas en `package.json`

**Que es:** Todas las dependencias estan fijadas a una version especifica (ej: `"react": "19.2.3"`) en lugar de usar rangos abiertos (ej: `"react": "^19"`).

**Para que sirve:** Con rangos abiertos, un `npm install` puede traer una version diferente a la que probaste. Si esa version nueva fue comprometida o tiene un bug, entraria al proyecto sin que te des cuenta. Con version exacta, siempre se instala lo que esperas.

**Como protege:**
- Al dev: evita que se descargue una version maliciosa publicada como patch.
- En produccion: garantiza que el build se hace con las mismas dependencias que probaste.

---

### 2. Archivo `.npmrc` con politicas de seguridad

El archivo `.npmrc` en la raiz del proyecto configura el comportamiento de npm:

```ini
ignore-scripts=true
save-exact=true
audit-level=high
package-lock=true
registry=https://registry.npmjs.org/
```

Cada linea explicada:

| Opcion | Que hace | Por que importa |
|---|---|---|
| `ignore-scripts=true` | Bloquea la ejecucion de scripts automaticos de paquetes durante `npm install` | Es el vector de ataque mas comun: un paquete malicioso ejecuta codigo al instalarse (ej: `postinstall` que roba tu `.env` o tus claves SSH). Al bloquear scripts, eso no puede pasar. |
| `save-exact=true` | Cuando agregas una dependencia nueva, se guarda con version exacta en lugar de rango | Refuerza la regla de versiones fijadas descrita arriba. |
| `audit-level=high` | `npm audit` solo reporta vulnerabilidades de severidad alta o critica | Evita ruido innecesario y enfoca la atencion en lo que realmente importa. |
| `package-lock=true` | Obliga a que siempre se genere y respete el `package-lock.json` | El lockfile es lo que garantiza que todos instalan exactamente las mismas versiones. Sin el, cada `npm install` podria resolver versiones diferentes. |
| `registry=https://registry.npmjs.org/` | Fuerza que los paquetes se descarguen solo del registro oficial de npm | Previene que un `.npmrc` global o corporativo redirija a un registro malicioso sin que lo sepas. |

---

## Buenas practicas para el dia a dia

### Al instalar dependencias nuevas

```bash
# Siempre con version exacta (automatico gracias al .npmrc)
npm install nombre-del-paquete
```

### Al actualizar dependencias

```bash
# Nunca actualizar todo de golpe. Actualizar de a una:
npm install nombre-del-paquete@version-especifica

# Despues verificar que todo funciona:
npm run lint
npm run build
```

### Al hacer un install limpio (CI o maquina nueva)

```bash
# Usar npm ci en lugar de npm install
# Respeta el lockfile exacto y es mas rapido
npm ci
```

### Para verificar vulnerabilidades

```bash
npm audit
```

---

## Que NO esta cubierto (y esta bien por ahora)

- **Tests automaticos:** El proyecto no tiene tests. Esto significa que al actualizar dependencias no hay forma automatica de detectar regresiones. Es un riesgo aceptable para el tamano actual del proyecto.
- **CI/CD:** No hay pipeline de integracion continua. Para un proyecto publico en crecimiento, se recomienda agregar un workflow basico que ejecute `npm ci && npm audit && npm run build`.
- **Subresource Integrity (SRI):** Next.js no carga scripts de CDN externo, asi que no aplica.
