const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { 
  createChambre, 
  getChambres, 
  getChambreById,
  updateChambre, 
  deleteChambre,
  uploadImage,
  uploadMultipleImages,
  deleteImage
} = require('../controllers/chambreControllers');
const { upload, handleUploadErrors } = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Chambres
 *   description: Gestion des chambres d'hôtel
 */

// ✅ ROUTE CRÉATION CHAMBRE CORRIGÉE - ACCEPTE FORM DATA
/**
 * @swagger
 * /api/chambres:
 *   post:
 *     summary: Créer une nouvelle chambre (Admin uniquement)
 *     tags: [Chambres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - name
 *               - type
 *               - category
 *               - capacity
 *               - price
 *               - bedType
 *             properties:
 *               number:
 *                 type: string
 *                 example: "301"
 *               name:
 *                 type: string
 *                 example: "Suite Deluxe"
 *               type:
 *                 type: string
 *                 enum: [standard, superior, deluxe, suite, family, executive, presidential]
 *               category:
 *                 type: string
 *                 enum: [single, double, twin, triple, quad, family]
 *               capacity:
 *                 type: number
 *                 example: 2
 *               price:
 *                 type: number
 *                 example: 150
 *               size:
 *                 type: string
 *                 example: "30 m²"
 *               bedType:
 *                 type: string
 *                 enum: [single_bed, double_bed, twin_beds, double_twin, king_bed, queen_bed, sofa_bed, bunk_bed]
 *               status:
 *                 type: string
 *                 enum: [disponible, occupée, maintenance, nettoyage]
 *               description:
 *                 type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Chambre créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */
router.route('/')
  .get(getChambres)
  .post(
    protect, 
    admin, 
    upload.array('images', 10), // ✅ ACCEPTE LES IMAGES
    handleUploadErrors,
    createChambre // ✅ APPEL DIRECT SANS UPLOAD SÉPARÉ
  );

// Routes d'upload séparées (pour autres usages)
router.post('/upload/image', 
  protect, 
  admin, 
  upload.single('image'),
  handleUploadErrors,
  uploadImage
);

router.post('/upload/images', 
  protect, 
  admin, 
  upload.array('images', 10),
  handleUploadErrors,
  uploadMultipleImages
);

router.delete('/images/:filename', 
  protect, 
  admin, 
  deleteImage
);

// Autres routes (inchangées)
router.route('/:id')
  .get(getChambreById)
  .put(protect, admin, updateChambre)
  .delete(protect, admin, deleteChambre);

module.exports = router;