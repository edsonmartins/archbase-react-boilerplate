# Padrões de Central de Atendimentos

Este documento descreve os padrões utilizados na Central de Atendimentos, incluindo WebSocket, mock data, CSS modules e componentes de chat.

---

## 1. Estrutura de Arquivos

```
src/views/atendimentos/
├── CentralAtendimentosView.tsx    # View principal
├── CentralAtendimentos.module.css # Estilos CSS modules
├── mockData.ts                    # Dados mock para testes
├── components/
│   ├── TopBar.tsx                 # Barra superior com tabs e filtros
│   ├── ChannelTabs.tsx            # Tabs de canais
│   ├── ListaAtendimentos.tsx      # Lista de conversas
│   ├── ListaTickets.tsx           # Lista de tickets (email)
│   ├── ChatPanel.tsx              # Painel de chat
│   ├── TicketPanel.tsx            # Painel de ticket
│   ├── MensagemItem.tsx           # Item de mensagem
│   ├── TransferenciaCard.tsx      # Card de transferência
│   ├── InfoPanelSAC.tsx           # Painel de info SAC
│   └── InfoPanelTicket.tsx        # Painel de info Ticket
├── hooks/
│   ├── index.ts
│   ├── useAtendimentoWebSocket.ts # Hook de WebSocket
│   ├── useAtendimentosSAC.ts      # Hook de dados SAC
│   ├── useAtendimentosCanal.ts    # Hook de dados por canal
│   ├── useCanais.ts               # Hook de canais
│   └── useTickets.ts              # Hook de tickets
```

---

## 2. Padrão de Mock Data

### Estrutura do arquivo mockData.ts

```typescript
/**
 * MOCK DATA - Central de Atendimentos
 *
 * Este arquivo contém dados mockados para validação da interface.
 * REMOVER após validação e ajustes.
 */

import { AtendimentoDto, MensagemDto, CanalDto, TicketEmailDto } from '../../domain/atendimento'
import { ContadoresSACDto } from '../../services/SACAtendimentoService'

// ============================================
// FLAG PARA ATIVAR/DESATIVAR MOCKS
// ============================================
export const USAR_MOCK_DATA = true

// ============================================
// MOCK: CANAIS
// ============================================
export const MOCK_CANAIS: CanalDto[] = [
  {
    id: 'canal-whatsapp-vendas',
    nome: 'WhatsApp Vendas',
    tipo: 'whatsapp',
    agenteId: 'agente-vendas-01',
    ativo: true
  },
  // ... mais canais
]

// ============================================
// MOCK: CONTADORES
// ============================================
export const MOCK_CONTADORES_SAC: ContadoresSACDto = {
  aguardandoHumano: 3,
  emAtendimento: 5,
  total: 12
}

// ============================================
// MOCK: ATENDIMENTOS
// ============================================
export const MOCK_ATENDIMENTOS_SAC: AtendimentoDto[] = [
  {
    id: 'atend-sac-001',
    protocolo: 'SAC-2024-00142',
    modulo: 'SAC',
    clienteNome: 'Maria Silva Santos',
    clienteContato: '(21) 99876-5432',
    status: 'AGUARDANDO_HUMANO',
    agenteIaNome: 'Assistente RQ',
    dataInicio: new Date(Date.now() - 25 * 60000).toISOString(),
    dataUltimaInteracao: new Date(Date.now() - 2 * 60000).toISOString(),
    iaAtiva: false,
    naoLidas: 3,
    ultimaMensagemPreview: 'Preciso falar com um atendente!'
  },
  // ... mais atendimentos
]

// ============================================
// MOCK: MENSAGENS
// ============================================
export const MOCK_MENSAGENS: Record<string, MensagemDto[]> = {
  'atend-sac-001': [
    {
      id: 'msg-001-1',
      atendimentoId: 'atend-sac-001',
      origem: 'CLIENTE',
      conteudo: 'Olá, boa tarde!',
      tipo: 'TEXTO',
      dataEnvio: new Date(Date.now() - 25 * 60000).toISOString(),
      lida: true
    },
    // ... mais mensagens
  ]
}

// ============================================
// FUNÇÕES HELPER
// ============================================
export function getMockAtendimentosByCanalId(canalId: string): AtendimentoDto[] {
  return MOCK_ATENDIMENTOS_CANAL.filter(a => a.canalId === canalId)
}

export function getMockMensagens(atendimentoId: string): MensagemDto[] {
  return MOCK_MENSAGENS[atendimentoId] || []
}
```

### Uso no Service

```typescript
import { USAR_MOCK_DATA, MOCK_ATENDIMENTOS_SAC, getMockMensagens } from '../views/atendimentos/mockData'

@injectable()
export class SACAtendimentoService {
  // Helper para simular delay de rede
  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
  }

  async listar(): Promise<AtendimentoDto[]> {
    if (USAR_MOCK_DATA) {
      await this.simulateDelay()
      return [...MOCK_ATENDIMENTOS_SAC]
    }
    return this.client.get<AtendimentoDto[]>(this.endpoint, {}, false)
  }

  async mensagens(id: string): Promise<MensagemDto[]> {
    if (USAR_MOCK_DATA) {
      await this.simulateDelay()
      return getMockMensagens(id)
    }
    return this.client.get<MensagemDto[]>(`${this.endpoint}/${id}/mensagens`, {}, false)
  }
}
```

