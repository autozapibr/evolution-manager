import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Button from "@/components/ui-custom/Button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Verificar se estamos em uma rota de erro conhecida
    const errorRoutes = ["404", "error", "not-found", "notfound"];
    const currentPathSegment =
      location.pathname.split("/").pop()?.toLowerCase() || "";

    if (errorRoutes.includes(currentPathSegment)) {
      console.log(
        "Detectado padrão de rota de erro, redirecionando para home..."
      );
      // Redirecionar para a home após um pequeno atraso (para mostrar a página brevemente)
      const timer = setTimeout(() => {
        navigate("/");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="text-center bg-slate-900 p-8 rounded-lg border border-slate-800 shadow-lg max-w-md w-full">
        <img
          src="https://cdn.jsdelivr.net/gh/packtypebot/imagens/evolution-logo.png"
          alt="Evolution API Logo"
          className="h-16 w-auto mx-auto mb-6"
        />
        <h1 className="text-5xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-slate-300 mb-6">Página não encontrada</p>
        <Link to="/">
          <Button
            variant="default"
            icon={<Home size={18} />}
            className="mx-auto"
          >
            Voltar ao Início
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
