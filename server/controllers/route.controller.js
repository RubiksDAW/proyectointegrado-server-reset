
// Importamos los schemos de nuestras entidades Ruta y Comentario. 
const Route = require('../models/route.model.js')
const Comment = require('../models/comment.model.js');

// Importamos cloudinary
const cloudinary = require("../config/cloudinary.js")

// Método del controlador para registrar una ruta. 
exports.register = async (req, res) => {
  try {
    // console.log(req.files)

    // Deconstruimos el body de la petición en las variables que utilizaremos para construir un nuevo objeto tipo ruta. 
    const { name, difficulty_level, distance, location, description, origin, destination, author } = req.body;
    const imageFileNames = req.files.map(file => file.filename); // Obtiene los nombres de archivo de las imágenes subidas
    // Subimos las imágenes a Cloudinary y obtenemos sus URLs
    const galeria = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file.path, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.secure_url);
          }
        });
      });
    });
    // Creamos una instancia de nuestro Objeto ruta y le pasamos todos los valores obtnidos
    const route = new Route({
      name: name,
      difficulty_level: difficulty_level,
      distance: distance,
      location: location,
      description: description,
      origin: origin,
      destination: destination,
      // Guarda los nombres de archivo en el campo de imágenes una vez ha terminado de comprobarse todas las imagenes.
      images: await Promise.all(galeria), 
      // Almacenamos el autor de la ruta para poder tenerlo identificado
      author: author
    });

    const newRoute = await route.save();
    res.send({ route: newRoute });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


// Método para modificar una ruta
exports.modifyRoute = async (req, res) => {
  try {
    // console.log(req.params.formData)
      const routeId = req.body._id;
      console.log(routeId)
      // const imageFileNames = req.files.map(file => file.filename)

      const galeria = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload(file.path, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.secure_url);
            }
          });
        });
      });
      // Guardamos en un objeto la información que nos llega en el cuerpo de la petición.
      const modifiedData = {
          name: req.body.name,
          difficulty_level: req.body.difficulty_level,
          distance: req.body.distance,
          location: req.body.location,
          description: req.body.description,
          origin: req.body.origin,
          destination: req.body.destination,
          // Esperamos a que terminen de subirse todas las imagenes antes de asignarlas a la propiedad del objeto
          images: await Promise.all(galeria),
          
      };
      console.log(modifiedData)

      // Se busca la ruta por su id y se sustituye por el objeto modifiedData creado
      const modifiedRoute = await Route.findByIdAndUpdate(routeId, modifiedData, { new: true });
      
      if (!modifiedRoute) {
          return res.status(404).send({ message: 'Ruta no encontrada' });
      }
      // Se devuelve 
      res.send({ route: modifiedRoute });
  } catch (error) {
      res.status(500).send({ message: error.message });
  }
};


// Método para controlar 
exports.getAllRoutes = async (req, res) => {
  try {
    // Comprobamos si en la petición nos llega una palabra clave para filtrar las rutas que se van a devolver
  const searchTerm = req.query.searchTerm;

  const difficultyLevel = req.query.difficulty_level;

  // creamos una variable para almacenar las rutas . 
  let routes;
  
  if (searchTerm && difficultyLevel) {
    // Si se proporcionan términos de búsqueda, filtrar las rutas por nombre, ubicación y nivel de dificultad
    routes = await Route.find({
      $and: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } },
        { difficulty_level: difficultyLevel }
      ]
    });
  } else if (searchTerm) {
    // Si solo se proporciona un término de búsqueda, filtrar las rutas por nombre o ubicación
    routes = await Route.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } }
      ]
    });

  } else if (difficultyLevel) {
    // Si solo se proporciona un nivel de dificultad, filtrar las rutas por nivel de dificultad
    routes = await Route.find({
      difficulty_level: difficultyLevel
    });
  } else {
    // Si no se proporcionan términos de búsqueda ni nivel de dificultad, devolver todas las rutas
    routes = await Route.find();
  }
  
  res.send({ routes });
  } catch (error) {
  res.status(500).send({ message: error.message });
  }
  };

// Metodo para encontrar rutas por su id
exports.findRouteById = async (req, res) => {
    // Obtenemos la id de la ruta por los parametros de la petición
    const routeId = req.params.id; 
    console.log(routeId)

    const routeAlreadyExist = await Route.findOne({ _id: routeId });
    
    if (routeAlreadyExist) {
  
      console.log("encontrado");
  
      res.json(routeAlreadyExist);
  
    } else {
  
      console.log("no encontrado");
  
      res.sendStatus(404);
    }
  };

  // Metodo para obtener una ruta según su nombre
exports.getRouteByName = async(req,res) =>{
    console.log(req.params)
    try {
        const route = await Route.findOne({name:req.params.name})
        // Si no existe ninguna ruta con ese nombre se devuelve un 404
        if(!route){
            return res.status(404).send({message:"No se ha encontrado la ruta"})
        }else{
            res.send({route:route})
        }
    } catch (error) {
        res.status(500).send({message:err.message})
    }
}

// Metodo para eliminar una ruta. Utilizando su id como identificador ya que es unico. 
exports.deleteRoute = async (req, res) => {

    console.log(req.params)
    try {
      // Guardamos en la variable routeId la id que llega en la petición
      const routeId = req.params.id;
        // Hacemos uso del metodo de Mongoose para buscar en nuestra db una ruta con el id proporcionado y eliminarla.
      const route = await Route.findByIdAndDelete(routeId)
      
      // Si no encuentra la ruta devuelve un error 404
      if (!route) {
        return res.status(404).send({ message: "No se ha encontrado la ruta" });
      }
  
      res.send({ message: "Ruta eliminada correctamente" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
 
  // Metodo para añadir un comentario al array de comentarios de una ruta. 
  exports.addComment = async (req, res) => {
  

    try {

      // Deconstruimos el cuerpo de la petición para inicializar las variable con la información que nos llega al servidor
      const { content, authorId, routeId, authorNick } = req.body;

      // El método exec() se utiliza para ejecutar la consulta y devolver una promesa que se puede esperar para obtener el resultado de la consulta.
      const route = await Route.findById(routeId).exec();
  
      if (!route) {
        console.log("No se ha encontrado la ruta");
        return res.status(404).send();
      }
      // Se crea una instancia de un nuevo objeto comentario 
      const newComment = new Comment({
        content,
        authorId,
        authorNick
      });
      // Inicializa el campo comments como un array vacío si es undefined
      if (!route.comments) {
        route.comments = []; 
      }
      // Hacemos push al array de comentarios que tiene nuestra ruta por propiedad y guardamos primero el comentario
      await newComment.save()
      // Hacemos push del comentario al array
      route.comments.push(newComment);
      
      await route.save();
        
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send();
    }
  };
  



// Método para obtener todos los comentarios de una ruta
exports.getRouteComments = async (req, res) => {
  // console.log("adios")
  try {
    const { routeId } = req.params;

    // Buscar la ruta por ID
    const route = await Route.findById(routeId).populate("comments");

    if (!route) {
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    // Obtener los comentarios de la ruta
    const comments = route.comments;

    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los comentarios de la ruta" });
  }
};


  
  
