// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'MyVoice SaaS',
  description: 'Voice TTS SaaS',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <body className="bg-gray-50 text-gray-900">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">MyVoice</h1>
            <nav>
              <a href="/" className="mr-4">Home</a>
              <a href="/dashboard" className="mr-4">Dashboard</a>
              <a href="/admin">Admin</a>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center py-6 text-sm text-gray-500">
          © {new Date().getFullYear()} MyVoice
        </footer>
      </body>
    </html>
  )
}
