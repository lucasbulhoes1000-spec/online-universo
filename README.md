# Universo das Lentes — Funil (Método Bulhões)

Página de vendas em HTML/CSS/JS puro (sem frameworks, sem CDN), com pop-up de captura
de lead antes do checkout.

## Como abrir localmente

Basta abrir o `index.html` no navegador. Ou, se preferir um servidor local:

```bash
npx serve .
```

## Estrutura de arquivos

```
index.html       → conteúdo da página (a copy que você mandou, estruturada em seções)
styles.css       → todo o visual (cores, tipografia, layout, modal)
flow.js          → configuração: campos do pop-up, URL de checkout, URL de webhook
app.js           → motor: abre/fecha pop-up, valida, salva o lead, dispara tracking
privacidade.html → rascunho de política de privacidade (revisar com jurídico)
```

## ⚠️ Antes de publicar — o que falta configurar

1. **VSL**: no `index.html`, procure o comentário `<!-- VSL: substitua o bloco abaixo -->`
   e troque pelo embed real do seu player (Vturb, Panda Video, YouTube não-listado etc).
2. **Fotos e provas sociais**: os blocos `.proof-card__media` e `.author-photo` estão
   com um placeholder cinza-gradiente. Troque por `<img src="...">` reais quando tiver
   as fotos/depoimentos.
3. **URL do checkout**: abra `flow.js` e preencha `checkoutUrl`. Enquanto estiver vazia,
   o formulário salva o lead mas mostra uma mensagem de confirmação em vez de redirecionar.
4. **Webhook (opcional)**: se quiser enviar o lead automaticamente para um CRM, planilha
   ou Zapier/Make, preencha `webhookUrl` em `flow.js`. Enquanto vazio, o lead fica só no
   `sessionStorage` do navegador (você pediu para deixar assim por enquanto).

## Como personalizar

- **Cores**: no topo do `index.html`, dentro do `<style>`, e no topo do `styles.css`,
  estão as variáveis `--charcoal`, `--porcelain`, `--bronze` etc. Troque os valores hex.
- **Textos**: edite diretamente as seções do `index.html` — a copy é a que você mandou,
  sem alterações de conteúdo.
- **Campos do formulário**: edite o array `fields` em `flow.js` e os campos
  correspondentes no `<form id="leadForm">` do `index.html`.

## Como adicionar tracking (GA4 / Meta Pixel)

Abra `app.js` e preencha `TRACKING_CONFIG` no topo:

```js
const TRACKING_CONFIG = {
  ga4_id: 'G-XXXXXXXXXX',
  meta_pixel_id: '1234567890',
  custom_webhook: FLOW_CONFIG.webhookUrl || '',
};
```

Sem isso preenchido, todos os eventos (`page_view`, `funnel_start`, `step_view`,
`field_error`, `funnel_complete`, `funnel_abandon`) aparecem só no console do navegador
(F12 → Console) — ótimo para testar antes de conectar ferramentas de verdade.

## Recuperar leads que abandonaram o checkout

Como o pop-up salva no `sessionStorage`, você consegue identificar (no navegador do
próprio usuário, durante a sessão) quem preencheu os dados mas não finalizou. Para um
histórico persistente entre sessões e visitantes, você vai precisar do webhook (item 4
acima) apontando para uma planilha, CRM ou banco de dados.
