const controllerEvent = require('../controllers/event.controller')


module.exports = function (app) {

    // Ruta para crear un evento
    app.post("/api/createEvent", controllerEvent.createEvent);

    // Ruta para registrar un usuario en el evento
    app.post("/api/events/register", controllerEvent.registerUserToEvent)

    // Ruta para desapuntar a un usuario de un evento
    app.post("/api/events/unregister", controllerEvent.unregisterUserFromEvent)

    // Ruta para obtener todos los eventos
    app.get("/api/getAllEvents", controllerEvent.getAllEvents);

    // Ruta para obtener un evento por su id
    app.get("/api/events/id/:eventId", controllerEvent.getEventById);

    // Ruta para comprobar si un usuario se encuentra registrado en un evento
    app.get("/:eventId/checkParticipation/:userId", controllerEvent.checkUserInEvent)

    // Ruta para actualizar un evento por su id
    app.put("/api/updateEvent/:eventId", controllerEvent.updateEventById);

    // Ruta para eliminar un evento por su id
    app.delete("/api/deleteEvent/:eventId", controllerEvent.deleteEventById);

    app.get("/api/getEventsJoined/:userId", controllerEvent.getEventsJoined)


}