# Control de gastos

Aplicación web del lado del cliente para registrar, editar y consultar gastos personales. No necesita servidor: los datos se guardan en el navegador con `localStorage`.

**Actividad 3 – Laboratorio de Programación Web (Unidad temática 3: JavaScript)**

- Autor: _tu nombre aquí_
- Demo: _enlace a GitHub Pages o al video_

## Funcionalidades

- **Agregar** un gasto (descripción, monto, categoría y fecha).
- **Visualizar** la lista de gastos sin recargar la página.
- **Editar** y **eliminar** gastos (con confirmación al eliminar).
- **Validación** de datos con mensajes claros: descripción mínima, monto mayor a 0 y con tope, categoría obligatoria, fecha obligatoria y no futura.
- **Persistencia** con `localStorage`: los datos siguen ahí al cerrar y volver a abrir la página.
- **Funciones adicionales:**
  - Búsqueda por descripción.
  - Filtro por categoría.
  - Ordenamiento por fecha o monto.
  - Cálculo automático del total general, del total mostrado y del total por categoría.

## Tecnologías

HTML5, CSS3 y JavaScript ES6+ (`const`/`let`, arrow functions, template literals, destructuring, spread y métodos de arreglos como `map`, `filter`, `reduce` y `sort`).

## Estructura

```
gastos-app/
├── index.html   # estructura de la página
├── styles.css   # estilos (responsivo, modo claro/oscuro)
├── app.js       # lógica: datos, validación, DOM, eventos y localStorage
└── README.md
```

## Cómo ejecutarla

1. Descarga o clona el repositorio.
2. Abre `index.html` en el navegador. No requiere instalación.

## Modelo de datos

```js
{ id: "lq3x9a1bz", descripcion: "Tacos", monto: 85.5, categoria: "Comida", fecha: "2026-11-15" }
```

Los gastos se guardan como un arreglo de objetos en `localStorage` bajo la clave `gastos-app-v1`.
