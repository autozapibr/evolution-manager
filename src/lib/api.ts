import { toast } from "sonner";
import { DateTime } from "luxon";
import {
  ApiResponse,
  CreateInstancePayload,
  Instance,
  PresencePayload,
  QRCodeResponse,
  TypebotConfig,
  TypebotStartPayload,
  WebhookConfig,
  License,
} from "./types";

// Interfaces para OpenAI
interface OpenAICredential {
  id: string;
  name: string;
  apiKey: string;
}

interface Chatbot {
  id: string;
  name: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
  status: string;
  remoteJid?: string;
}

interface BehaviorSettings {
  rejectCall: boolean;
  msgCall: string;
  groupsIgnore: boolean;
  alwaysOnline: boolean;
  readMessages: boolean;
  syncFullHistory: boolean;
  readStatus: boolean;
}

// Default API endpoint and key https://sua-evolution-api.com
export const DEFAULT_API_URL = "https://evo.autozapi.com";

// Helper to get API key from localStorage
export const getApiKey = (): string => {
  return localStorage.getItem("evolution_api_key") || "";
};

// Helper to set API key in localStorage
export const setApiKey = (apiKey: string): void => {
  localStorage.setItem("evolution_api_key", apiKey);
};

// Helper to get API URL from localStorage or use default
export const getApiUrl = (): string => {
  return localStorage.getItem("evolution_api_url") || DEFAULT_API_URL;
};

// Helper to set API URL in localStorage
export const setApiUrl = (url: string): void => {
  localStorage.setItem("evolution_api_url", url);
};

// Helper to clear API credentials when logging out
export const clearApiCredentials = (): void => {
  localStorage.removeItem("evolution_api_key");
  localStorage.removeItem("evolution_api_url");
};

// Base fetch with API key
const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();

  if (!apiKey) {
    toast.error("API Key Required", {
      description: "Please set your Evolution API key in settings",
    });
    return { status: 401, error: "API Key Required" };
  }

  const url = `${apiUrl}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    apikey: apiKey,
    ...options.headers,
  };

  try {
    console.log(`Fetching ${url} with method ${options.method || "GET"}`);
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      return {
        status: response.status,
        error: errorData.error || `Error: ${response.statusText}`,
        response: errorData.response,
      };
    }

    const data = await response.json();
    console.log("API Response Data:", data);
    return { response: data };
  } catch (error) {
    console.error("API Error:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// API Functions
export const fetchInstances = async (): Promise<Instance[]> => {
  const result = await apiFetch<Instance[]>("/instance/fetchInstances", {
    method: "GET",
  });

  const { response } = result;

  if (Array.isArray(response)) {
    return response;
  }

  // Se a resposta não for um array, retornar array vazio para evitar erros de renderização
  return [];
};

export const createInstance = async (
  payload: CreateInstancePayload
): Promise<ApiResponse> => {
  return await apiFetch("/instance/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const connectInstance = async (
  instanceName: string
): Promise<ApiResponse<QRCodeResponse>> => {
  return await apiFetch(`/instance/connect/${instanceName}`, {
    method: "GET",
  });
};

export const restartInstance = async (
  instanceName: string
): Promise<ApiResponse> => {
  return await apiFetch(`/instance/restart/${instanceName}`, {
    method: "POST",
  });
};

export const setPresence = async (
  instanceName: string,
  payload: PresencePayload
): Promise<ApiResponse> => {
  return await apiFetch(`/instance/setPresence/${instanceName}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getConnectionState = async (
  instanceName: string
): Promise<ApiResponse> => {
  return await apiFetch(`/instance/connectionState/${instanceName}`, {
    method: "GET",
  });
};

export const logoutInstance = async (
  instanceName: string
): Promise<ApiResponse> => {
  return await apiFetch(`/instance/logout/${instanceName}`, {
    method: "DELETE",
  });
};

export const deleteInstance = async (
  instanceName: string
): Promise<ApiResponse> => {
  console.log(`Deleting instance: ${instanceName}`);
  return await apiFetch(`/instance/delete/${instanceName}`, {
    method: "DELETE",
  });
};

export const getQRCode = async (
  instanceName: string
): Promise<ApiResponse<QRCodeResponse>> => {
  console.log(`Getting QR code for instance: ${instanceName}`);
  return await apiFetch(`/instance/qrcode/${instanceName}`, {
    method: "GET",
  });
};

