// pages/_app.js
// Este archivo es el punto de entrada principal de tu aplicación Next.js.
// Aquí se importan los estilos globales y se inicializa el componente principal de la aplicación.

import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // `Component` representa la página actual que se está renderizando (por ejemplo, index.js).
  // `pageProps` son las propiedades iniciales que se pasan a esa página.
  return <Component {...pageProps} />;
}

export default MyApp;


import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp

