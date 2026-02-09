# 12. Padrões de Dashboard

Padrões para criação de dashboards com KPIs, gráficos e dados em tempo real.

---

## 1. Hook useDashboardView

Hook customizado para centralizar setup de dashboard:

```typescript
// src/hooks/dashboard/useDashboardView.ts
import { useArchbaseTranslation, useArchbaseStore } from '@archbase/core'
import { useArchbaseSecureForm } from '@archbase/security'
import { useArchbaseNavigationListener } from '@archbase/admin'
import { useLocation } from 'react-router'

interface UseDashboardViewOptions {
  resourceName: string
  resourceDescription: string
  storeName: string
  navigationRoute: string
}

export function useDashboardView(options: UseDashboardViewOptions) {
  const { t } = useArchbaseTranslation()
  const location = useLocation()
  const store = useArchbaseStore(options.storeName)

  const { canView, isLoading: permissionsLoading } = useArchbaseSecureForm(
    options.resourceName,
    options.resourceDescription
  )

  const { closeAllowed } = useArchbaseNavigationListener(
    options.navigationRoute,
    () => {
      store.clearAllValues()
      closeAllowed()
    }
  )

  const cleanup = () => {
    store.clearAllValues()
    closeAllowed()
  }

  return {
    t,
    store,
    canView,
    permissionsLoading,
    cleanup,
    closeAllowed
  }
}
```

---

## 2. Hook useDashboardData

Hook para gerenciar dados do dashboard com período e refresh:

```typescript
// src/hooks/dashboard/useDashboardData.ts
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArchbaseNotifications } from '@archbase/components'

interface UseDashboardDataOptions<T> {
  queryKey: string[]
  fetchFn: (periodo: string) => Promise<T>
  defaultPeriodo?: string
  autoFetch?: boolean
  refetchInterval?: number
  showSuccessNotification?: boolean
}

export function useDashboardData<T>(options: UseDashboardDataOptions<T>) {
  const {
    queryKey,
    fetchFn,
    defaultPeriodo = 'today',
    autoFetch = true,
    refetchInterval,
    showSuccessNotification = false
  } = options

  const [periodo, setPeriodo] = useState(defaultPeriodo)

  const { data, isLoading, error, refetch, isFetched } = useQuery({
    queryKey: [...queryKey, periodo],
    queryFn: () => fetchFn(periodo),
    enabled: autoFetch,
    refetchInterval,
    onSuccess: () => {
      if (showSuccessNotification) {
        ArchbaseNotifications.showSuccess('Success', 'Data loaded')
      }
    },
    onError: (err: any) => {
      ArchbaseNotifications.showError('Error', err.message)
    }
  })

  const changePeriodo = useCallback((newPeriodo: string) => {
    setPeriodo(newPeriodo)
  }, [])

  return {
    data,
    loading: isLoading,
    error,
    periodo,
    setPeriodo: changePeriodo,
    refetch,
    hasLoaded: isFetched
  }
}
```

---

## 3. KPI Cards

Padrão para cards de KPI com gradiente:

```typescript
import { Card, Group, Text, ThemeIcon, Stack } from '@mantine/core'
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'

interface KPICardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function KPICard({ title, value, description, icon, color, trend }: KPICardProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
          {trend && (
            <Group gap={4}>
              {trend.isPositive ? (
                <IconTrendingUp size={16} color="green" />
              ) : (
                <IconTrendingDown size={16} color="red" />
              )}
              <Text size="xs" c={trend.isPositive ? 'green' : 'red'}>
                {trend.value}%
              </Text>
            </Group>
          )}
        </Stack>
        <ThemeIcon color={color} variant="light" size={50} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  )
}

// Uso
<SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
  <KPICard
    title="Total Sales"
    value={formatCurrency(stats.totalSales)}
    icon={<IconCurrencyDollar size={24} />}
    color="green"
    trend={{ value: 12.5, isPositive: true }}
  />
  <KPICard
    title="Orders"
    value={stats.totalOrders}
    description="Last 30 days"
    icon={<IconShoppingCart size={24} />}
    color="blue"
  />
</SimpleGrid>
```

---

## 4. Gráficos com ECharts

Estrutura base para gráficos ECharts:

```typescript
import * as echarts from 'echarts'
import { useRef, useEffect } from 'react'
import { useMantineColorScheme, Box } from '@mantine/core'

interface ChartProps {
  data: any[]
  height?: number
}

export function SalesChart({ data, height = 300 }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  useEffect(() => {
    if (!chartRef.current) return

    // Inicializa apenas uma vez
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#2C2E33' : '#fff',
        textStyle: { color: isDark ? '#fff' : '#333' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.label),
        axisLabel: { color: isDark ? '#909296' : '#666' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: isDark ? '#909296' : '#666' }
      },
      series: [{
        name: 'Sales',
        type: 'bar',
        data: data.map(d => d.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#228be6' },
            { offset: 1, color: '#15aabf' }
          ])
        }
      }]
    }

    chartInstance.current.setOption(option)

    // Resize handler
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [data, isDark])

  // Cleanup
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose()
    }
  }, [])

  return <Box ref={chartRef} style={{ width: '100%', height }} />
}
```

---

## 5. WebSocket para Dados em Tempo Real

Padrão para conexão WebSocket:

