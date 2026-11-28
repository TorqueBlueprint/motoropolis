# Motoropolis Online — preparação do lançamento público

Este documento junta tudo o que falta para abrir o Motoropolis Online a toda a gente:

- **A.** O que já está feito (neste ramo)
- **B.** Lista de tarefas do dono (só tu podes fazer)
- **C.** Pacote de verificação da Google (branding, domínio, justificação do scope, vídeo de demonstração)
- **D.** Runbook do dia do lançamento (projeto Supabase de produção) → passos detalhados em `tools/online_prod_deploy.md`
- **E.** Checklist de lançamento
- **F.** Notas técnicas (apagar conta, teste SQL, regra dos 30 dias do YouTube)

Projeto de teste: Supabase **motoropolis-dev** (ref `bxjitnmvmjbampgyrsxf`). App OAuth Google "Motoropolis Online" em modo **Testing** (máx. 100 testers).

---

## A. O que já está feito

| Peça | Ficheiro | Estado |
|---|---|---|
| Política de privacidade (EN) | `online/privacy.html` → `https://torqueblueprint.com/online/privacy.html` | Pronta, falta o email de contacto (`CONTACT_EMAIL`) |
| Termos de utilização (EN) | `online/terms.html` → `…/online/terms.html` | Pronta, falta `CONTACT_EMAIL` |
| Logótipo 120×120 (e 512×512) | `online/logo-120.png`, `online/logo-512.png` | Gerado (navy + "Mo" + estrada). Podes trocar por outro. |
| Links "Privacy · Terms" | `src/online/online.html` (rodapé da página e fundo do painel "My account") | Feito |
| Botão "Delete my account" + diálogo (escrever DELETE) | `src/online/account_delete.js`, incluído por `<script src="../src/online/account_delete.js" defer>` em `src/online/online.html` | Feito. Não foi preciso mexer em `build_online.py` nem em `online.js`. |
| Função `delete-account` | `supabase/functions/delete-account/index.ts` | **Publicada no projeto de teste** (verify_jwt ligado, mesmo CORS que `link-youtube`) |
| Migração "apagar conta" | `supabase/migrations/20261128000003_account_delete.sql` | **Aplicada no projeto de teste** |
| Proposta "regra dos 30 dias" | `supabase/proposed/youtube_data_refresh.sql` | **Não aplicada** (precisa do teu OK, ver F.3) |

Como o GitHub Pages serve os ficheiros: `tools/build.py`/`build_online.py` só reescrevem `online/index.html`; não apagam a pasta `online/`. Por isso `privacy.html`, `terms.html` e os logótipos estão guardados diretamente em `online/` e o `account_delete.js` é servido a partir de `src/online/` (o Pages publica o repositório inteiro). Nada disto precisa de passo de build.

---

## B. Tarefas do dono (por ordem)

1. **Email de contacto** — escolhe um email público (ex.: um Gmail só para o canal) e substitui o marcador nas duas páginas:
   ```bash
   (feito: torqueblueprint@gmail.com)
   ```
   Tira também o realce amarelo, se quiseres: apaga `<span class="todo">` / `</span>` à volta do email (ou deixa, fica só destacado).
   Usa o mesmo email como "User support email" e "Developer contact" na Google.
2. **Decidir a regra dos 30 dias do YouTube** (ver F.3). Recomendado: aprovar e aplicar `supabase/proposed/youtube_data_refresh.sql` antes de pedir a verificação.
3. **Juntar o ramo `wip-accounts` ao `main`** quando estiveres contente (as páginas de privacidade têm de estar no ar no endereço público antes de pedir a verificação).
4. **Search Console** — provar que és dono do domínio (C.2).
5. **Google Cloud → Branding** — preencher os campos (C.1) e carregar `online/logo-120.png`.
6. **Gravar o vídeo de demonstração** (C.4), carregar no YouTube como **Não listado**.
7. **Data access → justificação** do `youtube.readonly` (C.3) e **Publish app → Submit for verification**.
8. **Dia do lançamento**: criar o projeto Supabase de produção e seguir `tools/online_prod_deploy.md` (D). Não criar antes: um projeto gratuito é pausado após 1 semana sem uso.
9. **Correr a checklist** (E).

> Enquanto a verificação não sair, a app pode passar a "In production" sem estar verificada, mas a Google mostra o aviso "Google hasn't verified this app" e limita a **100 utilizadores** no total. Para um lançamento público, espera pela verificação.

