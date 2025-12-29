import { useState, FormEvent, useEffect } from 'react'
import { validatePassword, STORAGE_KEY } from '@/features/cassie/cassie-config'
import '@/styles/password-unlock.css'

interface PasswordUnlockProps {
  onUnlock: () => void
  onClose: () => void
}

export default function PasswordUnlock({
  onUnlock,
  onClose,
}: PasswordUnlockProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    if (validatePassword(password)) {
      setIsUnlocking(true)
      sessionStorage.setItem(STORAGE_KEY, 'true')

      // Immediately call onUnlock
      onUnlock()
    } else {
      setError('Incorrect password. Try again 💜')
      setPassword('')
    }
  }

  return (
    <div className="password-modal-overlay" onClick={onClose}>
      <div
        className={`password-unlock-modal ${isUnlocking ? 'unlocking' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="unlock-container">
          <div className="unlock-icon">🔒</div>
          <h2 className="unlock-title">Protected Content</h2>
          <p className="unlock-subtitle">
            Enter the password to view the full page
          </p>

          <form onSubmit={handleSubmit} className="unlock-form">
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="password-input"
                autoFocus
                disabled={isUnlocking}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="unlock-button"
              disabled={isUnlocking}
            >
              {isUnlocking ? 'unlocking...' : 'unlock'}
            </button>
          </form>

          <p className="unlock-hint">
            Hint: It&rsquo;s something very special 🦈💜
          </p>
        </div>
      </div>
    </div>
  )
}
