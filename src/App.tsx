// App.tsx
import 'reflect-metadata'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/spotlight/styles.css'
import '@archbase/components/dist/index.css'
import '@archbase/layout/dist/index.css'
import '@archbase/admin/dist/index.css'

import {
  ActionIcon,
  Menu,
  Tooltip,
  Badge,
  Text,
  Group,
  useMantineColorScheme,
  MantineThemeOverride,
  Stack,
  Avatar,
  LoadingOverlay,
} from '@mantine/core'
import { useFullscreen, useHotkeys, useLocalStorage, useMediaQuery } from '@mantine/hooks'
import { Dispatch, ErrorInfo, Fragment, ReactNode, SetStateAction, useEffect, useState, useCallback } from 'react'
import {
  IconArrowsMaximize,
  IconBell,
  IconLogout,
  IconMoonStars,
  IconSun,
  IconUserCircle,
} from '@tabler/icons-react'
import { Login } from '@views/login/Login'
import translation_en from '@locales/en/translation.json'
import translation_ptbr from '@locales/pt-BR/translation.json'
import translation_es from '@locales/es/translation.json'
import containerIOC from '@ioc/ContainerIOC'
import { AppThemeDark, AppThemeLight } from '@theme/index'
import { navigationData } from '@navigation/navigationData'
import { ErrorFallback } from '@utils/ErrorFallback'
import { AppUser } from '@auth/AppAuthenticator'
import { APP_NAME, APP_VERSION, TRANSLATION_NAME } from './AppConstants'

// Do pacote core
import {
  useArchbaseTheme,
  processErrorMessage,
  ArchbaseAppProvider,
  ArchbaseGlobalProvider,
  ArchbaseErrorBoundary,
  ARCHBASE_IOC_API_TYPE,
  archbaseI18next,
} from '@archbase/core'

// Do pacote data
import { useArchbaseRemoteServiceApi, useArchbaseStore } from '@archbase/data'

// Do pacote security
import { ArchbaseUserService, useArchbaseAuthenticationManager } from '@archbase/security'

import {
  defaultAvatar,
  useArchbaseAdminStore,
  ArchbaseAdminLayoutHeader,
  ArchbaseAdminMainLayout,
  ArchbaseAdminTabContainer,
  ArchbaseTabItem,
  CommandPaletteButton,
  ArchbaseNavigationProvider,
} from '@archbase/admin'

type MainProps = {
  onLoginUser: (user: AppUser) => void
  onLogoutUser: () => void
  user?: AppUser | undefined
  setUser: Dispatch<SetStateAction<AppUser | undefined>>
}