---

## C. Pacote de verificação da Google

### C.1 Página "Branding" (Google Cloud → Google Auth Platform → Branding)

| Campo | Valor |
|---|---|
| App name | `Motoropolis Online` (tem de ser igual ao que aparece na página e no vídeo) |
| User support email | o teu email de contacto |
| App logo | `online/logo-120.png` (PNG, 120×120, quadrado). Atenção: com logótipo a app passa a precisar de verificação de marca; é o que queremos. |
| Application home page | `https://torqueblueprint.com/online/` |
| Application privacy policy link | `https://torqueblueprint.com/online/privacy.html` |
| Application terms of service link | `https://torqueblueprint.com/online/terms.html` |
| Authorized domains | `torqueblueprint.github.io`. A documentação do Supabase manda acrescentar também `<PROD_REF>.supabase.co` (domínio do callback). Se a verificação reclamar desse domínio (não o podes provar na Search Console), as saídas são o *Custom Domain* do Supabase (add-on pago) ou perguntar ao revisor; não dá para resolver só com ficheiros. |
| Developer contact information | o teu email |

Regras da Google que já cumprimos: a página inicial é pública (não precisa de login), explica o que a app faz e tem link para a política de privacidade; a política está no mesmo domínio que a página inicial.

### C.2 Provar que és dono do domínio (Search Console)

A Google verifica o "top private domain" de cada endereço do ecrã de consentimento. Como `github.io` está na *Public Suffix List*, o domínio a provar é **`torqueblueprint.github.io`** (não `github.io`).

- **Domínio inteiro (registo DNS TXT)**: impossível — não controlas o DNS do github.io.
- **Prefixo de URL `https://torqueblueprint.github.io/` com ficheiro HTML**: possível, mas o ficheiro tem de ficar na **raiz** (`https://torqueblueprint.github.io/googleXXXX.html`). O repositório `motoropolis` é um *project site* e só publica em `/motoropolis/…`, por isso não consegue pôr lá o ficheiro. A solução é um **user site**:
  1. No GitHub (conta/organização **TorqueBlueprint**) cria um repositório público chamado exatamente **`torqueblueprint.github.io`** (se já existir, usa esse).
  2. Search Console → **Adicionar propriedade → Prefixo do URL** → `https://torqueblueprint.github.io/` → método **Ficheiro HTML** → descarrega `googleXXXXXXXX.html`.
  3. Põe esse ficheiro na raiz do repositório `torqueblueprint.github.io` (commit no ramo publicado). Opcional: um `index.html` que redireciona para `/motoropolis/`.
  4. Espera 1–2 minutos e clica **Verificar**. Não apagues o ficheiro depois (a Google volta a verificar).
  5. Usa **a mesma conta Google** na Search Console e como Owner/Editor do projeto Google Cloud.
- **Limites**: a Google não documenta oficialmente o caso github.io. Em geral a propriedade por prefixo de URL de um user site é aceite pela consola OAuth, mas, se a consola continuar a dizer que `torqueblueprint.github.io` não está verificado, ou se a equipa de revisão recusar por o domínio ser de terceiros, a alternativa é:
- **Plano B — domínio próprio** (~10–15 €/ano, ex.: `motoropolis.gg`/`.com`/`.net`): compra num registrar (Cloudflare, Porkbun, Namecheap), verifica-o na Search Console com **registo DNS TXT** (propriedade "Domínio"), aponta-o para o GitHub Pages (Settings → Pages → Custom domain, registos A/CNAME do GitHub) e troca todos os URLs (home, privacy, terms, Site URL do Supabase, redirect URLs, origins do cliente OAuth, lista `ALLOWED` das duas funções). É a opção mais segura se a verificação for recusada.

### C.3 Justificação do scope `youtube.readonly` (Data access → justificação)

Cola isto (inglês) no campo "How will the scopes be used?":

> Motoropolis Online is a free browser game for the community of the TorqueBlueprint YouTube channel. Players sign in with Google and their game identity is their YouTube channel.
>
> We request https://www.googleapis.com/auth/youtube.readonly for one purpose: to find out which YouTube channel belongs to the person signing in. Immediately after sign-in, our server makes a single call to the YouTube Data API channels.list with part=snippet and mine=true. From the response we store only the channel title and the channel thumbnail URL (to show the player as themselves in the game) and a SHA-256 hash of the channel ID (so that one YouTube channel can only have one game account). The raw channel ID is never stored, and the access token is not stored on our servers.
>
> We do not read videos, comments, subscriptions, analytics or any other YouTube data, and we never write to YouTube. No narrower scope exists that returns the authenticated user's own channel: the basic profile/email scopes do not identify the YouTube channel. The data is never sold, shared, used for advertising or used to train AI models, and users can delete their account and all stored data from inside the game at any time.

