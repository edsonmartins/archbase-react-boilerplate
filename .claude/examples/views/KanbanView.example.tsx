/**
 * Exemplo: Kanban View com toggle Lista/Kanban
 *
 * Padrão validado contra gestor-rq-admin (produção) - TicketKanbanView.
 *
 * Dependência: react-kanban-kit (pnpm add react-kanban-kit)
 *
 * PADRÕES DEMONSTRADOS:
 * - Kanban com react-kanban-kit (BoardData, BoardItem, Kanban)
 * - Toggle entre Kanban e ArchbaseDataGrid (SegmentedControl)
 * - Filtros com Chip.Group, Select, Switch, TextInput debounced
 * - Tabs de contexto (Meus / Departamento / Todos)
 * - Cards com prioridade, status, badges, ações
 * - DataSource local para lista (V1 para dados já carregados)
 * - Segurança com ArchbaseViewSecurityProvider + useSecureActions
 * - Theme-aware (dark/light) para cores dos cards
 * - CSS overrides para react-kanban-kit
 */

import React, { useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from 'react'
import {
  Paper, Title, Group, Stack, ActionIcon, Tooltip, LoadingOverlay, Text,
  Button, SegmentedControl, Tabs, Badge, Chip, Select, Switch, Box,
  Divider, TextInput, ThemeIcon,
  useMantineColorScheme, useMantineTheme,
} from '@mantine/core'
import {
  IconRefresh, IconPlus, IconLayoutKanban, IconList, IconUser, IconUsers,
  IconWorld, IconAlertTriangle, IconEye, IconEdit, IconSearch,
  IconInbox, IconUserCheck, IconHeadset, IconCircleCheck, IconX,
  IconCalendar, IconBuildingCommunity,
} from '@tabler/icons-react'
import { useDebouncedValue } from '@mantine/hooks'
import { Kanban, type BoardData, type BoardItem, type BoardProps } from 'react-kanban-kit'

import { ArchbaseDataSource } from '@archbase/data'
import { useArchbaseRemoteServiceApi } from '@archbase/data'
import { useArchbaseTranslation } from '@archbase/core'
import { ArchbaseViewSecurityProvider } from '@archbase/security'
import {
  ArchbaseNotifications, ArchbaseDataGrid, ArchbaseDataGridColumn, Columns,
} from '@archbase/components'

// Ajuste os imports para o seu projeto:
// import { API_TYPE } from '../../ioc/RapidexIOCTypes'
// import { TicketService } from '../../services/TicketService'
// import { TicketDto, StatusTicket, ... } from '../../domain/ticket'
// import { useSecureActions } from '../../hooks/useSecureActions'

// ===========================================
// 1. ENUMS E CONSTANTES
// ===========================================

enum StatusTicket {
  NOVO = 'NOVO',
  ATRIBUIDO = 'ATRIBUIDO',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
  RESOLVIDO = 'RESOLVIDO',
  CANCELADO = 'CANCELADO',
}

const StatusTicketValues = [
  { value: StatusTicket.NOVO, label: 'Novo' },
  { value: StatusTicket.ATRIBUIDO, label: 'Atribuido' },
  { value: StatusTicket.EM_ATENDIMENTO, label: 'Em Atendimento' },
  { value: StatusTicket.RESOLVIDO, label: 'Resolvido' },
  { value: StatusTicket.CANCELADO, label: 'Cancelado' },
]

enum PrioridadeTicket {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

const PrioridadeTicketValues = [
  { value: PrioridadeTicket.BAIXA, label: 'Baixa', color: 'green' },
  { value: PrioridadeTicket.MEDIA, label: 'Média', color: 'yellow' },
  { value: PrioridadeTicket.ALTA, label: 'Alta', color: 'orange' },
  { value: PrioridadeTicket.CRITICA, label: 'Crítica', color: 'red' },
]

// Colunas do Kanban (quais status serão exibidos)
const COLUMN_ORDER: StatusTicket[] = [
  StatusTicket.ATRIBUIDO,
  StatusTicket.EM_ATENDIMENTO,
  StatusTicket.RESOLVIDO,
  StatusTicket.CANCELADO,
]

// Cores por status
const STATUS_COLORS: Record<StatusTicket, string> = {
  [StatusTicket.NOVO]: 'blue',
  [StatusTicket.ATRIBUIDO]: 'indigo',
  [StatusTicket.EM_ATENDIMENTO]: 'violet',
  [StatusTicket.RESOLVIDO]: 'green',
  [StatusTicket.CANCELADO]: 'red',
}

// Icones por status
const STATUS_ICONS: Record<StatusTicket, React.ReactNode> = {
  [StatusTicket.NOVO]: <IconInbox size={16} />,
  [StatusTicket.ATRIBUIDO]: <IconUserCheck size={16} />,
  [StatusTicket.EM_ATENDIMENTO]: <IconHeadset size={16} />,
  [StatusTicket.RESOLVIDO]: <IconCircleCheck size={16} />,
  [StatusTicket.CANCELADO]: <IconX size={16} />,
}

const PRIORIDADE_COLORS: Record<PrioridadeTicket, string> = {
  [PrioridadeTicket.BAIXA]: 'green',
  [PrioridadeTicket.MEDIA]: 'yellow',
  [PrioridadeTicket.ALTA]: 'orange',
  [PrioridadeTicket.CRITICA]: 'red',
}

// DTO simplificado para o exemplo
interface TicketDto {
  id: string
  code: string
  descricao: string
  status: StatusTicket
  prioridade: PrioridadeTicket
  nomeCliente?: string
  departamento?: string
  responsavel?: string
  dataAbertura: string
  slaViolado?: boolean
}

type ViewMode = 'kanban' | 'list'
type TabFilter = 'meus' | 'departamento' | 'todos'
type ConfigMap = BoardProps['configMap']

// ===========================================
// 2. VIEW WRAPPER COM SEGURANCA
// ===========================================

export function TicketKanbanView() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName="ticket.kanban"
      resourceDescription="Kanban de Tickets"
    >
      <TicketKanbanViewContent />
    </ArchbaseViewSecurityProvider>
  )
}

