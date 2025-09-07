import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import {
  clearApiCredentials,
  getApiKey,
  getApiUrl,
  setApiKey,
  setApiUrl,
} from "@/lib/api";

type UserRole = "admin" | "user";

interface User {
  role: UserRole;
  phoneNumber?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsAdmin: (apiUrl: string, apiKey: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on component mount
    const checkExistingSession = () => {
      const storedUser = localStorage.getItem("evolution_user");
      const apiUrl = getApiUrl();
      const apiKey = getApiKey();

      if (storedUser && apiUrl) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          localStorage.removeItem("evolution_user");
        }
      }

      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const loginAsAdmin = async (
    apiUrl: string,
    apiKey: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Validate API URL (basic validation)
      if (!apiUrl.startsWith("http")) {
        toast.error("URL inválida", {
          description: "A URL deve começar com http:// ou https://",
        });
        return false;
      }

      // Validate API Key (basic validation)
      if (!apiKey || apiKey.length < 8) {
        toast.error("Chave API inválida", {
          description: "A chave API é muito curta ou inválida",
        });
        return false;
      }

      // Verificar se a API key é válida fazendo uma chamada ao servidor
      try {
        // Armazenar temporariamente para fazer a chamada
        setApiUrl(apiUrl);
        setApiKey(apiKey);

        // Tentar fazer uma chamada para verificar se a API key é válida
        const response = await fetch(`${apiUrl}/instance/fetchInstances`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: apiKey,
          },
        });

        if (!response.ok) {
          // Se a resposta não for bem-sucedida, a API key é inválida
          clearApiCredentials(); // Limpar credenciais inválidas
          toast.error("Chave API inválida", {
            description:
              "A chave API fornecida não foi aceita pelo servidor. Verifique e tente novamente.",
          });
          return false;
        }
      } catch (error) {
        clearApiCredentials(); // Limpar credenciais em caso de erro
        toast.error("Erro de conexão", {
          description:
            "Não foi possível conectar ao servidor. Verifique a URL e tente novamente.",
        });
        return false;
      }

      // Se chegou aqui, as credenciais são válidas
      // Store API credentials permanentemente
      setApiUrl(apiUrl);
      setApiKey(apiKey);

      // Create user object - this is for admin
      const adminUser: User = { role: "admin" };

      // Store user in local storage
      localStorage.setItem("evolution_user", JSON.stringify(adminUser));

      // Update state
      setUser(adminUser);

      toast.success("Bem-vindo!", {
        description: "Login realizado com sucesso",
      });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro no login", {
        description:
          "Não foi possível realizar o login. Verifique suas credenciais.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearApiCredentials();
    localStorage.removeItem("evolution_user");
    setUser(null);
    toast.success("Logout realizado", {
      description: "Você foi desconectado com sucesso",
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loginAsAdmin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
