import { Team } from '../models/Team.js';
import { User } from '../models/User.js';
import { ensureClerkUser } from './clerkService.js';

/**
 * Add a new member to a team
 */
export async function addMemberToTeam(teamId, { name, email, organisation, mobile }) {
  const team = await Team.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.status = 404;
    throw error;
  }

  // 1. Check max team capacity (5 members including lead)
  if (team.memberIds.length >= 5) {
    const error = new Error('A team cannot have more than 5 members (including the lead).');
    error.status = 400;
    error.code = 'TEAM_FULL';
    throw error;
  }

  const cleanEmail = email.toLowerCase().trim();

  // 2. Check duplicate email across teams
  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser && existingUser.teamId) {
    const error = new Error(
      existingUser.teamId.toString() === team._id.toString()
        ? `Member with email '${cleanEmail}' is already in this team.`
        : `Email '${cleanEmail}' is already registered with another team.`
    );
    error.status = 400;
    error.code = 'DUPLICATE_EMAIL';
    throw error;
  }

  // 3. Pre-create user in Clerk directory so they can sign in via OTP
  const clerkId = await ensureClerkUser(cleanEmail, name);

  // 4. Create or update User record
  const user = await User.findOneAndUpdate(
    { email: cleanEmail },
    {
      $set: {
        name: name.trim(),
        email: cleanEmail,
        organisation: organisation?.trim() || '',
        mobile: mobile?.trim() || '',
        teamId: team._id,
        role: 'member',
        eventId: team.eventId || 'codathon-2026',
        ...(clerkId ? { clerkId, isActivated: true } : {}),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // 5. Add to team memberIds if not already present
  if (!team.memberIds.some((id) => id.toString() === user._id.toString())) {
    team.memberIds.push(user._id);
    await team.save();
  }

  return Team.findById(team._id)
    .populate('leadId', 'name email mobile organisation role')
    .populate('memberIds', 'name email mobile organisation course yearOfGraduation role isActivated');
}

/**
 * Update an existing member's information
 */
export async function updateTeamMember(teamId, memberId, { name, email, organisation, mobile }) {
  const team = await Team.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.status = 404;
    throw error;
  }

  // Verify member belongs to this team
  const isMember = team.memberIds.some((id) => id.toString() === memberId.toString());
  if (!isMember) {
    const error = new Error('Member does not belong to this team.');
    error.status = 404;
    error.code = 'MEMBER_NOT_FOUND';
    throw error;
  }

  const currentUser = await User.findById(memberId);
  if (!currentUser) {
    const error = new Error('User record not found.');
    error.status = 404;
    throw error;
  }

  const updates = {};
  if (name) updates.name = name.trim();
  if (organisation !== undefined) updates.organisation = organisation.trim();
  if (mobile !== undefined) updates.mobile = mobile.trim();

  // If email is changing, ensure uniqueness
  if (email && email.toLowerCase().trim() !== currentUser.email) {
    const cleanEmail = email.toLowerCase().trim();
    const duplicate = await User.findOne({ email: cleanEmail, _id: { $ne: memberId } });
    if (duplicate && duplicate.teamId) {
      const error = new Error(`Email '${cleanEmail}' is already registered with another team.`);
      error.status = 400;
      error.code = 'DUPLICATE_EMAIL';
      throw error;
    }

    updates.email = cleanEmail;
    const clerkId = await ensureClerkUser(cleanEmail, updates.name || currentUser.name);
    if (clerkId) {
      updates.clerkId = clerkId;
      updates.isActivated = true;
    }
  }

  await User.findByIdAndUpdate(memberId, { $set: updates }, { new: true });

  return Team.findById(team._id)
    .populate('leadId', 'name email mobile organisation role')
    .populate('memberIds', 'name email mobile organisation course yearOfGraduation role isActivated');
}

/**
 * Remove a member from a team
 */
export async function removeMemberFromTeam(teamId, memberId) {
  const team = await Team.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.status = 404;
    throw error;
  }

  // 1. Cannot remove designated team lead
  if (team.leadId.toString() === memberId.toString()) {
    const error = new Error('Cannot remove the designated team leader. Please reassign the team leader first before removing.');
    error.status = 400;
    error.code = 'CANNOT_REMOVE_LEAD';
    throw error;
  }

  // 2. Minimum 1 member requirement
  if (team.memberIds.length <= 1) {
    const error = new Error('A team must have at least 1 member.');
    error.status = 400;
    error.code = 'MIN_TEAM_SIZE';
    throw error;
  }

  // 3. Verify member exists in team
  const isMember = team.memberIds.some((id) => id.toString() === memberId.toString());
  if (!isMember) {
    const error = new Error('Member does not belong to this team.');
    error.status = 404;
    error.code = 'MEMBER_NOT_FOUND';
    throw error;
  }

  // 4. Remove memberId from team
  team.memberIds = team.memberIds.filter((id) => id.toString() !== memberId.toString());
  await team.save();

  // 5. Delete or detach the user record
  await User.findByIdAndDelete(memberId);

  return Team.findById(team._id)
    .populate('leadId', 'name email mobile organisation role')
    .populate('memberIds', 'name email mobile organisation course yearOfGraduation role isActivated');
}
