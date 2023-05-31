
// Importamos los schemos de nuestras entidades Ruta y Comentario. 
const Route = require('../models/route.model.js')
const Comment = require('../models/comment.model.js');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
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
// exports.modifyRoute = async (req, res) => {
//  console.log(req.body)
//   try {
//     // console.log(req.params.formData)
//       const routeId = req.body._id;
//       console.log(routeId)
//       // const imageFileNames = req.files.map(file => file.filename)

//       const galeria = req.files.map((file) => {
//         return new Promise((resolve, reject) => {
//           cloudinary.uploader.upload(file.path, (err, result) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve(result.secure_url);
//             }
//           });
//         });
//       });

      
//       // Guardamos en un objeto la información que nos llega en el cuerpo de la petición.
//       const modifiedData = {
//           name: req.body.name,
//           difficulty_level: req.body.difficulty_level,
//           distance: req.body.distance,
//           location: req.body.location,
//           description: req.body.description,
//           origin: req.body.origin,
//           destination: req.body.destination,
//           // Esperamos a que terminen de subirse todas las imagenes antes de asignarlas a la propiedad del objeto
//           images: await Promise.all(galeria),
          
//       };
//       console.log(modifiedData)

//       // Se busca la ruta por su id y se sustituye por el objeto modifiedData creado
//       const modifiedRoute = await Route.findByIdAndUpdate(routeId, modifiedData, { new: true });
      
//       if (!modifiedRoute) {
//           return res.status(404).send({ message: 'Ruta no encontrada' });
//       }
//       // Se devuelve 
//       res.send({ route: modifiedRoute });
//   } catch (error) {
//       res.status(500).send({ message: error.message });
//   }
// };

exports.modifyRoute = async (req, res) => {
  try {
    const routeId = req.body._id;

    let modifiedData = {
      name: req.body.name,
      difficulty_level: req.body.difficulty_level,
      distance: req.body.distance,
      location: req.body.location,
      description: req.body.description,
      origin: req.body.origin,
      destination: req.body.destination,
      images: [], // Inicialmente vacío
    };

    if (req.files.length > 0) {
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

      // Esperamos a que todas las nuevas imágenes se suban antes de asignarlas a `modifiedData.images`
      modifiedData.images = await Promise.all(galeria);
    } else {
      // No se proporcionaron imágenes nuevas, usar las imágenes existentes de la ruta
      const route = await Route.findById(routeId);
      modifiedData.images = route.images;
    }

    const modifiedRoute = await Route.findByIdAndUpdate(routeId, modifiedData, { new: true });

    if (!modifiedRoute) {
      return res.status(404).send({ message: 'Ruta no encontrada' });
    }

    res.send({ route: modifiedRoute });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Método para controlar 
exports.getAllRoutesNames = async (req, res) => {
  try {
    const routes = await Route.find();
    res.send({ routes });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


// Método para controlar la carga de rutas por página
exports.getAllRoutes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Número de página, predeterminado: 1
    const pageSize = parseInt(req.query.pageSize) || 5;
    const totalRoutes = await Route.countDocuments(); // Obtener el número total de rutas
    const totalPages = Math.ceil(totalRoutes / pageSize); // Calcular el número total de páginas
    
    const routes = await Route.find()
      .skip((page - 1) * pageSize) // Saltar los resultados anteriores a la página actual
      .limit(pageSize); // Limitar el número de resultados por página
    console.log(routes)
    console.log(totalPages)
    console.log(totalRoutes)
    res.send({ routes, totalPages, totalRoutes});
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

  // exports.findRouteByIdHtml = async (req, res) => {
  //   const routeId = req.params.id;
  //   console.log(routeId);
  
  //   // Buscamos la ruta en la base de datos por su ID
  //   const routeAlreadyExist = await Route.findOne({ _id: routeId });
  
  //   if (routeAlreadyExist) {
  //     console.log("encontrado");
  
  //     // Construir la página HTML con los valores de la ruta
  //     const html = `
  //     <!DOCTYPE html>
  //     <html lang="es">
  //     <head>
  //       <meta charset="UTF-8">
  //       <title>Información de la Ruta</title>
  //     </head>
  //     <body>
  //       <h1 style="color: #333;">Información de la Ruta</h1>
  //       <p style="margin-bottom: 10px;"><strong>Nombre:</strong> ${routeAlreadyExist.name}</p>
  //       <p style="margin-bottom: 10px;"><strong>Descripción:</strong> ${routeAlreadyExist.description}</p>
  //       <p style="margin-bottom: 10px;"><strong>Distancia:</strong> ${routeAlreadyExist.distance} km</p>
  //       <p style="margin-bottom: 10px;"><strong>Punto de Origen:</strong> ${routeAlreadyExist.origin}</p>
  //       <p style="margin-bottom: 10px;"><strong>Punto de Destino:</strong> ${routeAlreadyExist.destination}</p>
  //       <a href="https://drive.google.com/file/d/14uGHM7LLUKnF4coTgR2pzJd_Kc6BkM-N/view?usp=sharing" style="display: inline-block; padding: 10px 20px; font-size: 18px; color: #fff; background-color: #ff6600; border-radius: 5px; text-decoration: none;">Descargar App</a>
  //     </body>
  //     </html>
  //     `;
  
  //     res.send(html); // Enviar la página HTML como respuesta
  //   } else {
  //     console.log("no encontrado");
  //     res.sendStatus(404); // Devolvemos un estado 404 si la ruta no se encuentra
  //   }
  // };
  
  exports.findRouteByIdHtml = async (req, res) => {
    const routeId = req.params.id;
    console.log(routeId);
  
    // Buscamos la ruta en la base de datos por su ID
    const routeAlreadyExist = await Route.findOne({ _id: routeId });
  
    if (routeAlreadyExist) {
      console.log("encontrado");
  
      // Cargar el archivo HTML
      const rutaHtmlPath = path.join(__dirname, '../config/ruta.html');
      const rutaHtmlTemplate = fs.readFileSync(rutaHtmlPath, 'utf8');
  
      // Renderizar el archivo HTML con los valores de la ruta
      const html = ejs.render(rutaHtmlTemplate, {
        nombre: routeAlreadyExist.name,
        descripcion: routeAlreadyExist.description,
        distancia: routeAlreadyExist.distance,
        origen: routeAlreadyExist.origin,
        destino: routeAlreadyExist.destination
      });
  
      res.send(html); // Enviar la página HTML renderizada como respuesta
    } else {
      console.log("no encontrado");
      res.sendStatus(404); // Devolvemos un estado 404 si la ruta no se encuentra
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

exports.deleteCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { routeId } = req.body;

    // Buscar la ruta por ID y actualizar el array de comentarios
    const updatedRoute = await Route.findOneAndUpdate(
      { _id: routeId },
      { $pull: { comments: commentId } },
      { new: true }
    );

    if (!updatedRoute) {
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    return res.status(200).json({ route: updatedRoute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el comentario" });
  }
};

exports.uploadRoutePic = async (req,res)=>{

  try {
    const routeId = req.params.routeId;

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

  const route = await Route.findByIdAndUpdate(routeId, {images:await Promise.all(galeria)}, {new:true})
  res.status(200).json({ message: 'Imagen subida correctamente', route });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}






  
  
