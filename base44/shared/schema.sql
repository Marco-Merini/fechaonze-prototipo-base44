-- =====================================================================
--  FechaOnze - Script de criação das tabelas (padrão de nomenclatura)
--  Prefixo por tabela: Usuarios -> Usu_, Quadras -> Qua_, etc.
--  Campos base do sistema: Id, DataCriacao, DataAtualizacao, IdCriador
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabela Usuarios (entidade User do sistema)
-- ---------------------------------------------------------------------
CREATE TABLE Usuarios (
    Usu_Id               VARCHAR(36)   NOT NULL PRIMARY KEY,
    Usu_Nome             NVARCHAR(255) NULL,          -- full_name
    Usu_Email            NVARCHAR(255) NULL,          -- email
    Usu_TipoConta        NVARCHAR(20)  NOT NULL DEFAULT 'cliente',  -- account_type (dono / cliente)
    Usu_Username         NVARCHAR(100) NULL,          -- username (@usuario)
    Usu_CodigoUsuario    NVARCHAR(50)  NULL,          -- user_code
    Usu_Telefone         NVARCHAR(30)  NULL,          -- phone / whatsapp
    Usu_Cidade           NVARCHAR(150) NULL,          -- city
    Usu_FotoUrl          NVARCHAR(500) NULL,          -- photo_url
    Usu_Posicao          NVARCHAR(10)  NOT NULL DEFAULT 'ATA',  -- position (GOL/ZAG/LAT/VOL/MEI/EXT/ATA)
    Usu_Velocidade       INT           NOT NULL DEFAULT 0,   -- pace
    Usu_Finalizacao      INT           NOT NULL DEFAULT 0,   -- shooting
    Usu_Passe            INT           NOT NULL DEFAULT 0,   -- passing
    Usu_Drible           INT           NOT NULL DEFAULT 0,   -- dribbling
    Usu_Defesa           INT           NOT NULL DEFAULT 0,   -- defending
    Usu_Fisico           INT           NOT NULL DEFAULT 0,   -- physical
    Usu_Overall          INT           NOT NULL DEFAULT 0,   -- overall
    Usu_QtdAvaliacoes    INT           NOT NULL DEFAULT 0,   -- ratings_count
    Usu_Esportes         TEXT          NULL,           -- sports (JSON: array de ids de modalidade)
    Usu_Posicoes         TEXT          NULL,           -- positions (JSON: [{sport, position}])
    Usu_DataCriacao      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Usu_DataAtualizacao  DATETIME      NULL,
    Usu_IdCriador        VARCHAR(36)   NULL
);

-- ---------------------------------------------------------------------
-- Tabela Quadras (entidade Court)
-- ---------------------------------------------------------------------
CREATE TABLE Quadras (
    Qua_Id               VARCHAR(36)   NOT NULL PRIMARY KEY,
    Qua_Nome             NVARCHAR(255) NOT NULL,
    Qua_TipoEsporte      NVARCHAR(50)  NOT NULL DEFAULT 'Futebol Society',  -- sport_type
    Qua_Cidade           NVARCHAR(150) NOT NULL,
    Qua_Endereco         NVARCHAR(500) NOT NULL,
    Qua_PrecoPorHora     DECIMAL(10,2) NOT NULL,      -- price_per_hour
    Qua_FotoUrl          NVARCHAR(500) NULL,          -- photo_url
    Qua_WhatsApp         NVARCHAR(30)  NOT NULL,      -- whatsapp_number
    Qua_Descricao        NVARCHAR(MAX) NULL,          -- description
    Qua_Latitude         DECIMAL(9,6)  NULL,          -- latitude
    Qua_Longitude        DECIMAL(9,6)  NULL,          -- longitude
    Qua_Ativa            BIT           NOT NULL DEFAULT 1,  -- is_active
    Qua_DataCriacao      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Qua_DataAtualizacao  DATETIME      NULL,
    Qua_IdCriador        VARCHAR(36)   NULL,
    CONSTRAINT FK_Quadras_Usuarios FOREIGN KEY (Qua_IdCriador) REFERENCES Usuarios(Usu_Id)
);

