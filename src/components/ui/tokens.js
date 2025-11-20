// Simple JS tokens used by UI primitives. These are small helpers that return
// Tailwind utility class strings. For a full design system you could expose
// CSS variables or a theme provider; this is intentionally minimal and
// framework-friendly.

export const spacing = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
}

export const typography = {
  h1: 'text-3xl md:text-4xl font-bold',
  h2: 'text-xl md:text-2xl font-semibold',
  body: 'text-base',
  small: 'text-sm'
}

export const layout = {
  card: 'rounded-lg shadow-sm',
}

export const icon = {
  small: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

export default { spacing, typography, layout, icon }
