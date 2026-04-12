import { Link } from 'react-router-dom'

export default function ErrorPage() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link to="/">Go back home</Link>
    </div>
  )
}
