const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // Nick del usuario. Será obligatorio y único
  nick: { type: String, required: true, unique:true },
  // Email del usuario. Será obligatorio y único
  email: { type: String, required: true },
  // Contraseña del usuario.
  password: {type:String, required:true},
  // Edad del usuario
  age:{type:Number, required:true},
  // Descripción aportada por el usuario sobre su perfil
  description:{type:String},
  // Imagen de perfil del usuario
  imageURL: [{type:String}],
  // Array de roles del usuario
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }
  ],
  // Lista de rutas favoritas del usuario. Guardamos solo las ids y no es obligatorio.
  favouriteRoutes: [{type:String, required: false}]
}
);

UserSchema.virtual('totalRoutes',{
      ref: 'Route',
      localField: '_id',
      foreignField: 'author',
      count: true
}).get(function() {
  return this.model('Route').countDocuments({author: this._id});
});

UserSchema.virtual('totalEvents',{
  ref: 'Event',
  localField: '_id',
  foreignField: 'creador',
  count: true
}).get(function() {
  return this.model('Event').countDocuments({creador: this._id});
})

UserSchema.virtual('totalComments',{
  ref: 'Comment',
  localField: '_id',
  foreignField: 'authorId',
  count: true
}).get(function() {
  return this.model('Comments').countDocuments({authorid: this._id});
})

// UserSchema.virtual('numberOfRoutes', {
//   ref: 'Route',
//   localField: '_id',
//   foreignField: 'author',
//   count: true
// }).get(function () {
//   return this.numberOfRoutes;
// });

// UserSchema.virtual('numberOfEvents', {
//   ref: 'Event',
//   localField: '_id',
//   foreignField: 'creador',
//   count: true
// });

const User = mongoose.model('User', UserSchema);

module.exports = User;
