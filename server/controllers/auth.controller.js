// Importamos el archivo de configuración y lo almacenamos en "config"
const config = require("../config/auth.config")
// importamos los modelos en "db"
const db = require("../models")

// const { ObjectId } = require('mongoose').Types;

const User = db.user;

const Route = db.route;

const Role = db.role;

// Importamos JWT para crear y verificar tokens JWT
let jwt = require("jsonwebtoken")

// IMportamos bcrypt para el hashing de contraseñas y que no se almacenen sin encryptar
let bcrypt = require("bcrypt")

// Importamos el array de palabras baneadas
const bannedWords = require('../config/bans.words')

// Importamos cloudinary
const cloudinary = require("../config/cloudinary.js")

// Mongoose recientemente ha dejado de aceptar callbacks como parametro por lo que las funciones 
// deben ser asincronas. 
exports.registrar = async (req, res) => {
    try {
        const { nick, email, password, age, description, roles } = req.body;
        console.log(req.files)
        // Subimos las imágenes a Cloudinary y obtenemos sus URLs
        const galeria = await Promise.all(req.files.map((file) => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(file.path, (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result.secure_url);
              }
            });
          });
        }));
        
        // Controlamos que no llegue nick email y contraseña vacios
        if (!nick || !email || !password) {
            return res.status(400).send({ message: 'Se requiere nick, email y password' });
        }
        // Establecemos un limite superior para la edad. 
        if(age > 100){
          return res.status(400).send({message: "No eres demasiado mayor para montar en bicicleta?"})
        }
        
        // Recorremos el array de palabras baneadas y comprobamos que no coincide que las utilizadas por el usuario
        for (let i = 0; i < bannedWords.length; i++) {
            if (nick.toUpperCase().includes(bannedWords[i].toLocaleUpperCase()) || email.includes(bannedWords[i])) {
                return res.status(400).send({ message: "Nick inapropiado, porfavor prueba con otro nick" })
            }
        }
        
        // Encryptamos la contraseña y la incluimos en el usuario que guardaremos en nuestra db
        const hashedPassword = await bcrypt.hash(password, 8);
        const newUser = new User({
            nick: nick.toLowerCase(),
            email: email,
            password: hashedPassword,
            age: age,
            description: description,
            imageURL: galeria,
        });

        // Almacenamos 
        const userSaved = await newUser.save();

        // Declaramos un array para almacenar distintos roles. Sólo se podrá crear un admin a través de una
        // petición. Cuando un usuario se registra, automaticamente se le asigna el rol de USER
        let assignedRoles = [];

        if (roles && roles.length > 0) {
            assignedRoles = await Role.find({ name: { $in: roles } }, '_id');
        } else {
            // Si no especificamos ningun usuario, se asigna por defecto un rol de "user"
            const defaultRole = await Role.findOne({ name: 'user' }, '_id');
            assignedRoles.push(defaultRole);
        }

        userSaved.roles = assignedRoles;

        await userSaved.save();
        // Si el usuario se crea de forma correcta y supera la asignación del rol. Nos devuelve un mensaje para informar
        return res.status(200).send({ message: 'El usuario se ha registrado correctamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: error.message || 'Ha habido un error en el registro del usuario' });
    }
}

