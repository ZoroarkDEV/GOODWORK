import React from 'react';

interface AdminRoomActionsProps {
  room: {
    id: string;
    name: string;
    capacity: number;
    price_per_hour: number;
    description?: string;
    image_url?: string;
  };
}

export const AdminRoomActions: React.FC<AdminRoomActionsProps> = ({ room }) => {
  
  const handleDelete = async () => {
    if (!window.confirm(`Deseja excluir a sala ${room.name}?`)) return;
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/rooms/${room.id}`, { method: 'DELETE' });
      if (response.ok) { window.location.reload(); }
    } catch (e) { console.error(e); }
  };

  const handleEdit = async () => {
    const newName = window.prompt("Novo nome:", room.name);
    if (!newName) return;
    const newPrice = window.prompt("Novo preço/h:", room.price_per_hour.toString());
    
    try {
      await fetch(`http://127.0.0.1:3000/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, price_per_hour: parseFloat(newPrice || '0') }),
      });
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex gap-2 mt-4 p-3 bg-slate-900/50 rounded-lg border border-warning/20">
      <button onClick={handleEdit} className="px-4 py-2 bg-amber-500 text-black rounded text-xs font-bold hover:bg-amber-600 transition">
        ✏️ Editar Sala
      </button>
      <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition">
        🗑️ Excluir Sala
      </button>
    </div>
  );
};

export default AdminRoomActions;