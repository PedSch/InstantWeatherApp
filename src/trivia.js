// Open Trivia DB helper (no API key required)
// API: https://opentdb.com/api.php?amount=1&type=multiple
export async function fetchTrivia() {
  try {
    const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple')
    if (!res.ok) return null
    const json = await res.json()
    if (!json.results || json.results.length === 0) return null
    const item = json.results[0]
    // Decode HTML entities (basic, extended)
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
    const question = decode(item.question)
    const correct = decode(item.correct_answer)
    const incorrect = item.incorrect_answers.map(decode)
    // Build choices and shuffle
    const choices = [...incorrect, correct]
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = choices[i]
      choices[i] = choices[j]
      choices[j] = tmp
    }
    return { question, choices, correct, category: item.category, difficulty: item.difficulty }
  } catch (e) {
    return null
  }
}
