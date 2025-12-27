import express from 'express';
import {
  getSchedulerStatus,
  triggerCheck,
  getMessageLogs,
  clearMessageLogs,
  checkWhatsAppHealth,
  scheduleMeeting,
  getMeetings,
  getDashboardStats,
} from '../controllers/schedulerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Authentication temporarily disabled for testing
// router.use(authenticateToken);

/**
 * @route   GET /api/scheduler/status
 * @desc    Get scheduler status
 * @access  Private
 */
router.get('/status', getSchedulerStatus);

/**
 * @route   POST /api/scheduler/trigger
 * @desc    Manually trigger message check
 * @access  Private
 */
router.post('/trigger', triggerCheck);

/**
 * @route   GET /api/scheduler/logs
 * @desc    Get message logs
 * @access  Private
 */
router.get('/logs', getMessageLogs);

/**
 * @route   DELETE /api/scheduler/logs
 * @desc    Clear message logs
 * @access  Private
 */
router.delete('/logs', clearMessageLogs);

/**
 * @route   GET /api/scheduler/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/dashboard', getDashboardStats);

/**
 * @route   POST /api/scheduler/meeting
 * @desc    Schedule a new meeting
 * @access  Private
 */
router.post('/meeting', scheduleMeeting);

/**
 * @route   GET /api/scheduler/meetings
 * @desc    Get all scheduled meetings
 * @access  Private
 */
router.get('/meetings', getMeetings);

/**
 * @route   GET /api/scheduler/health
 * @desc    Check WhatsApp API health
 * @access  Private
 */
router.get('/health', checkWhatsAppHealth);

export default router;
