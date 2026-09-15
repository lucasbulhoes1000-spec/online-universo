/* ============================================
   flow.js — configuração do funil
   Edite este arquivo para trocar textos, campos,
   destino do lead e URL de checkout.
   ============================================ */

const FLOW_CONFIG = {

  // Campos do pop-up de captura (antes do checkout).
  // Para adicionar um campo novo, copie um bloco e ajuste os valores.
  fields: [
    { id: "nome",     label: "Nome completo", type: "text",  required: true, minLength: 3 },
    { id: "email",    label: "E-mail",        type: "email", required: true },
    { id: "whatsapp", label: "WhatsApp",      type: "tel",   required: true, minLength: 8 },
  ],

  // ATENÇÃO: cole aqui a URL do checkout quando ela existir.
  // Enquanto estiver vazia, o formulário salva os dados e mostra
  // uma mensagem de confirmação em vez de redirecionar.
  checkoutUrl: "",

  // Opcional: URL de um webhook (Zapier, Make, CRM, planilha, etc.)
  // para receber os leads em tempo real. Deixe vazio para não enviar.
  // Você pediu para NÃO integrar isso ainda — está pronto, só falta a URL.
  webhookUrl: "",
};