function Main({ onLoginUser, onLogoutUser, user, setUser }: MainProps) {
  const { toggle } = useFullscreen()
  const theme = useArchbaseTheme()
  const isMedium = useMediaQuery(`(max-width: ${theme.breakpoints.md})`)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const adminStore = useArchbaseAdminStore()
  const templateStore = useArchbaseStore()
  const [isCollapsed, setCollapsed] = useState<boolean>(false)
  const [isHidden, setHidden] = useState<boolean>(false)
  const [isGettingUser, setIsGettingUser] = useState<boolean>(false)
  const [userInfoLoaded, setUserInfoLoaded] = useState<boolean>(false)
  const usuarioServiceApi = useArchbaseRemoteServiceApi<ArchbaseUserService>(ARCHBASE_IOC_API_TYPE.User)
  const api = import.meta.env.VITE_API

  const { loginWithContext, logout, username, isAuthenticated, isAuthenticating, isInitializing, error, accessToken } =
    useArchbaseAuthenticationManager({})

  const getUserInfo = useCallback(async () => {
    if (!accessToken || isGettingUser || userInfoLoaded) {
      return
    }

    try {
      setIsGettingUser(true)

      if (!username || username.trim() === '') {
        setIsGettingUser(false)
        await logout()
        return
      }

      // Buscar dados do usuário
      try {
        const usuario = await usuarioServiceApi.getUserByEmail(username)
        onLoginUser(
          new AppUser({
            id: usuario.id,
            displayName: usuario.name,
            email: usuario.email,
            photo: usuario.avatar && usuario.avatar !== '' ? atob(usuario.avatar) : undefined,
            isAdmin: usuario.isAdministrator || false,
            role: usuario.isAdministrator ? 'ADMIN' : 'USER',
            permissions: [],
            isActive: !usuario.accountDeactivated,
          })
        )
        setUserInfoLoaded(true)
      } catch (userErr: any) {
        // Fallback: usar dados básicos do username
        onLoginUser(
          new AppUser({
            id: username,
            displayName: username.split('@')[0],
            email: username,
            isAdmin: true,
            role: 'ADMIN',
            permissions: [],
            isActive: true,
          })
        )
        setUserInfoLoaded(true)
      }
    } catch (err: any) {
      const error = processErrorMessage(err)
      if (error.includes('401') || err?.response?.status === 403) {
        logout()
        onLogoutUser()
      }
    } finally {
      setIsGettingUser(false)
    }
  }, [accessToken, username, usuarioServiceApi, isGettingUser, userInfoLoaded, onLoginUser, logout, onLogoutUser])

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      getUserInfo().catch(() => {})
    }
  }, [isAuthenticated, accessToken])

  const handleLogin = async (username: string, password: string, rememberMe: boolean) => {
    await loginWithContext({ email: username, password, context: 'WEB_ADMIN' }, rememberMe)
  }

  const handleLogout = () => {
    templateStore.reset()
    setUserInfoLoaded(false)
    logout()
    onLogoutUser()
  }

  const headerActions = () => {
    const result: ReactNode[] = []
    if (api && api.includes('localhost')) {
      result.push(
        <Badge key="dev" size="lg" variant="gradient" gradient={{ from: '#2f3eeb', to: '#5b63f0', deg: 90 }}>
          {archbaseI18next.t(`${TRANSLATION_NAME}:DESENVOLVIMENTO`)}
        </Badge>
      )
    }
    result.push(
      <Tooltip key="fullscreen" withinPortal withArrow label={archbaseI18next.t(`${TRANSLATION_NAME}:Tela cheia`)}>
        <ActionIcon variant="transparent" c={'#868E96'} onClick={toggle}>
          <IconArrowsMaximize size="2rem" />
        </ActionIcon>
      </Tooltip>
    )
    result.push(
      <Tooltip key="notifications" withinPortal withArrow label={archbaseI18next.t(`${TRANSLATION_NAME}:Notificações`)}>
        <ActionIcon variant="transparent" c={'#868E96'}>
          <IconBell size="2rem" />
        </ActionIcon>
      </Tooltip>
    )
    return result
  }

  const logError = (error: Error, info: ErrorInfo) => {
    console.error(error, info)
  }

  const loginView = <Login onLogin={handleLogin} error={error} />

  const isLoading = isInitializing || isGettingUser || isAuthenticating

  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />
  }

  return (
    <ArchbaseErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      {isAuthenticated && user ? (
        <Fragment>
          <ArchbaseAdminMainLayout
            sideBarCollapsedSubmenuWidth={300}
            sideBarTextDarkColor="white"
            sideBarTextLightColor="white"
            sideBarIconDarkColor="white"
            sideBarIconLightColor="white"
            sideBarBackgroundDarkColor={theme.colors.appPrimary[7]}
            sideBarBackgroundLightColor={theme.colors.appPrimary[7]}
            showHeader={isMedium}
            onCollapsedSideBar={setCollapsed}
            onHiddenSidebar={setHidden}
            navigationData={navigationData}
            sideBarWidth={'280px'}
            sideBarCollapsedWidth={'60px'}
            navigationRootLink="/"
            menuItemHeight={isCollapsed ? 44 : 34}
            sideBarFooterHeight={isMedium ? 86 : 100}
            sideBarHeaderHeight={isMedium ? 0 : 54}
            enableSecurity={true}
            sideBarHeaderContent={
              !isMedium && (
                <Fragment>
                  <Group
                    py={4}
                    pr={isCollapsed ? 0 : 16}
                    bg={theme.colors.appPrimary[9]}
                    wrap="nowrap"
                    gap={8}
                    justify={isCollapsed ? 'center' : 'space-between'}
                  >
                    <Stack gap={0} align="start">
                      <Text
                        fw={700}
                        size="lg"
                        c="white"
                        style={{
                          marginLeft: isCollapsed ? 0 : 10,
                        }}
                      >
                        {isCollapsed ? 'AB' : APP_NAME}
                      </Text>
                    </Stack>
                    {!isCollapsed && <CommandPaletteButton navigationData={navigationData} />}
                  </Group>
                </Fragment>
              )
            }
            sideBarFooterContent={
              <Stack gap={4}>
                <Menu shadow="md" width={200} position="bottom-end" withArrow arrowPosition="center" offset={-5}>
                  <Menu.Target>
                    <Group gap={20} h={50} justify={isCollapsed ? 'center' : 'flex-start'}>
                      <Avatar
                        ml={isCollapsed ? 0 : 8}
                        style={{ cursor: 'pointer' }}
                        radius="xl"
                        src={user ? user.photo : defaultAvatar}
                        alt={user ? user.displayName : ''}
                      />
                      {!isCollapsed && <Text c={'white'}>{user.displayName}</Text>}
                    </Group>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>{archbaseI18next.t(`${TRANSLATION_NAME}:Usuário`)}</Menu.Label>
                    <Menu.Item leftSection={<IconUserCircle size={14} />}>
                      {archbaseI18next.t(`${TRANSLATION_NAME}:Meu Perfil`)}
                    </Menu.Item>
                    <Menu.Label>{archbaseI18next.t('archbase:Opções')}</Menu.Label>
                    <Menu.Item
                      leftSection={colorScheme === 'dark' ? <IconSun size={14} /> : <IconMoonStars size={14} />}
                      onClick={toggleColorScheme}
                    >
                      {archbaseI18next.t('archbase:toggleColorScheme')}
                    </Menu.Item>
                    <Menu.Item leftSection={<IconArrowsMaximize size={14} />} onClick={toggle}>
                      {archbaseI18next.t(`${TRANSLATION_NAME}:Tela cheia`)}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>{archbaseI18next.t(`${TRANSLATION_NAME}:Conta`)}</Menu.Label>
                    <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                      {archbaseI18next.t(`${TRANSLATION_NAME}:Sair`)}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
                <Group
                  justify="space-between"
                  align="center"
                  style={{ paddingLeft: '8px', paddingRight: '8px', backgroundColor: theme.colors.appPrimary[8] }}
                  h={52}
                >
                  {!isCollapsed || isHidden ? (
                    <Text size="sm" c="white" fw={500}>
                      {APP_NAME}
                    </Text>
                  ) : null}
                  <Badge size="sm" mb={'8px'} color={theme.colors.appPrimary[5]}>
                    {isCollapsed ? APP_VERSION : `Versão ${APP_VERSION}`}
                  </Badge>
                </Group>
              </Stack>
            }
            header={
              <ArchbaseAdminLayoutHeader
                user={user}
                headerActions={headerActions()}
                navigationData={navigationData}
                showLanguageSelector={true}
                userMenuItems={
                  <Fragment>
                    <Menu.Label>{archbaseI18next.t(`${TRANSLATION_NAME}:Usuário`)}</Menu.Label>
                    <Menu.Item leftSection={<IconUserCircle size={14} />}>
                      {archbaseI18next.t(`${TRANSLATION_NAME}:Meu Perfil`)}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>{archbaseI18next.t(`${TRANSLATION_NAME}:Conta`)}</Menu.Label>
                    <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                      {archbaseI18next.t(`${TRANSLATION_NAME}:Sair`)}
                    </Menu.Item>
                  </Fragment>
                }
              />
            }
          >
            <ArchbaseAdminTabContainer
              onChangeActiveTabId={(activeTabId) => adminStore.setActiveTabId(activeTabId)}
              onChangeOpenedTabs={(openedTabs: ArchbaseTabItem[]) => {
                adminStore.setOpenedTabs(openedTabs)
              }}
              openedTabs={adminStore.openedTabs}
              activeTabId={adminStore.activeTabId}
              navigationData={navigationData}
            />
          </ArchbaseAdminMainLayout>
        </Fragment>
      ) : (
        loginView
      )}
    </ArchbaseErrorBoundary>
  )
}

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: true,
  })
  const [dark, setThemeDark] = useState<MantineThemeOverride>(AppThemeDark)
  const [light, setThemeLight] = useState<MantineThemeOverride>(AppThemeLight)
  const [currentUser, setCurrentUser] = useState<AppUser | undefined>(undefined)

  const handleChangeCustomTheme = (dark: MantineThemeOverride, light: MantineThemeOverride) => {
    setThemeDark(dark)
    setThemeLight(light)
  }

  const toggleColorScheme = (value?: 'light' | 'dark') =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

  useHotkeys([['mod+J', () => toggleColorScheme()]])

  const handleLoginUser = (user: AppUser) => {
    setCurrentUser(user)
  }

  const handleLogoutUser = () => {
    setCurrentUser(undefined)
  }

  return (
    <ArchbaseGlobalProvider
      colorScheme={colorScheme}
      containerIOC={containerIOC}
      themeDark={dark}
      themeLight={light}
      translationName={TRANSLATION_NAME}
      translationResource={{
        en: translation_en,
        'pt-BR': translation_ptbr,
        es: translation_es,
      }}
    >
      <ArchbaseAppProvider
        user={currentUser}
        owner={null}
        selectedCompany={undefined}
        variant="filled"
        setCustomTheme={handleChangeCustomTheme}
        navigationProvider={ArchbaseNavigationProvider}
      >
        <Main
          onLoginUser={handleLoginUser}
          onLogoutUser={handleLogoutUser}
          user={currentUser}
          setUser={setCurrentUser}
        />
      </ArchbaseAppProvider>
    </ArchbaseGlobalProvider>
  )
}

export default App
