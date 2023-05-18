// Importamos el schema de nuestro evento para trabajar con Mongoose
const Event = require('../models/event.model');

// Método para registrar un nuevo evento
exports.createEvent = async (req, res) => {
  try {
    // Creamos un nuevo evento que añadir a nuestra bd
    const event = new Event({
      ruta: req.body.ruta,
      fecha: req.body.fecha,
      participantes: req.body.participantes,
      ubicacion:req.body.ubicacion,
      maxParticipantes: req.body.maxParticipantes,
      // Guardamos la id del creador del evento para controlar quien es el organizador
      creador: req.body.creador
    });

    // Guardamos el evento
    await event.save();
    res.status(201).json({ message: 'Evento creado exitosamente', event: event });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al crear el evento' });
  }
};


// Es necesario hacer uso de la función populate de Mongoose en los métodos del controlador que involucren campos de referencia a otras colecciones, como en este caso en el modelo "Event" que tiene referencias a las colecciones "Route" y "Usuario", por varias razones:

// Para obtener información completa de los documentos relacionados: Al utilizar populate, se obtiene información completa de los documentos relacionados que se han referenciado, es decir, en lugar de simplemente obtener el _id de los documentos relacionados, se obtiene todo el documento correspondiente.

// Para evitar consultas adicionales a la base de datos: Sin populate, tendríamos que hacer consultas adicionales a la base de datos para obtener los documentos relacionados y completar la información que necesitamos, lo que podría ser ineficiente y generar tiempos de espera innecesarios. En cambio, con populate, se realiza una sola consulta a la base de datos que incluye todos los documentos relacionados, lo que mejora el rendimiento de la aplicación.

// Para facilitar la manipulación de los datos: Al tener la información completa de los documentos relacionados, podemos manipular los datos de manera más fácil y conveniente, sin tener que hacer referencia a _id y hacer más consultas a la base de datos para obtener la información faltante.

// En resumen, populate nos permite obtener información completa y relacionada con una sola consulta a la base de datos, lo que mejora la eficiencia y la conveniencia al manipular los datos.

// Método para obtener todos los eventos

// Método para obtener un evento específico
exports.getAllEvents = async (req, res) => {
  const { searchTerm } = req.query;
  console.log(searchTerm)
  try {
  let events;
    // Comprobamos si en la petición nos llegan palabras clave para realizar una busqueda
  if (searchTerm) {
    // Del evento nos traemos la ruta asociada así como los participantes para obtener información de ambas entidades
    events = await Event.find({
      $or: [{ ubicacion: { $regex: searchTerm, $options: 'i' } }],
    }).populate('ruta').populate('participantes');
    
  } else {
    // Si no ha llegado ninguna palabra clave se devuelven todos los eventos
    events = await Event.find().populate('ruta').populate('participantes');
  }
  // 
  res.status(200).json(events);
  } catch (error) {
  console.log(error);
  res.status(500).json({ message: 'Error al obtener los eventos' });
  }
  };

// Método para obtener un evento específico por su id
exports.getEventById = async (req, res) => {
  try {
    
    // Pasamos la id para utilizarla en el metodo de Mongoose que nos devuelte un elemento según una propiedad
    const event = await Event.findOne({_id: req.params.eventId}).populate('ruta').populate('participantes');
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ message: 'Evento no encontrado' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener el evento' });
  }
};

// Método para modificar un evento existente
exports.updateEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event) {

      // Reasignamos los valores de nuestro evento 
      event.ruta = req.body.ruta;
      event.fecha = req.body.fecha;
      event.participantes = req.body.participantes;
      event.maxParticipantes = req.body.maxParticipantes;

      // Guardamos el evento y lo devolvemos
      await event.save();
      res.status(200).json({ message: 'Evento modificado exitosamente', event: event });
    } else {
      res.status(404).json({ message: 'Evento no encontrado' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al modificar el evento' });
  }
};

// Método para borrar un evento existente
exports.deleteEventById = async (req, res) => {
  const eventId = req.params.eventId;
  try {
    // Hacenis uso de la id del evento para eliminarlo con el siguiente metodo de Mongoose
    const event = await Event.findByIdAndDelete(eventId);
    if (event) {
      res.status(200).json({ message: 'Evento eliminado exitosamente' });
    } else {
      res.status(404).json({ message: 'Evento no encontrado' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al eliminar el evento' });
  }
};

// Metodo para registrar en el array de participantes un nuevo usuario
exports.registerUserToEvent = async (req, res) => {
    try {
      const { eventId, userId } = req.body;
      const event = await Event.findById(eventId);
      // Distintas validaciones para gestionar la participación de los usuarios en los eventos a los que se inscriben
      if (!event) {
        return res.status(404).json({ error: 'El evento no existe' });
      }
      // Comprobamos que no pueda apuntarse al evento si ha alcanzado el cupo de participantes maximos
      if (event.participantes.length >= event.maxParticipantes) {
        return res.status(400).json({ error: 'El evento ya alcanzó su capacidad máxima de participantes' });
      }

      // Comprobamos que el participante que se va a inscribir no esté ya inscrito.
      if (event.participantes.includes(userId)) {
        return res.status(400).json({ error: 'El usuario ya está inscrito en el evento' });
      }

      // Si ha superado las validaciones hace push de la id del usuario en el array de participantes.
      event.participantes.push(userId);

      await event.save();

      return res.status(201).json(event);
      
    } catch (error) {

      console.log(error);

      return res.status(500).json({ error: 'Ha ocurrido un error al inscribir al usuario en el evento' });
    }
  },

  // Método para eliminar la inscripción de un usuario en un evento
  exports.unregisterUserFromEvent = async (req, res) => {
    try {
      const { eventId, userId } = req.body;
      const event = await Event.findById(eventId);
      // Distintas validaciones para gestionar la participación de los usuarios en los eventos a los que se borran del evento
      if (!event) {
        return res.status(404).json({ error: 'El evento no existe' });
      }
      // Comprobamos que no pueda apuntarse al evento si no se encuentra en la lista de participantes
      if (!event.participantes.includes(userId)) {
        return res.status(400).json({ error: 'El usuario no está inscrito en el evento' });
      }

      event.participantes = event.participantes.filter(participante => participante != userId);
      await event.save();

      return res.status(200).json(event);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Ha ocurrido un error al eliminar la inscripción del usuario en el evento' });
    }
  }
  // Metodo para comprobar si el usuario está inscrito a un evento
  exports.checkUserInEvent = async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const userId = req.params.userId;
      
      // Utilizamos Mongoose para encontrar el evento en nuestra db pasandole que parametros la id del evento y la del id del usuario
      const event = await Event.findOne({_id: eventId, participantes: userId});
  
      if (event) {
        res.status(200).json({ message: 'El usuario está inscrito en el evento' });
      } else {
        res.status(404).json({ message: 'El usuario no está inscrito en el evento' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ha ocurrido un error al comprobar la inscripción del usuario en el evento' });
    }
  };
  
  exports.getEventsJoined = async(req,res)=>{
    try {
      const userId = req.params.userId;
      const eventsJoined = await Event.find({ participantes: userId });
  
      res.status(200).json(eventsJoined);
    } catch (error) {
      res.status(500).json({ error: 'Ha ocurrido un error al obtener los eventos inscritos' });
    }
  }