// Metodo del controlador con el cual podemos hacer inicio de sesión.
exports.login = async (req, res) => {
    try {
      // Buscamos un usuario por su nick. Si se encuentra en nuestra db se creará correctamente. Tambien nos traemos los ObjectId de los roles asociados
        const user = await User.findOne({ nick: req.body.nick }).populate("roles", "-__v")
      // Si no hay usuario devolvemos un error. 
        if (!user) return res.status(404).send({ message: "Usuario no encontrado" })
      // Comparamos las contraseña que ha introducido el usuario con la que está almacenadas
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
      //  Si no es correcta se devuelve un mensaje de error
        if (!passwordIsValid)
            return res.status(401).send({
                accessToken: null,
                message: "Contraseña incorrecta"
            })

        // Generamos un token para la sesión y le asignamos un tiempo de vida (1 año)
        const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 31536000  })
        
        // Cargamos el rol que tiene el usuario la constante "autoridades" se crea utilizando el método "map" 
        // para generar un nuevo array a partir del array de roles asignados al usuario.
        const autoridades = user.roles.map((role) => `ROLE_${role.name.toUpperCase()}`)

        // Luego se devuelve una respuesta en formato JSON con la información del usuario,
        // incluyendo su ID, nick, email, edad, descripción, URL de imagen, roles y el token de acceso generado 
        //utilizando la librería "jsonwebtoken".
        res.status(200).send({
            id: user._id,
            nick: user.nick,
            email: user.email,
            age: user.age,
            description: user.description,
            imageURL: user.imageURL,
            roles: autoridades,
            accessToken: token
        })
    } catch (err) {
      // si no se puede completar la operación de login se devuelve un error 500
        res.status(500).send({ message: err.message || "Ocurrió un error al intentar ingresar" })
    }
}

// Metodo para obtener el perfil del usuario
exports.profile = async (req, res) => {
    // Comprueba la cabecera para comprobar la información que llega y si corresponde a una sesion valida
    const { authorization } = req.headers;
    if (!authorization) return res.sendStatus(401);

    try {

      // El objeto encoder se utiliza para convertir la cadena config.secret en una matriz de bytes (Uint8Array)
      // utilizando el método encode() de la interfaz TextEncoder. Esto es necesario porque el método jwt.verify()
      // espera un array de bytes como su segundo argumento (clave secreta).
        const encoder = new TextEncoder();
        const { id } = await jwt.verify(authorization, encoder.encode(config.secret));
        const user = await User.findById(id).populate('roles', '-__v');
        
        if (!user) {
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }
        // Con populate cargamos los roles asociados al usuarios. 
        // contruimos un objeto de respuesta que incluye los detalles del usuario
        const autoridades = user.roles.map((role) => `ROLE_${role.name.toUpperCase()}`);
        res.status(200).send({
            id: user._id,
            nick: user.nick,
            email: user.email,
            age: user.age,
            description: user.description,
            imageURL: user.imageURL,
            roles: autoridades
        });
    } catch (err) {
        return res.sendStatus(401);
    }
};

