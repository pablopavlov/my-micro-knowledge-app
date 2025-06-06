// pages/index.js
// Esta es la página principal de nuestra aplicación.
// Ahora incluye la lógica para interactuar con Supabase para crear y listar notas.

import Head from 'next/head';
import { createClient } from '@supabase/supabase-js'; // Importa el cliente de Supabase
import { useState, useEffect } from 'react'; // Importa hooks de React para estado y efectos

// Inicializa el cliente Supabase utilizando las variables de entorno configuradas en Vercel.
// Las variables NEXT_PUBLIC_ son accesibles en el código del lado del cliente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [notes, setNotes] = useState([]); // Estado para almacenar la lista de notas.
  const [newNoteTitle, setNewNoteTitle] = useState(''); // Estado para el título de la nueva nota.
  const [newNoteContent, setNewNoteContent] = useState(''); // Estado para el contenido de la nueva nota.
  const [loading, setLoading] = useState(true); // Estado para indicar si la carga o guardado está en progreso.
  const [error, setError] = useState(null); // Estado para manejar mensajes de error.

  // Función asíncrona para obtener las notas de Supabase.
  const fetchNotes = async () => {
    try {
      setLoading(true); // Activa el estado de carga.
      setError(null); // Limpia errores previos antes de una nueva operación.

      // Consulta la tabla 'notes' en Supabase, selecciona todas las columnas y las ordena por fecha de creación.
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, created_at, is_public')
        .order('created_at', { ascending: false }); // Ordena de la más nueva a la más antigua.

      if (error) {
        throw error; // Lanza un error si la consulta falla.
      }
      setNotes(data); // Actualiza el estado con las notas obtenidas.
    } catch (err) {
      console.error('Error al obtener notas:', err.message);
      setError('Error al cargar las notas: ' + err.message); // Muestra un mensaje de error al usuario.
    } finally {
      setLoading(false); // Desactiva el estado de carga.
    }
  };

  // Función asíncrona para añadir una nueva nota a Supabase.
  const addNote = async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página.
    if (!newNoteTitle.trim()) { // Valida que el título no esté vacío.
      setError('El título de la nota no puede estar vacío.');
      return;
    }

    try {
      setLoading(true); // Activa el estado de carga.
      setError(null); // Limpia errores previos.

      // Inserta una nueva fila en la tabla 'notes'.
      // 'content' puede ser nulo si el usuario no lo proporciona.
      const { data, error } = await supabase
        .from('notes')
        .insert([
          { title: newNoteTitle.trim(), content: newNoteContent.trim() || null, is_public: false }
        ])
        .select(); // Con .select() obtenemos el registro insertado de vuelta.

      if (error) {
        throw error; // Lanza un error si la inserción falla.
      }
      // Actualiza la lista de notas añadiendo la nueva nota al principio.
      setNotes((prevNotes) => [data[0], ...prevNotes]);
      setNewNoteTitle(''); // Limpia el campo del título.
      setNewNoteContent(''); // Limpia el campo del contenido.
    } catch (err) {
      console.error('Error al añadir nota:', err.message);
      setError('Error al guardar la nota: ' + err.message); // Muestra un mensaje de error al usuario.
    } finally {
      setLoading(false); // Desactiva el estado de carga.
    }
  };

  // useEffect para cargar las notas cuando el componente se monta por primera vez.
  // El array de dependencias vacío [] asegura que se ejecute solo una vez.
  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f0f4f8',
      color: '#333',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem',
      alignItems: 'center'
    }}>
      <Head>
        <title>Mi Plataforma de Micro-Conocimiento Esencialista</title>
        <meta name="description" content="Tu espacio para la sencillez del conocimiento." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{
        width: '100%',
        maxWidth: '800px', // Limita el ancho máximo del contenido para mejor legibilidad.
        padding: '2rem',
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h1 style={{ color: '#0070f3', textAlign: 'center', marginBottom: '2rem' }}>
          Plataforma de Micro-Conocimiento Esencialista
        </h1>

        {/* Sección para Añadir Nueva Nota */}
        <section style={{ marginBottom: '3rem', borderBottom: '1px solid #eee', paddingBottom: '2rem' }}>
          <h2 style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Añadir Nueva Nota</h2>
          <form onSubmit={addNote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Título de la nota (requerido)"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              style={{
                padding: '0.8rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem'
              }}
              disabled={loading} // Deshabilita el input mientras se guarda.
            />
            <textarea
              placeholder="Contenido de la nota (opcional)"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows="5"
              style={{
                padding: '0.8rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem',
                resize: 'vertical' // Permite al usuario redimensionar verticalmente.
              }}
              disabled={loading} // Deshabilita el textarea mientras se guarda.
            ></textarea>
            <button
              type="submit"
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease', // Transición suave al pasar el ratón.
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'} // Efecto hover.
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0070f3'} // Vuelve al color original.
              disabled={loading} // Deshabilita el botón mientras se guarda.
            >
              {loading ? 'Guardando...' : 'Guardar Nota Esencial'}
            </button>
            {error && <p style={{ color: '#e74c3c', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
          </form>
        </section>

        {/* Sección para Listar Notas */}
        <section>
          <h2 style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Mis Notas Esenciales</h2>
          {loading && notes.length === 0 ? ( // Muestra "Cargando" solo si no hay notas aún.
            <p style={{ textAlign: 'center' }}>Cargando notas...</p>
          ) : notes.length === 0 ? ( // Muestra mensaje si no hay notas después de cargar.
            <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>Aún no hay notas. ¡Crea tu primera!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {notes.map((note) => (
                <div key={note.id} style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: '#fdfdfd',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s ease', // Efecto suave al pasar el ratón.
                  cursor: 'default'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <h3 style={{ color: '#0070f3', marginBottom: '0.5rem', fontSize: '1.4rem' }}>{note.title}</h3>
                  {note.content && ( // Muestra el contenido solo si existe.
                    <p style={{ fontSize: '1rem', lineHeight: '1.5', color: '#555' }}>
                      {/* Trunca el contenido si es muy largo para la vista previa. */}
                      {note.content.length > 200 ? note.content.substring(0, 200) + '...' : note.content}
                    </p>
                  )}
                  <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem' }}>
                    Creada el: {new Date(note.created_at).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    Pública: {note.is_public ? 'Sí' : 'No'}
                  </p>
                  {/* Más adelante, añadiremos botones de editar/borrar/publicar */}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
        Desarrollado con inspiración por tu IA. La belleza en la sencillez.
      </footer>
    </div>
  );
}


