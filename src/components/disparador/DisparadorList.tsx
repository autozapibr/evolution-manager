import { useState, useEffect } from "react";
import { toast } from "sonner";
import Card from "../ui-custom/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Send,
  Clock,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Trash,
} from "lucide-react";
import Button from "../ui-custom/Button";
import DisparadorForm from "./DisparadorForm";
import DisparadorUnico from "./DisparadorUnico";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getScheduledMessages,
  removeScheduledMessage,
  formatScheduledDateBR,
  ScheduledMessage,
  SendTextPayload,
  SendMediaPayload,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface DisparadorListProps {
  instance: string;
  onRefresh?: () => void;
}

const DisparadorList = ({ instance, onRefresh }: DisparadorListProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "info" | "unico" | "massa" | "agendados"
  >("info");
  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledMessage[]
  >([]);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  // Carregar mensagens agendadas
  useEffect(() => {
    const loadScheduledMessages = () => {
      const allMessages = getScheduledMessages();
      // Filtrar apenas as mensagens para esta instância
      const instanceMessages = allMessages.filter((msg) => {
        const payload = msg.payload as (SendTextPayload | SendMediaPayload) & {
          instance?: string;
        };
        return payload.instance === instance;
      });
      setScheduledMessages(instanceMessages);
    };

    loadScheduledMessages();

    // Atualizar quando houver mudanças no localStorage
    const handleStorageChange = () => {
      loadScheduledMessages();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [instance]);

  const handleSuccessfulDisparo = () => {
    setIsCreating(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleRemoveScheduledMessage = (id: string) => {
    // Marcar a mensagem para confirmar exclusão
    setMessageToDelete(id);
  };

  const confirmDelete = (id: string) => {
    // Realizar a remoção
    removeScheduledMessage(id);

    // Atualizar a lista local
    setScheduledMessages((prev) => prev.filter((msg) => msg.id !== id));

    // Limpar o ID
    setMessageToDelete(null);

    // Notificar o usuário
    toast.success("Mensagem removida", {
      description: "A mensagem foi removida com sucesso da lista.",
    });
  };

  const cancelDelete = () => {
    // Apenas limpar o ID para cancelar a exclusão
    setMessageToDelete(null);
  };

  if (isCreating) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Novo Disparo</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(false)}
            className="flex items-center gap-1"
          >
            Cancelar
          </Button>
        </div>
        <DisparadorForm
          instance={instance}
          onSuccess={handleSuccessfulDisparo}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={selectedTab}
        onValueChange={(value) =>
          setSelectedTab(value as "info" | "unico" | "massa" | "agendados")
        }
      >
        <TabsList className="mb-4 flex whitespace-nowrap scrollbar-none">
          <TabsTrigger
            value="info"
            className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Informações</span>
          </TabsTrigger>
          <TabsTrigger
            value="unico"
            className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Envio Único</span>
          </TabsTrigger>
          <TabsTrigger
            value="massa"
            className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Envio em Massa</span>
          </TabsTrigger>
          <TabsTrigger
            value="agendados"
            className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none min-w-[40px] sm:min-w-fit px-3 sm:px-4"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Agendados</span>
            {scheduledMessages.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {scheduledMessages.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Informação</AlertTitle>
            <AlertDescription>
              Os disparos são processados imediatamente e não ficam armazenados
              em um histórico. Escolha entre envio único ou em massa nas abas
              disponíveis.
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 border border-border rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              Dicas para disparos em massa
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                • Utilize um delay adequado entre as mensagens para evitar
                bloqueios (recomendado: 3000ms).
              </li>
              <li>
                • Personalize as mensagens usando variáveis para maior
                engajamento.
              </li>
              <li>
                • Para contatos em massa, utilize a importação via CSV com os
                dados dos destinatários.
              </li>
              <li>
                • Evite enviar a mesma mensagem para muitos contatos em um curto
                período.
              </li>
              <li>
                • Teste o disparo com poucos números antes de fazer um envio
                maior.
              </li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="unico" className="mt-4">
          <Card className="p-6">
            <DisparadorUnico
              instance={instance}
              onSuccess={() => toast.success("Mensagem enviada com sucesso")}
            />
          </Card>
        </TabsContent>

        <TabsContent value="massa" className="mt-4">
          <Card className="p-8 flex flex-col items-center justify-center text-center gap-4">
            <Send className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-xl font-medium mb-1">
                Iniciar um novo disparo em massa
              </h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Envie mensagens para múltiplos contatos de uma vez com suporte a
                personalização por contato.
              </p>
              <Button
                icon={<Send className="h-4 w-4" />}
                onClick={() => setIsCreating(true)}
              >
                Criar Novo Disparo em Massa
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="agendados" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Mensagens Agendadas</h3>
            </div>

            {scheduledMessages.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">
                  Nenhuma mensagem agendada
                </h4>
                <p className="text-muted-foreground max-w-md mx-auto">
                  As mensagens agendadas aparecerão aqui. Você pode agendar
                  mensagens nas opções de envio único ou em massa.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledMessages.map((message) => {
                  const isText = message.type === "text";
                  const destinationNumber = message.payload.number;
                  const payload = message.payload as
                    | SendTextPayload
                    | SendMediaPayload;
                  const content = isText
                    ? (payload as SendTextPayload).text
                    : (payload as SendMediaPayload).caption ||
                      "Mensagem com mídia";

                  return (
                    <div
                      key={message.id}
                      className="border border-border rounded-lg p-4 relative hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {isText ? (
                              <MessageSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Send className="h-4 w-4 text-primary" />
                            )}
                            <span className="font-medium">
                              {isText
                                ? "Mensagem de Texto"
                                : "Mensagem com Mídia"}
                            </span>
                            <Badge
                              variant={
                                message.status === "pending"
                                  ? "outline"
                                  : message.status === "sent"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="ml-2"
                            >
                              {message.status === "pending"
                                ? "Pendente"
                                : message.status === "sent"
                                ? "Enviada"
                                : "Falhou"}
                            </Badge>
                          </div>

                          <div className="text-sm text-muted-foreground mb-2">
                            Agendada para:{" "}
                            {formatScheduledDateBR(message.scheduledAt)}
                          </div>

                          <div className="text-sm mb-1">
                            <span className="font-medium">Destinatário:</span>{" "}
                            {destinationNumber}
                          </div>

                          <div className="text-sm mt-2 line-clamp-2">
                            <span className="font-medium">Conteúdo:</span>{" "}
                            <span className="text-muted-foreground">
                              {content.length > 100
                                ? content.substring(0, 100) + "..."
                                : content}
                            </span>
                          </div>
                        </div>

                        {messageToDelete === message.id ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => confirmDelete(message.id)}
                              className="flex items-center gap-1"
                              size="sm"
                            >
                              <Trash className="h-3.5 w-3.5" />
                              Confirmar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={cancelDelete}
                              size="sm"
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleRemoveScheduledMessage(message.id)
                            }
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {message.error && (
                        <div className="mt-2 text-sm text-destructive">
                          <span className="font-medium">Erro:</span>{" "}
                          {message.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DisparadorList;
