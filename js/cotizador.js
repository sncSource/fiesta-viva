// =========================================
// Fiesta Viva - cotizador.js
// Reglas de negocio del cotizador (sin acceso al DOM).
// =========================================

const TARIFAS = {
  tipos: {
    cumpleanos: "Cumpleaños",
    boda: "Boda",
    quinceanero: "Quinceañero",
    babyshower: "Baby shower",
    corporativo: "Evento corporativo",
    infantil: "Fiesta infantil",
  },
  paquetes: {
    esencial: { nombre: "Esencial", precio: 45 },
    clasico: { nombre: "Clásico", precio: 70 },
    premium: { nombre: "Premium", precio: 110 },
  },
  extras: {
    dj: { nombre: "DJ y sonido", precio: 900 },
    foto: { nombre: "Fotografía y video", precio: 1200 },
    horaLoca: { nombre: "Hora loca", precio: 650 },
    animacion: { nombre: "Animación infantil", precio: 500 },
    postres: { nombre: "Mesa de postres", precio: 750 },
  },
  minInvitados: 20,
  maxInvitados: 500,
  diasAnticipacion: 15,
  recargoSabado: 0.10, // 10% adicional los sábados
  igv: 0.18,
};

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Redondea a dos decimales evitando errores como 0.1 + 0.2
function redondear(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

// Convierte "AAAA-MM-DD" en una fecha local (sin desfase de zona horaria)
function leerFecha(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto || "")) return null;
  const [a, m, d] = texto.split("-").map(Number);
  const fecha = new Date(a, m - 1, d);
  return fecha.getFullYear() === a && fecha.getMonth() === m - 1 && fecha.getDate() === d
    ? fecha
    : null; // rechaza 2027-02-30
}

function diasEntre(desde, hasta) {
  const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  return Math.round((hasta - inicio) / 86400000);
}

// Devuelve un objeto { campo: mensaje } con los errores encontrados
function validarDatos(datos, hoy = new Date()) {
  const errores = {};
  const nombre = String(datos.nombre ?? "").trim();
  const correo = String(datos.correo ?? "").trim();

  if (nombre.length < 3) {
    errores.nombre = "Escribe tu nombre completo (mínimo 3 caracteres).";
  }

  if (!PATRON_CORREO.test(correo)) {
    errores.correo = "Escribe un correo válido, por ejemplo ana@correo.com.";
  }

  if (!TARIFAS.tipos[datos.tipo]) {
    errores.tipo = "Selecciona el tipo de evento.";
  }

  const fecha = leerFecha(datos.fecha);
  if (!fecha) {
    errores.fecha = "Selecciona la fecha del evento.";
  } else if (diasEntre(hoy, fecha) < TARIFAS.diasAnticipacion) {
    errores.fecha = `Reservamos con al menos ${TARIFAS.diasAnticipacion} días de anticipación.`;
  }

  const invitados = Number(datos.invitados);
  if (
    !Number.isInteger(invitados) ||
    invitados < TARIFAS.minInvitados ||
    invitados > TARIFAS.maxInvitados
  ) {
    errores.invitados = `Ingresa un número entero entre ${TARIFAS.minInvitados} y ${TARIFAS.maxInvitados}.`;
  }

  if (!TARIFAS.paquetes[datos.paquete]) {
    errores.paquete = "Selecciona un paquete.";
  }

  return errores;
}

// Calcula la cotización; supone que los datos ya fueron validados
function calcularCotizacion(datos) {
  const paquete = TARIFAS.paquetes[datos.paquete];
  const invitados = Number(datos.invitados);
  const detalle = [];

  const base = paquete.precio * invitados;
  detalle.push({ concepto: `Paquete ${paquete.nombre} x ${invitados} invitados`, monto: base });

  let extras = 0;
  for (const clave of datos.extras || []) {
    const extra = TARIFAS.extras[clave];
    if (!extra) continue; // ignora valores desconocidos
    extras += extra.precio;
    detalle.push({ concepto: extra.nombre, monto: extra.precio });
  }

  const fecha = leerFecha(datos.fecha);
  const esSabado = fecha !== null && fecha.getDay() === 6;
  const recargo = esSabado ? redondear((base + extras) * TARIFAS.recargoSabado) : 0;
  if (recargo > 0) {
    detalle.push({ concepto: "Recargo por sábado (10%)", monto: recargo });
  }

  const subtotal = redondear(base + extras + recargo);
  const igv = redondear(subtotal * TARIFAS.igv);
  const total = redondear(subtotal + igv);

  return { tipo: TARIFAS.tipos[datos.tipo], detalle, subtotal, igv, total, esSabado };
}

function formatearSoles(monto) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(monto);
}

// Permite usar las funciones en Node.js para las pruebas
if (typeof module !== "undefined") {
  module.exports = { TARIFAS, validarDatos, calcularCotizacion, formatearSoles, leerFecha };
}
