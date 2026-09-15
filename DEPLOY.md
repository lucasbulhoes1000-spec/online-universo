# Como publicar

Este projeto é HTML/CSS/JS puro — funciona em qualquer hospedagem de site estático.
Escolha uma das opções abaixo.

## Netlify (mais simples)

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Arraste a pasta do projeto para a área de upload ("Deploy manually")
3. Pronto — a Netlify gera uma URL na hora

Via CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Vercel

```bash
npm install -g vercel
vercel --prod
```
Siga as instruções no terminal (aceite os padrões).

## Cloudflare Pages

1. Acesse o painel da Cloudflare → Pages → "Create a project"
2. Opção "Direct Upload" → arraste a pasta do projeto
3. Ou conecte um repositório GitHub para deploy automático a cada push

## GitHub Pages

```bash
git init
git add .
git commit -m "Universo das Lentes"
git branch -M gh-pages
git remote add origin <url-do-seu-repo>
git push -u origin gh-pages
```
Depois, em Settings → Pages, selecione a branch `gh-pages` como fonte.

## Amazon S3

1. Crie um bucket S3
2. Em "Properties" → "Static website hosting", ative e defina `index.html` como
   documento raiz
3. Faça upload de todos os arquivos do projeto
4. Ajuste a política do bucket para leitura pública (`s3:GetObject`)

## Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```
Quando o `firebase init` perguntar a pasta pública, aponte para a pasta deste projeto.

---

Em qualquer uma dessas opções, lembre de configurar `checkoutUrl` em `flow.js` **antes**
de divulgar o link — sem isso, o pop-up salva o lead mas não redireciona para o pagamento.