---

## 3. Padrão de WebSocket Hook

```typescript
import { useState, useEffect, useCallback, useRef } from 'react'
import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { USAR_MOCK_DATA } from '../mockData'

export interface UseAtendimentoWebSocketOptions {
  url: string
  token?: string
  autoConnect?: boolean
  debug?: boolean
  onAtendimentoSAC?: (atendimento: AtendimentoDto) => void
  onMensagemSAC?: (atendimentoId: string, mensagem: MensagemDto) => void
  onTransferenciaSAC?: (dto: TransferenciaWebhookDto) => void
}

export function useAtendimentoWebSocket(options: UseAtendimentoWebSocketOptions) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const clientRef = useRef<Client | null>(null)

  const connect = useCallback(() => {
    // Não conectar quando usando mock data
    if (USAR_MOCK_DATA) {
      if (options.debug) console.log('[WS] Mock data ativo, WebSocket desabilitado')
      return
    }

    if (connecting || connected || clientRef.current) return

    setConnecting(true)

    const client = new Client({
      webSocketFactory: () => new SockJS(options.url),
      connectHeaders: options.token ? { Authorization: `Bearer ${options.token}` } : {},
      onConnect: () => {
        setConnected(true)
        setConnecting(false)

        // Subscrever aos topics
        client.subscribe('/topic/sac/atendimentos', (msg: IMessage) => {
          const data = JSON.parse(msg.body)
          options.onAtendimentoSAC?.(data.payload)
        })
      },
      onDisconnect: () => setConnected(false)
    })

    client.activate()
    clientRef.current = client
  }, [options, connecting, connected])

  const subscribeToMensagens = useCallback((atendimentoId: string) => {
    if (USAR_MOCK_DATA) return
    // ... implementação
  }, [])

  useEffect(() => {
    if (USAR_MOCK_DATA) return
    if (options.autoConnect) connect()
    return () => clientRef.current?.deactivate()
  }, [])

  return { connected, connecting, connect, subscribeToMensagens }
}
```

---

## 4. CSS Modules com Variáveis Mantine

### CentralAtendimentos.module.css

```css
/* Variáveis baseadas no tema Mantine */
.root {
  --text1: var(--mantine-color-text);
  --text2: var(--mantine-color-dimmed);
  --text3: var(--mantine-color-placeholder);
  --border: var(--mantine-color-default-border);
  --bg1: var(--mantine-color-body);
  --bg2: var(--mantine-color-default);
  --bg3: var(--mantine-color-default-hover);
  --accent: var(--mantine-color-orange-6);
  --ia-color: var(--mantine-color-teal-6);
  --human-color: var(--mantine-color-blue-6);

  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg1);
  color: var(--text1);
}

/* Workspace principal */
.workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Painel de lista */
.listPanel {
  width: 320px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--bg2);
}

/* Chat panel */
.chatPanel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg1);
}

/* Mensagens */
.msgRow {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
}

.msgRow.cliente {
  flex-direction: row;
}

.msgRow.ia,
.msgRow.humano {
  flex-direction: row-reverse;
}

.msgBubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.4;
}

.msgBubble.client {
  background: var(--bg3);
  border-bottom-left-radius: 4px;
}

.msgBubble.ia {
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.msgBubble.human {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}

/* Status badges */
.statusBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.statusBadge.waiting {
  background: rgba(251, 146, 60, 0.15);
  color: var(--accent);
}

.statusBadge.ia {
  background: rgba(45, 212, 191, 0.15);
  color: var(--ia-color);
}

.statusBadge.human {
  background: rgba(59, 130, 246, 0.15);
  color: var(--human-color);
}

/* Empty state */
.emptyState {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text3);
}

.emptyIcon {
  font-size: 48px;
  margin-bottom: 16px;
}
```

---

## 5. Colapso de Sidebar

```typescript
import { useContext, useRef, useEffect } from 'react'
import { ArchbaseAdminLayoutContext, ArchbaseAdminLayoutContextValue } from '@archbase/admin'

export function CentralAtendimentosView() {
  const adminLayoutContext = useContext<ArchbaseAdminLayoutContextValue>(ArchbaseAdminLayoutContext)
  const previousCollapsedState = useRef<boolean | undefined>(undefined)

  // Colapsar sidebar ao montar e restaurar ao desmontar
  useEffect(() => {
    previousCollapsedState.current = adminLayoutContext.collapsed
    if (!adminLayoutContext.collapsed && adminLayoutContext.setCollapsed) {
      adminLayoutContext.setCollapsed(true)
    }
    return () => {
      if (previousCollapsedState.current === false && adminLayoutContext.setCollapsed) {
        adminLayoutContext.setCollapsed(false)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.root}>
      {/* ... */}
    </div>
  )
}
```

