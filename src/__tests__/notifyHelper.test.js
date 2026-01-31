import { describe, test, expect, vi, beforeEach } from 'vitest'
import { notifyWeatherHelper } from '../notifyHelper'

describe('notifyWeatherHelper', () => {
  const weather = { name: 'Testville', temp: 21, is_day: 1 }
  const unit = 'C'
  let push
  const t = (k) => k + '_translated'

  beforeEach(() => {
    push = vi.fn()
  })

  test('maps capacitor platform to scheduled native message', async () => {
    const native = { scheduleLocalNotification: vi.fn().mockResolvedValue({ platform: 'capacitor' }) }
    const res = await notifyWeatherHelper({ weather, unit, t, push, native })
    expect(push).toHaveBeenCalledWith('notification_scheduled_native_translated')
    expect(res.platform).toBe('capacitor')
  })

  test('maps web platform with permission-denied to permission message', async () => {
    const native = { scheduleLocalNotification: vi.fn().mockResolvedValue({ platform: 'web', reason: 'permission-denied' }) }
    const res = await notifyWeatherHelper({ weather, unit, t, push, native })
    expect(push).toHaveBeenCalledWith('notification_permission_denied_translated')
    expect(res.reason).toBe('permission-denied')
  })

  test('maps web platform success to sent web message', async () => {
    const native = { scheduleLocalNotification: vi.fn().mockResolvedValue({ platform: 'web' }) }
    const res = await notifyWeatherHelper({ weather, unit, t, push, native })
    expect(push).toHaveBeenCalledWith('notification_sent_web_translated')
    expect(res.platform).toBe('web')
  })

  test('handles unknown platform and maps to unavailable', async () => {
    const native = { scheduleLocalNotification: vi.fn().mockResolvedValue({ platform: 'none', reason: 'not-supported' }) }
    const res = await notifyWeatherHelper({ weather, unit, t, push, native })
    expect(push).toHaveBeenCalledWith('notification_not_supported_translated')
    expect(res.reason).toBe('not-supported')
  })
})
