// index.js

/**
 * Modulos Externos
 */
const express = require('express');
const multer = require('multer');

const upload = multer({ dest: './uploads/imagenes' });
const handlebars = require('express-handlebars');
const {
  obtenerEquipo,
  eliminarEquipo,
  guardarEquipo,
  chequearSiglasErrores,
} = require('./src/utilities');

const {
  obtenerEquipos, obtenerEquiposRaw,
} = require('./src/server.js');

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
  eliminarEquipo(id);
  res.redirect('/');
});

app.get('/agregar/equipo', (req, res) => {
  res.render('agregarEquipo', {
    layout: 'index',
  });
});

app.post('/agregar/equipo', upload.single('fotoEquipo'), (req, res) => {
  const equipos = obtenerEquipos();
  const imagePath = '/imagenes/';
  const {
    siglas, nombre, direccion, telefono, website, fundacion,
  } = req.body;

  // Chequeo si TLA existe y el minimo de caracteres
  const errores = chequearSiglasErrores(equipos, siglas);

  // Chequeo si hay errores
  if (errores.length > 0) {
    res.render('agregarEquipo', {
      layout: 'index',
      data: {
        errores,
        equipo: req.body,
        image: req.file && imagePath + req.file.filename,
        action: '/agregar/equipo',
      },
    });
  } else {
    const nuevoEquipo = {
      tla: siglas.toUpperCase(),
      name: nombre,
      address: direccion,
      phone: telefono,
      website,
      area: { name: req.body.pais },
      founded: fundacion,
      crestUrl: req.file && imagePath + req.file.filename,
    };
    guardarEquipo(nuevoEquipo);
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
  const equipos = obtenerEquipos();
  const imagePath = '/imagenes/';

  // Chequeo si TLA existe y el minimo de caracteres
  const errores = chequearSiglasErrores(equipos, siglas, 'edit');

  // Chequeo si hay errores
  if (errores.length > 0) {
    res.render('agregarEquipo', {
      layout: 'index',
      data: {
        errores,
        equipo: req.body,
        image: req.file,
        action: `/editar/equipo/${id}`,
      },
    });
  } else {
    const equipoEditado = {
      id,
      tla: siglas,
      name: nombre,
      address: direccion,
      phone: telefono,
      website,
      area: { name: req.body.pais },
      founded: fundacion,
      crestUrl: req.file && `${imagePath}${req.file.filename}`,
    };

    guardarEquipo(equipoEditado);
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
