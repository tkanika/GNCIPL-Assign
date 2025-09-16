const { validationResult } = require('express-validator');
const Patient = require('../models/Patient');

// Get all patients with pagination and search
const getAllPatients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Add search filter
    if (search) {
      filter.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { 'contactInfo.phone': { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status) {
      filter.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const patients = await Patient.find(filter)
      .populate('createdBy', 'firstName lastName role')
      .populate('lastUpdatedBy', 'firstName lastName role')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Patient.countDocuments(filter);

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients'
    });
  }
};

// Get patient by ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id)
      .populate('createdBy', 'firstName lastName role specialization')
      .populate('lastUpdatedBy', 'firstName lastName role');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: {
        patient
      }
    });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient'
    });
  }
};

// Create new patient
const createPatient = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const patientData = {
      ...req.body,
      createdBy: req.user._id
    };

    const patient = new Patient(patientData);
    await patient.save();

    const populatedPatient = await Patient.findById(patient._id)
      .populate('createdBy', 'firstName lastName role');

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: {
        patient: populatedPatient
      }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating patient'
    });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user._id
    };

    const patient = await Patient.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy lastUpdatedBy', 'firstName lastName role');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: {
        patient
      }
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient'
    });
  }
};

// Delete patient (soft delete)
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByIdAndUpdate(
      id,
      { 
        status: 'inactive',
        lastUpdatedBy: req.user._id
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient deactivated successfully',
      data: {
        patient
      }
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating patient'
    });
  }
};

// Search patients by criteria
const searchPatients = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      bloodType,
      gender,
      age,
      city,
      patientId
    } = req.query;

    const filter = {};

    if (firstName) filter['personalInfo.firstName'] = { $regex: firstName, $options: 'i' };
    if (lastName) filter['personalInfo.lastName'] = { $regex: lastName, $options: 'i' };
    if (phone) filter['contactInfo.phone'] = { $regex: phone, $options: 'i' };
    if (email) filter['contactInfo.email'] = { $regex: email, $options: 'i' };
    if (bloodType) filter['personalInfo.bloodType'] = bloodType;
    if (gender) filter['personalInfo.gender'] = gender;
    if (city) filter['contactInfo.address.city'] = { $regex: city, $options: 'i' };
    if (patientId) filter.patientId = { $regex: patientId, $options: 'i' };

    // Age filter (approximate)
    if (age) {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - parseInt(age);
      const startDate = new Date(birthYear - 1, 0, 1);
      const endDate = new Date(birthYear + 1, 11, 31);
      filter['personalInfo.dateOfBirth'] = { $gte: startDate, $lte: endDate };
    }

    const patients = await Patient.find(filter)
      .populate('createdBy', 'firstName lastName role')
      .limit(50) // Limit search results
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        patients,
        count: patients.length
      }
    });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching patients'
    });
  }
};

// Get patient statistics
const getPatientStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const activePatients = await Patient.countDocuments({ status: 'active' });
    const inactivePatients = await Patient.countDocuments({ status: 'inactive' });
    
    // Gender distribution
    const genderStats = await Patient.aggregate([
      {
        $group: {
          _id: '$personalInfo.gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Blood type distribution
    const bloodTypeStats = await Patient.aggregate([
      {
        $group: {
          _id: '$personalInfo.bloodType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Age groups
    const currentDate = new Date();
    const ageGroups = await Patient.aggregate([
      {
        $addFields: {
          age: {
            $divide: [
              { $subtract: [currentDate, '$personalInfo.dateOfBirth'] },
              365.25 * 24 * 60 * 60 * 1000
            ]
          }
        }
      },
      {
        $addFields: {
          ageGroup: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 18] }, then: '0-17' },
                { case: { $lt: ['$age', 30] }, then: '18-29' },
                { case: { $lt: ['$age', 50] }, then: '30-49' },
                { case: { $lt: ['$age', 65] }, then: '50-64' },
                { case: { $gte: ['$age', 65] }, then: '65+' }
              ],
              default: 'Unknown'
            }
          }
        }
      },
      {
        $group: {
          _id: '$ageGroup',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalPatients,
          activePatients,
          inactivePatients
        },
        genderStats,
        bloodTypeStats,
        ageGroups
      }
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient statistics'
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientStats
};
