// Fetch a fun fact or local info for a given city using Wikipedia API
export async function fetchFunFact(city, country = '') {
  try {
    // Use Wikipedia API to get a summary for the city
    const query = encodeURIComponent(city + (country ? `, ${country}` : ''))
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${query}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      if (data.extract) return data.extract
      if (data.description) return data.description
    }
  } catch (e) {}
  // Fallback: NumbersAPI random trivia
  try {
    const res = await fetch('http://numbersapi.com/random/trivia')
    if (res.ok) {
      const text = await res.text()
      return text
    }
  } catch (e) {}
  return null
}