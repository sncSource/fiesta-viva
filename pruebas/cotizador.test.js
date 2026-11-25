// Pruebas del cotizador — ejecutar con: node pruebas/cotizador.test.js
const assert = require("node:assert");
const { validarDatos, calcularCotizacion, formatearSoles } = require("../js/cotizador.js");

const HOY = new Date(2026, 10, 23); // 23 de noviembre de 2026
const base = {
  nombre: "Ana Torres",
  correo: "ana@correo.com",
  tipo: "cumpleanos",
  fecha: "2026-12-18",
  invitados: "50",
  paquete: "clasico",
  extras: [],
};

let n = 0;
function prueba(nombre, fn) {
  fn();
  n++;
  console.log("✓ " + nombre);
}

prueba("Datos correctos: sin errores", () => {
  assert.deepStrictEqual(validarDatos(base, HOY), {});
});

prueba("Nombre corto y correo inválido", () => {
  const e = validarDatos({ ...base, nombre: "Al", correo: "ana@correo" }, HOY);
  assert.ok(e.nombre && e.correo);
});

prueba("Tipo de evento no seleccionado", () => {
  assert.ok(validarDatos({ ...base, tipo: "" }, HOY).tipo);
});

prueba("Fecha con menos de 15 días de anticipación", () => {
  assert.ok(validarDatos({ ...base, fecha: "2026-12-07" }, HOY).fecha);
  assert.ok(!validarDatos({ ...base, fecha: "2026-12-08" }, HOY).fecha);
});

prueba("Fecha inexistente (30 de febrero)", () => {
  assert.ok(validarDatos({ ...base, fecha: "2027-02-30" }, HOY).fecha);
});

prueba("Invitados fuera de rango o decimales", () => {
  for (const v of ["19", "501", "45.5", "", "abc"]) {
    assert.ok(validarDatos({ ...base, invitados: v }, HOY).invitados, v);
  }
  for (const v of ["20", "500"]) {
    assert.ok(!validarDatos({ ...base, invitados: v }, HOY).invitados, v);
  }
});

prueba("Viernes 18/12/2026, Clásico, 50 invitados, sin extras", () => {
  const c = calcularCotizacion(base);
  assert.strictEqual(c.subtotal, 3500);
  assert.strictEqual(c.igv, 630);
  assert.strictEqual(c.total, 4130);
  assert.strictEqual(c.esSabado, false);
});

prueba("Sábado 19/12/2026, Premium, 120 invitados, DJ + fotografía", () => {
  const c = calcularCotizacion({
    ...base,
    fecha: "2026-12-19",
    invitados: "120",
    paquete: "premium",
    extras: ["dj", "foto"],
  });
  // 110 x 120 = 13 200; extras 2 100; recargo 10% = 1 530; subtotal 16 830; IGV 3 029.40
  assert.strictEqual(c.subtotal, 16830);
  assert.strictEqual(c.igv, 3029.4);
  assert.strictEqual(c.total, 19859.4);
  assert.strictEqual(c.detalle.length, 4);
});

prueba("Extras desconocidos se ignoran", () => {
  const c = calcularCotizacion({ ...base, extras: ["dj", "fuegosArtificiales"] });
  assert.strictEqual(c.subtotal, 4400);
});

prueba("Formato de moneda peruana", () => {
  // Intl separa "S/" del número con un espacio no separable (U+00A0): \s lo reconoce
  assert.match(formatearSoles(19859.4), /^S\/\s19,859\.40$/);
});

console.log(`\n${n} pruebas superadas`);
