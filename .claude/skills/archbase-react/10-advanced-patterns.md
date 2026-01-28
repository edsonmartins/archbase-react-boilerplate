# 10. Padrões Avançados

Padrões avançados identificados no projeto gestor-rq-admin para views complexas, dashboards, gráficos e mais.

---

## Gráficos com ECharts

### Estrutura Base

```typescript
import * as echarts from 'echarts'
import { useRef, useEffect } from 'react'
import { useMantineColorScheme } from '@mantine/core'

export function MeuGrafico({ data, height = 300 }: MeuGraficoProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  useEffect(() => {
    if (!chartRef.current) return

    // Inicializa ECharts apenas uma vez
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    // Configuração do gráfico
    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      // ... configurações específicas
    }

    chartInstance.current.setOption(option)

    // Resize handler
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [data, isDark])

  return <Box ref={chartRef} style={{ width: '100%', height }} />
}
```

### Pie Chart (Donut)

```typescript
export function StatusPieChart({ data, height = 300 }: StatusPieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  useEffect(() => {
    if (!chartRef.current) return

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    const chartData = [
      { value: data.pendente, name: 'Pendente', itemStyle: { color: '#868e96' } },
      { value: data.emAndamento, name: 'Em Andamento', itemStyle: { color: '#339af0' } },
      { value: data.concluido, name: 'Concluído', itemStyle: { color: '#51cf66' } },
      { value: data.cancelado, name: 'Cancelado', itemStyle: { color: '#ff6b6b' } }
    ].filter(item => item.value > 0)

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: isDark ? '#c1c2c5' : '#495057' }
      },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['40%', '70%'],  // Donut
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: isDark ? '#1a1b1e' : '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
              color: isDark ? '#fff' : '#000'
            }
          },
          labelLine: { show: false },
          data: chartData
        }
      ]
    }

    chartInstance.current.setOption(option)

    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [data, isDark])

  return <Box ref={chartRef} style={{ width: '100%', height }} />
}
```

### Bar Chart

```typescript
const option: echarts.EChartsOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: data.labels,
    axisLabel: { color: isDark ? '#c1c2c5' : '#495057' }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: isDark ? '#c1c2c5' : '#495057' }
  },
  series: [
    {
      name: 'Valor',
      type: 'bar',
      data: data.values,
      itemStyle: { color: '#339af0', borderRadius: [4, 4, 0, 0] }
    }
  ]
}
```

---

## KPI Cards

### Componente KpiCard

```typescript
import { Paper, Stack, Group, Text } from '@mantine/core'

export type KpiVariant =
  | 'total'
  | 'emViagem'
  | 'problemas'
  | 'atrasadas'
  | 'pendentes'
  | 'concluidas'

interface KpiCardProps {
  title: string
  value: string | number
  delta?: string  // ex: "+2.91%" | "-5.60%"
  variant: KpiVariant
  minHeight?: number
  height?: number
  icon?: React.ReactNode
}

// CSS Variables para gradientes (definir no CSS global)
const VARIANT_GRADIENTS: Record<KpiVariant, string> = {
  total: 'var(--kpi-bg-total)',
  emViagem: 'var(--kpi-bg-em-viagem)',
  problemas: 'var(--kpi-bg-problemas)',
  atrasadas: 'var(--kpi-bg-atrasadas)',
  pendentes: 'var(--kpi-bg-pendentes)',
  concluidas: 'var(--kpi-bg-concluidas)',
}

export function KpiCard({
  title,
  value,
  delta,
  variant,
  minHeight = 100,
  height,
  icon
}: KpiCardProps) {
  const bg = VARIANT_GRADIENTS[variant]

  return (
    <Paper
      radius="md"
      p="md"
      style={{
        background: bg,
        color: 'var(--kpi-fg)',
        minHeight: height ? undefined : minHeight,
        height: height || undefined,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Stack gap={4} style={{ width: '100%' }}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Text fz={11} fw={500} style={{
            color: 'var(--kpi-fg-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {title}
          </Text>
          {icon && <div style={{ color: 'var(--kpi-fg-soft)', opacity: 0.9 }}>{icon}</div>}
        </Group>

        <Text fz={28} fw={700} lh={1.1} style={{ color: 'var(--kpi-fg)' }}>
          {value}
        </Text>

        {delta ? (
          <Text fz={12} fw={500} style={{ color: 'var(--kpi-fg-soft)' }}>
            {delta}
          </Text>
        ) : (
          <div style={{ height: 14 }} />
        )}
      </Stack>
    </Paper>
  )
}
```

