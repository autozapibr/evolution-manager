import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { router } from "./router";

// Interface para estender o objeto Window com nossa propriedade customizada
interface CustomWindow extends Window {
  initialPath?: string;
}

// Verificar se há algum caminho inicial fornecido pelo PHP
const customWindow = window as CustomWindow;
const initialPath = customWindow.initialPath;

// Se houver, configurar o router para iniciar nesse caminho
if (initialPath) {
  console.log("Inicializando com rota fornecida:", initialPath);
  // A rota será usada pelo RouterProvider automaticamente
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>
);