// ===========================================
// 3. COMPONENTE KANBAN BOARD
// ===========================================

interface TicketKanbanBoardProps {
  tickets: TicketDto[]
  onTicketClick?: (ticket: TicketDto) => void
  onTicketEdit?: (ticket: TicketDto) => void
  height?: string | number
}

function TicketKanbanBoard({
  tickets,
  onTicketClick,
  onTicketEdit,
  height = 'calc(100vh - 260px)',
}: TicketKanbanBoardProps) {
  const { colorScheme } = useMantineColorScheme()
  const theme = useMantineTheme()
  const isDark = colorScheme === 'dark'
  const containerRef = useRef<HTMLDivElement>(null)

  // Cores tema-aware
  const columnBgColor = isDark ? theme.colors.dark[7] : '#f8f9fa'
  const columnBorderColor = isDark ? theme.colors.dark[4] : '#e9ecef'
  const cardBgColor = isDark ? theme.colors.dark[5] : '#ffffff'
  const cardBorderColor = isDark ? theme.colors.dark[4] : '#e9ecef'

  // Montar BoardData para react-kanban-kit
  const dataSource: BoardData = useMemo(() => {
    const data: BoardData = {
      root: {
        id: 'root',
        title: 'Root',
        children: COLUMN_ORDER,
        totalChildrenCount: COLUMN_ORDER.length,
        parentId: null,
      },
    }

    // Criar colunas
    COLUMN_ORDER.forEach((status) => {
      const statusConfig = StatusTicketValues.find((s) => s.value === status)
      const ticketsColuna = tickets.filter((t) => t.status === status)

      data[status] = {
        id: status,
        title: statusConfig?.label || status,
        children: ticketsColuna.map((t) => t.id),
        totalChildrenCount: ticketsColuna.length,
        parentId: 'root',
        content: {
          color: STATUS_COLORS[status],
          icon: STATUS_ICONS[status],
        },
      }
    })

    // Criar cards
    tickets.forEach((ticket) => {
      data[ticket.id] = {
        id: ticket.id,
        title: ticket.code || ticket.id.slice(0, 8),
        children: [],
        totalChildrenCount: 0,
        parentId: ticket.status || StatusTicket.NOVO,
        type: 'card',
        content: { ticket },
      }
    })

    return data
  }, [tickets])

  // Click handler
  const handleCardClick = useCallback(
    (_e: React.MouseEvent, card: BoardItem) => {
      if (onTicketClick && card.content?.ticket) {
        onTicketClick(card.content.ticket)
      }
    },
    [onTicketClick],
  )

  // Configuracao de render dos cards
  const configMap: ConfigMap = {
    card: {
      render: ({ data }) => {
        const ticket: TicketDto = data.content?.ticket
        if (!ticket) return null

        const prioridadeColor = PRIORIDADE_COLORS[ticket.prioridade] || 'gray'
        const prioridadeConfig = PrioridadeTicketValues.find((p) => p.value === ticket.prioridade)

        return (
          <Paper
            className="ticket-card"
            shadow="xs"
            p="sm"
            radius="md"
            bg={cardBgColor}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              cursor: onTicketClick || onTicketEdit ? 'pointer' : 'default',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              border: `1px solid ${cardBorderColor}`,
              borderLeftWidth: 4,
              borderLeftColor: `var(--mantine-color-${prioridadeColor}-5)`,
            }}
            onClick={(e) => handleCardClick(e, data)}
          >
            <Stack gap={8}>
              {/* Linha 1: Codigo + SLA */}
              <Group justify="space-between" wrap="nowrap" gap={8}>
                <Text size="sm" fw={700} c="blue" truncate style={{ minWidth: 0 }}>
                  {ticket.code || ticket.id.slice(0, 8)}
                </Text>
                {ticket.slaViolado && (
                  <Tooltip label="SLA Violado">
                    <ThemeIcon size={20} color="red" variant="light" radius="xl">
                      <IconAlertTriangle size={12} />
                    </ThemeIcon>
                  </Tooltip>
                )}
              </Group>

              {/* Linha 2: Descricao */}
              <Text
                size="sm"
                lineClamp={2}
                lh={1.45}
                c={isDark ? 'gray.2' : 'dark.6'}
                style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
              >
                {ticket.descricao || '-'}
              </Text>

              {/* Linha 3: Cliente + Departamento + Data */}
              {(ticket.nomeCliente || ticket.departamento || ticket.dataAbertura) && (
                <Group gap={8} wrap="nowrap">
                  {ticket.nomeCliente && (
                    <Group gap={4} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                      <IconUser size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
                      <Text size="xs" c="dimmed" truncate style={{ minWidth: 0 }}>
                        {ticket.nomeCliente}
                      </Text>
                    </Group>
                  )}
                  {ticket.departamento && (
                    <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
                      <IconBuildingCommunity size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
                      <Text size="xs" c="dimmed" truncate style={{ minWidth: 0 }}>
                        {ticket.departamento}
                      </Text>
                    </Group>
                  )}
                  <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                    <IconCalendar size={12} style={{ opacity: 0.5 }} />
                    <Text size="xs" c="dimmed">
                      {new Date(ticket.dataAbertura).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </Text>
                  </Group>
                </Group>
              )}

              {/* Linha 4: Acoes + Prioridade */}
              <Group justify="space-between" wrap="nowrap">
                <Group gap={4}>
                  {onTicketClick && (
                    <Tooltip label="Ver detalhes" position="bottom">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTicketClick(ticket)
                        }}
                      >
                        <IconEye size={12} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  {onTicketEdit && (
                    <Tooltip label="Editar" position="bottom">
                      <ActionIcon
                        variant="light"
                        color="orange"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTicketEdit(ticket)
                        }}
                      >
                        <IconEdit size={12} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
                <Badge
                  size="xs"
                  variant="dot"
                  color={prioridadeConfig?.color || 'gray'}
                  styles={{
                    root: {
                      padding: '0 8px',
                      height: 20,
                      fontSize: 10,
                      fontWeight: 600,
                      flexShrink: 0,
                    },
                  }}
                >
                  {prioridadeConfig?.label || ticket.prioridade}
                </Badge>
              </Group>
            </Stack>
          </Paper>
        )
      },
      isDraggable: false, // true para habilitar drag-and-drop
    },
  }

  // Render do header de cada coluna
  const renderColumnHeader = (column: BoardItem) => {
    const color = column.content?.color || 'gray'
    const icon = column.content?.icon

    return (
      <Group
        justify="space-between"
        pb={10}
        mb={6}
        style={{ borderBottom: `2px solid var(--mantine-color-${color}-4)` }}
      >
        <Group gap={8}>
          <ThemeIcon size="md" variant="light" color={color} radius="xl">
            {icon}
          </ThemeIcon>
          <Text size="sm" fw={600}>
            {column.title}
          </Text>
        </Group>
        <Badge size="md" color={color} variant="filled" radius="xl" miw={28}>
          {column.totalChildrenCount}
        </Badge>
      </Group>
    )
  }

  return (
    <Box
      ref={containerRef}
      id="ticket-kanban"
      style={{ height, width: '100%' } as React.CSSProperties}
      className="kanban-board"
    >
      {/* CSS overrides necessarios para react-kanban-kit funcionar em 100% width */}
      <style>{`
        #ticket-kanban ::-webkit-scrollbar { height: 6px; width: 6px; }
        #ticket-kanban ::-webkit-scrollbar-track { background: transparent; }
        #ticket-kanban ::-webkit-scrollbar-thumb { background-color: var(--mantine-color-gray-4); border-radius: 3px; }
        #ticket-kanban#ticket-kanban .rkk-board {
          width: 100% !important;
          display: flex !important;
          gap: 14px !important;
          overflow: hidden !important;
        }
        #ticket-kanban#ticket-kanban .rkk-board > div {
          flex: 1 1 0% !important;
          min-width: 0 !important;
          max-width: none !important;
        }
        #ticket-kanban#ticket-kanban .rkk-column-outer,
        #ticket-kanban#ticket-kanban .rkk-column,
        #ticket-kanban#ticket-kanban .rkk-column-wrapper,
        #ticket-kanban#ticket-kanban .rkk-column-content,
        #ticket-kanban#ticket-kanban .rkk-column-content-list,
        #ticket-kanban#ticket-kanban .rkk-column-content-list > div,
        #ticket-kanban#ticket-kanban .rkk-column-content-list > div > div,
        #ticket-kanban#ticket-kanban .rkk-generic-item-wrapper,
        #ticket-kanban#ticket-kanban .rkk-card-outer,
        #ticket-kanban#ticket-kanban .rkk-card-inner,
        #ticket-kanban#ticket-kanban .ticket-card {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        #ticket-kanban .ticket-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
      `}</style>

      <Kanban
        dataSource={dataSource}
        configMap={configMap}
        viewOnly={true}
        virtualization={true}
        cardsGap={8}
        renderColumnHeader={renderColumnHeader}
        columnWrapperStyle={() => ({
          flex: '1 1 0%',
          minWidth: 0,
          maxWidth: 'none',
          width: '100%',
          backgroundColor: columnBgColor,
          borderRadius: 10,
          border: `1px solid ${columnBorderColor}`,
          padding: '12px 10px',
        })}
        columnStyle={() => ({
          height: '100%',
          backgroundColor: columnBgColor,
        })}
        columnListContentStyle={() => ({
          padding: '6px 0',
          backgroundColor: columnBgColor,
        })}
        rootStyle={{
          height: '100%',
          gap: '14px',
          display: 'flex',
          width: '100%',
          overflow: 'hidden',
        }}
      />
    </Box>
  )
}

