'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Check, X, Images, Loader2, ChevronLeft } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  credits: number;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

interface GalleryImage {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  width: number;
  height: number;
  createdAt: string;
}

interface GalleryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; credits: number; role: string }>({ name: '', credits: 0, role: '' });
  const [galleryUser, setGalleryUser] = useState<User | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryPagination, setGalleryPagination] = useState<GalleryPagination | null>(null);
  const [galleryLoading, setGalleryLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/prendas-separadas');
    }
  }, [status, session, router]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') fetchUsers();
  }, [session, fetchUsers]);

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditValues({ name: user.name || '', credits: user.credits, role: user.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      if (!res.ok) return;
      const data = await res.json();
      setUsers(prev => prev.map(u => u.id === id ? data.user : u));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Seguro que quieres eliminar este usuario?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) return;
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const openGallery = async (user: User, page = 1) => {
    setGalleryUser(user);
    setGalleryLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/images?page=${page}&limit=20`);
      if (!res.ok) return;
      const data = await res.json();
      setGalleryImages(data.images);
      setGalleryPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setGalleryLoading(false);
    }
  };

  const closeGallery = () => {
    setGalleryUser(null);
    setGalleryImages([]);
    setGalleryPagination(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') return null;

  if (galleryUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={closeGallery} className="rounded p-1.5 text-gray-500 hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Galeria de {galleryUser.name || galleryUser.email}</h2>
            {galleryPagination && (
              <p className="text-sm text-gray-500">{galleryPagination.total} imagenes</p>
            )}
          </div>
        </div>

        {galleryLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Images className="h-16 w-16 text-gray-300" />
            <p className="mt-4 text-lg text-gray-500">Este usuario no tiene imagenes</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {galleryImages.map(image => (
                <a
                  key={image.id}
                  href={image.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 transition-transform hover:scale-[1.02]"
                >
                  <img
                    src={image.thumbnailUrl || image.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-xs text-white">{new Date(image.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                </a>
              ))}
            </div>

            {galleryPagination && galleryPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => openGallery(galleryUser, galleryPagination.page - 1)}
                  disabled={galleryPagination.page === 1}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-4 text-sm text-gray-600">
                  Pagina {galleryPagination.page} de {galleryPagination.totalPages}
                </span>
                <button
                  onClick={() => openGallery(galleryUser, galleryPagination.page + 1)}
                  disabled={galleryPagination.page === galleryPagination.totalPages}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Panel de administracion</h2>
        <p className="text-sm text-gray-500">{users.length} usuarios registrados</p>
      </div>

      {/* Mobile: Cards */}
      <div className="space-y-3 md:hidden">
        {users.map(user => (
          <div key={user.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-700 text-sm font-medium text-white">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  {editingId === user.id ? (
                    <input
                      value={editValues.name}
                      onChange={e => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  ) : (
                    <p className="truncate font-medium text-gray-900">{user.name || 'Sin nombre'}</p>
                  )}
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                user.role === 'ADMIN' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                {user.role}
              </span>
            </div>

            {editingId === user.id ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16">Creditos</span>
                  <input
                    type="number"
                    value={editValues.credits}
                    onChange={e => setEditValues(prev => ({ ...prev, credits: Number(e.target.value) }))}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16">Rol</span>
                  <select
                    value={editValues.role}
                    onChange={e => setEditValues(prev => ({ ...prev, role: e.target.value }))}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MODERATOR">MODERATOR</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => saveEdit(user.id)} className="flex-1 rounded-lg bg-gray-900 py-2 text-xs font-medium text-white">
                    Guardar
                  </button>
                  <button onClick={cancelEdit} className="flex-1 rounded-lg border border-gray-300 py-2 text-xs font-medium text-gray-700">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{user.credits} creditos</span>
                  <span>{new Date(user.createdAt).toLocaleDateString('es-AR')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openGallery(user)} className="rounded p-2 text-gray-500 active:bg-gray-100">
                    <Images className="h-5 w-5" />
                  </button>
                  <button onClick={() => startEdit(user)} className="rounded p-2 text-gray-500 active:bg-gray-100">
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button onClick={() => deleteUser(user.id)} className="rounded p-2 text-red-500 active:bg-red-50">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Usuario</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Creditos</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Rol</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Registro</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-700 text-xs font-medium text-white">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    {editingId === user.id ? (
                      <input
                        value={editValues.name}
                        onChange={e => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                        className="w-32 rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="text-gray-900">{user.name || 'Sin nombre'}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  {editingId === user.id ? (
                    <input
                      type="number"
                      value={editValues.credits}
                      onChange={e => setEditValues(prev => ({ ...prev, credits: Number(e.target.value) }))}
                      className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-gray-900">{user.credits}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === user.id ? (
                    <select
                      value={editValues.role}
                      onChange={e => setEditValues(prev => ({ ...prev, role: e.target.value }))}
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MODERATOR">MODERATOR</option>
                    </select>
                  ) : (
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {editingId === user.id ? (
                      <>
                        <button onClick={() => saveEdit(user.id)} className="rounded p-1.5 text-green-600 hover:bg-green-50">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={cancelEdit} className="rounded p-1.5 text-gray-500 hover:bg-gray-100">
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => openGallery(user)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100" title="Ver galeria">
                          <Images className="h-4 w-4" />
                        </button>
                        <button onClick={() => startEdit(user)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="rounded p-1.5 text-red-500 hover:bg-red-50" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