### CSS Variables para KPI

```css
:root {
  --kpi-fg: #ffffff;
  --kpi-fg-muted: rgba(255, 255, 255, 0.7);
  --kpi-fg-soft: rgba(255, 255, 255, 0.85);

  --kpi-bg-total: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --kpi-bg-em-viagem: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  --kpi-bg-problemas: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --kpi-bg-atrasadas: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  --kpi-bg-pendentes: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --kpi-bg-concluidas: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
```

### Uso em Dashboard

```typescript
<SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
  <KpiCard
    title="Total Viagens"
    value={stats.totalViagens}
    delta="+12%"
    variant="total"
    icon={<IconTruck size={20} />}
  />
  <KpiCard
    title="Em Rota"
    value={stats.emRota}
    variant="emViagem"
    icon={<IconMapPin size={20} />}
  />
  <KpiCard
    title="Atrasadas"
    value={stats.atrasadas}
    delta="-3.5%"
    variant="atrasadas"
    icon={<IconAlertTriangle size={20} />}
  />
  <KpiCard
    title="Concluídas"
    value={stats.concluidas}
    variant="concluidas"
    icon={<IconCheck size={20} />}
  />
</SimpleGrid>
```

---

## Wizard/Stepper Pattern

### Estrutura com Fases

```typescript
type FaseGeracaoCarga = 'FILTROS' | 'SELECAO' | 'RESULTADO'

function GerarCargaView() {
  const [fase, setFase] = useState<FaseGeracaoCarga>('FILTROS')
  const [filtros, setFiltros] = useState<FiltrosDto>(() => FiltrosDto.newInstance())
  const [pedidos, setPedidos] = useState<PedidoDto[]>([])
  const [pedidosSelecionados, setPedidosSelecionados] = useState<number[]>([])
  const [resultado, setResultado] = useState<ResultadoDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const stepAtual = useMemo(() => {
    switch (fase) {
      case 'FILTROS': return 0
      case 'SELECAO': return 1
      case 'RESULTADO': return 2
      default: return 0
    }
  }, [fase])

  const buscarPedidos = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await service.buscarPedidosElegiveis(filtros)
      setPedidos(result)
      setPedidosSelecionados(result.map(p => p.id))
      if (result.length > 0) {
        setFase('SELECAO')
      } else {
        notifications.show({
          title: 'Nenhum pedido encontrado',
          message: 'Não foram encontrados pedidos elegíveis',
          color: 'yellow'
        })
      }
    } catch (err: any) {
      ArchbaseNotifications.showError('Erro', err.message)
    } finally {
      setIsLoading(false)
    }
  }, [filtros, service])

  const processarSelecionados = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await service.processar(pedidosSelecionados)
      setResultado(result)
      setFase('RESULTADO')
    } catch (err: any) {
      ArchbaseNotifications.showError('Erro', err.message)
    } finally {
      setIsLoading(false)
    }
  }, [pedidosSelecionados, service])

  return (
    <Paper p="lg">
      <Stepper active={stepAtual} style={{ marginBottom: '2rem' }}>
        <Stepper.Step label="Filtros" description="Definir critérios" />
        <Stepper.Step label="Seleção" description="Escolher itens" />
        <Stepper.Step label="Resultado" description="Ver resultado" />
      </Stepper>

      <LoadingOverlay visible={isLoading} />

      {fase === 'FILTROS' && (
        <FiltrosForm
          filtros={filtros}
          onFiltrosChange={setFiltros}
          onBuscar={buscarPedidos}
        />
      )}

      {fase === 'SELECAO' && (
        <SeletorItens
          itens={pedidos}
          selecionados={pedidosSelecionados}
          onSelecionadosChange={setPedidosSelecionados}
          onVoltar={() => setFase('FILTROS')}
          onProximo={processarSelecionados}
        />
      )}

      {fase === 'RESULTADO' && (
        <ResultadoView
          resultado={resultado}
          onVoltar={() => setFase('SELECAO')}
          onNovoProcesso={() => {
            setFase('FILTROS')
            setResultado(null)
            setPedidos([])
          }}
        />
      )}
    </Paper>
  )
}
```

---

## Hook useDashboardData

Hook customizado para carregar dados de dashboard com período.

