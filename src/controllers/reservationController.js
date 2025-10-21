const Reservation = require('../models/reservationModel');
const Chambre = require('../models/chambreModel');
const User = require('../models/userModel');

// 🔹 Créer une réservation - CORRIGÉ
exports.createReservation = async (req, res) => {
  try {
    const { chambreId, checkIn, checkOut, guests, adults, children, specialRequests, paymentMethod } = req.body;
    
    console.log('📥 Données reçues:', req.body);

    // Vérifier la chambre
    const chambre = await Chambre.findById(chambreId);
    if (!chambre) {
      return res.status(404).json({ 
        success: false,
        message: 'Chambre non trouvée' 
      });
    }

    // Vérifier disponibilité
    const existingReservation = await Reservation.findOne({
      chambre: chambreId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { 
          checkIn: { $lt: new Date(checkOut) }, 
          checkOut: { $gt: new Date(checkIn) } 
        }
      ]
    });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: 'Chambre non disponible pour ces dates'
      });
    }

    // Calculer le prix
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * chambre.price;

    const reservationData = {
      client: req.user._id,
      chambre: chambreId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guests: guests || (parseInt(adults || 1) + parseInt(children || 0)),
      adults: parseInt(adults || 1),
      children: parseInt(children || 0),
      specialRequests: specialRequests || '',
      totalAmount,
      paymentMethod: paymentMethod || 'card',
      status: 'pending',
      paiement: {
        amount: totalAmount,
        method: paymentMethod || 'card',
        status: 'pending'
      }
    };

    console.log('📦 Données réservation:', reservationData);

    const reservation = await Reservation.create(reservationData);

    // Populer pour la réponse
    await reservation.populate('chambre client');

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      reservation
    });

  } catch (error) {
    console.error('❌ Erreur création réservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message
    });
  }
};

// 🔹 Récupérer toutes les réservations - CORRIGÉ
exports.getReservations = async (req, res) => {
  try {
    let reservations;
    
    if (req.user.role === 'admin') {
      reservations = await Reservation.find()
        .populate('client', 'name surname email phone')
        .populate('chambre', 'number name type price');
    } else {
      reservations = await Reservation.find({ client: req.user._id })
        .populate('chambre', 'number name type price images');
    }

    res.json({
      success: true,
      count: reservations.length,
      reservations
    });

  } catch (error) {
    console.error('❌ Erreur récupération réservations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message
    });
  }
};

// 🔹 Récupérer une réservation par ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('client', 'name surname email phone')
      .populate('chambre', 'number name type price images amenities');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && !reservation.client._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette réservation'
      });
    }

    res.json({
      success: true,
      reservation
    });

  } catch (error) {
    console.error('❌ Erreur récupération réservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation',
      error: error.message
    });
  }
};

// 🔹 Mettre à jour une réservation
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && !reservation.client.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('client chambre');

    res.json({
      success: true,
      message: 'Réservation mise à jour avec succès',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour réservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la réservation',
      error: error.message
    });
  }
};

// 🔹 Annuler une réservation - CORRIGÉ (compatible avec les deux routes)
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('client', 'email name')
      .populate('chambre');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && !reservation.client._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    reservation.status = 'cancelled';
    if (reservation.paiement) {
      reservation.paiement.status = 'refunded';
    }
    
    await reservation.save();

    res.json({
      success: true,
      message: 'Réservation annulée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur annulation réservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la réservation',
      error: error.message
    });
  }
};

// 🔹 Confirmer une réservation (admin)
exports.confirmReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    reservation.status = 'confirmed';
    await reservation.save();

    res.json({
      success: true,
      message: 'Réservation confirmée avec succès',
      reservation
    });

  } catch (error) {
    console.error('❌ Erreur confirmation réservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation de la réservation',
      error: error.message
    });
  }
};