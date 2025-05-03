import './globals.css'

export const metadata = {
  title: 'Climate Power Forecast',
  description: '',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="m-0 p-0 overflow-auto">{children}</body>
    </html>
  )
}