```typescript
interface UseDashboardDataOptions<T> {
  fetchFn: (periodo: string) => Promise<T>
  initialPeriodo?: string
  autoFetch?: boolean
  showSuccessNotification?: boolean
  showErrorNotification?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseDashboardDataReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  periodo: string
  setPeriodo: (periodo: string) => void
  refetch: () => Promise<void>
  hasLoaded: boolean
}

export function useDashboardData<T>(
  options: UseDashboardDataOptions<T>
): UseDashboardDataReturn<T> {
  const { t } = useArchbaseTranslation()
  const {
    fetchFn,
    initialPeriodo = '7d',
    autoFetch = true,
    showSuccessNotification = false,
    showErrorNotification = true,
    onSuccess,
    onError
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [periodo, setPeriodo] = useState(initialPeriodo)
  const [hasLoaded, setHasLoaded] = useState(false)
  const isMountedRef = useRef(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn(periodo)
      if (isMountedRef.current) {
        setData(result)
        setHasLoaded(true)
        if (showSuccessNotification) {
          notifications.show({
            title: t('gestor-rq-admin:Sucesso'),
            message: t('gestor-rq-admin:Dados carregados com sucesso'),
            color: 'green'
          })
        }
        onSuccess?.(result)
      }
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      if (isMountedRef.current) {
        setError(errorObj)
        setHasLoaded(true)
        if (showErrorNotification) {
          ArchbaseNotifications.showError(t('gestor-rq-admin:Erro'), errorObj.message)
        }
        onError?.(errorObj)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [fetchFn, periodo, t, showSuccessNotification, showErrorNotification, onSuccess, onError])

  useEffect(() => {
    if (autoFetch) {
      refetch()
    }
  }, [periodo, refetch, autoFetch])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    data,
    loading,
    error,
    periodo,
    setPeriodo,
    refetch,
    hasLoaded
  }
}
```

### Uso

```typescript
function DashboardView() {
  const { data, loading, periodo, setPeriodo, refetch } = useDashboardData<DashboardStats>({
    fetchFn: (p) => dashboardService.getStats(p),
    initialPeriodo: '7d',
    autoFetch: true
  })

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Dashboard</Title>
        <Group>
          <Select
            value={periodo}
            onChange={(v) => setPeriodo(v || '7d')}
            data={[
              { value: '1d', label: 'Último dia' },
              { value: '7d', label: 'Últimos 7 dias' },
              { value: '30d', label: 'Últimos 30 dias' }
            ]}
          />
          <ActionIcon onClick={refetch}>
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <LoadingOverlay visible={loading} />

      {data && (
        <SimpleGrid cols={4}>
          <KpiCard title="Total" value={data.total} variant="total" />
          {/* ... mais KPIs */}
        </SimpleGrid>
      )}
    </Stack>
  )
}
```

---

## WebSocket Integration

### Hook useWebSocket

```typescript
interface UseWebSocketOptions {
  url: string
  autoConnect?: boolean
  debug?: boolean
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { url, autoConnect = true, debug = false } = options
  const [connected, setConnected] = useState(false)
  const [posicoes, setPosicoes] = useState<Map<string, PosicaoVeiculo>>(new Map())
  const [alertasNovos, setAlertasNovos] = useState<Alerta[]>([])
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!autoConnect) return

    const client = new Client({
      brokerURL: url,
      debug: debug ? (msg) => console.log('[WS]', msg) : () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    })

    client.onConnect = () => {
      setConnected(true)

      // Subscribe to topics
      client.subscribe('/topic/posicoes', (message) => {
        const posicao = JSON.parse(message.body) as PosicaoVeiculo
        setPosicoes(prev => {
          const next = new Map(prev)
          next.set(posicao.veiculoId, posicao)
          return next
        })
      })

      client.subscribe('/topic/alertas', (message) => {
        const alerta = JSON.parse(message.body) as Alerta
        setAlertasNovos(prev => [...prev, alerta])
      })
    }

    client.onDisconnect = () => {
      setConnected(false)
    }

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [url, autoConnect, debug])

  return { connected, posicoes, alertasNovos }
}
```

### Uso na Torre de Controle

```typescript
function TorreControleView() {
  const [veiculos, setVeiculos] = useState<VeiculoStatusDto[]>([])
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)

  const { connected, posicoes, alertasNovos } = useWebSocket({
    url: `${import.meta.env.VITE_API_URL || ''}/ws/torre-controle`,
    autoConnect: true,
    debug: import.meta.env.DEV
  })

  // Atualizar veículos quando receber posições via WebSocket
  useEffect(() => {
    if (posicoes.size > 0) {
      setVeiculos(prev => {
        const novosMapa = new Map(prev.map(v => [v.veiculoId, v]))
        posicoes.forEach((posicao, veiculoId) => {
          const veiculoAtualizado = converterPosicaoParaVeiculo(posicao)
          novosMapa.set(veiculoId, veiculoAtualizado)
        })
        return Array.from(novosMapa.values())
      })
      setUltimaAtualizacao(new Date())
    }
  }, [posicoes])

  return (
    <Stack>
      <Group justify="space-between">
        <Title>Torre de Controle</Title>
        <Badge color={connected ? 'green' : 'red'}>
          {connected ? 'Conectado' : 'Desconectado'}
        </Badge>
      </Group>
      {/* Mapa com veículos */}
    </Stack>
  )
}
```