// Metodo para editar el perfil de nuestro usuario.
// Actualmente no es disponible actualizar la contraseña.
exports.editProfile = async (req, res) => {
    try {
      const { nick, email, age, description, imageURL} = req.body;
      const { id } = req.params;
  
      // Buscamos al usuario por su ID en la base de datos
      const user = await User.findById(id);
  
      // Si el usuario no existe, devolvemos un error 404
      if (!user) {
        return res.status(404).send({ message: 'No se ha encontrado al usuario especificado' });
      }
  
      // Actualizamos los campos del usuario que nos hayan sido enviados en el cuerpo de la solicitud
      if (nick) {
        // Verificamos que el nuevo apodo no contenga palabras prohibidas
        for (let i = 0; i < bannedWords.length; i++) {
          if (nick.toUpperCase().includes(bannedWords[i].toLocaleUpperCase())) {
            return res.status(400).send({ message: 'El nuevo apodo contiene palabras prohibidas' });
          }
        }
        user.nick = nick;
      }
      // Comprobamos si viene información del mail para actualizar
      if (email) {
        user.email = email;
      }
    //   if (password) {
    //     const hashedPassword = await bcrypt.hash(password, 8);
    //     user.password = hashedPassword;
    //   }
      if (age) {
        user.age = age;
      }

      // Comprobamos si tenemos descripción a actualizar
      if (description) {
        user.description = description;
      }

      // Comprobamos si tenemos imagen de perfil que actualizar
      if (imageURL) {
        user.imageURL = imageURL;
      }
    // No se pueden modificar los roles actualmente
    //   if (roles) {
    //     const assignedRoles = await Role.find({ name: { $in: roles } }, '_id');
    //     user.roles = assignedRoles;
    //   }
      // Despues de haber reasignado los valores del objeto Usuario a editar
      // Guardamos los cambios en la base de datos
      await user.save();
  
      return res.status(200).send({ message: 'El usuario se ha modificado correctamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: error.message || 'Ha habido un error al modificar al usuario' });
    }
  };

// Metodo para eliminar un usuario
exports.deleteUser = async (req,res)=>{
    try {
        // Guardamos la id que nos viene en la petición
        // para buscar y eliminar 
        const userId = req.params.id
        console.log(userId)

        // Utilizamos el metodo para eliminar de Mongodb
        const deletedUser = await User.findByIdAndDelete(userId);
      
        if(!deletedUser){
            res.status(404).send({message:"Usuario no encontrado"})
        }else{
            res.status(200).send({message:"Usuario eliminado"})
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({message:"Error en el servidor"})
    }
}

// Metodo para buscar un usuario según su id.
exports.findUserByNick = async (req, res) => {
console.log(req.params)

  // Guardamos el nick del usuario que viene en la petición, eliminamos los espacios en blanco
  // y lo convertimos en minusculas
  const userNick = req.params.nick.trim().toLowerCase(); 

  // asegurarse de que no haya espacios en blanco y todo sea en minúsculas
  const userAlreadyExist = await User.findOne({ nick: userNick }).populate('totalRoutes').populate('totalEvents').populate('totalComments').populate('totalEventsJoined').lean();
  // const userAlreadyExist = await User.findOne({ nick: userNick });
  // En caso de encontrarlo lo devuelve. Sino devuelve un 404
  if (userAlreadyExist) {

    console.log("encontrado");

    res.json(userAlreadyExist);

  } else {

    console.log("no encontrado");

    res.sendStatus(404);
  }
};

// Metodo para buscar usuarios según id
exports.findUserById = async (req, res) => {

  const userId = req.params.id; 

  const userAlreadyExist = await User.findOne({ _id: userId }).populate('totalRoutes').populate('totalEvents').lean();

  // console.log(userAlreadyExist);

  if (userAlreadyExist) {

    console.log("encontrado");

    res.json(userAlreadyExist);

  } else {

    console.log("no encontrado");

    res.sendStatus(404);
  }
};

// Metodo para comprobar si el usuario es administrador
exports.isAdmin = async (req,res) => {
  const userId = req.params.id

  try {
    const user = await User.findById(userId).populate("roles");
    // comprueba si en el array de roles del usuario está el de admin
    const adminRole = await Role.findOne({ name: "admin" });
    console.log("es admin")
    
    // Devuelve el usuario si se incluye el rol de admin
    return user.roles.includes(adminRole._id);
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Metodo para buscar por email un usuario
exports.findUserByEmail = async (req, res) => {
  const email = req.params.email;
console.log(email)
  try {

    const usuarioEncontrado = await User.findOne({ email: email });

    if (!usuarioEncontrado) {
      return res.status(404).json({ mensaje: 'No se encontró un usuario con ese email.' });
    }

    res.json(usuarioEncontrado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: 'Ocurrió un error al buscar el usuario.' });
  }
};

// Meotodo para añadir rutas a la lista de favoritos de nuestro usuario
exports.addFavoriteRoute = async (req, res) => {
  // Obtenemomos la id del usuario del cuerpo de la petición
  const userId = req.body.userId;
  // Obtenemos la id de la ruta 
  const routeId = req.params.routeId;
  try {
    const user = await User.findById({ _id: userId });
    console.log(user)
    const route = await Route.findById(routeId);
    console.log(route)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrados' });
    }
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrados' });
    }

    // Verificar si la ruta ya está en la lista de favoritos del usuario
    if (user.favouriteRoutes.includes(routeId)) {
      return res.status(409).json({ message: 'La ruta ya está en la lista de favoritos del usuario' });
    }
    
    // Agregar la ruta a la lista de favoritos del usuario
    user.favouriteRoutes.push(routeId);
    await user.save();
    
    return res.status(200).json({ message: 'La ruta ha sido agregada a la lista de favoritos del usuario' });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al agregar la ruta a la lista de favoritos del usuario' });
  }
};

// Meotod para eliminar una ruta de la lista de favoritos de un usuarui
exports.removeFavoriteRoute = async (req, res) => {
  const userId = req.body.userId;
  const routeId = req.params.routeId;
  try {
    // Comprobamos que la id del usuario exista
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    // Si en el array de favoritos no se incluye la id de la ruta que nos llega se devuelve un error
    if (!user.favouriteRoutes.includes(routeId)) {
      return res.status(409).json({ message: 'La ruta no está en la lista de favoritos del usuario' });
    }

    // Si no ha devuelto ningun error se elimina del array de rutas favortias mediante el metodp pull()
    user.favouriteRoutes.pull(routeId);
    await user.save();

    return res.status(200).json({ message: 'La ruta ha sido eliminada de la lista de favoritos del usuario' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar la ruta de la lista de favoritos del usuario' });
  }
};


// Metodo para obtener la lista de rutas favoritas del usuario
exports.getFavoriteRoutes = async (req, res) => {
  try {
    const userId = req.params.userId;
    // console.log("user id "+ userId)
    // Buscar el usuario en la base de datos
    const user = await User.findById({ _id: userId });

    // console.log(user)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Se utiliza el operador "$in" de MongoDB para buscar documentos donde el valor del campo "_id" 
    // esté presente en el array "favouriteRoutes". El resultado de la consulta se almacena en la variable "favoriteRoutes".
    const favoriteRoutes = await Route.find({ _id: { $in: user.favouriteRoutes } });
    // console.log(favoriteRoutes)

    res.json(favoriteRoutes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las rutas favoritas' });
  }
};

// Metodo para obtener la información asociada a las id que se almacenan en el array de rutas favoritas
exports.getFavoriteRoutesView = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(userId).populate('favouriteRoutes');
    const favouriteRoutes = user.favouriteRoutes;
    res.status(200).json({ favouriteRoutes });
  } catch (error) {
    
    res.status(500).json({ message: "Error al obtener las rutas favoritas del usuario" });
  }
};

exports.resetPassword = async (req, res) => {

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send("Debe proporcionar un correo electrónico");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("No existe un usuario con el correo electrónico proporcionado");
    }

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `https://bikebrosv2.herokuapp.com/password-reset/${user._id}/${token.token}`;

    await sendEmail(user.email, "Restablecimiento de contraseña", link);

    res.send("Se ha enviado un enlace de restablecimiento de contraseña a tu cuenta de correo electrónico");
  } catch (error) {
    res.send("Ocurrió un error");
    console.log(error);
  }
};



exports.resetPasswordPage = async (req, res) => {
  try {
    const { userId, token } = req.params;
    const templatePath = path.join(__dirname, '../config/reset-password.html');

    // Renderizar la plantilla con los valores de userId y token
    const renderedTemplate = await ejs.renderFile(templatePath, { userId, token });

    res.send(renderedTemplate);
  } catch (error) {
    res.status(500).send('Error al cargar la página de restablecimiento de contraseña');
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { userId, token, password, confirmPassword } = req.body;
    console.log(req.body)

    // Verificar si la contraseña y la confirmación coinciden
    if (password !== confirmPassword) {
      return res.status(400).send({ message: 'La contraseña y la confirmación no coinciden' });
    }

    // Obtener el usuario correspondiente al userId
    const user = await User.findById(userId);

    // Verificar si el usuario existe y si el token es válido
    if (!user) {
      return res.status(400).send({ message: 'Token inválido o usuario no encontrado' });
    }

    // Actualizar la contraseña del usuario
    const hashedPassword = await bcrypt.hash(password, 8);
    user.password = hashedPassword;
    

    // Guardar los cambios en la base de datos
    await user.save();

    return res.status(200).send({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: error.message || 'Ha ocurrido un error al restablecer la contraseña' });
  }
};