Se perguntarem pelo `openid`, `email`, `profile`: "used by Google Sign-In (Supabase Auth) to create the account and sign the user in".

### C.4 Vídeo de demonstração (obrigatório para scopes sensíveis)

Requisitos da Google: mostrar o fluxo OAuth completo **em inglês**, o ecrã de consentimento com o **nome da app**, o **URL da barra de endereço com o `client_id`** visível quando aparece o ecrã da Google, e como cada dado é usado na app. Carregar no YouTube como **Não listado** e colar o link no pedido. 2–4 minutos chegam. Grava o ecrã do PC (OBS), browser em inglês, janela anónima, sem extensões.

Guião / lista de planos:

1. **(0:00) Página inicial** — abrir `https://torqueblueprint.com/online/`. Mostrar o nome "Motoropolis Online", o rodapé com **Privacy policy · Terms**. Clicar em Privacy policy, fazer scroll rápido até à secção 3 (uso do YouTube) e à frase "Limited Use"; voltar.
   Narração/legenda: *"This is Motoropolis Online, a free fan game of the TorqueBlueprint YouTube channel. Here is our privacy policy."*
2. **(0:30) Sign in** — clicar **Sign in with YouTube**. No ecrã da Google, **clicar na barra de endereço e mostrar o URL** com `client_id=…apps.googleusercontent.com` (pausa de 2–3 s). Escolher a conta.
3. **(0:50) Consentimento** — mostrar o ecrã com "Motoropolis Online" e a permissão **"View your YouTube account"**. Legenda: *"We request youtube.readonly only to identify which YouTube channel the user owns."* Clicar **Continue/Allow**.
4. **(1:10) Uso dos dados** — de volta à página: mensagem "Welcome to Motoropolis Online, <canal>!" e o painel **My account** com o **nome e foto do canal**. Legenda: *"The channel title and picture are shown here. We also store a one-way hash of the channel ID so one channel = one account. Nothing else is read from YouTube, and nothing is ever posted."*
5. **(1:40) Jogo** — candidatar a um emprego júnior, **Collect today's salary**, mostrar o saldo e o histórico. Legenda: *"Game data: balance, history, job."*
6. **(2:10) Apagar conta** — **Delete my account** → escrever DELETE → **Delete forever** → mensagem de conta apagada e página volta ao estado "Sign in". Legenda: *"Users can delete their account and all stored data at any time."*
7. **(2:30) (Opcional) Revogar** — abrir `https://myaccount.google.com/permissions` e mostrar "Motoropolis Online" com a opção de remover acesso.

Dica: grava com o **projeto de produção** já configurado (mesmo cliente OAuth que vais submeter) — o `client_id` do vídeo tem de ser o do pedido.

### C.5 Depois de submeter

- Verificação de marca: minutos a 2–3 dias úteis. Verificação do scope sensível: normalmente alguns dias a algumas semanas; podem pedir alterações por email (responde a partir do email de contacto).
- Quota da YouTube Data API: 10 000 unidades/dia por defeito; cada login gasta 1 unidade (`channels.list`). Chega para milhares de logins/dia.

---

## D. Runbook do dia do lançamento (resumo)

Passos completos com comandos e marcadores em **`tools/online_prod_deploy.md`**. Resumo:

1. **Com a tua aprovação, no próprio dia**: criar o projeto Supabase de produção (`motoropolis-prod`, região **eu-west-1 / Ireland**, mesma org `ahevdvhhyykrmvjzhkgj`). Gratuito = pausa após 7 dias sem atividade; com jogadores diários não pausa, mas o plano Pro (25 $/mês) evita pausas e dá backups diários.
2. Aplicar as migrações **por ordem**: `20261128000001_online_phase1.sql` → `20261128000002_job_taken_counter.sql` → `20261128000003_account_delete.sql` (→ `youtube_data_refresh` se aprovada, com o número seguinte).
3. Publicar as funções `link-youtube` e `delete-account` (ambas com verify_jwt ligado).
4. Google: no cliente OAuth acrescentar o redirect `https://<PROD_REF>.supabase.co/auth/v1/callback`; no Supabase prod ligar o provider Google (Client ID + Secret), **desligar o Email provider**, configurar Site URL e Redirect URLs.
5. Em `src/online/online.js` trocar **`SB_URL`** e **`SB_KEY`** (as duas constantes no topo do ficheiro) pelos valores do projeto de produção; correr `python3 tools/build.py` e `python3 tools/build.py --check`. O `account_delete.js` não tem constantes: segue automaticamente o projeto que o `online.js` usa.
6. Commit + merge para `main` → GitHub Pages publica.
7. Checklist (E).

