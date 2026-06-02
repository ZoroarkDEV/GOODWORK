import React from 'react';
import { toast } from 'sonner';
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
      const res = await fetch(`http://127.0.0.1:3000/api/rooms/${room.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Sala excluída!");
        window.location.reload();
      } else {
        toast.error("Erro ao excluir sala.");
      }
    } catch (e) {
      toast.error("Erro de conexão.");
    }
  };
  const handleEdit = async () => {
    const newName = window.prompt("Novo nome:", room.name);
    if (!newName) return;
    const newPrice = window.prompt("Novo preço por hora:", room.price_per_hour.toString());
    const newImage = window.prompt("Nova URL da Imagem:", room.image_url || '');
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          price_per_hour: parseFloat(newPrice || '0'),
          image_url: newImage,
        }),
      });
      if (res.ok) {
        toast.success("Sala atualizada!");
        window.location.reload();
      }
    } catch (e) {
      toast.error("Erro ao atualizar.");
    }
  };
  return (
    <div className="flex gap-2 mt-4 p-3 bg-slate-900/50 rounded-lg border border-amber-500/20">
      <button onClick={handleEdit} className="px-3 py-1.5 bg-amber-500 text-black rounded text-xs font-bold hover:bg-amber-600 transition">
        ✏️ Editar
      </button>
      <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition">
        🗑️ Deletar
      </button>
    </div>
  );
};