# LA 2.8.1 — BARBER OS

Demo de control operativo para La 2.8.1 Barbershop, desarrollada por Coronado Systems.

## Funcionalidades
- Dashboard de servicios, ventas y comisiones.
- Registro de servicios y productos con métodos de cobro y pendientes.
- Alta, edición y desactivación de barberos conservando historial.
- Catálogo editable de servicios y productos.
- Histórico, filtros, confirmación de cobros y exportación CSV.
- Interfaz responsive negra con detalles dorados.

## Importante
Esta es una **demostración sin backend**. Toda la información se guarda exclusivamente en el `localStorage` del navegador donde se usa. Los roles son vistas simuladas y **no** protegen datos ni autentican usuarios. No usar como sistema de cobro real ni para datos sensibles. Para operación real se requiere autenticación, permisos verificados en servidor, base de datos compartida, auditoría y respaldos.

## Probar
Abre `index.html` directamente en el navegador o despliega el repositorio como sitio estático en Cloudflare Pages. No necesita proceso de compilación.

## Publicación en Cloudflare Pages
1. Workers & Pages → Crear aplicación → Pages → Conectar a Git.
2. Elegir `EMC-LAB/La_281_Barber`.
3. Framework: Ninguno. Comando de compilación: vacío. Directorio de salida: `/`.
4. Desplegar. Cloudflare genera una URL `*.pages.dev`.

**Nota:** en repositorios públicos, el código fuente es visible. No guardar contraseñas, claves, tokens o datos privados en este proyecto.
