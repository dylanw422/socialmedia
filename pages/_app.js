import '../styles/globals.css'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@1,300&family=Roboto+Mono&display=swap"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp
