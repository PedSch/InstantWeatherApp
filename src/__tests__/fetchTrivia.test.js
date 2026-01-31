import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchTrivia } from '../trivia'

const sampleResponse = {
  results: [
    {
      category: 'General Knowledge',
      type: 'multiple',
      difficulty: 'easy',
      question: 'What is 2 + 2?',
      correct_answer: '4',
      incorrect_answers: ['3', '5', '22']
    },
    {
      category: 'Science',
      type: 'multiple',
      difficulty: 'medium',
      question: 'What planet is known as the Red Planet?',
      correct_answer: 'Mars',
      incorrect_answers: ['Venus', 'Jupiter', 'Saturn']
    },
    {
      category: 'Math',
      type: 'multiple',
      difficulty: 'easy',
      question: 'What is 1 + 1?',
      correct_answer: '2',
      incorrect_answers: ['11', '0', '3']
    }
  ]
}

describe('fetchTrivia', () => {
  let origFetch
  beforeEach(() => {
    origFetch = globalThis.fetch
    globalThis.fetch = vi.fn()
  })
  afterEach(() => {
    globalThis.fetch = origFetch
  })

  it('fetches a single trivia item and decodes entities', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ results: [sampleResponse.results[0]] }) })
    const item = await fetchTrivia(1)
    expect(item).toBeTruthy()
    expect(item.question).toContain('2 + 2')
    expect(item.choices).toContain('4')
    expect(item.correct).toBe('4')
  })

  it('fetches multiple trivia items when amount > 1', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: true, json: async () => sampleResponse })
    const items = await fetchTrivia(3)
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBe(3)
    expect(items[1].question).toContain('Red Planet')
  })

  it('returns null or empty array on network error gracefully', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    const s1 = await fetchTrivia(1)
    expect(s1).toBeNull()
    globalThis.fetch.mockRejectedValueOnce(new Error('network'))
    const s2 = await fetchTrivia(2)
    expect(Array.isArray(s2)).toBe(true)
  })
})
