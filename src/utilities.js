const fs = require('fs');
const { obtenerEquipos, guardarEquipos } = require('./server');

const buscarEquipo = (arrayEquipos, id) => {
  const [equipo] = arrayEquipos.filter((eq) => eq.id == id);
  return equipo;
};

const eliminarImagenServer = (nombre) => {
  if (nombre && !nombre.includes('http')) {
    fs.unlinkSync(`./uploads${nombre}`);
  }
};

const crearNuevoId = (equipos) => Math.max(...equipos.map((equipo) => equipo.id)) + 1;

exports.obtenerEquipo = (id) => {
  const equipo = buscarEquipo(obtenerEquipos(), id);
  return equipo;
};

exports.eliminarEquipo = (id) => {
  let equipos = obtenerEquipos();
  let equipo;
  equipos = equipos.filter((eq) => {
    if (eq.id == id) {
      equipo = eq;
    }
    return eq.id != id;
  });
  eliminarImagenServer(equipo.crestUrl);
  guardarEquipos(equipos);
};

exports.guardarEquipo = (equipo) => {
  let equipos = obtenerEquipos();
  const equipoEditado = equipo;
  if (equipoEditado.hasOwnProperty('id')) {
    equipos = equipos.map((eq) => {
      if (eq.id == equipoEditado.id) {
        if (!equipoEditado.crestUrl) {
          equipoEditado.crestUrl = eq.crestUrl;
        } else if (eq.crestUrl && !eq.crestUrl.includes('http')) {
          eliminarImagenServer(eq.crestUrl);
        }
        return equipoEditado;
      }
      return eq;
    });
  } else {
    const nuevoEquipo = equipo;
    const nuevoId = crearNuevoId(equipos);
    nuevoEquipo.id = nuevoId;
    equipos.push(nuevoEquipo);
  }
  guardarEquipos(equipos);
};

exports.chequearSiglasErrores = (equipos, siglas, edit) => {
  const errores = [];
  console.log(edit, Boolean(edit));
  const max = edit ? 1 : 0;
  console.log(max, 'maxxxx');
  console.log(equipos.filter((equipo) => equipo.tla === siglas.toUpperCase()).length, 'lengthhh');
  if (equipos.filter((equipo) => equipo.tla === siglas.toUpperCase()).length > max) {
    errores.push('La sigla para identificar al club ya existe');
  }

  if (siglas.length < 3) {
    errores.push('La Sigla del equipo debe tener 3 caracteres');
  }
  return errores;
};
