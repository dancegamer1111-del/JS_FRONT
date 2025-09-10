import { Html, Head, Main, NextScript } from 'next/document';

export default function MyDocument() {
  return (
    <Html lang="kk">
      <Head>
        {/* МЕТА-ТЕГИ */}
        <meta charSet="UTF-8" />
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="kk-KZ" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="SARYARQA JASTARY - жастарға арналған платформа. Жұмыс іздеу, білім алу, жобаларға дауыс беру және даму мүмкіндіктері."
        />
        <meta
          name="keywords"
          content="SARYARQA JASTARY, жастар, жұмыс іздеу, білім беру, жобалар, дауыс беру, мансап, дамыту, жастар платформасы, Сарыарқа жастары"
        />
        <meta name="author" content="SARYARQA JASTARY Team" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#1e40af" />

        {/* Open Graph */}
        <meta property="og:title" content="SARYARQA JASTARY - Жастарға арналған платформа" />
        <meta
          property="og:description"
          content="Жұмыс іздеу, білім алу, жобаларға дауыс беру және даму мүмкіндіктері бір жерде. Жастардың болашағын құрайық!"
        />
        <meta property="og:image" content="https://saryarqajastary.kz/og-image.png" />
        <meta property="og:url" content="https://saryarqajastary.kz" />
        <meta property="og:type" content="website" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SARYARQA JASTARY - Жастарға арналған платформа" />
        <meta
          name="twitter:description"
          content="Жұмыс іздеу, білім алу, жобаларға дауыс беру және даму мүмкіндіктері бір жерде."
        />
        <meta name="twitter:image" content="https://saryarqajastary.kz/twitter-image.png" />

        {/* Canonical */}
        <link rel="canonical" href="https://saryarqajastary.kz" />

        {/* Favicons */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@100;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />






        {/* Title */}
        <title>SARYARQA JASTARY - Жастарға арналған платформа</title>

        {/* Встроенные стили */}
        <style>{`
          body {
            background-color: #f8fafc;
            font-family: 'Inter', 'Roboto', sans-serif;
          }

          * {
            box-sizing: border-box;
          }

          html {
            scroll-behavior: smooth;
          }
        `}</style>
      </Head>

      <body>
        <Main />
        <NextScript />

      </body>
    </Html>
  );
}