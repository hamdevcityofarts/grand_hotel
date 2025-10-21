const mongoose = require('mongoose');

// 🔹 Sous-schema Paiement (détail transaction)
const paiementSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
  method: { 
    type: String, 
    enum: ['card', 'cash', 'transfer', 'check'],
    default: 'card' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  transactionId: { type: String }
});

// 🔹 Schema principal Réservation - COMPLÉTÉ
const reservationSchema = new mongoose.Schema(
  {
    client: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    chambre: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Chambre', 
      required: true 
    },
    checkIn: { 
      type: Date, 
      required: true 
    },
    checkOut: { 
      type: Date, 
      required: true 
    },
    nights: { 
      type: Number, 
      required: true 
    },
    guests: {
      type: Number,
      required: true,
      default: 1
    },
    adults: {
      type: Number,
      required: true,
      default: 1
    },
    children: {
      type: Number,
      default: 0
    },
    totalAmount: { 
      type: Number, 
      required: true 
    },
    acompte: { 
      type: Number, 
      default: 0 
    },
    specialRequests: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'transfer', 'check'],
      default: 'card'
    },
    paiement: paiementSchema
  },
  { 
    timestamps: true 
  }
);

// Index pour les recherches par dates et statut
reservationSchema.index({ chambre: 1, checkIn: 1, checkOut: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ client: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);