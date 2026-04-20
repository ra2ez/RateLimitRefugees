import { supabase } from "../supabaseClient";

// Get current logged in user
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Get user's role in a specific group
export const getUserRole = async (groupId) => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data.role;
};

// Create a new group
export const createGroup = async (groupData) => {
  const user = await getCurrentUser();
  if (!user) return { error: "Not logged in" };

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: groupData.name,
      description: groupData.description,
      contribution_amount: groupData.contribution_amount,
      payout_cycle: groupData.payout_cycle,
      meeting_frequency: groupData.meeting_frequency,
      max_members: groupData.max_members,
      created_by: user.id,
    })
    .select()
    .single();

  if (groupError) return { error: groupError.message };

  // Auto add creator as admin
  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "admin",
  });

  if (memberError) return { error: memberError.message };

  return { data: group };
};

// Join a group via invite code
export const joinGroup = async (inviteCode) => {
  const user = await getCurrentUser();
  if (!user) return { error: "Not logged in" };

  // Find group by invite code
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name")
    .eq("invite_code", inviteCode.toUpperCase())
    .single();

  if (groupError) return { error: "Invalid invite code" };

  // Check if already a member
  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();

  if (existing) return { error: "You are already a member of this group" };

  // Join the group
  const { error: joinError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "member",
  });

  if (joinError) return { error: joinError.message };

  return { data: group };
};

// Get all groups the current user belongs to
export const getUserGroups = async () => {
  const user = await getCurrentUser();
  if (!user) return { error: "Not logged in" };

  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
      role,
      joined_at,
      groups (
        id,
        name,
        description,
        contribution_amount,
        payout_cycle,
        meeting_frequency,
        invite_code,
        created_at
      )
    `,
    )
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { data };
};

// Update member role (admin only)
export const updateMemberRole = async (groupId, userId, newRole) => {
  const { error } = await supabase
    .from("group_members")
    .update({ role: newRole })
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return { success: true };
};

// Update group settings (admin only)
export const updateGroupSettings = async (groupId, updates) => {
  const { error } = await supabase
    .from("groups")
    .update(updates)
    .eq("id", groupId);

  if (error) return { error: error.message };
  return { success: true };
};
