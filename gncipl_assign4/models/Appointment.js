const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    trim: true
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'surgery', 'checkup', 'vaccination', 'therapy'],
    required: true
  },
  department: {
    type: String,
    enum: ['general', 'cardiology', 'neurology', 'orthopedics', 'pediatrics', 'gynecology', 'dermatology', 'psychiatry', 'oncology', 'emergency'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  symptoms: [String],
  visitType: {
    type: String,
    enum: ['in-person', 'telemedicine', 'phone-consultation'],
    default: 'in-person'
  },
  roomNumber: {
    type: String,
    trim: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date
  },
  insuranceVerified: {
    type: Boolean,
    default: false
  },
  copayAmount: {
    type: Number,
    min: 0
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  waitTime: {
    type: Number // in minutes
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpInstructions: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancellationDate: {
    type: Date
  },
  rescheduleHistory: [{
    originalDate: Date,
    originalTime: String,
    newDate: Date,
    newTime: String,
    reason: String,
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescheduledAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate appointment ID before saving
appointmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate wait time if actual start time is available
appointmentSchema.pre('save', function(next) {
  if (this.actualStartTime && this.appointmentDate && this.appointmentTime) {
    const [hours, minutes] = this.appointmentTime.split(':');
    const scheduledDateTime = new Date(this.appointmentDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const waitTimeMs = this.actualStartTime.getTime() - scheduledDateTime.getTime();
    this.waitTime = Math.max(0, Math.round(waitTimeMs / (1000 * 60))); // Convert to minutes
  }
  next();
});

// Virtual for appointment duration calculation
appointmentSchema.virtual('actualDuration').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    const durationMs = this.actualEndTime.getTime() - this.actualStartTime.getTime();
    return Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }
  return null;
});

// Virtual for formatted appointment date and time
appointmentSchema.virtual('formattedDateTime').get(function() {
  if (this.appointmentDate && this.appointmentTime) {
    const date = new Date(this.appointmentDate);
    return `${date.toDateString()} at ${this.appointmentTime}`;
  }
  return null;
});

// Indexing for better performance
appointmentSchema.index({ appointmentId: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ department: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
