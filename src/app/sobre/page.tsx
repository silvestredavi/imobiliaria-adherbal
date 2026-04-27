import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function SobreContatoPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Sobre Nós & Contato</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Sobre Section */}
            <div className="p-8 md:p-12 bg-blue-600 text-white">
              <h2 className="text-3xl font-bold mb-6">Nossa História</h2>
              <p className="text-blue-100 mb-6 leading-relaxed">
                A <span className="font-semibold text-white">ImobiPrime</span> atua no mercado imobiliário há mais de 15 anos. Somos especialistas em encontrar sempre o melhor negócio para nossos clientes, unindo transparência, inovação e um atendimento premium que você merece.
              </p>
              <p className="text-blue-100 mb-10 leading-relaxed">
                Seja para comprar, vender ou alugar, nossa equipe está pronta para entregar as chaves do seu próximo sonho diretamente nas suas mãos.
              </p>

              <h3 className="text-xl font-semibold mb-4 border-b border-blue-500 pb-2">Informações de Contato</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <span>(11) 99999-9999</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <span>contato@imobiprime.com.br</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-1">
                    <MapPin size={20} />
                  </div>
                  <span>Av. Paulista, 1000<br/>Cerqueira César, São Paulo - SP</span>
                </li>
              </ul>
            </div>

            {/* Contato Section */}
            <div className="p-8 md:p-12" id="contato">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Envie uma mensagem</h2>
              <form className="flex flex-col gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Seu Nome completo</label>
                  <input type="text" id="name" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Ex: João da Silva" />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input type="email" id="email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="seu@email.com" />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                  <input type="text" id="subject" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Qual o motivo do contato?" />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Sua Mensagem</label>
                  <textarea id="message" rows={5} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" placeholder="Digite sua mensagem aqui..."></textarea>
                </div>

                <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition w-full md:w-auto self-start">
                  <Send size={18} />
                  Enviar Mensagem
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}