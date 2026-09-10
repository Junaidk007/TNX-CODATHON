import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roleGuard.js';
import { processTeamFile } from '../services/importService.js';
import { ensureClerkUser } from '../services/clerkService.js';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';
import { EventInfo } from '../models/EventInfo.js';
import { 
  validateBody, 
  wildcardTeamSchema, 
  adminTeamOverrideSchema, 
  reassignLeadSchema, 
  eventInfoSchema 
} from '../validators/schemas.js';

const router = express.Router();

// Memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ];
    if (
      allowedMimes.includes(file.mimetype) ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls') ||
      file.originalname.endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.'));
    }
  },
});

// Apply auth and admin check to all admin routes
router.use(requireAuth, requireAdmin);

/**
 * POST /api/admin/teams/import
 * Bulk CSV/XLSX import with long-format candidate grouping and idempotent upsert
 */
router.post('/teams/import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'No file uploaded. Please attach a .xlsx, .xls, or .csv file.',
      });
    }

    const result = await processTeamFile(req.file.buffer);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/teams
 * Create single wildcard team with Joi validation
 */
router.post('/teams', validateBody(wildcardTeamSchema), async (req, res, next) => {
  try {
    const { teamName, regnId, lead, members = [], domain } = req.body;

    const finalRegnId = regnId || `WC-${Date.now()}`;

    // Check if team already exists
    const existing = await Team.findOne({ regnId: finalRegnId });
    if (existing) {
      return res.status(400).json({
        error: 'DUPLICATE_TEAM',
        message: `Team with Registration ID '${finalRegnId}' already exists.`,
      });
    }

    // Pre-create in Clerk so user can directly sign in via OTP without "Account not found"
    const leadClerkId = await ensureClerkUser(lead.email, lead.name);

    // Upsert Lead User
    const leadUser = await User.findOneAndUpdate(
      { email: lead.email.toLowerCase().trim() },
      {
        $set: {
          name: lead.name.trim(),
          email: lead.email.toLowerCase().trim(),
          mobile: lead.mobile || '',
          organisation: lead.organisation || '',
          role: 'lead',
          ...(leadClerkId ? { clerkId: leadClerkId, isActivated: true } : {}),
        },
      },
      { new: true, upsert: true }
    );

    const memberIds = [leadUser._id];

    // Upsert Other Members
    for (const mem of members) {
      if (!mem.email || !mem.name) continue;
      const memClerkId = await ensureClerkUser(mem.email, mem.name);
      const memUser = await User.findOneAndUpdate(
        { email: mem.email.toLowerCase().trim() },
        {
          $set: {
            name: mem.name.trim(),
            email: mem.email.toLowerCase().trim(),
            mobile: mem.mobile || '',
            organisation: mem.organisation || '',
            role: 'member',
            ...(memClerkId ? { clerkId: memClerkId, isActivated: true } : {}),
          },
        },
        { new: true, upsert: true }
      );
      memberIds.push(memUser._id);
    }

    // Create Team
    const newTeam = await Team.create({
      teamName: teamName.trim(),
      regnId: finalRegnId,
      leadId: leadUser._id,
      memberIds,
      createdVia: 'wildcard',
      domain: domain || '',
    });

    // Link teamId to users
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $set: { teamId: newTeam._id } }
    );

    const populatedTeam = await Team.findById(newTeam._id)
      .populate('leadId', 'name email mobile role')
      .populate('memberIds', 'name email mobile organisation role isActivated');

    res.status(201).json(populatedTeam);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/teams
 * List all teams with search/filter
 */
router.get('/teams', async (req, res, next) => {
  try {
    const { search, createdVia } = req.query;
    const query = {};

    if (createdVia) {
      query.createdVia = createdVia;
    }

    if (search) {
      query.$or = [
        { teamName: { $regex: search, $options: 'i' } },
        { regnId: { $regex: search, $options: 'i' } },
      ];
    }

    const teams = await Team.find(query)
      .populate('leadId', 'name email mobile organisation')
      .populate('memberIds', 'name email mobile organisation role isActivated')
      .sort({ createdAt: -1 });

    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/teams/:teamId
 * Get single team full details
 */
router.get('/teams/:teamId', async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('leadId', 'name email mobile organisation role')
      .populate('memberIds', 'name email mobile organisation course yearOfGraduation role isActivated');

    if (!team) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Team not found.',
      });
    }

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/teams/:teamId
 * Admin override/edit team details with Joi validation
 */
router.patch('/:teamId', validateBody(adminTeamOverrideSchema), async (req, res, next) => {
  try {
    const { teamName, domain } = req.body;
    const updates = {};
    if (teamName) updates.teamName = teamName.trim();
    if (domain !== undefined) updates.domain = domain.trim();

    const team = await Team.findByIdAndUpdate(
      req.params.teamId,
      { $set: updates },
      { new: true }
    )
      .populate('leadId', 'name email mobile organisation role')
      .populate('memberIds', 'name email mobile organisation role isActivated');

    if (!team) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Team not found.',
      });
    }

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/teams/:teamId/lead
 * Reassign team lead with Joi validation
 */
router.patch('/teams/:teamId/lead', validateBody(reassignLeadSchema), async (req, res, next) => {
  try {
    const { newLeadId } = req.body;

    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Team not found.',
      });
    }

    // Ensure newLeadId is already in memberIds
    const isMember = team.memberIds.some((id) => id.toString() === newLeadId.toString());
    if (!isMember) {
      return res.status(400).json({
        error: 'INVALID_LEAD',
        message: 'The designated lead must be an existing member of this team.',
      });
    }

    const previousLeadId = team.leadId;

    // Update team leadId pointer
    team.leadId = newLeadId;
    await team.save();

    // Update roles on User records
    if (previousLeadId && previousLeadId.toString() !== newLeadId.toString()) {
      await User.findByIdAndUpdate(previousLeadId, { $set: { role: 'member' } });
    }
    await User.findByIdAndUpdate(newLeadId, { $set: { role: 'lead' } });

    const updatedTeam = await Team.findById(req.params.teamId)
      .populate('leadId', 'name email mobile role')
      .populate('memberIds', 'name email mobile organisation role isActivated');

    res.status(200).json({
      message: 'Team lead reassigned successfully',
      team: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/stats
 * Dashboard stats
 */
router.get('/stats', async (req, res, next) => {
  try {
    const totalTeams = await Team.countDocuments();
    const totalParticipants = await User.countDocuments({ role: { $in: ['lead', 'member'] } });
    const totalActivated = await User.countDocuments({ isActivated: true });
    const totalPptsSubmitted = await Team.countDocuments({ ppt: { $ne: null } });

    res.status(200).json({
      totalTeams,
      totalParticipants,
      totalActivated,
      totalPptsSubmitted,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/event-info
 * Edit landing page content & timeline with Joi validation
 */
router.put('/event-info', validateBody(eventInfoSchema), async (req, res, next) => {
  try {
    const { timeline, prizePool, location, venue, eventDates, eventFormat } = req.body;
    const event = await EventInfo.getSingleton();

    if (timeline && Array.isArray(timeline)) event.timeline = timeline;
    if (prizePool !== undefined) event.prizePool = prizePool;
    if (location !== undefined) event.location = location;
    if (venue !== undefined) event.venue = venue;
    if (eventDates !== undefined) event.eventDates = eventDates;
    if (eventFormat !== undefined) event.eventFormat = eventFormat;
    event.updatedBy = req.user._id;

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
});

export default router;
