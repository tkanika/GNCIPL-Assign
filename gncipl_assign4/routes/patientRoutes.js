const express = require('express');
const { body } = require('express-validator');
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientStats
} = require('../controllers/patientController');
const { authenticateToken, authorizePatientAccess } = require('../middleware/auth');

const router = express.Router();

// Validation rules for patient creation/update
const patientValidation = [
  body('personalInfo.firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  body('personalInfo.lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  body('personalInfo.dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('personalInfo.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('contactInfo.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('emergencyContact.name')
    .notEmpty()
    .withMessage('Emergency contact name is required')
    .trim(),
  body('emergencyContact.relationship')
    .notEmpty()
    .withMessage('Emergency contact relationship is required')
    .trim(),
  body('emergencyContact.phone')
    .notEmpty()
    .withMessage('Emergency contact phone is required')
    .isMobilePhone()
    .withMessage('Please provide a valid emergency contact phone number')
];

// Apply authentication to all routes
router.use(authenticateToken);
router.use(authorizePatientAccess);

// Routes
router.get('/', getAllPatients);
router.get('/search', searchPatients);
router.get('/:id', getPatientById);
router.post('/', patientValidation, createPatient);
router.put('/:id', patientValidation, updatePatient);
router.delete('/:id', deletePatient);

module.exports = router;
