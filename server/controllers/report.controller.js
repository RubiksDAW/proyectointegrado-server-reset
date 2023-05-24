const Report = require('../models/report.model')
const Route = require('../models/route.model')
const Event = require('../models/event.model')


// exports.getRouteReports = async (req, res) => {
//   // console.log("adios")
//   try {
//     const { routeId } = req.params;

//     // Buscar la ruta por ID
//     const route = await Route.findById(routeId).populate("reports");

//     if (!route) {
//       return res.status(404).json({ message: "Ruta no encontrada" });
//     }

//     // Obtener los comentarios de la ruta
//     const reports = route.reports;

//     res.status(200).json({ reports });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error al obtener los comentarios de la ruta" });
//   }
// };

exports.addReport = async (req, res) => {
    console.log("hola")

    try {

      // Deconstruimos el cuerpo de la petición para inicializar las variable con la información que nos llega al servidor
    const { reason, description} = req.body;
    const id = req.params.routeId;
      // El método exec() se utiliza para ejecutar la consulta y devolver una promesa que se puede esperar para obtener el resultado de la consulta.
      const route = await Route.findById(id).exec();
        console.log(id)
        console.log(route)
      if (!route) {
        console.log("No se ha encontrado la ruta");
        return res.status(404).send();
      }
      // Se crea una instancia de un nuevo objeto comentario 
      const newReport = new Report({
        id,
        reason,
        description,
      });
      // Inicializa el campo comments como un array vacío si es undefined
      if (!route.reports) {
        route.reports = []; 
      }
      // Hacemos push al array de comentarios que tiene nuestra ruta por propiedad y guardamos primero el comentario
      await newReport.save()
      // Hacemos push del comentario al array
      route.reports.push(newReport);
      
      await route.save();
        
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send();
    }
  };

  exports.addReportEvent = async (req, res) => {
    console.log("hola");
  
    try {
      // Desestructuramos el cuerpo de la petición para inicializar las variables con la información que nos llega al servidor
      const { reason, description } = req.body;
      const id = req.params.eventId;
  
      // Utilizamos el método exec() para ejecutar la consulta y obtener el evento correspondiente desde la base de datos
      const event = await Event.findById(id).exec();
      console.log(id);
      console.log(event);
  
      if (!event) {
        console.log("No se ha encontrado el evento");
        return res.status(404).send();
      }
  
      // Creamos una nueva instancia de un objeto Report (informe)
      const newReport = new Report({
        id,
        reason,
        description,
      });
  
      // Inicializamos el campo "reports" como un array vacío si es undefined en el evento
      if (!event.reports) {
        event.reports = [];
      }
  
      // Guardamos el nuevo informe en la base de datos
      await newReport.save();
  
      // Agregamos el informe al array de informes del evento
      event.reports.push(newReport);
  
      // Guardamos los cambios en el evento
      await event.save();
  
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send();
    }
  };
  
  exports.getEventReports = async (req, res) => {
    console.log("adios");
    try {
      console.log(req.params)
      const { eventId } = req.params;
      // console.log(id);
      // Buscar el evento por ID
      const event = await Event.findById(eventId).populate("reports");
  
      if (!event) {
        return res.status(404).json({ message: "Evento no encontrado" });
      }
  
      // Obtener los informes del evento
      const reports = event.reports;
  
      res.status(200).json({ reports });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener los informes del evento" });
    }
  };
  

  exports.getRouteReports = async (req, res) => {
    // console.log("adios")
    try {
      const { routeId } = req.params;
  
      // Buscar la ruta por ID
      const route = await Route.findById(routeId).populate("reports");
  
      if (!route) {
        return res.status(404).json({ message: "Ruta no encontrada" });
      }
  
      // Obtener los comentarios de la ruta
      const reports = route.reports;
  
      res.status(200).json({ reports });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener los comentarios de la ruta" });
    }
  };

  exports.deleteRouteReportById = async (req, res) => {
    try {
      console.log(req.params)
      const { reportId } = req.params;
      const { routeId } = req.body;
      console.log(reportId)
      console.log(routeId)
      // Buscar la ruta por ID y actualizar el array de informes
      const updatedRoute = await Route.findOneAndUpdate(
        { _id: routeId },
        { $pull: { reports: reportId } },
        { new: true }
      );
  
      if (!updatedRoute) {
        return res.status(404).json({ message: "Ruta no encontrada" });
      }
  
      return res.status(200).json({ route: updatedRoute });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar el informe" });
    }
  };

  exports.deleteEventReportById = async (req, res) => {
    try {
      console.log(req.params)
      const { reportId } = req.params;
      const { eventId } = req.body;
      console.log(reportId)
      console.log(eventId)
      // Buscar la ruta por ID y actualizar el array de informes
      const updatedEvent = await Event.findOneAndUpdate(
        { _id: eventId },
        { $pull: { reports: reportId } },
        { new: true }
      );
  
      if (!updatedEvent) {
        return res.status(404).json({ message: "Evento no encontrada" });
      }
  
      return res.status(200).json({ event: updatedEvent });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar el informe" });
    }
  };
  
  
  
  