// Typebot API Functions
export const createTypebot = async (
  instance: string,
  config: TypebotConfig
): Promise<ApiResponse> => {
  return await apiFetch(`/typebot/create/${instance}`, {
    method: "POST",
    body: JSON.stringify(config),
  });
};

export const findTypebot = async (
  instance: string
): Promise<ApiResponse<TypebotConfig[]>> => {
  return await apiFetch(`/typebot/find/${instance}`, {
    method: "GET",
  });
};

export const fetchTypebot = async (
  instance: string,
  typebotId: string
): Promise<ApiResponse<TypebotConfig>> => {
  return await apiFetch(`/typebot/fetch/${typebotId}/${instance}`, {
    method: "GET",
  });
};

export const updateTypebot = async (
  instance: string,
  typebotId: string,
  config: TypebotConfig
): Promise<ApiResponse> => {
  return await apiFetch(`/typebot/update/${typebotId}/${instance}`, {
    method: "PUT",
    body: JSON.stringify(config),
  });
};

export const deleteTypebot = async (
  instance: string,
  typebotId: string
): Promise<ApiResponse> => {
  return await apiFetch(`/typebot/delete/${typebotId}/${instance}`, {
    method: "DELETE",
  });
};

export const startTypebot = async (
  instance: string,
  payload: TypebotStartPayload
): Promise<ApiResponse> => {
  return await apiFetch(`/typebot/start/${instance}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const findAllTypebots = async (
  instance: string
): Promise<ApiResponse<TypebotConfig[]>> => {
  return await apiFetch(`/typebot/find-all/${instance}`, {
    method: "GET",
  });
};

// Webhook API Functions
export const setWebhook = async (
  instance: string,
  config: { webhook: WebhookConfig }
): Promise<ApiResponse> => {
  return await apiFetch(`/webhook/set/${instance}`, {
    method: "POST",
    body: JSON.stringify(config),
  });
};

export const findWebhook = async (
  instance: string
): Promise<ApiResponse<{ webhook: WebhookConfig }>> => {
  return await apiFetch(`/webhook/find/${instance}`, {
    method: "GET",
  });
};

// OpenAI API Functions
export const findOpenAICredentials = async (
  instance: string
): Promise<ApiResponse<OpenAICredential[]>> => {
  return await apiFetch(`/openai/creds/${instance}`, {
    method: "GET",
  });
};

export const findOpenAICredentialById = async (
  instance: string,
  credentialId: string
): Promise<ApiResponse<OpenAICredential>> => {
  const response = await findOpenAICredentials(instance);

  if (response.error) {
    return { status: response.status, error: response.error };
  }

  const credentials = response.response || [];
  const credential = credentials.find(
    (cred: OpenAICredential) => cred.id === credentialId
  );

  if (!credential) {
    return { status: 404, error: "Credential not found" };
  }

  return { status: 200, response: credential };
};

export const createOpenAICredential = async (
  instance: string,
  credential: { name: string; apiKey: string }
): Promise<ApiResponse> => {
  return await apiFetch(`/openai/creds/${instance}`, {
    method: "POST",
    body: JSON.stringify(credential),
  });
};

export const updateOpenAICredential = async (
  instance: string,
  credentialId: string,
  credential: { name: string; apiKey: string }
): Promise<ApiResponse> => {
  // Corrected endpoint format
  return await apiFetch(`/openai/creds/${credentialId}/${instance}`, {
    method: "PUT",
    body: JSON.stringify(credential),
  });
};

export const deleteOpenAICredential = async (
  instance: string,
  credentialId: string
): Promise<ApiResponse> => {
  // Corrected endpoint format
  return await apiFetch(`/openai/creds/${credentialId}/${instance}`, {
    method: "DELETE",
  });
};

// Chatbot API Functions
export const findChatbots = async (
  instance: string
): Promise<ApiResponse<Chatbot[]>> => {
  return await apiFetch(`/openai/find/${instance}`, {
    method: "GET",
  });
};

export const findChatbotById = async (
  instance: string,
  chatbotId: string
): Promise<ApiResponse<Chatbot>> => {
  const response = await findChatbots(instance);

  if (response.error) {
    return { status: response.status, error: response.error };
  }

  const chatbots = response.response || [];
  const chatbot = chatbots.find((bot: Chatbot) => bot.id === chatbotId);

  if (!chatbot) {
    return { status: 404, error: "Chatbot not found" };
  }

  return { status: 200, response: chatbot };
};

export const createChatbot = async (
  instance: string,
  chatbot: Omit<Chatbot, "id">
): Promise<ApiResponse> => {
  return await apiFetch(`/openai/create/${instance}`, {
    method: "POST",
    body: JSON.stringify(chatbot),
  });
};

export const updateChatbot = async (
  instance: string,
  chatbotId: string,
  chatbot: Partial<Omit<Chatbot, "id">>
): Promise<ApiResponse> => {
  return await apiFetch(`/openai/update/${chatbotId}/${instance}`, {
    method: "PUT",
    body: JSON.stringify(chatbot),
  });
};

export const deleteChatbot = async (
  instance: string,
  chatbotId: string
): Promise<ApiResponse> => {
  // Updated endpoint format to match the API structure
  return await apiFetch(`/openai/delete/${chatbotId}/${instance}`, {
    method: "DELETE",
  });
};

export const changeChatbotStatus = async (
  instance: string,
  chatbotId: string,
  status: { status: string; remoteJid: string }
): Promise<ApiResponse> => {
  return await apiFetch(`/openai/changeStatus/${instance}`, {
    method: "POST",
    body: JSON.stringify({
      ...status,
      chatbotId,
    }),
  });
};

// Behavior Settings API Functions
export const findBehaviorSettings = async (
  instance: string
): Promise<ApiResponse<BehaviorSettings>> => {
  return await apiFetch(`/settings/find/${instance}`, {
    method: "GET",
  });
};

export const setBehaviorSettings = async (
  instance: string,
  settings: {
    rejectCall: boolean;
    msgCall: string;
    groupsIgnore: boolean;
    alwaysOnline: boolean;
    readMessages: boolean;
    syncFullHistory: boolean;
    readStatus: boolean;
  }
): Promise<ApiResponse> => {
  return await apiFetch(`/settings/set/${instance}`, {
    method: "POST",
    body: JSON.stringify(settings),
  });
};

// Sender API Functions
export interface SendTextPayload {
  number: string;
  text: string;
  delay?: number;
  scheduledAt?: string; // ISO string para agendamento
  quoted?: {
    key?: {
      id: string;
    };
    message?: {
      conversation: string;
    };
  };
  linkPreview?: boolean;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
}

export interface SendMediaPayload {
  number: string;
  mediatype: "image" | "video" | "document";
  mimetype: string;
  caption: string;
  media: string;
  fileName: string;
  delay?: number;
  scheduledAt?: string; // ISO string para agendamento
  quoted?: {
    key?: {
      id: string;
    };
    message?: {
      conversation: string;
    };
  };
  mentionsEveryOne?: boolean;
  mentioned?: string[];
}

export interface MessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  pushName: string;
  status: string;
  message: Record<string, unknown>;
  contextInfo: Record<string, unknown> | null;
  messageType: string;
  messageTimestamp: number;
  instanceId: string;
  source: string;
}

export const sendText = async (
  instance: string,
  payload: SendTextPayload
): Promise<ApiResponse<MessageResponse>> => {
  return await apiFetch(`/message/sendText/${instance}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const sendMedia = async (
  instance: string,
  payload: SendMediaPayload
): Promise<ApiResponse<MessageResponse>> => {
  return await apiFetch(`/message/sendMedia/${instance}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// Bulk Messaging Helper Functions
export const parseCsvContacts = (
  csvContent: string
): { number: string; [key: string]: string }[] => {
  try {
    // Função auxiliar para parsear uma linha CSV considerando campos com aspas
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          // Toggle estado de "dentro de aspas"
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          // Vírgula fora de aspas é um separador
          result.push(current.trim());
          current = "";
        } else {
          // Adicionar caractere ao campo atual
          current += char;
        }
      }

      // Adicionar o último campo
      result.push(current.trim());
      return result;
    };

    // Verificar se o conteúdo CSV tem aspas nas mensagens, caso não tenha, adicioná-las
    let fixedCsvContent = csvContent;

    // Identificar as linhas
    const lines = fixedCsvContent.split("\n");

    // Extrair cabeçalhos
    const headers = parseCSVLine(lines[0]);

    // Encontrar o índice da coluna 'mensagem'
    const msgIndex = headers.findIndex((h) => h.trim() === "mensagem");

    // Verificar se o conteúdo precisa ser corrigido
    if (msgIndex !== -1) {
      // Criar linhas corrigidas
      const fixedLines = [lines[0]]; // Primeiro os cabeçalhos

      // Para cada linha de dados
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "") continue;

        // Dividir a linha nos primeiros N campos (onde N é o índice da coluna mensagem + 1)
        const parts = lines[i].split(",");

        if (parts.length > msgIndex + 1) {
          // Os primeiros campos (exceto mensagem)
          const firstParts = parts.slice(0, msgIndex).join(",");
          // O campo de mensagem e tudo que vier depois (potencialmente com vírgulas)
          const messageAndRest = parts.slice(msgIndex).join(",");

          // Se a mensagem não estiver entre aspas, colocá-la
          let fixedMessage = messageAndRest;
          if (
            !messageAndRest.startsWith('"') &&
            !messageAndRest.endsWith('"')
          ) {
            fixedMessage = `"${messageAndRest}"`;
          }

          // Reconstruir a linha
          fixedLines.push(`${firstParts},${fixedMessage}`);
        } else {
          // Se a linha não tiver campos suficientes, apenas incluí-la como está
          fixedLines.push(lines[i]);
        }
      }

      // Reconstruir o CSV com as linhas corrigidas
      fixedCsvContent = fixedLines.join("\n");
    }

    // Agora realizar o parsing com o conteúdo corrigido
    const correctedLines = fixedCsvContent.split("\n");
    const correctedHeaders = parseCSVLine(correctedLines[0]);

    // Garantir que os cabeçalhos incluam 'number'
    if (!correctedHeaders.includes("number")) {
      throw new Error("CSV deve ter uma coluna 'number'");
    }

    // Analisar linhas
    const contacts = correctedLines
      .slice(1)
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const values = parseCSVLine(line);
        const contact: { [key: string]: string } = {};

        correctedHeaders.forEach((header, index) => {
          let value = values[index] || "";
          // Remover aspas do início e fim, se presentes
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          contact[header] = value;
        });

        // Garantir que cada contato tenha um campo number
        if (!contact.number) {
          contact.number = ""; // Atribuir string vazia como fallback
        }

        return contact as { number: string; [key: string]: string };
      });

    return contacts;
  } catch (error) {
    console.error("Erro ao analisar CSV:", error);
    return [];
  }
};

export const getCsvTemplate = (): string => {
  return 'number,nome,data,valor,mensagem\n5511999999999,João,01/05/2024,R$ 100;00,"Olá {nome}, seu pagamento de *{valor}* vence em {data}.n/n/Entre em contato para _regularizar_ sua situação."\n5511999999991,Maria,02/05/2024,R$ 150;00,"*AVISO IMPORTANTE*n/n/Prezada {nome}, seu pagamento no valor de {valor} vence em {data}.n/Favor desconsiderar se já efetuou."';
};

export const scheduleMessage = async (
  payload: SendTextPayload | SendMediaPayload,
  type: "text" | "media",
  scheduledAt: Date
): Promise<void> => {
  try {
    // Converter a data do JS para DateTime do Luxon, já setando o timezone de São Paulo
    const scheduledTime =
      DateTime.fromJSDate(scheduledAt).setZone("America/Sao_Paulo");

    // Armazenar mensagem agendada no localStorage
    const scheduledMessages = getScheduledMessages();

    scheduledMessages.push({
      id: `scheduled_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`,
      payload: {
        ...payload,
        scheduledAt: scheduledTime.toISO(), // formato ISO com timezone
      },
      type,
      scheduledAt: scheduledTime.toISO(),
      status: "pending",
    });

    localStorage.setItem(
      "scheduled_messages",
      JSON.stringify(scheduledMessages)
    );

    // Disparar evento para atualizar componentes
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    console.error("Erro ao agendar mensagem:", error);
    throw error;
  }
};

// Interface para mensagens agendadas
export interface ScheduledMessage {
  id: string;
  payload: SendTextPayload | SendMediaPayload;
  type: "text" | "media";
  scheduledAt: string;
  status: "pending" | "sent" | "failed";
  error?: string;
}

// Funções para gerenciar mensagens agendadas
export const getScheduledMessages = (): ScheduledMessage[] => {
  const stored = localStorage.getItem("scheduled_messages");
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Erro ao analisar mensagens agendadas:", error);
    return [];
  }
};

export const removeScheduledMessage = (id: string): void => {
  const messages = getScheduledMessages();
  const updated = messages.filter((msg) => msg.id !== id);
  localStorage.setItem("scheduled_messages", JSON.stringify(updated));

  // Disparar evento para atualizar componentes
  window.dispatchEvent(new Event("storage"));
};

export const processScheduledMessages = async (): Promise<void> => {
  const messages = getScheduledMessages();
  const now = DateTime.now().setZone("America/Sao_Paulo");
  let updated = false;

  for (const message of messages) {
    if (message.status !== "pending") continue;

    const scheduledTime = DateTime.fromISO(message.scheduledAt).setZone(
      "America/Sao_Paulo"
    );

    if (scheduledTime <= now) {
      // Hora de enviar a mensagem
      try {
        const payload = message.payload as (
          | SendTextPayload
          | SendMediaPayload
        ) & { instance?: string };
        const instance = payload.instance || "";

        if (!instance) {
          throw new Error("Instance name not provided in scheduled message");
        }

        let response;

        if (message.type === "text") {
          response = await sendText(
            instance,
            message.payload as SendTextPayload
          );
        } else {
          response = await sendMedia(
            instance,
            message.payload as SendMediaPayload
          );
        }

        // Atualizar status da mensagem
        message.status = response.error ? "failed" : "sent";
        if (response.error) {
          message.error = response.error;
        }

        updated = true;
      } catch (error) {
        console.error("Erro ao processar mensagem agendada:", error);
        message.status = "failed";
        message.error =
          error instanceof Error ? error.message : "Erro desconhecido";
        updated = true;
      }
    }
  }

  if (updated) {
    localStorage.setItem("scheduled_messages", JSON.stringify(messages));
    window.dispatchEvent(new Event("storage"));
  }
};

// Atualizar a função initScheduledMessageProcessor para usar Luxon
export const initScheduledMessageProcessor = (): number => {
  // Iniciar um intervalo para verificar mensagens agendadas a cada 30 segundos
  const intervalId = window.setInterval(async () => {
    // Para fins de depuração
    console.log(
      "Verificando mensagens agendadas em:",
      DateTime.now().setZone("America/Sao_Paulo").toFormat("HH:mm:ss")
    );

    try {
      await processScheduledMessages();
    } catch (error) {
      console.error("Erro ao processar mensagens agendadas:", error);
    }
  }, 30000); // 30 segundos

  // Executar imediatamente na inicialização
  setTimeout(async () => {
    try {
      await processScheduledMessages();
    } catch (error) {
      console.error("Erro ao processar mensagens agendadas (inicial):", error);
    }
  }, 1000);

  return intervalId;
};

// Formatar data para exibição no timezone de São Paulo
export const formatScheduledDateBR = (isoString: string): string => {
  // Usar Luxon para formatar o ISO string no formato brasileiro
  return DateTime.fromISO(isoString)
    .setZone("America/Sao_Paulo")
    .setLocale("pt-BR")
    .toFormat("dd/MM/yyyy HH:mm");
};

export interface ContactInfo {
  pushname?: string;
  number: string;
  name?: string;
  businessProfile?: {
    description?: string;
    email?: string;
    websites?: string[];
    address?: string;
    latitude?: number;
    longitude?: number;
    profilePictureUrl?: string;
  };
  isGroup?: boolean;
  // Outros campos que possam ser retornados pela API
}

/**
 * Obtém informações de um contato do WhatsApp
 * @param instance Nome da instância
 * @param phoneNumber Número do telefone (com código do país)
 * @returns Informações do contato, incluindo pushname
 */
export const getContactInfo = async (
  instance: string,
  phoneNumber: string
): Promise<ApiResponse<ContactInfo>> => {
  // Garantir que o número esteja formatado corretamente (com código do país)
  let formattedNumber = phoneNumber;
  if (!phoneNumber.includes("@")) {
    // Remover caracteres não numéricos
    formattedNumber = phoneNumber.replace(/\D/g, "");
    // Adicionar o código do país se não existir
    if (!formattedNumber.startsWith("55") && formattedNumber.length < 13) {
      formattedNumber = `55${formattedNumber}`;
    }
  }

  return await apiFetch<ContactInfo>(`/chat/fetchContact/${instance}`, {
    method: "POST",
    body: JSON.stringify({ number: formattedNumber }),
  });
};

// Group interfaces
export interface Group {
  id: string;
  subject: string;
  subjectOwner: string;
  subjectTime: number;
  pictureUrl: string | null;
  size: number;
  creation: number;
  owner: string;
  desc: string;
  descId: string;
  restrict: boolean;
  announce: boolean;
  isCommunity: boolean;
  isCommunityAnnounce: boolean;
}

export const fetchGroups = async (
  instance: string
): Promise<ApiResponse<Group[]>> => {
  return await apiFetch(
    `/group/fetchAllGroups/${instance}?getParticipants=false`,
    {
      method: "GET",
    }
  );
};
