import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="min-h-screen bg-background font-sans antialiased">
        <Main />
        <NextScript />
        <script src="https://www.youtube.com/iframe_api"></script>
        <script src="https://www.youtube.com/player_api"></script>
      </body>
    </Html>
  )
}
