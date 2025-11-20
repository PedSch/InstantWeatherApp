import React from 'react'

// Generic Icon wrapper: applies sizing classes and forwards children.
export default function Icon({ className = '', children, as: Component = 'span', ...props }) {
  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}
