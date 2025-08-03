import { render, screen } from '@testing-library/react'
import App from '../../src/App'
import { describe, it, expect } from 'vitest'

describe('App', () => {
  it('renders without error', () => {
    render(<App />)
    expect(screen.getByText('Atrium Tabs')).toBeInTheDocument()
    expect(screen.getByText('Your groups will appear here.')).toBeInTheDocument()
  })
})