---

## E. Checklist de lançamento

- [ ] `privacy.html` e `terms.html` abrem no endereço público, sem `CONTACT_EMAIL` por preencher.
- [ ] Ecrã de consentimento da Google mostra "Motoropolis Online", o logótipo e **sem** aviso "unverified app".
- [ ] **Sign in** com uma conta nova → "Welcome to Motoropolis Online, <canal>!" → painel com nome/foto do canal, **$0**, Unemployed.
- [ ] **Season 1: toda a gente começa em $0** — no SQL editor da produção: `select count(*), sum(balance) from public.wallets;` → soma 0 antes do primeiro salário; `select count(*) from public.ledger;` → 0 no arranque.
- [ ] **Apply** para um emprego júnior → o lugar fica ocupado (`taken` sobe).
- [ ] **Collect today's salary** → saldo sobe, botão bloqueia até à meia-noite de Lisboa; segunda tentativa recusada.
- [ ] **Quit my job** → lugar libertado.
- [ ] **Delete my account** → escrever DELETE → conta apagada; voltar a entrar cria conta nova a $0; no SQL: nenhuma linha órfã (ver F.2).
- [ ] Conta Google sem canal YouTube → mensagem "This Google account has no YouTube channel".
- [ ] Mesmo canal noutra conta Google → mensagem "already linked to another Motoropolis account".
- [ ] Supabase → Advisors (Security) sem erros novos.
- [ ] Projeto de teste: manter (para testes) ou pausar.

---

## F. Notas técnicas

### F.1 Como funciona o "apagar conta"

- O botão aparece no painel **My account** (só com sessão iniciada). O diálogo obriga a escrever `DELETE`.
- O browser chama `POST https://<ref>.supabase.co/functions/v1/delete-account` com o JWT do utilizador e o corpo `{"confirm":"DELETE"}`. O `<ref>` é lido da chave de sessão que o supabase-js guarda (`sb-<ref>-auth-token`), por isso não há URL repetido no código.
- A função confirma o utilizador pelo token (nunca pelo corpo do pedido) e apaga o utilizador de `auth.users` com a service role. A base de dados apaga em cascata: `profiles` → `wallets`, `ledger`, `employment`, `salary_claims`; o trigger `employment_count` devolve o lugar do emprego.
- A migração `…000003_account_delete.sql` acrescenta ao ledger um bloqueio de **DELETE** (e de **TRUNCATE**): uma linha do ledger só pode desaparecer quando o perfil do dono já não existe (ou seja, numa cascata de apagar conta) ou numa sessão de manutenção do dono com `set local motoropolis.ledger_maintenance = 'on'` (ex.: reset de Season). O UPDATE continua proibido como antes. Assim o "append-only" fica mais forte e não bloqueia o apagar conta.

### F.2 Teste SQL (corre tu no SQL Editor do projeto de teste)

A ferramenta automática não teve autorização para correr SQL com DELETE, por isso este teste ficou por correr. Ele cria um utilizador falso, faz um emprego, um salário e uma linha de ledger, verifica os bloqueios e apaga a conta. **Termina sempre com um erro de propósito ("ALL CHECKS PASSED") para desfazer tudo** — não fica lixo nenhum. Se aparecer outra mensagem, é essa a falha.

