const controllerReport = require('../controllers/report.controller')


module.exports = function (app) {

    // Ruta para crear un evento
    app.post("/api/reports/:routeId",controllerReport.addReport )
    app.get("/api/showRouteReports/:routeId", controllerReport.getRouteReports)

    app.post("/api/reportsEvent/:eventId", controllerReport.addReportEvent)
    app.get("/api/report/showEventReports/:eventId", controllerReport.getEventReports)
    app.delete("/api/reports/route/delete/:reportId", controllerReport.deleteRouteReportById)
    app.delete("/api/reports/event/delete/:reportId", controllerReport.deleteEventReportById)
}