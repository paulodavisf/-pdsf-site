# PDSF Consultoria — site institucional

Site estático em HTML, CSS e JavaScript, preparado para importação como projeto Git no Vercel.

## Publicar no Vercel

> Atenção: o plano Hobby do Vercel é restrito a projetos pessoais e não comerciais. Como este é o site de uma consultoria, confirme o plano adequado antes de usá-lo como presença pública da empresa. Consulte [os termos do plano Hobby](https://vercel.com/docs/plans/hobby).


1. Importe o repositório `paulodavisf/-pdsf-site` no Vercel.
2. Selecione o preset `Other`, mantenha a raiz do projeto como diretório raiz e deixe comando de build e dependências em branco.
3. Para ativar o formulário, configure `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` nas variáveis do projeto Vercel.
4. No Supabase, execute `supabase/schema.sql` no SQL Editor. Isso cria a tabela de contatos e permite apenas novos envios públicos; leitura, edição e exclusão ficam bloqueadas para visitantes.
5. Publique novamente o projeto e faça um envio de teste.

A função em `api/contact.js` valida os campos e grava os dados na tabela `contact_submissions`. Ela usa a chave publicável do Supabase, com permissão restrita por RLS; nunca coloque a chave `secret` ou a antiga `service_role` no site ou nas variáveis desta função.

Antes de receber contatos do público, publique o aviso de privacidade da PDSF e confirme o prazo de retenção e o acesso interno aos dados.

## Arquivos

- `index.html` — página inicial.
- `contato.html` — formulário de contato.
- `api/contact.js` — função do Vercel para validar e receber o formulário.
- `supabase/schema.sql` — tabela e regras de acesso para os contatos.
- `pdsf-logo.png` e `pdsf-hero.jpg` — identidade visual do site.
