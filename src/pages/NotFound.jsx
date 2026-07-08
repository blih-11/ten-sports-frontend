import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <div className="text-primary font-black text-8xl mb-4">404</div>
        <h1 className="text-dark font-black text-3xl mb-3">Page not found</h1>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="bg-dark text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-dark transition-all">← Back to Home</Link>
      </div>
    </div>
  )
}
