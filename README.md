<div align="center">

# ⚽ FechaOnze

### A rede social esportiva que conecta jogadores, quadras e partidas

[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Base44-15265C?style=for-the-badge)](#)
[![Frontend](https://img.shields.io/badge/Frontend-Vite%20%2B%20Tailwind-3892FA?style=for-the-badge)](#)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-FBC02E?style=for-the-badge)](#)

**Reserve quadras • Monte seu time • Avalie jogadores • Construa sua reputação**

</div>

---

## 📖 Sobre o projeto

O **FechaOnze** é uma plataforma completa para a comunidade esportiva amadora que unifica, em uma só experiência, três pilares:

1. **🏟️ Gestão de quadras** — donos de complexos cadastram espaços, horários e gerenciam reservas com confirmação e lembretes automáticos.
2. **👥 Rede social de jogadores** — perfis no estilo *card* (overall, atributos, posição), sistema de seguir/seguidores, publicações e comentários.
3. **🎯 Descoberta e organização de partidas** — feed de partidas abertas, busca de jogadores e conexões para fechar o time.

Tudo isso com avaliação entre pares, cálculo automático de overall por posição e integração com Google Calendar para sincronizar agendamentos.

---

## ✨ Principais funcionalidades

### 🎮 Para Jogadores (Clientes)
| Recurso | Descrição |
|---|---|
| **Onboarding inteligente** | Seleção de modalidades com posições reais por esporte (futebol, basquete, vôlei, padel…) |
| **Card de jogador** | Perfil estilo FIFA com overall, atributos (PAC, SHO, PAS, DRI, DEF, FIS) e tier (Bronze→Lenda) |
| **Avaliações** | Sistema de notas 0–99 por atributo, com comentários, entre jogadores conectados |
| **Rede social** | Feed de publicações com imagens, curtidas e comentários |
| **Conexões** | Seguir/solicitar amizade, gerenciar seguidores e seu "time" |
| **Descoberta de quadras** | Busca por nome, cidade, preço e disponibilidade de horário |
| **Agendamentos** | Reserva de horários, confirmação e acompanhamento das reservas |
| **Feed de partidas** | Partidas abertas por organizadores, com nível e vagas por posição |

### 🏟️ Para Donos de Local (Gestores)
| Recurso | Descrição |
|---|---|
| **Dashboard** | Visão geral das operações e métricas |
| **Gestão de quadras** | Cadastro completo com foto, preço, localização (GPS) e WhatsApp |
| **Horários recorrentes** | Configuração de disponibilidade por dia da semana |
| **Gestão de reservas** | Confirmação/cancelamento com sincronização de disponibilidade |
| **Lembretes automáticos** | E-mail de lembrete enviado aos clientes antes da reserva |
| **Sincronização com calendário** | Agendamentos confirmados viram eventos no Google Calendar |

---

## 🏗️ Arquitetura

```
FechaOnze/
├── src/
│   ├── pages/
│   │   ├── admin/          # Dashboard, Quadras, Horários, Agendamentos (dono)
│   │   ├── client/         # Explorar, Partidas, Jogadores, Perfil (cliente)
│   │   ├── Onboarding.jsx  # Configuração inicial de esportes/posições
│   │   └── Login / Register / ForgotPassword / ResetPassword
│   ├── components/
│   │   ├── layout/         # AppLayout + Sidebar (navegação por papel)
│   │   ├── players/       # Cards, criação, avaliação e atributos
│   │   ├── matches/       # Cards e criação de partidas
│   │   ├── ui/            # Componentes shadcn/ui
│   │   └── AuthLayout / SportSelector / Logo / ...
│   └── lib/               # Utils, contexto de auth, lógica de esportes e stats
├── base44/
│   ├── entities/          # Esquemas das entidades (JSON)
│   ├── functions/         # Funções backend (Deno)
│   ├── workflows/          # Automações (lembretes, calendário)
│   └── connectors/        # Integrações OAuth (Google Calendar)
```

### 🧰 Stack tecnológica
- **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend (BaaS):** Base44 — autenticação, banco de dados, integrações e hospedagem
- **Ícones:** lucide-react · **Gráficos:** recharts · **Mapas:** react-leaflet
- **Autenticação:** E-mail/senha com OTP + Google OAuth
- **Integrações:** Google Calendar (eventos), LLM (extração/upload), E-mail

---

## 🗃️ Modelo de dados

O sistema conta com **9 entidades** principais:

| Entidade | Descrição |
|---|---|
| **Usuarios** | Usuários com perfil, atributos esportivos e rede social |
| **Quadras** | Espaços esportivos cadastrados pelos donos |
| **Horarios** | Disponibilidade recorrente das quadras (por dia da semana) |
| **Agendamentos** | Reservas de horários feitas pelos clientes |
| **Partidas** | Publicações de partidas abertas no feed |
| **Avaliacoes** | Notas de atributos que um jogador dá a outro |
| **Publicacoes** | Posts do feed social |
| **Comentarios** | Comentários nas publicações |
| **SolicitacoesSeguir** | Pedidos de conexão entre jogadores |
| **Conexoes** | Relações de seguir/seguidor estabelecidas |

> 📄 O script SQL completo (com nomenclatura em português e prefixo por tabela) está em [`base44/shared/schema.sql`](base44/shared/schema.sql).

---

## ⚙️ Automações e integrações

- **🔄 Lembretes de reserva** — workflow que envia e-mail automático antes do horário marcado.
- **📅 Sincronização com Google Calendar** — agendamentos confirmados criam eventos no calendário do gestor.
- **🤖 Avaliação de jogadores** — cálculo automático de overall ponderado por posição (ex.: goleiro prioriza defesa, atacante prioriza finalização).

---

## 🚀 Como rodar localmente

### Pré-requisitos
1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Instale a CLI do Base44 (opcional):
   ```bash
   npm install -g base44@latest
   ```

### Ambiente completo (frontend + backend local)
```bash
base44 dev
```
A CLI inicia o backend local e, se configurado, também o frontend.

### Apenas o frontend (contra backend hospedado)
```bash
npm run dev
```
Crie um arquivo `.env.local` na raiz:
```bash
VITE_BASE44_APP_ID=seu_app_id
VITE_BASE44_APP_BASE_URL=https://seu-app.base44.app
```

---

## 📱 Publicação

Após enviar suas alterações para o Git, publique o app pelo dashboard:
```bash
base44 dashboard open
```
O mesmo código-base compila para **iOS e Android** — o design é responsivo desde o início.

---

## 📚 Documentação e suporte

- 📘 [Documentação Base44](https://docs.base44.com)
- 🔧 [Referência da CLI](https://docs.base44.com/developers/references/cli/commands/introduction)
- 🤝 [Suporte Base44](https://app.base44.com/support)

---

<div align="center">

**FechaOnze** — *onde o jogo começa antes da quadra.* ⚽

Feito com 💚 pela comunidade esportiva.

</div>