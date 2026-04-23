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
  Flex,
  Group,
  useMantineColorScheme,
  MantineThemeOverride,
  Stack,
  Indicator,
  Avatar,
  LoadingOverlay,
} from '@mantine/core'
import { useFullscreen, useHotkeys, useLocalStorage, useMediaQuery } from '@mantine/hooks'
import { Dispatch, ErrorInfo, Fragment, ReactNode, SetStateAction, useEffect, useState, useCallback } from 'react'
import {
  IconArrowsMaximize,
  IconBell,
  IconBrandMessenger,
  IconLogout,
  IconMoonStars,
  IconSun,
  IconUserCircle,
  IconLayoutSidebar,
  IconLayoutSidebarRight,
  IconLayoutList,
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
import {
  ArchbaseUserService,
  useArchbaseAuthenticationManager,
  useArchbaseResetPassword,
  ArchbaseSecurityProvider,
} from '@archbase/security'

import {
  defaultAvatar,
  useArchbaseAdminStore,
  ArchbaseAdminLayoutHeader,
  ArchbaseAdminMainLayout,
  ArchbaseAdminTabContainer,
  ArchbaseTabItem,
  CommandPaletteButton,
  ArchbaseMyProfileModal,
  ArchbaseNavigationProvider,
} from '@archbase/admin'

declare const __APP_VERSION__: string

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
  const [sidebarVariant, setSidebarVariant] = useLocalStorage<'standard' | 'rail' | 'minimal'>({
    key: 'app-sidebar-variant',
    defaultValue: 'rail',
  })
  const isCompact = isCollapsed || sidebarVariant === 'minimal'
  const [isGettingUser, setIsGettingUser] = useState<boolean>(false)
  const [userInfoLoaded, setUserInfoLoaded] = useState<boolean>(false)
  const [showMyProfile, setShowMyProfile] = useState<boolean>(false)
  const usuarioServiceApi = useArchbaseRemoteServiceApi<ArchbaseUserService>(ARCHBASE_IOC_API_TYPE.User)
  const api = import.meta.env.VITE_API

  const { loginWithContext, logout, username, isAuthenticated, isAuthenticating, isInitializing, error, accessToken, clearError } =
    useArchbaseAuthenticationManager({})

  const { sendResetPasswordEmail, resetPassword } = useArchbaseResetPassword()

  const [credentialsExpired, setCredentialsExpired] = useState<{ email: string; message: string } | null>(null)

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
    console.log('🔐 App.tsx handleLogin chamado')
    console.log('📧 Username:', username)
    console.log('🔑 loginWithContext existe?', !!loginWithContext)

    setCredentialsExpired(null)
    if (loginWithContext) {
      try {
        console.log('📤 Chamando loginWithContext...')
        const result = await loginWithContext(
          { email: username, password, context: 'WEB_ADMIN' },
          rememberMe
        )
        console.log('✅ loginWithContext retornou:', result)
        console.log('🔑 isAuthenticated após login:', isAuthenticated)
        console.log('🔑 accessToken após login:', !!accessToken)
      } catch (err: any) {
        console.error('❌ Erro no loginWithContext:', err)
        const errorData = err?.response?.data || err?.data
        if (errorData?.error === 'CREDENTIALS_EXPIRED' || err?.message?.includes('CREDENTIALS_EXPIRED')) {
          setCredentialsExpired({
            email: errorData?.email || username,
            message: errorData?.message || 'Sua senha expirou. Por favor, redefina sua senha para continuar.',
          })
        }
        // Não re-lança o erro para evitar problemas com o componente de login
      }
    } else {
      console.error('❌ loginWithContext não está disponível!')
    }
  }

  const handleSendResetPasswordEmail = async (email: string) => {
    await sendResetPasswordEmail(email)
  }

  const handleResetPassword = async (email: string, token: string, newPassword: string) => {
    await resetPassword(email, token, newPassword)
    setCredentialsExpired(null)
  }

  const handleClearCredentialsExpired = () => {
    setCredentialsExpired(null)
    if (clearError) {
      clearError()
    }
  }

  const handleLogout = () => {
    templateStore.reset()
    setUserInfoLoaded(false)
    logout()
    onLogoutUser()
  }

  const handleOpenMyProfileModal = () => {
    setShowMyProfile(true)
  }

  const handleCloseMyProfileModal = () => {
    setShowMyProfile(false)
  }

  const handleUpdateUser = (newName: string, newAvatar?: string) => {
    setUser(prev => {
      if (!prev) return prev
      return new AppUser({
        id: prev.id,
        displayName: newName ?? prev.displayName,
        email: prev.email,
        photo: newAvatar ? atob(newAvatar) : prev.photo,
        isAdmin: prev.isAdmin,
      })
    })
  }

  const headerActions = () => {
    const result: ReactNode[] = []
    if (api && api.includes('localhost')) {
      result.push(
        <Badge key="dev" size="lg" variant="gradient" gradient={{ from: '#2f3eeb', to: '#5b63f0', deg: 90 }}>
          {archbaseI18next.t(`${TRANSLATION_NAME}:DESENVOLVIMENTO`)}
        </Badge>
      )
    } else if (api && api.includes('homolog')) {
      result.push(
        <Badge key="homolog" size="lg" variant="gradient" gradient={{ from: '#2f3eeb', to: '#5b63f0', deg: 90 }}>
          {archbaseI18next.t(`${TRANSLATION_NAME}:HOMOLOGACAO`) || 'HOMOLOGACAO'}
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

  const loginView = (
    <Login
      onLogin={handleLogin}
      onSendResetPasswordEmail={handleSendResetPasswordEmail}
      onResetPassword={handleResetPassword}
      error={credentialsExpired ? undefined : error}
      credentialsExpired={credentialsExpired}
      onClearCredentialsExpired={handleClearCredentialsExpired}
    />
  )

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
            sidebarVariant={sidebarVariant}
            showCollapsedButton={sidebarVariant !== 'minimal'}
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
              <Stack gap={0}>
                <Flex
                  px={isCompact ? 4 : 8}
                  py={8}
                  align="center"
                  justify={isCompact ? 'center' : 'space-between'}
                  style={{
                    backgroundColor: `color-mix(in srgb, ${theme.colors.appPrimary[7]} 70%, ${theme.colors.appPrimary[9]} 30%)`,
                    borderTop: `1px solid ${theme.colors.appPrimary[6]}`,
                    borderBottom: `1px solid ${theme.colors.appPrimary[8]}`,
                  }}
                >
                  <Menu shadow="md" width={200} position="top-end" withArrow arrowPosition="center" offset={5}>
                    <Menu.Target>
                      <Group gap={12} style={{ cursor: 'pointer' }} justify={isCompact ? 'center' : 'flex-start'}>
                        <Indicator
                          inline
                          label="A"
                          position="bottom-end"
                          disabled={!user?.isAdmin}
                          styles={{
                            indicator: {
                              display: 'flex',
                              border: '1px solid yellow',
                              justifyContent: 'center',
                              alignItems: 'center',
                              bottom: 5,
                              right: 5,
                              width: '16px',
                              height: '16px',
                              position: 'absolute',
                              zIndex: 400,
                              borderRadius: 50,
                              backgroundColor: 'green',
                            },
                          }}
                          size={18}
                          color="green"
                          offset={7}
                        >
                          <Avatar
                            style={{ cursor: 'pointer' }}
                            radius="xl"
                            src={user ? user.photo : defaultAvatar}
                            alt={user ? user.displayName : ''}
                          />
                        </Indicator>
                        {!isCompact && (
                          <Stack gap={0}>
                            <Text c="white" size="sm" fw={500} lineClamp={1}>
                              {user.displayName}
                            </Text>
                            {api && api.includes('localhost') ? (
                              <Badge size="xs" variant="light" color="blue">
                                DEV
                              </Badge>
                            ) : (
                              api &&
                              api.includes('homolog') && (
                                <Badge size="xs" variant="light" color="blue">
                                  HOMOLOG
                                </Badge>
                              )
                            )}
                          </Stack>
                        )}
                      </Group>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Label>{archbaseI18next.t(`${TRANSLATION_NAME}:Usuário`)}</Menu.Label>
                      <Menu.Item leftSection={<IconUserCircle size={14} />} onClick={handleOpenMyProfileModal}>
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
                      <Menu.Label>Layout do Menu</Menu.Label>
                      <Menu.Item
                        leftSection={<IconLayoutSidebar size={14} />}
                        onClick={() => setSidebarVariant('standard')}
                        bg={sidebarVariant === 'standard' ? theme.colors.appPrimary[1] : undefined}
                      >
                        {archbaseI18next.t(`${TRANSLATION_NAME}:Padrão`) || 'Padrão'}
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconLayoutSidebarRight size={14} />}
                        onClick={() => setSidebarVariant('rail')}
                        bg={sidebarVariant === 'rail' ? theme.colors.appPrimary[1] : undefined}
                      >
                        Rail (Grupos)
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconLayoutList size={14} />}
                        onClick={() => setSidebarVariant('minimal')}
                        bg={sidebarVariant === 'minimal' ? theme.colors.appPrimary[1] : undefined}
                      >
                        Minimal (Ícones)
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Label>{archbaseI18next.t(`${TRANSLATION_NAME}:Conta`)}</Menu.Label>
                      <Menu.Item leftSection={<IconBrandMessenger size={14} />}>
                        {archbaseI18next.t(`${TRANSLATION_NAME}:Suporte`) || 'Suporte'}
                      </Menu.Item>
                      <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                        {archbaseI18next.t(`${TRANSLATION_NAME}:Sair`)}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Flex>

                <Flex
                  justify={isCompact ? 'center' : 'space-between'}
                  align="center"
                  px={isCompact ? 4 : 8}
                  style={{ backgroundColor: theme.colors.appPrimary[8] }}
                  h={48}
                >
                  {!isCompact || isHidden ? (
                    <Text size="sm" c="white" fw={500}>
                      {APP_NAME}
                    </Text>
                  ) : null}
                  <Badge size="sm" color={theme.colors.appPrimary[5]}>
                    {isCompact ? `${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : APP_VERSION}` : `v${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : APP_VERSION}`}
                  </Badge>
                </Flex>
              </Stack>
            }
            header={
              <ArchbaseAdminLayoutHeader
                logo=""
                user={user}
                headerActions={headerActions()}
                navigationData={navigationData}
                showLanguageSelector={true}
                userMenuItems={
                  <Fragment>
                    <Menu.Label>{archbaseI18next.t(`${TRANSLATION_NAME}:Usuário`)}</Menu.Label>
                    <Menu.Item leftSection={<IconUserCircle size={14} />} onClick={handleOpenMyProfileModal}>
                      {archbaseI18next.t(`${TRANSLATION_NAME}:Meu Perfil`)}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>{archbaseI18next.t(`${TRANSLATION_NAME}:Conta`)}</Menu.Label>
                    <Menu.Item leftSection={<IconBrandMessenger size={14} />}>
                      {archbaseI18next.t(`${TRANSLATION_NAME}:Suporte`) || 'Suporte'}
                    </Menu.Item>
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
          {user && (
            <ArchbaseMyProfileModal
              opened={showMyProfile}
              handleClose={handleCloseMyProfileModal}
              userId={user.id}
              updateUser={handleUpdateUser}
              options={{
                showNickname: false,
                avatarMaxSizeKB: 100,
              }}
            />
          )}
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

  const securityUser = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.displayName,
        email: currentUser.email,
        isAdministrator: currentUser.isAdmin,
        code: '',
        version: 0,
        createEntityDate: '',
        updateEntityDate: '',
        createdByUser: '',
        lastModifiedByUser: '',
        description: '',
        actions: [],
        userName: currentUser.email,
        password: '',
        changePasswordOnNextLogin: false,
        allowPasswordChange: true,
        allowMultipleLogins: true,
        passwordNeverExpires: true,
        accountDeactivated: false,
        accountLocked: false,
        unlimitedAccessHours: true,
        groups: [],
        type: 'user',
        isNewUser: false,
        nickname: currentUser.displayName,
      }
    : null

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
      <ArchbaseSecurityProvider user={securityUser}>
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
      </ArchbaseSecurityProvider>
    </ArchbaseGlobalProvider>
  )
}

export default App
