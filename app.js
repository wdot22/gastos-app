'use strict';

/* ============ Constantes y estado ============ */
const CLAVE_STORAGE = 'gastos-app-v1';
const CATEGORIAS = ['Comida', 'Transporte', 'Escuela', 'Entretenimiento', 'Servicios', 'Otros'];
const MONTO_MAXIMO = 1000000;

const $ = (id) => document.getElementById(id);
const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const hoy = () => new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD en hora local

// Cada gasto es un objeto: { id, descripcion, monto, categoria, fecha }
let gastos = cargar();
let temporizadorMensaje;

/* ============ Persistencia (localStorage) ============ */
function cargar() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardar() {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(gastos));
  } catch {
    mostrarMensaje('No se pudo guardar en el navegador.', true);
  }
}

/* ============ Utilidades ============ */
const escapar = (texto) =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const formatearFecha = (fecha) =>
  new Date(`${fecha}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

function mostrarMensaje(texto, esError = false) {
  const el = $('mensaje');
  el.textContent = texto;
  el.className = esError ? 'error' : 'exito';
  clearTimeout(temporizadorMensaje);
  temporizadorMensaje = setTimeout(() => { el.textContent = ''; el.className = ''; }, 5000);
}

/* ============ Validación ============ */
function validar({ descripcion, monto, categoria, fecha }) {
  const errores = [];
  if (descripcion.length < 3) errores.push('La descripción debe tener al menos 3 caracteres.');
  if (!Number.isFinite(monto) || monto <= 0) errores.push('El monto debe ser un número mayor a 0.');
  else if (monto > MONTO_MAXIMO) errores.push(`El monto no puede ser mayor a ${moneda.format(MONTO_MAXIMO)}.`);
  if (!CATEGORIAS.includes(categoria)) errores.push('Selecciona una categoría.');
  if (!fecha) errores.push('Selecciona una fecha.');
  else if (fecha > hoy()) errores.push('La fecha no puede ser futura.');
  return errores;
}

/* ============ Operaciones CRUD ============ */
function agregar(datos) {
  gastos.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), ...datos });
}

function actualizar(id, datos) {
  gastos = gastos.map((g) => (g.id === id ? { ...g, ...datos } : g));
}

function eliminar(id) {
  const gasto = gastos.find((g) => g.id === id);
  if (!gasto || !confirm(`¿Eliminar "${gasto.descripcion}"?`)) return;
  gastos = gastos.filter((g) => g.id !== id);
  guardar();
  if ($('gasto-id').value === id) limpiarFormulario();
  render();
  mostrarMensaje('Gasto eliminado.');
}

function editar(id) {
  const gasto = gastos.find((g) => g.id === id);
  if (!gasto) return;
  $('gasto-id').value = gasto.id;
  $('descripcion').value = gasto.descripcion;
  $('monto').value = gasto.monto;
  $('categoria').value = gasto.categoria;
  $('fecha').value = gasto.fecha;
  $('form-titulo').textContent = 'Editar gasto';
  $('btn-guardar').textContent = 'Guardar cambios';
  $('btn-cancelar').hidden = false;
  $('descripcion').focus();
}

function limpiarFormulario() {
  $('form-gasto').reset();
  $('gasto-id').value = '';
  $('fecha').value = hoy();
  $('form-titulo').textContent = 'Nuevo gasto';
  $('btn-guardar').textContent = 'Agregar gasto';
  $('btn-cancelar').hidden = true;
}

/* ============ Búsqueda, filtro y ordenamiento ============ */
function obtenerVisibles() {
  const texto = $('busqueda').value.trim().toLowerCase();
  const categoria = $('filtro-categoria').value;
  const [campo, direccion] = $('orden').value.split('-');

  return gastos
    .filter((g) => (!categoria || g.categoria === categoria) && g.descripcion.toLowerCase().includes(texto))
    .sort((a, b) => {
      const r = campo === 'monto' ? a.monto - b.monto : a.fecha.localeCompare(b.fecha);
      return direccion === 'asc' ? r : -r;
    });
}

/* ============ Render (manipulación del DOM) ============ */
function renderLista(visibles) {
  $('lista').innerHTML = visibles.length
    ? visibles.map((g) => `
      <li class="gasto">
        <div class="detalle">
          <strong>${escapar(g.descripcion)}</strong>
          <small>${escapar(g.categoria)} · ${formatearFecha(g.fecha)}</small>
        </div>
        <span class="monto">${moneda.format(g.monto)}</span>
        <div class="botones">
          <button type="button" class="secundario" data-accion="editar" data-id="${g.id}">Editar</button>
          <button type="button" class="peligro" data-accion="eliminar" data-id="${g.id}">Eliminar</button>
        </div>
      </li>`).join('')
    : `<li class="vacio">${gastos.length ? 'Ningún gasto coincide con tu búsqueda.' : 'Aún no tienes gastos. Agrega el primero con el formulario.'}</li>`;
}

function renderResumen(visibles) {
  const suma = (arr) => arr.reduce((total, g) => total + g.monto, 0);
  const totalGeneral = suma(gastos);
  const porCategoria = CATEGORIAS
    .map((cat) => ({ cat, total: suma(gastos.filter((g) => g.categoria === cat)) }))
    .filter((c) => c.total > 0);

  $('resumen').innerHTML = `
    <p class="total">${moneda.format(totalGeneral)}</p>
    <p class="sub">${gastos.length} gasto(s) en total</p>
    <p class="sub">Mostrando ${visibles.length}: ${moneda.format(suma(visibles))}</p>
    <ul class="categorias">
      ${porCategoria.map(({ cat, total }) => `<li><span>${cat}</span><span>${moneda.format(total)}</span></li>`).join('')}
    </ul>`;
}

function render() {
  const visibles = obtenerVisibles();
  renderLista(visibles);
  renderResumen(visibles);
}

/* ============ Eventos ============ */
$('form-gasto').addEventListener('submit', (e) => {
  e.preventDefault();
  const datos = {
    descripcion: $('descripcion').value.trim(),
    monto: parseFloat($('monto').value),
    categoria: $('categoria').value,
    fecha: $('fecha').value,
  };

  const errores = validar(datos);
  if (errores.length) return mostrarMensaje(errores.join(' '), true);

  const id = $('gasto-id').value;
  if (id) actualizar(id, datos); else agregar(datos);
  guardar();
  limpiarFormulario();
  render();
  mostrarMensaje(id ? 'Gasto actualizado.' : 'Gasto agregado.');
});

$('btn-cancelar').addEventListener('click', limpiarFormulario);

// Delegación de eventos: un solo listener para todos los botones de la lista
$('lista').addEventListener('click', (e) => {
  const boton = e.target.closest('button[data-accion]');
  if (!boton) return;
  const { accion, id } = boton.dataset;
  if (accion === 'editar') editar(id);
  if (accion === 'eliminar') eliminar(id);
});

['input', 'change'].forEach((evento) => {
  $('busqueda').addEventListener(evento, render);
  $('filtro-categoria').addEventListener(evento, render);
  $('orden').addEventListener(evento, render);
});

/* ============ Inicio ============ */
function iniciar() {
  const opciones = CATEGORIAS.map((c) => `<option value="${c}">${c}</option>`).join('');
  $('categoria').innerHTML = `<option value="">Selecciona una categoría</option>${opciones}`;
  $('filtro-categoria').innerHTML = `<option value="">Todas las categorías</option>${opciones}`;
  $('fecha').value = hoy();
  render();
}

iniciar();
