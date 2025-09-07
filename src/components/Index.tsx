import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  List,
  Plus,
  LogOut,
  User,
  Bot,
  Webhook,
  Sparkles,
  Github,
  BookOpen,
  Activity,
  Send,
} from "lucide-react";
import CreateInstanceForm from "@/components/CreateInstanceForm";
import InstancesListWrapper from "@/components/InstancesListWrapper";
import ApiKeyForm from "@/components/ApiKeyForm";
import Header from "@/components/ui-custom/Header";
import Card from "@/components/ui-custom/Card";
import ThemeToggle from "@/components/ui-custom/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui-custom/Button";
import { useNavigate } from "react-router-dom";
import {
  getApiKey,
  fetchInstances,
  initScheduledMessageProcessor,
} from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Instance } from "@/lib/types";
import TypebotWrapper from "@/components/TypebotWrapper";
import WebhookWrapper from "@/components/WebhookWrapper";
import IAWrapper from "@/components/IAWrapper";
import BehaviorSettingsWrapper from "@/components/BehaviorSettingsWrapper";
import DisparadorWrapper from "@/components/DisparadorWrapper";

const Index = () => {
  const [activeTab, setActiveTab] = useState("instances");
  const [isGlobalApiKey, setIsGlobalApiKey] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Inicializar o processador de mensagens agendadas
  useEffect(() => {
    const intervalId = initScheduledMessageProcessor();
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Buscar instâncias para obter o nome da instância conectada
  const { data: instances = [] } = useQuery({
    queryKey: ["instances"],
    queryFn: fetchInstances,
  });

  useEffect(() => {
    // Verificar se a API key é global
    const checkGlobalApiKey = async () => {
      const apiKey = getApiKey();
      const isGlobal = apiKey.startsWith("global_");
      setIsGlobalApiKey(isGlobal);
      if (!isGlobal && instances.length > 0) {
        setInstanceName(instances[0].name);
      }
    };
    checkGlobalApiKey();
  }, [instances, user]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayName = isGlobalApiKey
    ? "Administrador"
    : instanceName || "Suporte";

  const renderTabContent = () => {
    return (
      <>
        {activeTab === "instances" ? (
          <div>
            <InstancesListWrapper />
          </div>
        ) : activeTab === "create" &&
          user?.role === "admin" &&
          isGlobalApiKey ? (
          <div className="max-w-lg mx-auto py-4">
            <h2 className="text-xl font-medium mb-6">Nova Instância</h2>
            <CreateInstanceForm onSuccess={() => setActiveTab("instances")} />
          </div>
        ) : activeTab === "typebot" ? (
          <div>
            <TypebotWrapper />
          </div>
        ) : activeTab === "webhook" ? (
          <div>
            <WebhookWrapper />
          </div>
        ) : activeTab === "disparador" ? (
          <div>
            <DisparadorWrapper />
          </div>
        ) : activeTab === "ia" ? (
          <div>
            <IAWrapper />
          </div>
        ) : activeTab === "behavior" ? (
          <div>
            <BehaviorSettingsWrapper />
          </div>
        ) : (
          <div className="max-w-lg mx-auto py-4">
            <h2 className="text-2xl font-medium mb-6 text-center">
              Configuração de Acesso
            </h2>
            <ApiKeyForm />
            <div className="mt-6 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="font-medium mb-2">Sobre as Chaves de API</h3>
              <p className="mb-2">
                Sua chave de API é armazenada de forma segura no armazenamento
                local do seu navegador e é usada apenas para autenticar com o
                servidor Evolution API. Não armazenamos ou transmitimos sua
                chave de API para nossos servidores.
              </p>
              <p>
                Para a segurança, certifique-se de manter sua chave de API
                confidencial e apenas usá-la em dispositivos confiáveis.
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  useEffect(() => {
    const handleSetActiveTab = (event: CustomEvent<{ tab: string }>) => {
      if (event.detail && event.detail.tab) {
        setActiveTab(event.detail.tab);
      }
    };
    window.addEventListener(
      "setActiveTab",
      handleSetActiveTab as EventListener
    );
    return () => {
      window.removeEventListener(
        "setActiveTab",
        handleSetActiveTab as EventListener
      );
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-8">
          <Header
            title="Evolution Manager"
            subtitle={
              user?.role === "admin"
                ? "Gerenciamento de instâncias"
                : "Gerenciamento da sua instâncias"
            }
            className="text-center sm:text-left mb-0"
          />
          <div className="flex justify-center items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm">
              <User size={16} />
              <span>{displayName}</span>
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-500 hover:bg-red-500/10"
              onClick={handleLogout}
              icon={<LogOut size={16} />}
            >
              Sair
            </Button>
          </div>
        </div>
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-800">
            <Tabs
              defaultValue="instances"
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="h-12 bg-transparent overflow-x-auto flex whitespace-nowrap scrollbar-none">
                <TabsTrigger
                  value="instances"
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Instâncias</span>
                </TabsTrigger>
                {user?.role === "admin" && isGlobalApiKey && (
                  <TabsTrigger
                    value="create"
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Criar Instância</span>
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="typebot"
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
                >
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">Typebot</span>
                </TabsTrigger>
                <TabsTrigger
                  value="webhook"
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
                >
                  <Webhook className="h-4 w-4" />
                  <span className="hidden sm:inline">Webhooks</span>
                </TabsTrigger>
                <TabsTrigger
                  value="disparador"
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Disparador</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ia"
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">IA</span>
                </TabsTrigger>
                <TabsTrigger
                  value="behavior"
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
                >
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Comportamento</span>
                </TabsTrigger>
                {user?.role === "admin" && (
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Configurações</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
          <div className="p-2 sm:p-4">{renderTabContent()}</div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