-- ---------------------------------------------------------------------
-- Tabela Horarios (entidade TimeSlot)
-- ---------------------------------------------------------------------
CREATE TABLE Horarios (
    Hor_Id               VARCHAR(36)   NOT NULL PRIMARY KEY,
    Hor_QuadraId         VARCHAR(36)   NOT NULL,      -- court_id
    Hor_DiaSemana        NVARCHAR(20)  NOT NULL,      -- weekday (domingo..sabado)
    Hor_HoraInicio       NVARCHAR(5)   NOT NULL,      -- start_time (HH:mm)
    Hor_HoraFim          NVARCHAR(5)   NOT NULL,      -- end_time (HH:mm)
    Hor_Disponivel       BIT           NOT NULL DEFAULT 1,  -- is_available
    Hor_DataCriacao      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Hor_DataAtualizacao  DATETIME      NULL,
    Hor_IdCriador        VARCHAR(36)   NULL,
    CONSTRAINT FK_Horarios_Quadras FOREIGN KEY (Hor_QuadraId) REFERENCES Quadras(Qua_Id)
);

-- ---------------------------------------------------------------------
-- Tabela Agendamentos (entidade Booking)
-- ---------------------------------------------------------------------
CREATE TABLE Agendamentos (
    Age_Id               VARCHAR(36)   NOT NULL PRIMARY KEY,
    Age_QuadraId         VARCHAR(36)   NOT NULL,      -- court_id
    Age_HorarioId        VARCHAR(36)   NOT NULL,      -- time_slot_id
    Age_NomeCliente      NVARCHAR(255) NOT NULL,      -- client_name
    Age_TelefoneCliente  NVARCHAR(30)  NULL,          -- client_phone
    Age_EmailCliente     NVARCHAR(255) NULL,          -- client_email
    Age_Data             DATE          NOT NULL,      -- date
    Age_HoraInicio       NVARCHAR(5)   NOT NULL,      -- start_time
    Age_HoraFim          NVARCHAR(5)   NOT NULL,      -- end_time
    Age_NomeQuadra       NVARCHAR(255) NOT NULL,      -- court_name
    Age_Status           NVARCHAR(20)  NOT NULL DEFAULT 'pendente',  -- pendente/confirmado/cancelado
    Age_LembreteEnviado  BIT           NOT NULL DEFAULT 0,  -- reminder_sent
    Age_EventoCalendarioId NVARCHAR(255) NULL,        -- calendar_event_id
    Age_DataCriacao      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Age_DataAtualizacao  DATETIME      NULL,
    Age_IdCriador        VARCHAR(36)   NULL,
    CONSTRAINT FK_Agendamentos_Quadras   FOREIGN KEY (Age_QuadraId)  REFERENCES Quadras(Qua_Id),
    CONSTRAINT FK_Agendamentos_Horarios  FOREIGN KEY (Age_HorarioId) REFERENCES Horarios(Hor_Id),
    CONSTRAINT FK_Agendamentos_Usuarios  FOREIGN KEY (Age_IdCriador) REFERENCES Usuarios(Usu_Id)
);

