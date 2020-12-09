const fs = require('fs');

exports.obtenerEquiposRaw = () => fs.readFileSync('./data/equipos.json');

exports.obtenerEquipos = () => JSON.parse(fs.readFileSync('./data/equipos.json'));

exports.obtenerEquipo = (id) => {
  const equipo = fs.readFileSync('./data/equipos.json');
  let equipoJson = JSON.parse(equipo);
  [equipoJson] = equipoJson.filter((team) => team.id == id);
  return equipoJson;
};

exports.guardarEquipos = (equipos) => {
  fs.writeFileSync('./data/equipos.json', JSON.stringify(equipos));
};

exports.eliminarImagenServer = (nombre) => {
  if (nombre && !nombre.includes('http')) {
    fs.unlinkSync(`./uploads${nombre}`);
  }
};
