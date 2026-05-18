import { vi, describe, it, expect, beforeEach } from 'vitest'

// ── Mock supabase before importing the helpers ─────────────────────────────
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from:  vi.fn(),
  },
}))

import { supabase } from '../supabaseClient'
import {
  getCurrentUser,
  getUserRole,
  createGroup,
  joinGroup,
  getUserGroups,
  updateMemberRole,
  updateGroupSettings,
} from '../lib/supabaseHelpers'

// ── Chainable query builder (same pattern as GroupDashboard tests) ─────────
const makeChain = (overrides = {}) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq:     vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  ...overrides,
})

const USER = { id: 'user-123', email: 'test@test.com' }


// ─────────────────────────────────────────────────────────────────────────────
describe('supabaseHelpers', () => {

  beforeEach(() => {
    vi.resetAllMocks()
  })


  // ── getCurrentUser ────────────────────────────────────────────────────────

  describe('getCurrentUser', () => {

    it('returns the logged-in user', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      const result = await getCurrentUser()
      expect(result).toEqual(USER)
    })

    it('returns null when no session exists', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      const result = await getCurrentUser()
      expect(result).toBeNull()
    })

  })


  // ── getUserRole ───────────────────────────────────────────────────────────

  describe('getUserRole', () => {

    it('returns the user role string', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      supabase.from.mockReturnValue(makeChain({
        single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
      }))
      const result = await getUserRole('group-123')
      expect(result).toBe('admin')
    })

    it('returns null when there is no logged-in user', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      const result = await getUserRole('group-123')
      expect(result).toBeNull()
    })

    it('returns null when the DB query errors', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      supabase.from.mockReturnValue(makeChain({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
      }))
      const result = await getUserRole('group-123')
      expect(result).toBeNull()
    })

  })


  // ── createGroup ───────────────────────────────────────────────────────────

  describe('createGroup', () => {

    const GROUP_DATA = {
      name: 'My Stokvel', description: 'Saving together',
      contribution_amount: 500, payout_cycle: 'monthly',
      meeting_frequency: 'monthly', max_members: 10,
    }
    const CREATED_GROUP = { id: 'g-1', ...GROUP_DATA }

    it('creates a group and returns it on success', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      // call 1: insert group → returns created group
      // call 2: insert member → returns no error
      supabase.from
        .mockReturnValueOnce(makeChain({ single: vi.fn().mockResolvedValue({ data: CREATED_GROUP, error: null }) }))
        .mockReturnValueOnce(makeChain({ insert: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) }))
      const result = await createGroup(GROUP_DATA)
      expect(result.data).toEqual(CREATED_GROUP)
    })

    it('returns an error when not logged in', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      const result = await createGroup(GROUP_DATA)
      expect(result.error).toBe('Not logged in')
    })

    it('returns an error when the group insert fails', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      supabase.from.mockReturnValue(makeChain({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'duplicate name' } }),
      }))
      const result = await createGroup(GROUP_DATA)
      expect(result.error).toBe('duplicate name')
    })

    it('returns an error when adding the creator as member fails', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      // group insert succeeds, member insert fails
      supabase.from
        .mockReturnValueOnce(makeChain({ single: vi.fn().mockResolvedValue({ data: CREATED_GROUP, error: null }) }))
        .mockReturnValueOnce(makeChain({
          insert: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'member error' } }),
          // the second from().insert() doesn't call .single(), it awaits the chain itself
          then: (res, rej) => Promise.resolve({ error: { message: 'member error' } }).then(res, rej),
        }))
      const result = await createGroup(GROUP_DATA)
      expect(result.error).toBe('member error')
    })

  })


  // ── joinGroup ─────────────────────────────────────────────────────────────

  describe('joinGroup', () => {

    const GROUP = { id: 'g-1', name: 'Test Group' }

    it('joins a group successfully', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      supabase.from
        // find group by invite code
        .mockReturnValueOnce(makeChain({ single: vi.fn().mockResolvedValue({ data: GROUP, error: null }) }))
        // check existing membership → not a member
        .mockReturnValueOnce(makeChain({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }))
        // insert membership → success
        .mockReturnValueOnce(makeChain({ then: (r) => Promise.resolve({ error: null }).then(r) }))
      const result = await joinGroup('INVITE1')
      expect(result.data).toEqual(GROUP)
    })

    it('returns an error when not logged in', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      const result = await joinGroup('INVITE1')
      expect(result.error).toBe('Not logged in')
    })

    it('returns an error for an invalid invite code', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      supabase.from.mockReturnValue(makeChain({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
      }))
      const result = await joinGroup('BADCODE')
      expect(result.error).toBe('Invalid invite code')
    })

    it('returns an error when the user is already a member', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      supabase.from
        .mockReturnValueOnce(makeChain({ single: vi.fn().mockResolvedValue({ data: GROUP, error: null }) }))
        // already a member
        .mockReturnValueOnce(makeChain({ single: vi.fn().mockResolvedValue({ data: { id: 'm1' }, error: null }) }))
      const result = await joinGroup('INVITE1')
      expect(result.error).toBe('You are already a member of this group')
    })

    it('returns an error when the join insert fails', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      supabase.from
        .mockReturnValueOnce(makeChain({ single: vi.fn().mockResolvedValue({ data: GROUP, error: null }) }))
        .mockReturnValueOnce(makeChain({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }))
        .mockReturnValueOnce(makeChain({ then: (r) => Promise.resolve({ error: { message: 'insert failed' } }).then(r) }))
      const result = await joinGroup('INVITE1')
      expect(result.error).toBe('insert failed')
    })

  })


  // ── getUserGroups ─────────────────────────────────────────────────────────

  describe('getUserGroups', () => {

    it('returns the groups list for the logged-in user', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      const groups = [{ role: 'admin', groups: { id: 'g1', name: 'Test' } }]
      supabase.from.mockReturnValue(makeChain({
        then: (r) => Promise.resolve({ data: groups, error: null }).then(r),
      }))
      const result = await getUserGroups()
      expect(result.data).toEqual(groups)
    })

    it('returns an error when not logged in', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      const result = await getUserGroups()
      expect(result.error).toBe('Not logged in')
    })

    it('returns an error when the DB query fails', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: USER } })
      supabase.from.mockReturnValue(makeChain({
        then: (r) => Promise.resolve({ data: null, error: { message: 'query failed' } }).then(r),
      }))
      const result = await getUserGroups()
      expect(result.error).toBe('query failed')
    })

  })


  // ── updateMemberRole ──────────────────────────────────────────────────────

  describe('updateMemberRole', () => {

    it('returns success when the update works', async () => {
      supabase.from.mockReturnValue(makeChain({
        then: (r) => Promise.resolve({ error: null }).then(r),
      }))
      const result = await updateMemberRole('g-1', 'user-456', 'treasurer')
      expect(result.success).toBe(true)
    })

    it('returns an error when the update fails', async () => {
      supabase.from.mockReturnValue(makeChain({
        then: (r) => Promise.resolve({ error: { message: 'update denied' } }).then(r),
      }))
      const result = await updateMemberRole('g-1', 'user-456', 'treasurer')
      expect(result.error).toBe('update denied')
    })

  })


  // ── updateGroupSettings ───────────────────────────────────────────────────

  describe('updateGroupSettings', () => {

    it('returns success when settings are saved', async () => {
      supabase.from.mockReturnValue(makeChain({
        then: (r) => Promise.resolve({ error: null }).then(r),
      }))
      const result = await updateGroupSettings('g-1', { name: 'New Name' })
      expect(result.success).toBe(true)
    })

    it('returns an error when the update fails', async () => {
      supabase.from.mockReturnValue(makeChain({
        then: (r) => Promise.resolve({ error: { message: 'save failed' } }).then(r),
      }))
      const result = await updateGroupSettings('g-1', { name: 'New Name' })
      expect(result.error).toBe('save failed')
    })

  })

})
