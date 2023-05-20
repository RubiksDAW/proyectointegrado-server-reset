const controllerReport = require('../controllers/report.controller')


module.exports = function (app) {

    // Ruta para crear un evento
    app.post("/api/reports/:routeId",controllerReport.addReport )
    app.get("/api/showRouteReports/:routeId", controllerReport.getRouteReports)
}