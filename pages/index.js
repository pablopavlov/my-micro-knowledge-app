// pages/index.js
// Esta es la página principal de nuestra aplicación.
// Ahora incluye la lógica para interactuar con Supabase para crear, listar, editar y eliminar notas.

import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// Inicializa el cliente Supabase utilizando las variables de entorno configuradas en Vercel.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null); // ID de la nota que se está editando.
  const [editingTitle, setEditingTitle] = useState(''); // Título temporal para la edición.
  const [editingContent, setEditingContent] = useState(''); // Contenido temporal para la edición.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Para el modal de confirmación de eliminación.
  const [noteToDeleteId, setNoteToDeleteId] = useState(null); // ID de la nota a eliminar.

  // Función para obtener las notas de Supabase
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, created_at, is_public')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setNotes(data);
    } catch (err) {
      console.error('Error al obtener notas:', err.message);
      setError('Error al cargar las notas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para añadir una nueva nota a Supabase
  const addNote = async (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) {
      setError('El título de la nota no puede estar vacío.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title: newNoteTitle.trim(), content: newNoteContent.trim() || null, is_public: false }])
        .select();

      if (error) {
        throw error;
      }
      setNotes((prevNotes) => [data[0], ...prevNotes]);
      setNewNoteTitle('');
      setNewNoteContent('');
    } catch (err) {
      console.error('Error al añadir nota:', err.message);
      setError('Error al guardar la nota: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Inicia el modo de edición para una nota específica.
  const startEditing = (note) => {
    setEditingNoteId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content || '');
  };

  // Guarda los cambios de una nota editada.
  const saveEditedNote = async (e) => {
    e.preventDefault();
    if (!editingTitle.trim()) {
      setError('El título de la nota no puede estar vacío.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('notes')
        .update({ title: editingTitle.trim(), content: editingContent.trim() || null })
        .eq('id', editingNoteId) // Condición: actualizar donde el ID coincide.
        .select();

      if (error) {
        throw error;
      }
      // Actualiza la lista de notas en el estado local.
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === editingNoteId ? data[0] : note))
      );
      setEditingNoteId(null); // Sale del modo de edición.
      setEditingTitle('');
      setEditingContent('');
    } catch (err) {
      console.error('Error al guardar edición:', err.message);
      setError('Error al actualizar la nota: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancela el modo de edición.
  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingTitle('');
    setEditingContent('');
    setError(null);
  };

  // Abre el modal de confirmación para eliminar.
  const confirmDelete = (id) => {
    setNoteToDeleteId(id);
    setShowConfirmModal(true);
  };

  // Elimina una nota de Supabase.
  const deleteNote = async () => {
    if (!noteToDeleteId) return;

    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteToDeleteId); // Condición: eliminar donde el ID coincide.

      if (error) {
        throw error;
      }
      // Actualiza la lista de notas en el estado local, filtrando la nota eliminada.
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteToDeleteId));
      setShowConfirmModal(false); // Cierra el modal.
      setNoteToDeleteId(null); // Limpia el ID de la nota a eliminar.
    } catch (err) {
      console.error('Error al eliminar nota:', err.message);
      setError('Error al eliminar la nota: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cambia el estado 'is_public' de una nota.
  const togglePublicStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('notes')
        .update({ is_public: !currentStatus }) // Invierte el estado actual.
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }
      // Actualiza la lista de notas en el estado local.
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === id ? data[0] : note))
      );
    } catch (err) {
      console.error('Error al cambiar estado público:', err.message);
      setError('Error al cambiar el estado de publicación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar notas al montar el componente.
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
        maxWidth: '800px',
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
              disabled={loading || editingNoteId !== null} // Deshabilitar si carga o edita.
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
                resize: 'vertical'
              }}
              disabled={loading || editingNoteId !== null} // Deshabilitar si carga o edita.
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
                transition: 'background-color 0.3s ease',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
              disabled={loading || editingNoteId !== null} // Deshabilitar si carga o edita.
            >
              {loading ? 'Guardando...' : 'Guardar Nota Esencial'}
            </button>
            {error && <p style={{ color: '#e74c3c', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
          </form>
        </section>

        {/* Sección para Listar Notas */}
        <section>
          <h2 style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Mis Notas Esenciales</h2>
          {loading && notes.length === 0 ? (
            <p style={{ textAlign: 'center' }}>Cargando notas...</p>
          ) : notes.length === 0 ? (
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
                  transition: 'transform 0.2s ease',
                  cursor: 'default'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {editingNoteId === note.id ? (
                    // Modo de edición para la nota
                    <form onSubmit={saveEditedNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        style={{
                          padding: '0.6rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}
                        disabled={loading}
                      />
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows="4"
                        style={{
                          padding: '0.6rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '0.95rem',
                          resize: 'vertical'
                        }}
                        disabled={loading}
                      ></textarea>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                        <button
                          type="submit"
                          style={{
                            flex: 1,
                            padding: '0.7rem 1rem',
                            backgroundColor: '#28a745', // Verde para guardar.
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                          disabled={loading}
                        >
                          Guardar Cambios
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          style={{
                            flex: 1,
                            padding: '0.7rem 1rem',
                            backgroundColor: '#6c757d', // Gris para cancelar.
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Modo de visualización para la nota
                    <>
                      <h3 style={{ color: '#0070f3', marginBottom: '0.5rem', fontSize: '1.4rem' }}>{note.title}</h3>
                      {note.content && (
                        <p style={{ fontSize: '1rem', lineHeight: '1.5', color: '#555' }}>
                          {note.content}
                        </p>
                      )}
                      <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem' }}>
                        Creada el: {new Date(note.created_at).toLocaleDateString()}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#888' }}>
                        Pública: {note.is_public ? 'Sí' : 'No'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button
                          onClick={() => startEditing(note)}
                          style={{
                            padding: '0.6rem 1rem',
                            backgroundColor: '#ffc107', // Amarillo para editar.
                            color: '#333',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
                          disabled={loading}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => confirmDelete(note.id)}
                          style={{
                            padding: '0.6rem 1rem',
                            backgroundColor: '#dc3545', // Rojo para eliminar.
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                          disabled={loading}
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={() => togglePublicStatus(note.id, note.is_public)}
                          style={{
                            padding: '0.6rem 1rem',
                            backgroundColor: note.is_public ? '#17a2b8' : '#6f42c1', // Azul/Púrpura para público/privado.
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = note.is_public ? '#138496' : '#5a2d9b'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = note.is_public ? '#17a2b8' : '#6f42c1'}
                          disabled={loading}
                        >
                          {note.is_public ? 'Hacer Privada' : 'Hacer Pública'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal de confirmación de eliminación */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ color: '#dc3545', marginBottom: '1.5rem' }}>Confirmar Eliminación</h3>
            <p style={{ marginBottom: '2rem' }}>¿Estás seguro de que quieres eliminar esta nota?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={deleteNote}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                disabled={loading}
              >
                Sí, Eliminar
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
        Desarrollado con inspiración por tu IA. La belleza en la sencillez.
      </footer>
    </div>
  );
}


