// Importamos el controlador para manejar las peticiones relacionadas con las rutas 
const controllerRoute = require('../controllers/route.controller')
const {upload} = require('../config/multer.js')
module.exports = function (app) {

    
    // Ruta para registrar una ruta en bicicleta
    app.post("/api/route/register", upload.array('images', 5), controllerRoute.register)
    // Ruta para obtener todas las rutas en bicicleta disponibles
    app.get("/api/route/getAll", controllerRoute.getAllRoutes)

    app.get("/routes/getAll", controllerRoute.getAllRoutesNames)
    // Ruta para obtener una ruta según su nombre
    app.get("/route/:name", controllerRoute.getRouteByName)
    // Ruta para obtener una ruta según su id
    app.get("/route/id/:id", controllerRoute.findRouteById)
    // Ruta para compartir información de una ruta
    app.get("/route/html/:id", controllerRoute.findRouteByIdHtml)
    //Ruta para eliminar una ruta según su id 
    app.delete("/route/delete/:id", controllerRoute.deleteRoute)
    // Ruta utilizada para añadir un comentario a la ruta
    app.post("/route/comments/:routeId", controllerRoute.addComment)
    // Ruta utilizada para obtener todos los comentarios asociados a una ruta
    app.get("/route/getAllComments/:routeId", controllerRoute.getRouteComments)
    // Ruta utilizada para modificar una ruta 
    app.put("/route/:routeId/modify",upload.array('images', 5),controllerRoute.modifyRoute)

    app.delete("/route/comments/delete/:commentId", controllerRoute.deleteCommentById)

    app.put("/route/updateRoutePic/:routeId", upload.array('images',5), controllerRoute.uploadRoutePic)
}