import { useState } from "react";
import { Eye, EyeOff, Key, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui-custom/Button";
import Card from "@/components/ui-custom/Card";
import Header from "@/components/ui-custom/Header";
import { DEFAULT_API_URL } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const { loginAsAdmin, isLoading } = useAuth();

  const [apiKey, setApiKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null); // Limpa o erro anterior, se houver
    const success = await loginAsAdmin(DEFAULT_API_URL, apiKey);
    if (success) {
      navigate("/dashboard");
    } else {
      // Se não tiver sucesso, mostrar uma mensagem genérica
      // A mensagem específica já é mostrada pelo toast no contexto de autenticação
      setLoginError("Falha na autenticação. Verifique suas credenciais.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <Card className="w-full max-w-md p-6 bg-slate-900 border-slate-800">
        <div className="flex flex-col items-center mb-6">
          <Header
            title="Evolution Manager"
            subtitle="Por favor, informe o Token de Acesso para continuar"
            className="mb-0 text-center"
            centered
          />
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          {loginError && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-300">
              <Key className="h-4 w-4 mr-2" /> Token de Acesso{" "}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Seu Token de Acesso"
                required
                className={`bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 pr-10 ${
                  loginError ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Conectar
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
