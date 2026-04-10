import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Page not found</h1>
      <p style={{ color: 'var(--text2)', marginBottom: '32px' }}>
        That page doesn't exist or the content was removed.
      </p>
      <Link href="/" className="btn btn-primary">← Back to Home</Link>
    </div>
  )
}
