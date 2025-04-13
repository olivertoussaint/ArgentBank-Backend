const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    email: String,
    password:{
      select: true,//! passé à true sinon problème d'authentification
      type: String,
    },

    firstName: String,
    lastName: String,
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }] 
  },
  {
    timestamps: true,
    toObject: {
      transform: (doc, ret, options) => {
        ret.id = ret._id
        delete ret._id
        delete ret.password
        delete ret.__v
        return ret
      }
    }
  }
)

module.exports = mongoose.model('User', userSchema)