// ===========================================
// 4. VIEW PRINCIPAL COM TOGGLE KANBAN/LISTA
// ===========================================

function TicketKanbanViewContent() {
  const { t } = useArchbaseTranslation()

  // Estados
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [tabFilter, setTabFilter] = useState<TabFilter>('meus')
  const [prioridadeFilter, setPrioridadeFilter] = useState<PrioridadeTicket | null>(null)
  const [slaVioladoFilter, setSlaVioladoFilter] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [debouncedSearch] = useDebouncedValue(searchText, 400)
  const [tickets, setTickets] = useState<TicketDto[]>([])
  const initializedRef = useRef(false)

  // DataSource LOCAL para a visualizacao em lista
  // Usado porque os dados ja estao carregados em memoria
  const dsListRef = useRef<ArchbaseDataSource<TicketDto, string> | null>(null)
  if (!dsListRef.current) {
    dsListRef.current = new ArchbaseDataSource<TicketDto, string>('dsTicketsList', {
      records: [],
      grandTotalRecords: 0,
      currentPage: 0,
      totalPages: 0,
      pageSize: 200,
    })
  }
  const dsList = dsListRef.current

  // Service (ajuste para o seu service)
  // const serviceApi = useArchbaseRemoteServiceApi<TicketService>(API_TYPE.Ticket)

  // Carregar tickets
  const carregarTickets = useCallback(async () => {
    setLoading(true)
    try {
      // Substitua pela chamada real ao service:
      // const result = await serviceApi.findAll(0, 200)
      // setTickets(result.content || [])

      // Dados mock para o exemplo:
      setTickets([
        {
          id: '1', code: 'TKT-001', descricao: 'Problema no login',
          status: StatusTicket.ATRIBUIDO, prioridade: PrioridadeTicket.ALTA,
          nomeCliente: 'João Silva', departamento: 'TI',
          responsavel: 'Maria', dataAbertura: '2026-03-20', slaViolado: true,
        },
        {
          id: '2', code: 'TKT-002', descricao: 'Erro na impressão de relatório',
          status: StatusTicket.EM_ATENDIMENTO, prioridade: PrioridadeTicket.MEDIA,
          nomeCliente: 'Ana Costa', departamento: 'Financeiro',
          responsavel: 'Pedro', dataAbertura: '2026-03-21',
        },
        {
          id: '3', code: 'TKT-003', descricao: 'Solicitação de acesso',
          status: StatusTicket.RESOLVIDO, prioridade: PrioridadeTicket.BAIXA,
          nomeCliente: 'Carlos Souza', departamento: 'RH',
          responsavel: 'Maria', dataAbertura: '2026-03-18',
        },
      ])
    } catch (error: any) {
      ArchbaseNotifications.showError('Erro', error.message || 'Erro ao carregar tickets')
    } finally {
      setLoading(false)
    }
  }, [tabFilter, t])

  // Carregar na montagem
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    carregarTickets()
  }, [])

  // Recarregar quando aba mudar
  useEffect(() => {
    if (initializedRef.current) {
      carregarTickets()
    }
  }, [tabFilter])

  // Filtrar tickets localmente
  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((ticket) => {
      // Filtro de busca texto
      if (debouncedSearch.trim()) {
        const termo = debouncedSearch.trim().toLowerCase()
        const match =
          ticket.code?.toLowerCase().includes(termo) ||
          ticket.descricao?.toLowerCase().includes(termo) ||
          ticket.nomeCliente?.toLowerCase().includes(termo) ||
          ticket.responsavel?.toLowerCase().includes(termo)
        if (!match) return false
      }

      // Filtro de prioridade
      if (prioridadeFilter && ticket.prioridade !== prioridadeFilter) return false

      // Filtro de SLA violado
      if (slaVioladoFilter && !ticket.slaViolado) return false

      return true
    })
  }, [tickets, debouncedSearch, prioridadeFilter, slaVioladoFilter])

  // Atualizar DataSource da lista quando ticketsFiltrados mudar
  useEffect(() => {
    dsList.open({
      records: ticketsFiltrados,
      grandTotalRecords: ticketsFiltrados.length,
      currentPage: 0,
      totalPages: 1,
      pageSize: 200,
    })
  }, [ticketsFiltrados, dsList])

  // Handlers
  const handleTicketClick = (ticket: TicketDto) => {
    // navigate(`/tickets/${ticket.id}`)
    console.log('View ticket:', ticket.id)
  }

  const handleEditarTicket = (ticket: TicketDto) => {
    // navigate(`/tickets/${ticket.id}?action=edit`)
    console.log('Edit ticket:', ticket.id)
  }

  // Totais
  const totalTickets = ticketsFiltrados.length
  const totalSLAViolado = ticketsFiltrados.filter((t) => t.slaViolado).length

  // ===========================================
  // 5. RENDER DA LISTA (ArchbaseDataGrid)
  // ===========================================

  const renderListView = () => (
    <div style={{ flex: 1, minHeight: 0 }}>
      <ArchbaseDataGrid dataSource={dsList} height="100%" enableTopToolbar={false} withBorder>
        <Columns>
          <ArchbaseDataGridColumn
            dataField="code"
            header="Codigo"
            size={120}
            dataType="text"
            render={(data: any) => (
              <Text size="sm" fw={500}>
                {data.row?.code || data.getValue()}
              </Text>
            )}
          />
          <ArchbaseDataGridColumn
            dataField="status"
            header="Status"
            size={150}
            dataType="text"
            align="center"
            render={(data: any) => {
              const status = data.row?.status || data.getValue()
              return (
                <Badge color={STATUS_COLORS[status as StatusTicket] || 'gray'} variant="filled" size="sm">
                  {StatusTicketValues.find((s) => s.value === status)?.label || status}
                </Badge>
              )
            }}
          />
          <ArchbaseDataGridColumn
            dataField="prioridade"
            header="Prioridade"
            size={130}
            dataType="text"
            align="center"
            render={(data: any) => {
              const prio = data.row?.prioridade || data.getValue()
              const config = PrioridadeTicketValues.find((p) => p.value === prio)
              return (
                <Badge color={config?.color || 'gray'} variant="light" size="sm">
                  {config?.label || prio}
                </Badge>
              )
            }}
          />
          <ArchbaseDataGridColumn dataField="descricao" header="Descricao" size={280} dataType="text" />
          <ArchbaseDataGridColumn dataField="nomeCliente" header="Cliente" size={150} dataType="text" />
          <ArchbaseDataGridColumn dataField="responsavel" header="Responsavel" size={150} dataType="text" />
          <ArchbaseDataGridColumn
            dataField="slaViolado"
            header="SLA"
            size={80}
            dataType="boolean"
            align="center"
            render={(data: any) => {
              const violado = data.row?.slaViolado
              return violado ? (
                <Badge color="red" variant="filled" size="xs">
                  Violado
                </Badge>
              ) : (
                <Badge color="green" variant="light" size="xs">
                  OK
                </Badge>
              )
            }}
          />
          <ArchbaseDataGridColumn
            dataField="id"
            header="Acoes"
            size={80}
            dataType="text"
            enableSorting={false}
            render={(data: any) => {
              const row = data.row
              return (
                <Group gap={4}>
                  <Tooltip label="Ver">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTicketClick(row)
                      }}
                    >
                      <IconEye size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Editar">
                    <ActionIcon
                      variant="light"
                      color="orange"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditarTicket(row)
                      }}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              )
            }}
          />
        </Columns>
      </ArchbaseDataGrid>
    </div>
  )

  // ===========================================
  // 6. RENDER PRINCIPAL
  // ===========================================

  return (
    <Paper p="md" style={{ height: '100%', position: 'relative' }}>
      <LoadingOverlay visible={loading} />

      <Stack gap="md" style={{ height: '100%' }}>
        {/* Header */}
        <Group justify="space-between">
          <Group gap="md">
            <Title order={2}>Meus Tickets</Title>
            <Badge size="lg" variant="light">
              {totalTickets}
            </Badge>
            {totalSLAViolado > 0 && (
              <Tooltip label="Tickets com SLA violado">
                <Badge size="lg" variant="filled" color="red" leftSection={<IconAlertTriangle size={14} />}>
                  {totalSLAViolado}
                </Badge>
              </Tooltip>
            )}
          </Group>

          <Group gap="sm">
            <Button leftSection={<IconPlus size={18} />} onClick={() => console.log('Novo ticket')}>
              Novo Ticket
            </Button>
            <Button leftSection={<IconRefresh size={16} />} variant="light" onClick={carregarTickets}>
              Atualizar
            </Button>
          </Group>
        </Group>

        {/* Filtros */}
        <Paper withBorder p="sm" radius="md">
          <Group justify="space-between">
            {/* Abas de contexto */}
            <Tabs variant="pills" value={tabFilter} onChange={(v) => setTabFilter(v as TabFilter)}>
              <Tabs.List>
                <Tabs.Tab value="meus" leftSection={<IconUser size={14} />}>
                  Para Mim
                </Tabs.Tab>
                <Tabs.Tab value="departamento" leftSection={<IconUsers size={14} />}>
                  Meu Departamento
                </Tabs.Tab>
                <Tabs.Tab value="todos" leftSection={<IconWorld size={14} />}>
                  Todos
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            {/* Toggle Kanban/Lista */}
            <SegmentedControl
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
              data={[
                { value: 'kanban', label: (<IconLayoutKanban size={16} />) as any },
                { value: 'list', label: (<IconList size={16} />) as any },
              ]}
            />
          </Group>

          {/* Filtros rapidos */}
          <Group mt="sm" gap="md">
            <TextInput
              size="xs"
              placeholder="Buscar por codigo, cliente, descricao..."
              leftSection={<IconSearch size={14} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />

            <Divider orientation="vertical" />

            {/* Chips de prioridade */}
            <Chip.Group
              value={prioridadeFilter || ''}
              onChange={(v) => setPrioridadeFilter((v as PrioridadeTicket) || null)}
            >
              <Group gap="xs">
                <Chip value="" size="xs" variant="light">
                  Todos
                </Chip>
                {PrioridadeTicketValues.map((p) => (
                  <Chip key={p.value} value={p.value} size="xs" color={p.color} variant="light">
                    {p.label}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>

            <Divider orientation="vertical" />

            {/* Toggle SLA Violado */}
            <Switch
              label="SLA Violado"
              size="xs"
              checked={slaVioladoFilter}
              onChange={(e) => setSlaVioladoFilter(e.currentTarget.checked)}
              color="red"
            />
          </Group>
        </Paper>

        {/* Conteudo: Kanban ou Lista */}
        {viewMode === 'kanban' ? (
          <Box style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
            <TicketKanbanBoard
              tickets={ticketsFiltrados}
              onTicketClick={handleTicketClick}
              onTicketEdit={handleEditarTicket}
              height="calc(100vh - 260px)"
            />
          </Box>
        ) : (
          renderListView()
        )}
      </Stack>
    </Paper>
  )
}

export default TicketKanbanView
