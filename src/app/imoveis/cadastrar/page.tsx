"use client";

import { useState, useEffect, Suspense } from "react";
import { UploadCloud, CheckCircle, Image as ImageIcon, MapPin, Bed, Bath, Maximize, FileText, Info, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function CadastrarImovelForm() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [charInput, setCharInput] = useState("");
  const [exibir, setExibir] = useState(true);

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cidadesList, setCidadesList] = useState<{nome: string}[]>([]);
  const [loadingProperty, setLoadingProperty] = useState(false);

  // hardcoded UF list
  const ufList = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
    "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
  ];

  useEffect(() => {
    if (estado) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Sort alphabetical
            const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome));
            setCidadesList(sorted);
          }
        })
        .catch(err => console.error("Erro ao buscar cidades:", err));
    } else {
      setCidadesList([]);
    }
  }, [estado]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    async function loadProperty() {
      if (editId) {
        setLoadingProperty(true);
        try {
          const res = await fetch(`/api/imoveis/${editId}`);
          if (res.ok) {
            const data = await res.json();
            setImages(data.images || []);
            setCharacteristics(data.characteristics || []);
            setCep(""); // You might map address parts here if structured differently
            setRua(data.address || ""); 
            setExibir(data.exibir !== undefined ? data.exibir : true);
            // Will need to populate form fields directly in onSubmit or map state
            setTimeout(() => {
              const form = document.getElementById("imovel-form") as HTMLFormElement;
              if (form) {
                (form.elements.namedItem("title") as HTMLInputElement).value = data.title;
                (form.elements.namedItem("description") as HTMLTextAreaElement).value = data.description;
                (form.elements.namedItem("price") as HTMLInputElement).value = data.price.toString();
                (form.elements.namedItem("type") as HTMLSelectElement).value = data.type;
                (form.elements.namedItem("rooms") as HTMLInputElement).value = data.rooms.toString();
                (form.elements.namedItem("bathrooms") as HTMLInputElement).value = data.bathrooms.toString();
                (form.elements.namedItem("area") as HTMLInputElement).value = data.area.toString();
              }
            }, 100);
          }
        } catch (error) {
          console.error("Error loading property", error);
        } finally {
          setLoadingProperty(false);
        }
      }
    }
    loadProperty();
  }, [editId]);

  if (isLoading || loadingProperty) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const handleAddCharacteristic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (charInput.trim() && !characteristics.includes(charInput.trim())) {
        setCharacteristics([...characteristics, charInput.trim()]);
        setCharInput("");
      }
    }
  };

  const removeCharacteristic = (charToRemove: string) => {
    setCharacteristics(characteristics.filter(c => c !== charToRemove));
  };

  // Removed duplicated states

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const rawCep = e.target.value.replace(/\D/g, "");
    if (rawCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setRua(data.logradouro || "");
          setBairro(data.bairro || "");
          setCidade(data.localidade || "");
          setEstado(data.uf || "");
        } else {
          toast.error("CEP não encontrado.");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024); // max 2MB
      if (validFiles.length < files.length) {
        toast.error("Algumas imagens excedem o tamanho máximo de 2MB e não foram adicionadas.");
      }

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Concatena endereço no formato antigo compatível com a base
    const hasAddress = rua && cep;
    const fullAddress = hasAddress ? `${rua}, ${bairro}, ${cidade} - ${estado} | CEP: ${cep}` : rua; // Falback if filled with API address directly

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      id: editId || undefined,
      title: formData.get("title"),
      description: formData.get("description") || null,
      type: formData.get("type"),
      price: formData.get("price") ? Number(formData.get("price")) : null,
      area: formData.get("area") ? Number(formData.get("area")) : null,
      rooms: formData.get("rooms") ? Number(formData.get("rooms")) : null,
      bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null,
      address: hasAddress ? fullAddress : (rua || null),
      exibir: exibir,
      images: images.length > 0 ? images : null,
      characteristics: characteristics,
    };

    try {
      const isEdit = !!editId;
      const res = await fetch("/api/imoveis", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEdit ? "Imóvel editado com sucesso!" : "Imóvel cadastrado com sucesso!");
        setTimeout(() => window.location.href = "/", 1500);
      } else {
        const errorData = await res.json();
        toast.error(`Erro: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro de comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 py-16 min-h-screen">
      <div className="container mx-auto max-w-4xl px-4">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{editId ? "Editar Imóvel" : "Cadastrar Novo Imóvel"}</h1>
          <p className="text-gray-500">{editId ? "Atualize os detalhes abaixo do seu anúncio." : "Preencha os detalhes abaixo para anunciar no ImobiPrime."}</p>
        </div>

        <form id="imovel-form" onSubmit={handleFormSubmit} className="space-y-8">
          
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Info size={24} /></span>
              <h2 className="text-2xl font-bold text-gray-800">Visibilidade</h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Exibir anúncio publicamente?</label>
              <input 
                type="checkbox" 
                checked={exibir}
                onChange={(e) => setExibir(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </div>
          </div>

          {/* Sessão: Informações Principais */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Info size={24} /></span>
              <h2 className="text-2xl font-bold text-gray-800">Informações Principais</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Anúncio *</label>
                <input type="text" name="title" required placeholder="Ex: Lindo Apartamento em Pinheiros..." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2"><FileText size={16}/> Descrição Completa</label>
                <textarea name="description" rows={5} placeholder="Detalhes sobre o imóvel, diferenciais, localização..." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Negócio *</label>
                <select required name="type" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                  <option value="">Selecione...</option>
                  <option value="Venda">Venda</option>
                  <option value="Aluguel">Aluguel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preço (R$)</label>
                <input type="number" name="price" placeholder="Ex: 500000" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Sessão: Características e Dimensões */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Maximize size={24} /></span>
              <h2 className="text-2xl font-bold text-gray-800">Detalhes & Cômodos</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2"><Maximize size={16}/> Área (m²)</label>
                <input type="number" step="any" name="area" placeholder="120" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2"><Bed size={16}/> Quartos</label>
                <input type="number" name="rooms" placeholder="3" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2"><Bath size={16}/> Banheiros</label>
                <input type="number" name="bathrooms" placeholder="2" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Características (Pressione Enter para adicionar)</label>
              <input 
                type="text" 
                placeholder="Ex: Piscina, Churrasqueira, Portaria 24h..." 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
                value={charInput}
                onChange={(e) => setCharInput(e.target.value)}
                onKeyDown={handleAddCharacteristic}
              />
              <div className="flex gap-2 flex-wrap min-h-[32px]">
                {characteristics.map(char => (
                  <span key={char} className="bg-blue-100 text-blue-800 text-sm py-1 px-3 rounded-full flex items-center gap-2">
                    {char}
                    <button type="button" onClick={() => removeCharacteristic(char)} aria-label="Remover" className="hover:text-blue-900 focus:outline-none">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sessão: Localização */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><MapPin size={24} /></span>
              <h2 className="text-2xl font-bold text-gray-800">Localização</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CEP</label>
                <input 
                  type="text" 
                  name="cep" 
                  placeholder="00000-000" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  onBlur={handleCepBlur}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estado (UF)</label>
                <select 
                  name="estado" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  value={estado}
                  onChange={(e) => {
                    setEstado(e.target.value);
                    setCidade(""); // reseta a cidade ao mudar de estado
                  }}
                >
                  <option value="">Selecione...</option>
                  {ufList.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cidade</label>
                <select 
                  name="cidade" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  disabled={!estado || cidadesList.length === 0}
                >
                  <option value="">Selecione a cidade...</option>
                  {cidadesList.map(c => (
                    <option key={c.nome} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rua/Logradouro (Endereço completo)</label>
                <input 
                  type="text" 
                  name="rua" 
                  placeholder="Ex: Rua Coronel Batista, Centro" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bairro</label>
                <input 
                  type="text" 
                  name="bairro" 
                  placeholder="Ex: Centro" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sessão: Anexo de Imagens */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><ImageIcon size={24} /></span>
              <h2 className="text-2xl font-bold text-gray-800">Imagens do Imóvel</h2>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition relative">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud size={48} className="text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700">Clique ou arraste imagens aqui</p>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG ou WEBP (máx. 2MB cada)</p>
            </div>

            {images.length > 0 && (
              <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
                {images.map((img, index) => (
                  <div key={index} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border">
                    <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4">
            <button disabled={isSubmitting} type="submit" className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition shadow-md flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}>
              {isSubmitting ? "Salvando..." : <><CheckCircle size={20}/> Publicar Anúncio</> }
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default function CadastrarImovelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex text-lg text-gray-500 items-center justify-center">Carregando...</div>}>
      <CadastrarImovelForm />
    </Suspense>
  );
}