---

## Responsividade

### Media Queries com Mantine

```typescript
import { useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'

function ResponsiveView() {
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`)
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`)

  return (
    <Stack>
      {isMobile ? (
        <MobileLayout />
      ) : isTablet ? (
        <TabletLayout />
      ) : (
        <DesktopLayout />
      )}
    </Stack>
  )
}
```

### Layout Adaptativo

```typescript
<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
  {cards.map(card => (
    <KpiCard key={card.id} {...card} />
  ))}
</SimpleGrid>

<Grid>
  <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
    {/* Conteúdo */}
  </Grid.Col>
</Grid>
```

---

## Admin Layout Context

### Controle do Menu Lateral

```typescript
import { useContext, useRef, useEffect } from 'react'
import { ArchbaseAdminLayoutContext } from '@archbase/admin'

function ViewQueColapsaMenu() {
  const adminLayoutContext = useContext(ArchbaseAdminLayoutContext)
  const previousCollapsedState = useRef<boolean | undefined>(undefined)

  // Colapsa menu ao entrar na view
  useEffect(() => {
    previousCollapsedState.current = adminLayoutContext.collapsed
    if (!adminLayoutContext.collapsed && adminLayoutContext.setCollapsed) {
      adminLayoutContext.setCollapsed(true)
    }

    // Restaura ao sair
    return () => {
      if (previousCollapsedState.current === false && adminLayoutContext.setCollapsed) {
        adminLayoutContext.setCollapsed(false)
      }
    }
  }, [])

  return <div>Conteúdo full-width</div>
}
```

---

## Padrões de Performance

### Memoização de Callbacks

```typescript
// Callbacks estáveis com useCallback
const handleUpdate = useCallback((index: number, field: string, value: any) => {
  dataSource.updateFieldArrayItem('contatos', index, (draft) => {
    (draft as any)[field] = value
  })
}, [dataSource])

// Componentes memoizados
const ItemContatoMemo = memo(({ contato, index, onUpdate, onRemove }: ItemContatoProps) => {
  return (
    <Group>
      <Select value={contato.tipo} onChange={(v) => onUpdate(index, 'tipo', v)} />
      <ActionIcon onClick={() => onRemove(index)}>
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  )
})
```

### Carregamento Único com useRef

```typescript
const hasLoadedRef = useRef(false)

useEffect(() => {
  if (hasLoadedRef.current) return
  hasLoadedRef.current = true

  const loadRecord = async () => {
    // Lógica de carregamento
  }

  loadRecord()
}, []) // Dependências vazias
```

### useMemo para Cálculos Pesados

```typescript
const columns = useMemo(() => (
  <Columns>
    <ArchbaseDataGridColumn<ItemDto>
      dataField="nome"
      header="Nome"
      size={200}
      dataType="text"
    />
    {/* Mais colunas */}
  </Columns>
), [t]) // Recalcula apenas quando tradução muda

const totais = useMemo(() => {
  return itens.reduce((acc, item) => ({
    quantidade: acc.quantidade + item.quantidade,
    valor: acc.valor + (item.quantidade * item.precoUnitario)
  }), { quantidade: 0, valor: 0 })
}, [itens])
```

---

## Resumo de Patterns por Tipo

| Tipo | Pattern | Arquivo de Referência |
|------|---------|----------------------|
| Dashboard | `useDashboardData` + KPI Cards + Gráficos | `DashboardOperacionalView.tsx` |
| Wizard | Fases + Stepper + Callbacks | `GerarCargaView.tsx` |
| Real-time | WebSocket + Context + Map de estados | `TorreControleView.tsx` |
| Kanban | Colunas por status + Cards clicáveis | `TicketKanbanView.tsx` |
| Lista/Grid | `ArchbaseGridTemplate` + Security | `ChecklistModeloView.tsx` |
| Formulário | `ArchbaseFormTemplate` + Tabs + V2 | `ChecklistModeloForm.tsx` |
| Modal | `useDisclosure` + DataSource local | `OrdemServicoModal.tsx` |
