// pages/index.js
// Este archivo define la página de inicio de tu aplicación.
// Es lo que verás cuando accedas a la URL base de tu despliegue.

import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  return (
    // Contenedor principal con estilos en línea para centrar el contenido y dar un fondo.
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh', // Ocupa al menos el 100% de la altura del viewport.
      backgroundColor: '#f0f4f8', // Un color de fondo suave.
      color: '#333', // Color de texto oscuro para contraste.
      fontFamily: 'Arial, sans-serif' // Fuente genérica y legible.
    }}>
      {/* Componente Head para metadatos de la página (título, descripción, favicon). */}
      <Head>
        <title>Mi Plataforma de Micro-Conocimiento Esencialista</title>
        <meta name="description" content="Tu espacio para la sencillez del conocimiento." />
        {/* Asegúrate de que el archivo se llame 'favicon.ico' en la carpeta public. */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Contenido principal de la página. */}
      <main style={{
        textAlign: 'center',
        padding: '2rem',
        borderRadius: '10px', // Bordes redondeados para un aspecto moderno.
        backgroundColor: '#ffffff', // Fondo blanco para el contenido principal.
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)' // Sombra suave para un efecto de elevación.
      }}>
        <h1 style={{ color: '#0070f3', marginBottom: '1rem' }}>
          ¡Bienvenido a tu Plataforma de Micro-Conocimiento Esencialista!
        </h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
          La belleza de la sencillez comienza aquí.
          Este es el primer paso de nuestra obra de arte digital.
        </p>
        <div style={{ marginTop: '2rem' }}>
          {/* Componente Image de Next.js para optimizar la carga de imágenes. */}
          {/* Asegúrate de que el archivo se llame 'vercel.svg' en la carpeta public. */}
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
        </div>
      </main>

      {/* Pie de página. */}
      <footer style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        Desarrollado con inspiración por tu IA
      </footer>
    </div>
  );
}


