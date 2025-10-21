const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Créer le dossier uploads s'il n'existe pas
const uploadDir = 'uploads/rooms'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log('✅ Dossier upload créé:', uploadDir)
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    const filename = `room-${uniqueSuffix}${extension}`
    console.log('📁 Fichier uploadé:', filename)
    cb(null, filename)
  }
})

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls JPG, JPEG, PNG et WebP sont acceptés.'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 10 // Maximum 10 fichiers
  }
})

// Middleware pour gérer les erreurs d'upload
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux. Maximum 10MB autorisé.'
      })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers. Maximum 10 images autorisées.'
      })
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
  next()
}

module.exports = {
  upload,
  handleUploadErrors
}