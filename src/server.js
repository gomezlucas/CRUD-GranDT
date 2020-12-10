const fs = require('fs');

exports.obtenerEquipos = () => JSON.parse(fs.readFileSync('./data/equipos.json'));

exports.obtenerEquiposRaw = () => fs.readFileSync('./data/equipos.json');

exports.guardarEquipos = (equipos) => {
  fs.writeFileSync('./data/equipos.json', JSON.stringify(equipos));
};

exports.eliminarImagenServer = (nombre) => {
  fs.unlinkSync(`./uploads${nombre}`);
};