-- ---------------------------------------------------------------------
-- Tabela Partidas (entidade MatchPost)
-- ---------------------------------------------------------------------
CREATE TABLE Partidas (
    Par_Id                  VARCHAR(36)   NOT NULL PRIMARY KEY,
    Par_Titulo              NVARCHAR(255) NOT NULL,
    Par_TipoEsporte         NVARCHAR(50)  NOT NULL DEFAULT 'Futebol Society',  -- sport_type
    Par_NomeOrganizador     NVARCHAR(255) NOT NULL,  -- organizer_name
    Par_OrganizadorId       VARCHAR(36)   NOT NULL,  -- organizer_id
    Par_Data                DATE          NOT NULL,  -- date
    Par_HoraInicio          NVARCHAR(5)   NOT NULL,  -- start_time
    Par_HoraFim             NVARCHAR(5)   NOT NULL,  -- end_time
    Par_Cidade              NVARCHAR(150) NOT NULL,
    Par_Local               NVARCHAR(255) NULL,       -- location
    Par_VagasNecessarias    NVARCHAR(255) NULL,      -- positions_needed
    Par_Nivel               NVARCHAR(20)  NOT NULL DEFAULT 'amistoso',  -- amistoso/competitivo/iniciantes
    Par_Descricao           NVARCHAR(MAX) NULL,
    Par_Status              NVARCHAR(20)  NOT NULL DEFAULT 'aberto',  -- aberto/completo
    Par_WhatsApp            NVARCHAR(30)  NOT NULL,  -- whatsapp_number
    Par_JogadoresInteressados TEXT        NULL,      -- interested_players (JSON: array de ids)
    Par_DataCriacao         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Par_DataAtualizacao     DATETIME      NULL,
    Par_IdCriador           VARCHAR(36)   NULL,
    CONSTRAINT FK_Partidas_Usuarios FOREIGN KEY (Par_OrganizadorId) REFERENCES Usuarios(Usu_Id)
);

-- ---------------------------------------------------------------------
-- Tabela Avaliacoes (entidade PlayerRating)
-- ---------------------------------------------------------------------
CREATE TABLE Avaliacoes (
    Ava_Id               VARCHAR(36)   NOT NULL PRIMARY KEY,
    Ava_JogadorId        VARCHAR(36)   NOT NULL,      -- player_id
    Ava_NomeJogador      NVARCHAR(255) NULL,          -- player_name
    Ava_AvaliadorId      VARCHAR(36)   NOT NULL,      -- rater_id
    Ava_NomeAvaliador    NVARCHAR(255) NOT NULL,      -- rater_name
    Ava_Velocidade       INT           NOT NULL,     -- pace (0-99)
    Ava_Finalizacao      INT           NOT NULL,     -- shooting (0-99)
    Ava_Passe            INT           NOT NULL,     -- passing (0-99)
    Ava_Drible           INT           NOT NULL,     -- dribbling (0-99)
    Ava_Defesa           INT           NOT NULL,     -- defending (0-99)
    Ava_Fisico           INT           NOT NULL,     -- physical (0-99)
    Ava_Comentario       NVARCHAR(MAX) NULL,         -- comment
    Ava_DataCriacao      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Ava_DataAtualizacao  DATETIME      NULL,
    Ava_IdCriador        VARCHAR(36)   NULL,
    CONSTRAINT FK_Avaliacoes_Jogador   FOREIGN KEY (Ava_JogadorId)   REFERENCES Usuarios(Usu_Id),
    CONSTRAINT FK_Avaliacoes_Avaliador FOREIGN KEY (Ava_AvaliadorId) REFERENCES Usuarios(Usu_Id)
);

-- ---------------------------------------------------------------------
-- Tabela Comentarios (entidade Comment)
-- ---------------------------------------------------------------------
CREATE TABLE Comentarios (
    Com_Id               VARCHAR(36)   NOT NULL PRIMARY KEY,
    Com_PublicacaoId     VARCHAR(36)   NOT NULL,      -- post_id
    Com_AutorId          VARCHAR(36)   NOT NULL,      -- author_id
    Com_NomeAutor        NVARCHAR(255) NOT NULL,      -- author_name
    Com_FotoAutor        NVARCHAR(500) NULL,          -- author_photo_url
    Com_Conteudo        NVARCHAR(MAX) NOT NULL,      -- content
    Com_DataCriacao      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Com_DataAtualizacao  DATETIME      NULL,
    Com_IdCriador        VARCHAR(36)   NULL,
    CONSTRAINT FK_Comentarios_Publicacoes FOREIGN KEY (Com_PublicacaoId) REFERENCES Publicacoes(Pub_Id),
    CONSTRAINT FK_Comentarios_Usuarios     FOREIGN KEY (Com_AutorId)      REFERENCES Usuarios(Usu_Id)
);

