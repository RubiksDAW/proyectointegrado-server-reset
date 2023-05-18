const db = require('../models')
const ROLES = db.ROLES;
const User = db.user;

// función para verificar si un usuario ya existe por su nombre de usuario o correo electrónico en la base de datos
 comprobarUsuarioExistenteOrEmail = async(req, res, next) => {

    try {
       
       // Verifica si el usuario ya existe con ese nickname
       const nickExists = await User.exists({ nick: req.body.nick });
       
       if (nickExists) {
          res.status(400).send({message:"Error! El nick ya está en uso!"});
          return;
       }
 
      // Si el nombre de usuario no está tomado, verifique si el correo electrónico ya existe
      const emailExists = await User.exists({ email: req.body.email });
       
       if (emailExists) {
          res.status(400).send({ message:"Error! El email ya está en uso" });
          return;
       }
 
      // Si ni el correo electrónico ni el nombre de usuario están tomados, proceda con la solicitud
      next();
 
    } catch (error) {
       console.log(error);
       res.status(500).send({ message: "Ha ocurrido un error en el servidor" });
    }
 }
 


// Esta función verifica si los roles enviados en el cuerpo de la solicitud existen
comprobarRolExistente = (req, res, next) => {
  const { roles } = req.body;
  
  if (roles && !roles.every(role => ROLES.includes(role))) {
    return res.status(400).send({
      message: `Error! Uno o más de los roles especificados no existen`
    });
  }

// De lo contrario, continúa con el siguiente middleware o función de controlador
   next();
}


const verificarRegistro = {
    comprobarUsuarioExistenteOrEmail,
    comprobarRolExistente
}

module.exports = verificarRegistro;