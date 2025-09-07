import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/ui-custom/Button";
import { toast } from "sonner";
import { Send, AlertCircle, Calendar } from "lucide-react";
import { sendText, sendMedia, scheduleMessage } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DisparadorUnicoProps {
  instance: string;
  onSuccess?: () => void;
}

const DisparadorUnico = ({ instance, onSuccess }: DisparadorUnicoProps) => {
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
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
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    undefined
  );
  const [scheduledTime, setScheduledTime] = useState("12:00");

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
  const getScheduledDateTime = (): Date | null => {
    if (!isScheduled || !scheduledDate) return null;

    const [hours, minutes] = scheduledTime.split(":").map(Number);
    const dateTime = new Date(scheduledDate);
    dateTime.setHours(hours, minutes, 0, 0);

    return dateTime;
  };

  const handleSubmit = async () => {
    // Validações
    if (!number.trim()) {
      toast.error("Número inválido", {
        description: "Por favor, informe um número de telefone válido.",
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
      const dateTime = getScheduledDateTime();

      if (!dateTime) {
        toast.error("Data inválida", {
          description:
            "Por favor, selecione uma data e hora válidas para o agendamento.",
        });
        return;
      }

      const now = new Date();
      if (dateTime <= now) {
        toast.error("Data inválida", {
          description: "A data de agendamento deve ser no futuro.",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Preparar payload de acordo com o tipo de mensagem
      if (messageType === "text") {
        const payload = {
          number: number.trim(),
          text: message,
          instance,
        };

        if (isScheduled) {
          const scheduledDateTime = getScheduledDateTime();
          if (scheduledDateTime) {
            await scheduleMessage(payload, "text", scheduledDateTime);
            toast.success("Mensagem agendada", {
              description: `A mensagem será enviada em ${format(
                scheduledDateTime,
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR }
              )}`,
            });
          }
        } else {
          const response = await sendText(instance, payload);

          if (response.error) {
            toast.error("Erro ao enviar mensagem", {
              description: response.error,
            });
          } else {
            toast.success("Mensagem enviada", {
              description: "A mensagem foi enviada com sucesso.",
            });
          }
        }
      } else {
        const payload = {
          number: number.trim(),
          mediatype: mediaType,
          mimetype: getMimeType(),
          caption: mediaCaption,
          media: mediaUrl,
          fileName: getFileName(),
          instance,
        };

        if (isScheduled) {
          const scheduledDateTime = getScheduledDateTime();
          if (scheduledDateTime) {
            await scheduleMessage(payload, "media", scheduledDateTime);
            toast.success("Mensagem agendada", {
              description: `A mensagem será enviada em ${format(
                scheduledDateTime,
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR }
              )}`,
            });
          }
        } else {
          const response = await sendMedia(instance, payload);

          if (response.error) {
            toast.error("Erro ao enviar mensagem", {
              description: response.error,
            });
          } else {
            toast.success("Mensagem enviada", {
              description: "A mensagem foi enviada com sucesso.",
            });
          }
        }
      }

      // Limpar o formulário após o envio
      setNumber("");
      setMessage("");
      setMediaUrl("");
      setMediaCaption("");
      setMediaFileName("");
      setIsScheduled(false);
      setScheduledDate(undefined);
      setScheduledTime("12:00");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Erro no envio", {
        description: "Ocorreu um erro ao tentar enviar a mensagem.",
      });
      console.error("Erro no envio:", error);
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
          específico. Para envios em massa, utilize a aba "Novo Disparo".
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
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
            />
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

        {/* Seção de agendamento */}
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
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <ShadcnButton
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {scheduledDate ? (
                        format(scheduledDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </ShadcnButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
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
