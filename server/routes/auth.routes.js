// Importamos el middleware que controla el registro
const { verificarRegistro} = require("../middleware")
// Importamos el controlador al cual se llamará desde una ruta
const controlador = require("../controllers/auth.controller")
// const { verify } = require("jsonwebtoken")

// const { verificarToken } = require("../middleware/authJwt")
const {upload} = require('../config/multer.js')

module.exports = function (app) {
    // establece los encabezados de respuesta para permitir el acceso a los
    // recursos de la aplicación desde un origen diferente al del servidor
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        )
        next()
    })
    // Ruta para realizar un registro. Incorpora dos middlewares que se ejecutan antes de llegar al controller.
    // En este caso comprobamos tanto que el nick como el email no estén previamente registrados
    // Y luego comprobamos el rol que se le ha asignado en el registro.
    app.post("/api/auth/registro",[verificarRegistro.comprobarUsuarioExistenteOrEmail, verificarRegistro.comprobarRolExistente, upload.array('images',1)], controlador.registrar)
    // Ruta para realizar el login
    app.post("/api/auth/login", controlador.login)
    // ruta para acceder al perfil donde mostramos la información del usuario
    app.get("/api/auth/profile", controlador.profile)
    // Ruta para buscar un usuario segun su id
    app.get("/user/:id", controlador.findUserById)
    // Ruta para buscar un usuario segun su nick
    app.get("/api/auth/verify/:nick", controlador.findUserByNick);
    // Ruta para buscar un usuario por su email
    app.get("/api/auth/verifyEmail/:email", controlador.findUserByEmail);
    // Ruta para eliminar un usuario por su id única
    app.delete("/:id", controlador.deleteUser);
    // Ruta para modificar la información de nuestro usuario
    app.put("/:id", upload.array('images',1) ,controlador.editProfile);
    // Ruta para comprobar si el usuario es admin
    app.get ("/api/auth/idAdmin/:id", controlador.isAdmin)
    // Ruta para añadir una ruta a la lista de rutas favortias  
    app.post("/favs/routes/addFavRoute/:routeId", controlador.addFavoriteRoute)
    // Ruta para eliminar una ruta de favoritos
    app.post("/favs/routes/removeFavRoute/:routeId", controlador.removeFavoriteRoute)
    // Ruta para obtener la lista de rutas favoritas
    app.get("/favs/:userId", controlador.getFavoriteRoutes)
    // Ruta para devolver la lista de rutas favoritas
    app.get("/favs/view/:userId", controlador.getFavoriteRoutesView)

    app.post("/api/auth/reset-password", controlador.resetPassword);

    app.get('/password-reset/:userId/:token', controlador.resetPasswordPage);

    app.post("/password-reset", controlador.changePassword)
}