-- ---------------------------------------------------------------------
-- Tabela Publicacoes (entidade Post)
-- ---------------------------------------------------------------------
CREATE TABLE Publicacoes (
    Pub_Id               VARCHAR(36)   NOT NULL PRIMARY KEY,
    Pub_AutorId          VARCHAR(36)   NOT NULL,      -- author_id
    Pub_NomeAutor        NVARCHAR(255) NOT NULL,      -- author_name
    Pub_UsernameAutor    NVARCHAR(100) NULL,          -- author_username
    Pub_FotoAutor        NVARCHAR(500) NULL,          -- author_photo_url
    Pub_Conteudo        NVARCHAR(MAX) NOT NULL,      -- content
    Pub_ImagemUrl        NVARCHAR(500) NULL,          -- image_url
    Pub_Curtidas         TEXT          NULL,          -- likes (JSON: array de ids)
    Pub_QtdComentarios   INT           NOT NULL DEFAULT 0,  -- comments_count
    Pub_DataCriacao      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Pub_DataAtualizacao  DATETIME      NULL,
    Pub_IdCriador        VARCHAR(36)   NULL,
    CONSTRAINT FK_Publicacoes_Usuarios FOREIGN KEY (Pub_AutorId) REFERENCES Usuarios(Usu_Id)
);

-- ---------------------------------------------------------------------
-- Tabela SolicitacoesSeguir (entidade FollowRequest)
-- ---------------------------------------------------------------------
CREATE TABLE SolicitacoesSeguir (
    Sol_Id               VARCHAR(36)   NOT NULL PRIMARY KEY,
    Sol_SolicitanteId    VARCHAR(36)   NOT NULL,      -- requester_id
    Sol_NomeSolicitante  NVARCHAR(255) NULL,          -- requester_name
    Sol_DestinatarioId   VARCHAR(36)   NOT NULL,      -- target_id
    Sol_NomeDestinatario NVARCHAR(255) NULL,          -- target_name
    Sol_Status           NVARCHAR(20)  NOT NULL DEFAULT 'pending',  -- pending/accepted/rejected
    Sol_DataCriacao      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Sol_DataAtualizacao  DATETIME      NULL,
    Sol_IdCriador        VARCHAR(36)   NULL,
    CONSTRAINT FK_Solicitacoes_Solicitante FOREIGN KEY (Sol_SolicitanteId)  REFERENCES Usuarios(Usu_Id),
    CONSTRAINT FK_Solicitacoes_Destinatario FOREIGN KEY (Sol_DestinatarioId) REFERENCES Usuarios(Usu_Id)
);

-- ---------------------------------------------------------------------
-- Tabela Conexoes (entidade Follow)
-- ---------------------------------------------------------------------
CREATE TABLE Conexoes (
    Con_Id               VARCHAR(36)   NOT NULL PRIMARY KEY,
    Con_SeguidorId       VARCHAR(36)   NOT NULL,      -- follower_id
    Con_SeguidoId        VARCHAR(36)   NOT NULL,      -- following_id
    Con_DataCriacao      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Con_DataAtualizacao  DATETIME      NULL,
    Con_IdCriador        VARCHAR(36)   NULL,
    CONSTRAINT FK_Conexoes_Seguidor FOREIGN KEY (Con_SeguidorId) REFERENCES Usuarios(Usu_Id),
    CONSTRAINT FK_Conexoes_Seguido  FOREIGN KEY (Con_SeguidoId)  REFERENCES Usuarios(Usu_Id)
);