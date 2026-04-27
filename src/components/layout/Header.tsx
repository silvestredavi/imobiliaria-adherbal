"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, PlusCircle, Menu, X } from "lucide-react";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Check if logged_in cookie exists (UI state token since auth_token is httpOnly)
    const hasToken = document.cookie.includes("logged_in=true");
    setIsLoggedIn(hasToken);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
      } else {
        const data = await res.json();
        setLoginError(data.error || "Erro ao fazer login");
      }
    } catch (err) {
      setLoginError("Erro de conexão");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggedIn(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Adherbal <span className="text-gray-800">Imóveis</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">Início</Link>
            <Link href="/sobre" className="text-gray-600 hover:text-blue-600 font-medium">Sobre / Contato</Link>
            
            <div className="flex items-center border-l pl-6 ml-2">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link href="/imoveis/cadastrar" className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    <PlusCircle size={18} />
                    Cadastrar Imóvel
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition">
                    <LogOut size={18} />
                    Sair
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 px-5 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  <User size={18} />
                  Entrar
                </button>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>Início</Link>
            <Link href="/sobre" className="text-gray-600 hover:text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>Sobre / Contato</Link>
            
            <div className="border-t pt-4 mt-2">
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <Link href="/imoveis/cadastrar" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-md">
                    <PlusCircle size={18} />
                    Cadastrar Imóvel
                  </Link>
                  <button onClick={() => {handleLogout(); setIsMenuOpen(false);}} className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 border border-gray-300 px-4 py-2 rounded-md">
                    <LogOut size={18} />
                    Sair
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {setIsLoginModalOpen(true); setIsMenuOpen(false);}}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-blue-600 px-5 py-2 rounded-md"
                >
                  <User size={18} />
                  Entrar
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Acesse sua conta</h2>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4">
              {loginError && <p className="text-red-500 text-sm font-semibold">{loginError}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" name="email" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input type="password" name="password" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition mt-2">
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
