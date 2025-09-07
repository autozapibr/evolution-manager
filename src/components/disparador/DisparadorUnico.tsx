import { useState, useRef, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Button from "@/components/ui-custom/Button";
import { toast } from "sonner";
import {
  Upload,
  FileType,
  File,
  Send,
  AlertCircle,
  Calendar,
  Plus,
  Image,
  Clock,
  Tag,
  Users,
} from "lucide-react";
import {
  sendText,
  sendMedia,
  scheduleMessage,
  getContactInfo,
  fetchGroups,
  Group,
} from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { DateTime } from "luxon";
import { cn } from "@/lib/utils";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { pt } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

// Registrar localização brasileira
registerLocale("pt-BR", pt);

interface DisparadorUnicoProps {
  instance: string;
  onSuccess?: () => void;
}

const DisparadorUnico = ({ instance, onSuccess }: DisparadorUnicoProps) => {
  const [destinationType, setDestinationType] = useState<"contact" | "group">(
    "contact"
  );
  const [number, setNumber] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [message, setMessage] = useState("");
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [messageType, setMessageType] = useState<"text" | "media">("text");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "document">(
    "image"
  );
  const [mediaFileName, setMediaFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos para agendamento
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState("12:00");

  // Lista de variáveis disponíveis
  const variables = [
    { id: "nome", label: "Nome", value: "{{nome}}" },
    { id: "telefone", label: "Telefone", value: "{{telefone}}" },
    { id: "data", label: "Data", value: "{{data}}" },
    { id: "empresa", label: "Empresa", value: "{{empresa}}" },
    { id: "saudacao", label: "Saudação", value: "{{saudacao}}" },
  ];

  // Fetch groups
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["groups", instance],
    queryFn: async () => {
      try {
        const response = await fetchGroups(instance);
        // Garantir que sempre retornamos um array
        return Array.isArray(response?.response) ? response.response : [];
      } catch (error) {
        console.error("Erro ao buscar grupos:", error);
        return [];
      }
    },
    enabled: destinationType === "group", // Only fetch when group type is selected
  });

  // Função para inserir variável na posição do cursor
  const insertVariable = (variable: string) => {
    if (messageRef.current) {
      const textarea = messageRef.current;
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;

      const newMessage =
        message.substring(0, startPos) + variable + message.substring(endPos);

      setMessage(newMessage);

      // Foco no textarea após inserir a variável
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          startPos + variable.length,
          startPos + variable.length
        );
      }, 0);
    } else {
      // Se não conseguir acessar a referência, apenas adiciona ao final
      setMessage(message + variable);
    }
  };

  const getMimeType = () => {
    switch (mediaType) {
      case "image":
        return "image/jpeg";
      case "video":
        return "video/mp4";
      case "document":
        return "application/pdf";
      default:
        return "image/jpeg";
    }
  };

  const getFileName = () => {
    if (mediaFileName) return mediaFileName;

    const extension =
      mediaType === "image" ? ".jpg" : mediaType === "video" ? ".mp4" : ".pdf";

    return `arquivo${extension}`;
  };

  // Função para obter a data/hora agendada completa
  const getScheduledDateTime = (): DateTime | null => {
    if (!isScheduled || !scheduledDate) return null;

    // Obter as horas e minutos do formato HH:mm
    const [hours, minutes] = scheduledTime.split(":").map(Number);

    // Criar um clone da data e configurar hora/minutos
    const dateWithTime = new Date(scheduledDate);
    dateWithTime.setHours(hours, minutes, 0, 0);

    // Converter para DateTime do Luxon com timezone
    return DateTime.fromJSDate(dateWithTime, {
      zone: "America/Sao_Paulo",
    }).setLocale("pt-BR");
  };

  // Modificar a função processMessage para processar formatações especiais
  const processMessage = async (template: string): Promise<string> => {
    let processed = template;

    // Obter a data atual formatada com Luxon
    const today = DateTime.now().setLocale("pt-BR").toFormat("dd/MM/yyyy");

    // Determinar saudação com base na hora do dia
    const hour = DateTime.now().hour;
    let saudacao = "Bom dia";
    if (hour >= 12 && hour < 18) {
      saudacao = "Boa tarde";
    } else if (hour >= 18) {
      saudacao = "Boa noite";
    }

    // Tentar obter as informações de contato reais do WhatsApp
    let pushname = "Cliente"; // Valor padrão
    try {
      const contactInfo = await getContactInfo(instance, number);
      if (contactInfo.response && contactInfo.response.pushname) {
        pushname = contactInfo.response.pushname;
      }
    } catch (error) {
      console.error(`Erro ao obter informações do contato ${number}:`, error);
    }

    // Mapa de variáveis para substituição
    const variableMap: Record<string, string> = {
      "{{nome}}": pushname,
      "{{telefone}}": number,
      "{{data}}": today,
      "{{empresa}}": instance,
      "{{saudacao}}": saudacao,
    };

    // Substituir todas as variáveis no texto
    for (const [variable, value] of Object.entries(variableMap)) {
      processed = processed.replace(new RegExp(variable, "g"), value);
    }

    // Processar quebras de linha personalizadas (n/) -> transformar em quebra de linha real
    processed = processed.replace(/n\//g, "\n");

    // As formatações *texto* para negrito e _texto_ para itálico são mantidas
    // porque o WhatsApp interpreta corretamente essas marcações

    return processed;
  };

  const handleSubmit = async () => {
    // Validações
    if (destinationType === "contact" && !number.trim()) {
      toast.error("Número inválido", {
        description: "Por favor, informe um número de telefone válido.",
      });
      return;
    }

    if (destinationType === "group" && !selectedGroupId) {
      toast.error("Grupo inválido", {
        description: "Por favor, selecione um grupo para enviar a mensagem.",
      });
      return;
    }

    if (messageType === "text" && !message.trim()) {
      toast.error("Mensagem inválida", {
        description: "Por favor, digite uma mensagem para enviar.",
      });
      return;
    }

    if (messageType === "media") {
      if (!mediaUrl.trim()) {
        toast.error("URL de mídia inválida", {
          description: "Por favor, informe a URL da mídia para enviar.",
        });
        return;
      }

      if (!mediaFileName && mediaType === "document") {
        toast.error("Nome do arquivo inválido", {
          description:
            "Por favor, informe um nome para o arquivo a ser enviado.",
        });
        return;
      }
    }

    // Verificar agendamento
    if (isScheduled) {
      const scheduledDateTime = getScheduledDateTime();

      if (!scheduledDateTime) {
        toast.error("Data inválida", {
          description:
            "Por favor, selecione uma data e hora válidas para o agendamento.",
        });
        return;
      }

      // Obter a data atual no timezone de São Paulo
      const now = DateTime.now().setZone("America/Sao_Paulo");

      // Comparar apenas o timestamp das datas
      if (scheduledDateTime.toMillis() <= now.toMillis()) {
        toast.error("Horário inválido", {
          description: "O horário de agendamento deve ser no futuro.",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const destinationNumber =
        destinationType === "group" ? selectedGroupId : number.trim();

      if (messageType === "text") {
        // Processar o texto com as variáveis substituídas
        const processedText = await processMessage(message);

        const payload = {
          number: destinationNumber,
          text: processedText,
          instance,
        };

        if (isScheduled) {
          const scheduledDateTime = getScheduledDateTime();
          if (scheduledDateTime) {
            await scheduleMessage(
              payload,
              "text",
              scheduledDateTime.toJSDate()
            );
            toast.success("Mensagem Agendada", {
              description: `Mensagem de texto agendada para ${scheduledDateTime.toFormat(
                "dd/MM/yyyy 'às' HH:mm"
              )}`,
            });
          }
        } else {
          const response = await sendText(instance, payload);
          if (response.error) {
            toast.error("Erro ao Enviar", {
              description: response.error,
            });
          } else {
            toast.success("Mensagem Enviada", {
              description: "Mensagem de texto enviada com sucesso!",
            });
          }
        }
      } else {
        // Processar o caption com as variáveis substituídas
        const processedCaption = await processMessage(mediaCaption);

        const payload = {
          number: destinationNumber,
          mediatype: mediaType,
          mimetype: getMimeType(),
          caption: processedCaption,
          media: mediaUrl,
          fileName: getFileName(),
          instance,
        };

        if (isScheduled) {
          const scheduledDateTime = getScheduledDateTime();
          if (scheduledDateTime) {
            await scheduleMessage(
              payload,
              "media",
              scheduledDateTime.toJSDate()
            );
            toast.success("Mensagem Agendada", {
              description: `Mensagem de mídia agendada para ${scheduledDateTime.toFormat(
                "dd/MM/yyyy 'às' HH:mm"
              )}`,
            });
          }
        } else {
          const response = await sendMedia(instance, payload);
          if (response.error) {
            toast.error("Erro ao Enviar", {
              description: response.error,
            });
          } else {
            toast.success("Mensagem Enviada", {
              description: "Mensagem de mídia enviada com sucesso!",
            });
          }
        }
      }

      // Limpar o formulário apenas se não for agendado
      if (!isScheduled) {
        setNumber("");
        setSelectedGroupId("");
        setMessage("");
        setMediaUrl("");
        setMediaCaption("");
        setMediaFileName("");
        setIsScheduled(false);
        setScheduledDate(new Date());
        setScheduledTime("12:00");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro Inesperado", {
        description: "Ocorreu um erro ao enviar a mensagem. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Envio Único</AlertTitle>
        <AlertDescription>
          Esta função permite enviar uma única mensagem para um número
          específico ou grupo. Para envios em massa, utilize a aba "Novo
          Disparo".
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Tipo de Destinatário</Label>
          <Select
            value={destinationType}
            onValueChange={(value) =>
              setDestinationType(value as "contact" | "group")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de destinatário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contact">Contato Individual</SelectItem>
              <SelectItem value="group">Grupo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {destinationType === "contact" ? (
          <div className="space-y-2">
            <Label htmlFor="number">Número do Destinatário</Label>
            <Input
              id="number"
              placeholder="Ex: 5511999999999"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Digite o número com código do país, sem espaços ou caracteres
              especiais.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="group">Grupo</Label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingGroups ? (
                  <SelectItem value="loading" disabled>
                    Carregando grupos...
                  </SelectItem>
                ) : groups.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Nenhum grupo encontrado
                  </SelectItem>
                ) : (
                  groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{group.subject}</span>
                        <span className="text-xs text-muted-foreground">
                          ({group.size} membros)
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedGroupId && (
              <div className="text-xs text-muted-foreground">
                {groups.find((g) => g.id === selectedGroupId)?.desc ||
                  "Sem descrição"}
              </div>
            )}
            {groups.length === 0 && !isLoadingGroups && (
              <p className="text-xs text-muted-foreground mt-1">
                Verifique se a instância está conectada e tente novamente.
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Tipo de Mensagem</Label>
          <Select
            value={messageType}
            onValueChange={(value) => setMessageType(value as "text" | "media")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de mensagem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="media">
                Mídia (Imagem, Vídeo, Documento)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {messageType === "text" ? (
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem de Texto</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem aqui..."
              className="min-h-[120px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              ref={messageRef}
            />

            <div className="mt-2">
              <Label className="flex items-center gap-2 mb-2 text-sm">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Variáveis Disponíveis (clique para adicionar)
              </Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {variables.map((variable) => (
                  <button
                    key={variable.id}
                    type="button"
                    onClick={() => insertVariable(variable.value)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-xs text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {variable.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="mediaType">Tipo de Mídia</Label>
              <Select
                value={mediaType}
                onValueChange={(value) =>
                  setMediaType(value as "image" | "video" | "document")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de mídia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Imagem</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaUrl">URL da Mídia</Label>
              <Input
                id="mediaUrl"
                placeholder="https://exemplo.com/imagem.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Insira a URL da{" "}
                {mediaType === "image"
                  ? "imagem"
                  : mediaType === "video"
                  ? "vídeo"
                  : "documento"}{" "}
                que deseja enviar
              </p>
            </div>

            {mediaType === "document" && (
              <div className="space-y-2">
                <Label htmlFor="fileName">Nome do Arquivo</Label>
                <Input
                  id="fileName"
                  placeholder="documento.pdf"
                  value={mediaFileName}
                  onChange={(e) => setMediaFileName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mediaCaption">Legenda</Label>
              <Textarea
                id="mediaCaption"
                placeholder="Digite a legenda aqui..."
                className="min-h-[80px]"
                value={mediaCaption}
                onChange={(e) => setMediaCaption(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Seção de agendamento com input de data simples */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="isScheduled"
              checked={isScheduled}
              onCheckedChange={setIsScheduled}
            />
            <Label htmlFor="isScheduled" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Agendar Envio
            </Label>
          </div>

          {isScheduled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Data</Label>
                <div className="relative">
                  <DatePicker
                    selected={scheduledDate}
                    onChange={(date: Date | null) =>
                      date && setScheduledDate(date)
                    }
                    locale="pt-BR"
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    showPopperArrow={false}
                    wrapperClassName="w-full"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecione uma data (incluindo hoje)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Hora</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Horário de Brasília (GMT-3)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            type="button"
            className="w-full sm:w-auto"
            icon={
              isScheduled ? (
                <Calendar className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )
            }
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isScheduled ? "Agendar Mensagem" : "Enviar Mensagem"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisparadorUnico;
