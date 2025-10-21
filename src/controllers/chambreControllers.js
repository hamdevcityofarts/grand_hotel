const Chambre = require('../models/chambreModel');
const path = require('path');
const fs = require('fs');

// ✅ CRÉATION CORRIGÉE - GÈRE LES IMAGES UPLOADÉES
exports.createChambre = async (req, res) => {
  try {
    console.log('📥 Données reçues:', req.body);
    console.log('📁 Fichiers reçus:', req.files);

    const { 
      number, 
      name, 
      type, 
      category, 
      capacity, 
      price, 
      size, 
      bedType, 
      status, 
      description, 
      amenities 
    } = req.body;

    // ✅ Vérifier si le numéro existe déjà
    const existing = await Chambre.findOne({ number });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Une chambre avec ce numéro existe déjà' 
      });
    }

    // ✅ CONSTRUIRE LES IMAGES À PARTIR DES FICHIERS UPLOADÉS
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        url: `${req.protocol}://${req.get('host')}/uploads/rooms/${file.filename}`,
        alt: `${name || 'Chambre'} - Image ${index + 1}`,
        isPrimary: index === 0,
        order: index
      }));
      console.log('🖼️ Images créées:', images);
    }

    // ✅ CRÉER LA CHAMBRE AVEC LES IMAGES
    const chambre = await Chambre.create({
      number,
      name,
      type,
      category,
      capacity: parseInt(capacity),
      price: parseFloat(price),
      size,
      bedType,
      status: status || 'disponible',
      description,
      amenities: Array.isArray(amenities) ? amenities : (amenities ? [amenities] : []),
      images: images
    });

    console.log('✅ Chambre créée avec succès:', {
      id: chambre._id,
      number: chambre.number,
      images: chambre.images
    });

    res.status(201).json({
      success: true,
      message: 'Chambre créée avec succès',
      chambre
    });
  } catch (err) {
    console.error('❌ Erreur création chambre:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la création de la chambre',
      error: err.message 
    });
  }
};

// ✅ AUTRES FONCTIONS (inchangées)
exports.getChambres = async (req, res) => {
  try {
    const chambres = await Chambre.find({ isActive: true });
    
    res.json({
      success: true,
      count: chambres.length,
      chambres
    });
  } catch (err) {
    console.error('❌ Erreur récupération chambres:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des chambres',
      error: err.message 
    });
  }
};

exports.getChambreById = async (req, res) => {
  try {
    const chambre = await Chambre.findById(req.params.id);
    
    if (!chambre) {
      return res.status(404).json({ 
        success: false,
        message: 'Chambre non trouvée' 
      });
    }

    res.json({
      success: true,
      chambre
    });
  } catch (err) {
    console.error('❌ Erreur récupération chambre:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération de la chambre',
      error: err.message 
    });
  }
};

exports.updateChambre = async (req, res) => {
  try {
    const chambre = await Chambre.findById(req.params.id);
    
    if (!chambre) {
      return res.status(404).json({ 
        success: false,
        message: 'Chambre non trouvée' 
      });
    }

    Object.assign(chambre, req.body);
    await chambre.save();

    res.json({
      success: true,
      message: 'Chambre mise à jour avec succès',
      chambre
    });
  } catch (err) {
    console.error('❌ Erreur mise à jour chambre:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la mise à jour de la chambre',
      error: err.message 
    });
  }
};

exports.deleteChambre = async (req, res) => {
  try {
    const chambre = await Chambre.findById(req.params.id);
    
    if (!chambre) {
      return res.status(404).json({ 
        success: false,
        message: 'Chambre non trouvée' 
      });
    }

    if (chambre.images && chambre.images.length > 0) {
      chambre.images.forEach(image => {
        const filename = image.url.split('/').pop();
        const imagePath = path.join(__dirname, '../uploads/rooms', filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    chambre.isActive = false;
    await chambre.save();

    res.json({
      success: true,
      message: 'Chambre supprimée avec succès'
    });
  } catch (err) {
    console.error('❌ Erreur suppression chambre:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la suppression de la chambre',
      error: err.message 
    });
  }
};

// ✅ FONCTIONS UPLOAD (inchangées)
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'Aucun fichier uploadé' 
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/rooms/${req.file.filename}`;

    console.log('✅ Image uploadée:', {
      filename: req.file.filename,
      url: imageUrl
    });

    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      image: {
        url: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (err) {
    console.error('❌ Erreur upload image:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de l\'upload de l\'image',
      error: err.message 
    });
  }
};

exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Aucun fichier uploadé' 
      });
    }

    const uploadedImages = req.files.map(file => ({
      url: `${req.protocol}://${req.get('host')}/uploads/rooms/${file.filename}`,
      filename: file.filename
    }));

    console.log('✅ Images uploadées:', uploadedImages.length);

    res.json({
      success: true,
      message: `${req.files.length} image(s) uploadée(s) avec succès`,
      images: uploadedImages
    });
  } catch (err) {
    console.error('❌ Erreur upload multiple images:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de l\'upload des images',
      error: err.message 
    });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../uploads/rooms', filename);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`✅ Image supprimée: ${filename}`);
    }

    await Chambre.updateMany(
      { 'images.url': { $regex: filename } },
      { $pull: { images: { url: { $regex: filename } } } }
    );

    res.json({
      success: true,
      message: 'Image supprimée avec succès'
    });
  } catch (err) {
    console.error('❌ Erreur suppression image:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la suppression de l\'image',
      error: err.message 
    });
  }
};