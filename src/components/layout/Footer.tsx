import Link from "next/link";
import { Mail, Phone, MapPin, Share2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 text-sm">
      <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="text-2xl font-bold text-white mb-4 block">
            Silvestre <span className="text-blue-500">Imóveis</span>
          </Link>
          <p className="text-sm text-gray-400 mt-4 leading-relaxed">
            Encontre o imóvel dos seus sonhos com a melhor imobiliária da região. Especialistas em bons negócios.
          </p>
        </div>

        <div className="col-span-1 md:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Contato</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm">
              <Phone size={18} className="text-blue-500 shrink-0" />
              <span>(12) 98708-6949</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-blue-500 shrink-0" />
              <span>adherbalsilvestre@gmail.com </span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <span>Jambeiro - SP</span>
            </li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Links Úteis</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-blue-400 transition">Início</Link></li>
            <li><Link href="/sobre" className="hover:text-blue-400 transition">Sobre Nós</Link></li>
            <li><Link href="/sobre#contato" className="hover:text-blue-400 transition">Fale Conosco</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition">Termos de Uso</Link></li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Redes Sociais</h3>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition" aria-label="Instagram">
              <Share2 size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition" aria-label="Facebook">
              <Share2 size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition" aria-label="Twitter">
              <Share2 size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Adherbal Imóveis. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
