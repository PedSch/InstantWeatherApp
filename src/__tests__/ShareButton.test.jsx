import { describe, test, expect, beforeEach, vi } from 'vitest'
import { shareText } from '../shareHelper'

describe('shareText', () => {
  const text = 'Hello world share text'
  let push
  const t = (k) => k

  beforeEach(() => {
    push = vi.fn()
    delete global.navigator
  })

  test('copies to clipboard and calls push on success', async () => {
    const navigatorMock = { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } }
    const res = await shareText({ text, push, t, navigatorOverride: navigatorMock })
    expect(res.status).toBe('copied')
    expect(push).toHaveBeenCalledWith('copied_clipboard')
  })

  test('handles user cancel AbortError and pushes canceled', async () => {
    const err = Object.assign(new Error('User canceled'), { name: 'AbortError' })
    const navigatorMock = { share: vi.fn().mockRejectedValue(err) }
    const res = await shareText({ text, push, t, navigatorOverride: navigatorMock })
    expect(res.status).toBe('canceled')
    expect(push).toHaveBeenCalledWith('share_canceled')
  })
})
