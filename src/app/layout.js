import './globals.css'

export const metadata = {
  title: 'Title',
  description: '',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="m-0 p-0 overflow-hidden">{children}</body>
    </html>
  )
}
