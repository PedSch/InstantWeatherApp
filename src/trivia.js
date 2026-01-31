// Open Trivia DB helper (no API key required)
// API: https://opentdb.com/api.php?amount=1&type=multiple
export async function fetchTrivia(amount = 1) {
  try {
    const res = await fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple`)
    if (!res.ok) return amount === 1 ? null : []
    const json = await res.json()
    if (!json.results || json.results.length === 0) return amount === 1 ? null : []
    const decode = (s) => {
      if (!s) return s
      return s
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&eacute;/g, 'é')
        .replace(/&uuml;/g, 'ü')
        .replace(/&rsquo;/g, '’')
    }

    const makeItem = (item) => {
      const choices = [...item.incorrect_answers.map(decode), decode(item.correct_answer)]
      for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = choices[i]
        choices[i] = choices[j]
        choices[j] = tmp
      }
      return { question: decode(item.question), choices, correct: decode(item.correct_answer), category: item.category, difficulty: item.difficulty }
    }

    const items = json.results.map(makeItem)
    return amount === 1 ? items[0] : items
  } catch (e) {
    return amount === 1 ? null : []
  }
}

