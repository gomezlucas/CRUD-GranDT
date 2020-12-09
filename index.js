// index.js

/**
 * Modulos Externos
 */
const express = require('express');
const multer = require('multer');

const upload = multer({ dest: './uploads/imagenes' });
const handlebars = require('express-handlebars');
const {
  obtenerEquipo, obtenerEquiposRaw, obtenerEquipos, guardarEquipos, eliminarImagenServer,
} = require('./src/utilities');
/**
 * App Variables
 */
const port = process.env.PORT || '8000';
const app = express();
const hbs = handlebars.create();

// Set handlebar
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Carpetas estaticas
app.use(express.static(`${__dirname}/public`));
app.use(express.static(`${__dirname}/uploads`));

/* Rutas */
app.get('/', (req, res) => {
  const equipos = obtenerEquipos();
  const total = equipos.length;
  res.render('equipos', {
    layout: 'index',
    data: {
      total,
      equipos,
    },

  });
});

app.get('/equipos', (req, res) => {
  const equipos = obtenerEquiposRaw();
  res.setHeader('Content-Type', 'application/json');
  res.send(equipos);
});

app.get('/equipo/:id', (req, res) => {
  const { id } = req.params;
  const equipo = obtenerEquipo(id);
  if (equipo) {
    res.render('equipo', {
      layout: 'index',
      data: { equipo },
    });
  } else {
    res.render('404', {
      layout: 'index',
    });
  }
});

app.get('/eliminar/equipo/:id', (req, res) => {
  const { id } = req.params;
  let equipos = obtenerEquipos();
  const equipo = obtenerEquipo(id);

  // Busca y guarda el path de la imagen, elimina si es que existe
  eliminarImagenServer(equipo.crestUrl);

  equipos = equipos.filter((eq) => eq.id != id);
  guardarEquipos(equipos);
  res.redirect('/');
});

app.get('/agregar/equipo', (req, res) => {
  res.render('agregarEquipo', {
    layout: 'index',
  });
});

app.post('/agregar/equipo', upload.single('fotoEquipo'), (req, res) => {
  const equipos = obtenerEquipos();
  const errores = [];
  const {
    siglas, nombre, direccion, telefono, website, fundacion,
  } = req.body;

  // Creo ID para el nuevo Equipo
  const newID = Math.max(...equipos.map((equipo) => equipo.id)) + 1;

  // Chequeo si TLA existe
  if (equipos.filter((equipo) => equipo.tla === siglas.toUpperCase()).length > 0) {
    errores.push('La sigla para identificar al club ya existe');
  }

  if (siglas.length < 3) {
    errores.push('La Sigla del equipo debe tener 3 caracteres');
  }

  // Chequeo si hay errores
  if (errores.length > 0) {
    res.render('agregarEquipo', {
      layout: 'index',
      data: {
        errores,
        equipo: req.body,
        action: '/agregar/equipo',
      },
    });
  } else {
    const imagePath = '/imagenes/';

    const nuevoEquipo = {
      id: newID,
      tla: siglas.toUpperCase(),
      name: nombre,
      address: direccion,
      phone: telefono,
      website,
      area: { name: req.body.pais },
      founded: fundacion,
      crestUrl: req.file && imagePath + req.file.filename,
    };
    equipos.push(nuevoEquipo);
    guardarEquipos(equipos);
    res.redirect('/');
  }
});

app.get('/editar/equipo/:id', (req, res) => {
  const { id } = req.params;

  const {
    tla, name, area, address, website, founded, phone, crestUrl,
  } = obtenerEquipo(id);

  const equipo = {
    siglas: tla,
    nombre: name,
    pais: area.name,
    direccion: address,
    fundacion: founded,
    telefono: phone,
    website,
    image: crestUrl,
  };

  res.render('agregarEquipo', {
    layout: 'index',
    data: {
      equipo,
      action: `/editar/equipo/${id}`,
    },

  });
});

app.post('/editar/equipo/:id', upload.single('fotoEquipo'), (req, res) => {
  const { id } = req.params;
  const {
    siglas, nombre, direccion, telefono, website, fundacion,
  } = req.body;
  const errores = [];
  let equipos = obtenerEquipos();
  const equipo = obtenerEquipo(id);

  // Defino foto del equipo
  const imagePath = '/imagenes/';
  let image;
  if (req.file) {
    eliminarImagenServer(equipo.crestUrl);
    image = `${imagePath}${req.file.filename}`;
  } else {
    image = equipo.crestUrl;
  }

  // Chequeo si hay errores
  if (errores.length > 0) {
    res.render('agregarEquipo', {
      layout: 'index',
      data: {
        errores,
        equipo: req.body,
        action: `/editar/equipo/${id}`,
      },
    });
  } else {
    const nuevoEquipo = {
      ...equipo,
      tla: siglas,
      name: nombre,
      address: direccion,
      phone: telefono,
      website,
      area: { name: req.body.pais },
      founded: fundacion,
      crestUrl: image,
    };

    equipos = equipos.map((eq) => {
      if (eq.id == id) {
        return nuevoEquipo;
      }
      return eq;
    });

    guardarEquipos(equipos);
    res.redirect('/');
  }
});

app.get('/:id', (req, res) => {
  res.render('404', {
    layout: 'index',
  });
});

// Server Activation
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
