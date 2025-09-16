const express = require('express');
const { body } = require('express-validator');
const {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointmentById,
  getDoctorSchedule
} = require('../controllers/appointmentController');
const { authenticateToken, authorizePatientAccess } = require('../middleware/auth');

const router = express.Router();

// Validation rules for appointments
const appointmentValidation = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid appointment date'),
  body('appointmentTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('appointmentType')
    .isIn(['consultation', 'follow-up', 'emergency', 'surgery', 'checkup', 'vaccination', 'therapy'])
    .withMessage('Invalid appointment type'),
  body('department')
    .isIn(['general', 'cardiology', 'neurology', 'orthopedics', 'pediatrics', 'gynecology', 'dermatology', 'psychiatry', 'oncology', 'emergency'])
    .withMessage('Invalid department'),
  body('reason')
    .notEmpty()
    .withMessage('Reason for appointment is required')
    .trim()
];

// Apply authentication to all routes
router.use(authenticateToken);
router.use(authorizePatientAccess);

// Routes
router.get('/', getAllAppointments);
router.get('/doctor/:doctorId/schedule', getDoctorSchedule);
router.get('/:id', getAppointmentById);
router.post('/', appointmentValidation, createAppointment);
router.put('/:id', updateAppointment);
router.patch('/:id/cancel', cancelAppointment);

module.exports = router;