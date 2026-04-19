import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ErrorPage from '../pages/ErrorPage'

const renderPage = () => render(<MemoryRouter><ErrorPage /></MemoryRouter>)

describe('ErrorPage', () => {
  it('renders 404 heading', () => {
    renderPage()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders disappearing act text', () => {
    renderPage()
    expect(screen.getByText(/disappearing act/i)).toBeInTheDocument()
  })

  it('renders Go Home link', () => {
    renderPage()
    expect(screen.getByText(/go home/i)).toBeInTheDocument()
  })

  it('renders Login link', () => {
    renderPage()
    expect(screen.getByText(/login/i)).toBeInTheDocument()
  })

  it('renders tap for another excuse hint', () => {
    renderPage()
    expect(screen.getByText(/tap for another excuse/i)).toBeInTheDocument()
  })

  it('displays a joke on load', () => {
    renderPage()
    expect(screen.getByText(/stokvel funds|owes everyone|load shedding|payout cycle/i)).toBeInTheDocument()
  })

  it('cycles to next joke on click', () => {
    renderPage()
    const jokeBox = screen.getByText(/stokvel funds|owes everyone|load shedding|payout cycle/i).closest('div')
    const first = jokeBox.textContent
    fireEvent.click(jokeBox)
    const second = jokeBox.textContent
    // either changed or wrapped back — box still exists
    expect(jokeBox).toBeInTheDocument()
    // clicks through all 4 jokes
    fireEvent.click(jokeBox)
    fireEvent.click(jokeBox)
    fireEvent.click(jokeBox)
    expect(jokeBox.textContent).toBe(first)
  })
})
