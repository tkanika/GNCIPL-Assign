const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Get all appointments with filters
const getAllAppointments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
      doctorId = '',
      patientId = '',
      date = '',
      department = ''
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (department) filter.department = department;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'personalInfo.firstName personalInfo.lastName patientId contactInfo.phone')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('createdBy', 'firstName lastName role')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
};

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(req.body.patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if doctor exists
    const doctor = await User.findById(req.body.doctorId);
    if (!doctor || !['doctor', 'admin'].includes(doctor.role)) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check for appointment conflicts
    const conflictingAppointment = await Appointment.findOne({
      doctorId: req.body.doctorId,
      appointmentDate: req.body.appointmentDate,
      appointmentTime: req.body.appointmentTime,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available at this time slot'
      });
    }

    const appointmentData = {
      ...req.body,
      createdBy: req.user._id
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'personalInfo.firstName personalInfo.lastName patientId contactInfo.phone')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('createdBy', 'firstName lastName role');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment: populatedAppointment
      }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment'
    });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { ...req.body, lastUpdatedBy: req.user._id },
      { new: true, runValidators: true }
    )
    .populate('patientId', 'personalInfo.firstName personalInfo.lastName patientId contactInfo.phone')
    .populate('doctorId', 'firstName lastName specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment'
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancelledBy: req.user._id,
        cancellationReason: reason,
        cancellationDate: new Date(),
        lastUpdatedBy: req.user._id
      },
      { new: true }
    )
    .populate('patientId', 'personalInfo.firstName personalInfo.lastName patientId')
    .populate('doctorId', 'firstName lastName specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment'
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'personalInfo.firstName personalInfo.lastName patientId contactInfo')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('createdBy', 'firstName lastName role');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment'
    });
  }
};

// Get doctor's schedule
const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: startDate, $lt: endDate },
      status: { $nin: ['cancelled'] }
    })
    .populate('patientId', 'personalInfo.firstName personalInfo.lastName patientId')
    .sort({ appointmentTime: 1 });

    res.json({
      success: true,
      data: {
        appointments,
        date: date
      }
    });
  } catch (error) {
    console.error('Get doctor schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor schedule'
    });
  }
};

module.exports = {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointmentById,
  getDoctorSchedule
};
