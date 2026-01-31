import React from 'react'

// Small Card wrapper that merges base project `card` styles with additional classes.
export default function Card({ children, className = '', as: Component = 'div', ...props }) {
  const classes = `card ${className}`.trim()
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}
