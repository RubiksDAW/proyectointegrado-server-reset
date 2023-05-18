// Middleware que utilizo para verificar tanto token como si es administrador 
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js")
const db = require("../models");
const User = require("../models/user.model");
const Role = db.role;


verificarToken = (req, res, next) => {

    // verifica si un token JWT está presente en los encabezados de solicitud
    let token = req.headers["Authorization"]

    // Devuelve un error si no se encuentra el token
    if(!token){
        return res.status(403).send({message:"No hay token disponible"})
    }
    // Si el token es válido, decodifica el token utilizando la clave secreta (config.secret),
    //  obtiene el ID del usuario y lo agrega a la solicitud (req.userId) 
    jwt.verify(token, config.secret, (err,decoded)=>{
        if(err){
            return res.status(401).send({message: "No estás autorizado"})
        }
        req.userId = decoded.id;
        next()
    })
}

//  verifica si el usuario que hace la solicitud tiene el rol de administrador. 
isAdmin = async (req, res, next)=>{
    await User.findById(req.userId).exec(async (err, user)=>{
        if(err){
            res.status(500).send({message: err})
            return
        }

        // Busca todos los roles asociados al usuario
        await Role.find({
            _id:{$in:user.roles}
        },
        (err, roles )=>{
            if(err){
                res.status(500).send({message:err})
                return
            }

            // Verifica si el usuario tiene el rol de "admin"
            for(let i = 0; i < roles.length; i++){
                if(roles[i].name === "admin"){
                    next()
                    return
                }
            }

            // Devuelve un error de "No eres administrador" si el usuario no tiene el rol correspondiente
            res.status(403).send({message : "No eres administrador"})
        })

    })
}
// creamos un objeto con los dos metodos creados
const authJwt = {
    verificarToken,
    isAdmin
}


module.exports = authJwt;