---

## 6. Componentes de Chat

### MensagemItem

```typescript
interface MensagemItemProps {
  mensagem: MensagemDto
}

export function MensagemItem({ mensagem }: MensagemItemProps) {
  const lado = useMemo(() => {
    if (mensagem.origem === 'CLIENTE') return 'client'
    if (mensagem.origem === 'IA') return 'ia'
    return 'human'
  }, [mensagem.origem])

  return (
    <div className={`${styles.msgRow} ${styles[lado]}`}>
      {mensagem.origem === 'CLIENTE' && (
        <div className={styles.msgAvatar}>CL</div>
      )}
      <div>
        {mensagem.origem !== 'CLIENTE' && (
          <div className={styles.msgLabel}>
            {mensagem.origem === 'IA' ? 'Agente IA' : mensagem.operadorNome}
          </div>
        )}
        <div className={`${styles.msgBubble} ${styles[lado]}`}>
          {mensagem.conteudo}
        </div>
        <div className={styles.msgTime}>
          {formatHorario(mensagem.dataEnvio)}
          {mensagem.lida && ' ✓✓'}
        </div>
      </div>
    </div>
  )
}
```

### TransferenciaCard

```typescript
export function TransferenciaCard({ atendimentoId, onAssumir }: TransferenciaCardProps) {
  return (
    <div className={styles.transferEvent}>
      <div className={styles.transferCard}>
        <div className={styles.transferIcon}>🔔</div>
        <div>
          <div className={styles.transferTitle}>
            Transferência para Humano Solicitada
          </div>
          <div className={styles.transferDetail}>
            O agente IA solicitou transferência para atendimento humano.
          </div>
          <Button color="orange" onClick={() => onAssumir(atendimentoId)}>
            ✋ Assumir este atendimento
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## 7. Hooks Compostos

### useAtendimentosSAC

```typescript
export function useAtendimentosSAC(): UseAtendimentosSACReturn {
  const service = useInjection<SACAtendimentoService>(API_TYPE.SACAtendimento)

  const [atendimentos, setAtendimentos] = useState<AtendimentoDto[]>([])
  const [loading, setLoading] = useState(true)
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<AtendimentoDto | null>(null)
  const [mensagens, setMensagens] = useState<MensagemDto[]>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [lista, contadores] = await Promise.all([
        service.listar(),
        service.contadores()
      ])
      // Ordenar: AGUARDANDO_HUMANO primeiro
      const ordenados = lista.sort((a, b) => {
        if (a.status === 'AGUARDANDO_HUMANO' && b.status !== 'AGUARDANDO_HUMANO') return -1
        if (a.status !== 'AGUARDANDO_HUMANO' && b.status === 'AGUARDANDO_HUMANO') return 1
        return new Date(b.dataUltimaInteracao).getTime() - new Date(a.dataUltimaInteracao).getTime()
      })
      setAtendimentos(ordenados)
    } finally {
      setLoading(false)
    }
  }, [service])

  const assumir = useCallback(async (id: string) => {
    const atualizado = await service.assumir(id)
    setAtendimentos(prev => prev.map(a => a.id === id ? atualizado : a))
    if (atendimentoSelecionado?.id === id) {
      setAtendimentoSelecionado(atualizado)
    }
    return atualizado
  }, [service, atendimentoSelecionado])

  useEffect(() => { refresh() }, [refresh])

  return {
    atendimentos,
    loading,
    atendimentoSelecionado,
    mensagens,
    refresh,
    selecionarAtendimento: setAtendimentoSelecionado,
    assumir,
    // ... outros métodos
  }
}
```

---

## 8. Emojis vs HTML Entities

**IMPORTANTE**: Em JSX, use emojis Unicode diretamente, não HTML entities.

```typescript
// ❌ ERRADO - Renderiza como texto
<div>&#128172;</div>

// ✅ CORRETO - Renderiza o emoji
<div>💬</div>
```

Emojis comuns:
- 💬 Chat/Mensagem
- 📧 Email
- 🔔 Notificação
- 👤 Usuário
- 🤖 IA/Bot
- ✋ Mão (assumir)
- ✓ Check
- 📎 Anexo
- 📋 Lista/Clipboard
- ⏱ Timer/SLA
- 📦 Pacote/Pedido

---

## 9. Checklist de Implementação

- [ ] Criar estrutura de pastas conforme seção 1
- [ ] Definir DTOs em `domain/atendimento/`
- [ ] Criar services com suporte a mock
- [ ] Implementar hooks compostos
- [ ] Criar CSS modules com variáveis Mantine
- [ ] Implementar WebSocket hook (desabilitado com mock)
- [ ] Usar emojis Unicode, não HTML entities
- [ ] Colapsar sidebar ao entrar na view
- [ ] Restaurar sidebar ao sair

---

Versão: 1.0.0
Atualizado: 2026-02-20