```sql
do $$
declare u uuid := 'dddddddd-0000-4000-8000-00000000d001'; t0 int; ok boolean;
begin
  select taken into t0 from public.job_catalog where code='news.vendor';
  insert into auth.users (instance_id,id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
  values ('00000000-0000-0000-0000-000000000000',u,'authenticated','authenticated','deltest@example.invalid',
          '{"provider":"email","providers":["email"]}','{"name":"Del Test"}',now(),now());
  assert (select count(*) from public.profiles where id=u)=1, 'profile not created';
  insert into public.employment(user_id,job_code) values (u,'news.vendor');
  insert into public.salary_claims(user_id,day) values (u,current_date);
  insert into public.ledger(user_id,amount,kind,ref) values (u,80,'salary','news.vendor:test');
  assert (select balance from public.wallets where user_id=u)=80, 'ledger did not move wallet';
  assert (select taken from public.job_catalog where code='news.vendor')=t0+1, 'taken not incremented';
  ok := false; begin delete from public.ledger where user_id=u; exception when others then ok := sqlerrm like '%append-only%'; end;
  assert ok, 'direct ledger delete was NOT blocked';
  ok := false; begin update public.ledger set amount=1 where user_id=u; exception when others then ok := sqlerrm like '%append-only%'; end;
  assert ok, 'ledger update was NOT blocked';
  ok := false; begin truncate public.ledger; exception when others then ok := sqlerrm like '%append-only%'; end;
  assert ok, 'truncate was NOT blocked';
  delete from auth.users where id=u;
  assert (select count(*) from public.profiles where id=u)=0, 'profile left';
  assert (select count(*) from public.wallets where user_id=u)=0, 'wallet left';
  assert (select count(*) from public.ledger where user_id=u)=0, 'ledger left';
  assert (select count(*) from public.employment where user_id=u)=0, 'employment left';
  assert (select count(*) from public.salary_claims where user_id=u)=0, 'claims left';
  assert (select taken from public.job_catalog where code='news.vendor')=t0, 'seat not given back';
  raise exception 'ALL CHECKS PASSED (rolled back)';
end $$;
```

Verificação de linhas órfãs depois de apagar contas reais (deve dar tudo 0):

```sql
select (select count(*) from public.profiles p where not exists (select 1 from auth.users u where u.id=p.id)) as orphan_profiles,
       (select count(*) from public.wallets w where not exists (select 1 from public.profiles p where p.id=w.user_id)) as orphan_wallets,
       (select count(*) from public.ledger l where not exists (select 1 from public.profiles p where p.id=l.user_id)) as orphan_ledger;
```

### F.3 Regra dos 30 dias do YouTube (decisão tua antes da verificação)

As *YouTube API Services Developer Policies* (III.E.4.c) dizem que dados autorizados (tirando tokens) só podem ser guardados **até 30 dias**; depois têm de ser **atualizados ou apagados**. E se o utilizador remover o acesso nas definições da Google, os dados têm de ser apagados em 30 dias (III.D.2.3.b). Hoje o título e a foto do canal só são atualizados quando a pessoa volta a fazer login — quem fica com a sessão aberta mais de 30 dias fica com dados "velhos", e nós não sabemos quando alguém revoga o acesso (não guardamos o token).

Proposta pronta em `supabase/proposed/youtube_data_refresh.sql`:
- coluna `profiles.yt_refreshed_at`, carimbada sempre que `link-youtube` grava o título/foto (trigger, sem mexer na função);
- `expire_youtube_data()` limpa título e foto de quem não renovou há 30 dias (o jogo mostra as iniciais até ao próximo login);
- um job diário `pg_cron` às 04:17 UTC (ativa a extensão `pg_cron`).
O *fingerprint* (hash do ID do canal) fica, porque é a chave "um canal = uma conta" e não dá para voltar ao ID. Há um risco pequeno de o revisor considerar o hash como dado do YouTube; se pedirem, a alternativa é guardar o hash com um "sal" secreto do servidor ou apagá-lo também aos 30 dias (perdendo a regra um-canal-uma-conta para contas inativas).

Se aprovares: mover para `supabase/migrations/20261128000004_youtube_data_refresh.sql` (sem as 2 linhas de "PROPOSAL"), aplicar no projeto de teste, e descomentar a frase preparada na secção 6 de `online/privacy.html`. Mais tarde (online.js), convém mostrar "Sign in again to refresh your channel" quando `yt_title` está vazio.

### F.4 Outras notas

- O Email provider do Supabase está ligado no projeto de teste (aviso "leaked password protection"). Na produção desliga-o: só se entra com Google.
- A página `/online/` carrega fontes (Google Fonts) e bibliotecas (jsDelivr). A política de privacidade já o diz. As páginas `privacy.html`/`terms.html` não carregam nada de fora.
- Com mais de 100 jogadores é preciso a app **verificada**; não há forma de contornar com o modo Testing.
