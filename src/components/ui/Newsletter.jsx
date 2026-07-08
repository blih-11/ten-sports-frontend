import { useState } from 'react'
import { subscribe } from '../../utils/api'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await subscribe(email)
      toast.success('Subscribed successfully!')
      setEmail('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-dark rounded-2xl p-6 sm:p-8 text-center">
      <div className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Newsletter</div>
      <h2 className="text-white text-xl sm:text-2xl font-black mb-2">Stay Ahead of the Game</h2>
      <p className="text-gray-400 text-sm mb-6">Get the latest sports news, transfers, and analysis delivered to your inbox.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-0 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 w-full bg-surface text-white px-4 py-3 rounded-lg sm:rounded-l-lg sm:rounded-r-none outline-none border border-gray-700 focus:border-primary text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-dark px-5 py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg font-bold text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? '...' : 'Subscribe'}
        </button>
      </form>
    </div>
  )
}