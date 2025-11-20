import { describe, test, expect, vi, beforeEach } from 'vitest'
import requestNotifications from '../requestNotifications'

describe('requestNotifications', () => {
  let push
  const t = (k) => k

  beforeEach(() => {
    push = vi.fn()
  })

  test('granted when permission already granted', async () => {
    global.Notification = { permission: 'granted' }
    const res = await requestNotifications({ push, t })
    expect(res.status).toBe('granted')
    expect(push).toHaveBeenCalledWith('request_notifications_granted')
  })

  test('denied when requestPermission returns denied', async () => {
    global.Notification = { permission: 'default', requestPermission: vi.fn().mockResolvedValue('denied') }
    const res = await requestNotifications({ push, t })
    expect(res.status).toBe('denied')
    expect(push).toHaveBeenCalledWith('request_notifications_denied')
  })

  test('default when requestPermission returns default', async () => {
    global.Notification = { permission: 'default', requestPermission: vi.fn().mockResolvedValue('default') }
    const res = await requestNotifications({ push, t })
    expect(res.status).toBe('default')
    expect(push).toHaveBeenCalledWith('request_notifications_default')
  })
})
