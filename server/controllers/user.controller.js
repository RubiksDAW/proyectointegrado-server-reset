
exports.perfilUsuario = (req,res)=>{
    res.status(200).send("Esto es el perfil del usuario")
    console.log(res)
}
// Con este controlador podríamos redireccionar al usuario a un panel de administración
exports.perfilAdmin = (req, res) =>{
    res.status(200).send("Esto es el perfil del administrador")
}