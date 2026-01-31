import React from 'react'

export default function Button({ children, className = '', as: Component = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center'
  return (
    <Component className={`${base} ${className}`.trim()} {...props}>
      {children}
    </Component>
  )
}
