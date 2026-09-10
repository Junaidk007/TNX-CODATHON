import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { requireAuth } from '../middlewares/auth.js';
import { requireLeadOrAdmin } from '../middlewares/roleGuard.js';
import { Team } from '../models/Team.js';
import { uploadToCloudinary, getCloudinaryDownloadUrl } from '../config/cloudinary.js';
import { pptUploadLimiter } from '../middlewares/rateLimiter.js';
import { validateBody, updateTeamNameSchema, addMemberSchema, updateMemberSchema } from '../validators/schemas.js';
import { addMemberToTeam, updateTeamMember, removeMemberFromTeam } from '../services/memberService.js';

const router = express.Router();

// Multer upload config for presentations (PPT, PPTX, PDF up to 25MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const isPresentation =
      file.originalname.endsWith('.ppt') ||
      file.originalname.endsWith('.pptx') ||
      file.originalname.endsWith('.pdf') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.ms-powerpoint' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    if (isPresentation) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a PowerPoint (.ppt, .pptx) or PDF (.pdf) deck.'));
    }
  },
});

/**
 * GET /api/teams/:id/ppt
 * Resolve team presentation deck and redirect to authenticated Cloudinary download URL.
 * Bypasses Cloudinary 401 delivery restriction on PDF files.
 */
router.get('/:id/ppt', async (req, res, next) => {
  try {
    const { id } = req.params;
    let team = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      team = await Team.findById(id).select('ppt teamName regnId');
    } else {
      team = await Team.findOne({ regnId: id }).select('ppt teamName regnId');
    }

    if (!team || !team.ppt) {
      return res.status(404).send(`
        <html>
          <body style="background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="text-align:center;padding:30px;border:1px solid #333;background:#141414;border-radius:6px;max-width:400px;">
              <h2 style="color:#ff2a3d;margin-top:0;">No Presentation Deck Found</h2>
              <p style="color:#999;font-size:14px;">This team has not uploaded a presentation deck yet.</p>
              <button onclick="window.close()" style="background:#e10600;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;margin-top:10px;">Close Window</button>
            </div>
          </body>
        </html>
      `);
    }

    const forceDownload = req.query.download === 'true';
    const downloadUrl = getCloudinaryDownloadUrl(team.ppt, forceDownload);

    if (req.query.json === 'true') {
      return res.status(200).json({ url: downloadUrl, originalUrl: team.ppt });
    }

    return res.redirect(downloadUrl);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/public
 * Public roster listing with sanitized fields (teamName, domain, memberCount, regnId)
 */
router.get('/public', async (req, res, next) => {
  try {
    const teams = await Team.find()
      .select('teamName domain memberIds leadId regnId createdAt')
      .lean();

    const sanitized = teams.map((team) => ({
      _id: team._id,
      teamName: team.teamName,
      domain: team.domain || 'Open Innovation',
      memberCount: (Array.isArray(team.memberIds) ? team.memberIds.length : 0) + (team.leadId ? 1 : 0),
      regnId: team.regnId,
    }));

    res.status(200).json(sanitized);
  } catch (error) {
    next(error);
  }
});

router.use(requireAuth);

/**
 * GET /api/teams/me
 * Get own team's full info
 */
router.get('/me', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(404).json({
        error: 'NO_TEAM_ASSIGNED',
        message: 'You are not assigned to any team.',
      });
    }

    const team = await Team.findById(req.user.teamId)
      .populate('leadId', 'name email mobile organisation role')
      .populate('memberIds', 'name email mobile organisation course yearOfGraduation role isActivated');

    if (!team) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Team record not found.',
      });
    }

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/teams/me
 * Edit team name (Lead only) with Joi validation & ownership check
 */
router.patch('/me', requireLeadOrAdmin, validateBody(updateTeamNameSchema), async (req, res, next) => {
  try {
    const { teamName } = req.body;

    if (!req.user.teamId) {
      return res.status(404).json({
        error: 'NO_TEAM_ASSIGNED',
        message: 'You are not assigned to any team.',
      });
    }

    // Explicit ownership check
    const team = await Team.findById(req.user.teamId);
    if (!team) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Team not found.',
      });
    }

    if (req.user.role !== 'admin' && team.leadId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the designated team leader can rename this team.',
      });
    }

    team.teamName = teamName;
    await team.save();

    const populatedTeam = await Team.findById(team._id).populate('leadId memberIds');
    res.status(200).json(populatedTeam);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/teams/me/ppt
 * Upload or replace team presentation deck to Cloudinary (Lead only) with rate limiting
 */
router.post('/me/ppt', requireLeadOrAdmin, pptUploadLimiter, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'No file uploaded. Please attach a .ppt, .pptx, or .pdf deck.',
      });
    }

    if (!req.user.teamId) {
      return res.status(404).json({
        error: 'NO_TEAM_ASSIGNED',
        message: 'You are not assigned to any team.',
      });
    }

    // Explicit ownership check
    const team = await Team.findById(req.user.teamId);
    if (!team) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Team not found.',
      });
    }

    if (req.user.role !== 'admin' && team.leadId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the designated team leader can upload presentation decks.',
      });
    }

    // Upload to Cloudinary
    const pptUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname, 'codathon_ppts');

    // Update database record
    team.ppt = pptUrl;
    await team.save();

    res.status(200).json({
      message: 'Presentation deck uploaded successfully',
      pptUrl,
      team,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/teams/me/members
 * Add a new member to own team (Lead only, max 5 members)
 */
router.post('/me/members', requireLeadOrAdmin, validateBody(addMemberSchema), async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(404).json({
        error: 'NO_TEAM_ASSIGNED',
        message: 'You are not assigned to any team.',
      });
    }

    const updatedTeam = await addMemberToTeam(req.user.teamId, req.body);
    res.status(201).json(updatedTeam);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/teams/me/members/:memberId
 * Update a member's information on own team (Lead only)
 */
router.patch('/me/members/:memberId', requireLeadOrAdmin, validateBody(updateMemberSchema), async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(404).json({
        error: 'NO_TEAM_ASSIGNED',
        message: 'You are not assigned to any team.',
      });
    }

    const updatedTeam = await updateTeamMember(req.user.teamId, req.params.memberId, req.body);
    res.status(200).json(updatedTeam);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/teams/me/members/:memberId
 * Remove a member from own team (Lead only)
 */
router.delete('/me/members/:memberId', requireLeadOrAdmin, async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(404).json({
        error: 'NO_TEAM_ASSIGNED',
        message: 'You are not assigned to any team.',
      });
    }

    const updatedTeam = await removeMemberFromTeam(req.user.teamId, req.params.memberId);
    res.status(200).json(updatedTeam);
  } catch (error) {
    next(error);
  }
});

export default router;
