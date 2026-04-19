import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'

const renderPage = () => render(<MemoryRouter><Home /></MemoryRouter>)

describe('Home', () => {
  it('renders platform name in navbar', () => {
    renderPage()
    expect(screen.getAllByText(/stokvel management platform/i).length).toBeGreaterThan(0)
  })

  it('renders Login link', () => {
    renderPage()
    expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0)
  })

  it('renders Join Now button', () => {
    renderPage()
    expect(screen.getByText(/join now/i)).toBeInTheDocument()
  })

  it('renders hero headline', () => {
    renderPage()
    expect(screen.getByText(/communal wealth/i)).toBeInTheDocument()
  })

  it('renders Start Your Ledger CTA', () => {
    renderPage()
    expect(screen.getByText(/start your ledger/i)).toBeInTheDocument()
  })

  it('renders About section', () => {
    renderPage()
    expect(screen.getAllByText(/about/i).length).toBeGreaterThan(0)
  })

  it('renders footer copyright', () => {
    renderPage()
    expect(screen.getByText(/rate limit refugees/i)).toBeInTheDocument()
  })

  it('renders Sign In link in hero', () => {
    renderPage()
    expect(screen.getAllByText(/sign in/i).length).toBeGreaterThan(0)
  })
})
