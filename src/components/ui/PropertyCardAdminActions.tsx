"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface AdminProperty {
  id: string;
  title: string;
  exibir?: boolean;
}

export function PropertyCardAdminActions({ property }: { property: AdminProperty }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isHidden = property.exibir === false;

  const handleToggleVisibility = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/imoveis", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: property.id, exibir: !property.exibir }),
      });

      if (res.ok) {
        toast.success(property.exibir ? "Imóvel ocultado!" : "Imóvel visível!");
        router.refresh();
      } else {
        toast.error("Erro ao alterar visibilidade.");
      }
    } catch {
      toast.error("Erro de conexão.");
    }
  };

  const handleEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push(`/imoveis/cadastrar?id=${property.id}`);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);

    try {
      const res = await fetch(`/api/imoveis/${property.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Imóvel excluído com sucesso!");
        router.refresh();
      } else {
        toast.error("Erro ao excluir imóvel.");
      }
    } catch {
      toast.error("Erro de conexão ao tentar excluir.");
    }
  };

  return (
    <>
      <div className="absolute top-3 right-3 z-30 flex gap-2">
        <button
          onClick={handleToggleVisibility}
          className={`p-2 rounded-full shadow-md text-white transition ${isHidden ? "bg-gray-500 hover:bg-gray-600" : "bg-green-500 hover:bg-green-600"}`}
          title={isHidden ? "Tornar visível" : "Ocultar anúncio"}
        >
          {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button
          onClick={handleEdit}
          className="p-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition"
          title="Editar anúncio"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowDeleteModal(true);
          }}
          className="p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
          title="Excluir imóvel"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteModal(false);
            }}
          />
          <div
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl transform transition-all"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-6">
              <Trash2 className="h-7 w-7 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-3">
              Excluir Imóvel
            </h3>
            <p className="text-center text-gray-600 mb-8 min-h-12">
              Tem certeza que deseja excluir o imóvel <strong className="text-gray-900">{property.title}</strong>? <br /> Esta ação não pode ser desfeita.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-center">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:ring-4 focus:ring-gray-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteModal(false);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors focus:ring-4 focus:ring-red-200 shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmDelete();
                }}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