```typescript
import { useEffect, useState, useCallback } from 'react'

interface UseWebSocketOptions {
  url: string
  onMessage?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  reconnectInterval?: number
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    onMessage,
    onConnect,
    onDisconnect,
    reconnectInterval = 5000
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  const connect = useCallback(() => {
    const socket = new WebSocket(url)

    socket.onopen = () => {
      setIsConnected(true)
      onConnect?.()
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setLastMessage(data)
      onMessage?.(data)
    }

    socket.onclose = () => {
      setIsConnected(false)
      onDisconnect?.()

      // Reconnect
      setTimeout(connect, reconnectInterval)
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
      socket.close()
    }

    setWs(socket)
  }, [url, onMessage, onConnect, onDisconnect, reconnectInterval])

  useEffect(() => {
    connect()

    return () => {
      ws?.close()
    }
  }, [])

  const send = useCallback((data: any) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify(data))
    }
  }, [ws, isConnected])

  return { isConnected, lastMessage, send }
}

// Uso em Dashboard
function RealTimeDashboard() {
  const [positions, setPositions] = useState<VehiclePosition[]>([])

  const { isConnected, lastMessage } = useWebSocket({
    url: 'wss://api.example.com/realtime',
    onMessage: (data) => {
      if (data.type === 'POSITION_UPDATE') {
        setPositions(prev => {
          const updated = [...prev]
          const index = updated.findIndex(p => p.id === data.vehicleId)
          if (index >= 0) {
            updated[index] = { ...updated[index], ...data.position }
          }
          return updated
        })
      }
    }
  })

  return (
    <Stack>
      <Group>
        <Badge color={isConnected ? 'green' : 'red'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </Group>
      {/* Mapa ou lista de posições */}
    </Stack>
  )
}
```

---

## 6. Dashboard Layout Completo

Estrutura completa de dashboard:

```typescript
import { Stack, Group, Text, SimpleGrid, Card, SegmentedControl } from '@mantine/core'
import { useDashboardView, useDashboardData } from '../../hooks/dashboard'

export function SalesDashboard() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName="dashboard.sales"
      resourceDescription="Sales Dashboard"
    >
      <SalesDashboardContent />
    </ArchbaseViewSecurityProvider>
  )
}

function SalesDashboardContent() {
  const { t, canView } = useDashboardView({
    resourceName: 'dashboard.sales',
    resourceDescription: 'Sales Dashboard',
    storeName: 'salesDashboardStore',
    navigationRoute: '/dashboard/sales'
  })

  const { data: stats, loading, periodo, setPeriodo, refetch } = useDashboardData({
    queryKey: ['dashboard', 'sales'],
    fetchFn: (periodo) => dashboardService.getSalesStats(periodo),
    refetchInterval: 60000 // Refresh a cada minuto
  })

  if (!canView) {
    return <Text>No permission to view this dashboard</Text>
  }

  return (
    <Stack gap="md" p="md">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={700}>Sales Dashboard</Text>
          <Text c="dimmed">Overview of sales performance</Text>
        </div>
        <Group>
          <SegmentedControl
            value={periodo}
            onChange={setPeriodo}
            data={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' }
            ]}
          />
          <ActionIcon onClick={() => refetch()}>
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {/* KPI Cards */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={<IconCurrencyDollar size={24} />}
          color="green"
        />
        <KPICard
          title="Orders"
          value={stats?.totalOrders || 0}
          icon={<IconShoppingCart size={24} />}
          color="blue"
        />
        <KPICard
          title="Customers"
          value={stats?.activeCustomers || 0}
          icon={<IconUsers size={24} />}
          color="violet"
        />
        <KPICard
          title="Avg. Order Value"
          value={formatCurrency(stats?.avgOrderValue || 0)}
          icon={<IconReceipt size={24} />}
          color="orange"
        />
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder>
          <Text fw={500} mb="md">Sales by Month</Text>
          <SalesChart data={stats?.salesByMonth || []} height={300} />
        </Card>
        <Card withBorder>
          <Text fw={500} mb="md">Top Products</Text>
          <TopProductsChart data={stats?.topProducts || []} height={300} />
        </Card>
      </SimpleGrid>

      {/* Recent Activity */}
      <Card withBorder>
        <Text fw={500} mb="md">Recent Orders</Text>
        <RecentOrdersTable orders={stats?.recentOrders || []} />
      </Card>
    </Stack>
  )
}
```

---

## 7. Filtros de Período

Componente de filtro de período reutilizável:

```typescript
interface PeriodFilterProps {
  value: string
  onChange: (value: string) => void
  options?: Array<{ value: string; label: string }>
}

export function PeriodFilter({ value, onChange, options }: PeriodFilterProps) {
  const defaultOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ]

  return (
    <SegmentedControl
      value={value}
      onChange={onChange}
      data={options || defaultOptions}
    />
  )
}
```

---

## Resumo de Boas Práticas

| Prática | Descrição |
|---------|-----------|
| Hooks customizados | `useDashboardView` e `useDashboardData` |
| KPI Cards | Componente reutilizável com trend |
| ECharts | Inicializar uma vez, atualizar via setOption |
| WebSocket | Reconnect automático, estado de conexão |
| Período | SegmentedControl para seleção |
| Refresh | Intervalo automático + botão manual |
| Layout | SimpleGrid responsivo para cards e gráficos |
