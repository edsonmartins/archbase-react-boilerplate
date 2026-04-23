import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'
import {
  PlanoDto,
  PlanoPrecoDto,
  AssinaturaDto,
  FaturaDto,
  PagamentoDto,
  ContratoDto,
  ContratoAceiteDto,
  GatewayConfigDto,
  FinanceiroResumoDto,
  StatusAssinatura,
  StatusFatura,
  StatusPagamento,
  GatewayPagamento,
} from '../domain/financeiro/FinanceiroDto'

// ============================================
// PLANO SERVICE
// ============================================

@injectable()
export class PlanoService extends ArchbaseRemoteApiService<PlanoDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/admin/planos'
  }

  public getId(entity: PlanoDto): string {
    return entity.id
  }

  public isNewRecord(entity: PlanoDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): PlanoDto {
    return new PlanoDto(data as Partial<PlanoDto>)
  }

  /**
   * Listar planos ativos (publico)
   */
  public async listarAtivos(): Promise<PlanoDto[]> {
    const response = await this.client.get<PlanoDto[]>(
      '/api/v1/planos',
      this.configureHeaders()
    )
    return (response as unknown as Partial<PlanoDto>[]).map((p) => new PlanoDto(p))
  }

  /**
   * Ativar plano
   */
  public async ativar(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/ativar`,
      {},
      this.configureHeaders()
    )
  }

  /**
   * Desativar plano
   */
  public async desativar(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/desativar`,
      {},
      this.configureHeaders()
    )
  }

  /**
   * Listar precos do plano
   */
  public async listarPrecos(planoId: string): Promise<PlanoPrecoDto[]> {
    const response = await this.client.get<PlanoPrecoDto[]>(
      `${this.getEndpoint()}/${planoId}/precos`,
      this.configureHeaders()
    )
    return (response as unknown as Partial<PlanoPrecoDto>[]).map((p) => new PlanoPrecoDto(p))
  }

  /**
   * Criar preco
   */
  public async criarPreco(planoId: string, preco: Partial<PlanoPrecoDto>): Promise<PlanoPrecoDto> {
    const response = await this.client.post<Partial<PlanoPrecoDto>, PlanoPrecoDto>(
      `${this.getEndpoint()}/${planoId}/precos`,
      preco,
      this.configureHeaders()
    )
    return new PlanoPrecoDto(response as Partial<PlanoPrecoDto>)
  }
}

// ============================================
// ASSINATURA SERVICE
// ============================================

@injectable()
export class AssinaturaService extends ArchbaseRemoteApiService<AssinaturaDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/admin/assinaturas'
  }

  public getId(entity: AssinaturaDto): string {
    return entity.id
  }

  public isNewRecord(entity: AssinaturaDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): AssinaturaDto {
    return new AssinaturaDto(data as Partial<AssinaturaDto>)
  }

  /**
   * Listar assinaturas por aluno
   */
  public async listarPorAluno(alunoId: string): Promise<AssinaturaDto[]> {
    const response = await this.client.get<AssinaturaDto[]>(
      `${this.getEndpoint()}/aluno/${alunoId}`,
      this.configureHeaders()
    )
    return (response as unknown as Partial<AssinaturaDto>[]).map((a) => new AssinaturaDto(a))
  }

  /**
   * Criar assinatura para aluno
   */
  public async criarAssinatura(alunoId: string, data: Partial<AssinaturaDto>): Promise<AssinaturaDto> {
    const response = await this.client.post<Partial<AssinaturaDto>, AssinaturaDto>(
      `${this.getEndpoint()}?alunoId=${alunoId}`,
      data,
      this.configureHeaders()
    )
    return new AssinaturaDto(response as Partial<AssinaturaDto>)
  }

  /**
   * Iniciar trial para aluno
   */
  public async iniciarTrial(alunoId: string, planoId: string): Promise<AssinaturaDto> {
    const response = await this.client.post<unknown, AssinaturaDto>(
      `${this.getEndpoint()}/trial?alunoId=${alunoId}&planoId=${planoId}`,
      {},
      this.configureHeaders()
    )
    return new AssinaturaDto(response as Partial<AssinaturaDto>)
  }

  /**
   * Ativar assinatura
   */
  public async ativar(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/ativar`,
      {},
      this.configureHeaders()
    )
  }

  /**
   * Pausar assinatura
   */
  public async pausar(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/pausar`,
      {},
      this.configureHeaders()
    )
  }

  /**
   * Retomar assinatura
   */
  public async retomar(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/retomar`,
      {},
      this.configureHeaders()
    )
  }

  /**
   * Cancelar assinatura
   */
  public async cancelar(id: string, motivo?: string): Promise<void> {
    const params = motivo ? `?motivo=${encodeURIComponent(motivo)}` : ''
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/cancelar${params}`,
      {},
      this.configureHeaders()
    )
  }

  /**
   * Renovar assinatura
   */
  public async renovar(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/renovar`,
      {},
      this.configureHeaders()
    )
  }
}

// ============================================
// FATURA SERVICE
// ============================================

@injectable()
export class FaturaService extends ArchbaseRemoteApiService<FaturaDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/admin/faturas'
  }

  public getId(entity: FaturaDto): string {
    return entity.id
  }

  public isNewRecord(entity: FaturaDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): FaturaDto {
    return new FaturaDto(data as Partial<FaturaDto>)
  }

  /**
   * Buscar por codigo
   */
  public async buscarPorCodigo(codigo: string): Promise<FaturaDto> {
    const response = await this.client.get<FaturaDto>(
      `${this.getEndpoint()}/codigo/${codigo}`,
      this.configureHeaders()
    )
    return new FaturaDto(response as Partial<FaturaDto>)
  }

  /**
   * Listar faturas por aluno
   */
  public async listarPorAluno(alunoId: string): Promise<FaturaDto[]> {
    const response = await this.client.get<FaturaDto[]>(
      `${this.getEndpoint()}/aluno/${alunoId}`,
      this.configureHeaders()
    )
    return (response as unknown as Partial<FaturaDto>[]).map((f) => new FaturaDto(f))
  }

  /**
   * Gerar fatura para assinatura
   */
  public async gerar(assinaturaId: string): Promise<FaturaDto> {
    const response = await this.client.post<unknown, FaturaDto>(
      `${this.getEndpoint()}/assinatura/${assinaturaId}/gerar`,
      {},
      this.configureHeaders()
    )
    return new FaturaDto(response as Partial<FaturaDto>)
  }

  /**
   * Marcar fatura como paga
   */
  public async marcarComoPaga(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/pagar`,
      {},
      this.configureHeaders()
    )
  }

  /**
   * Cancelar fatura
   */
  public async cancelar(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/cancelar`,
      {},
      this.configureHeaders()
    )
  }

  /**
   * Aplicar desconto
   */
  public async aplicarDesconto(id: string, valorDesconto: number): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/desconto?valorDesconto=${valorDesconto}`,
      {},
      this.configureHeaders()
    )
  }
}

// ============================================
// PAGAMENTO SERVICE
// ============================================

@injectable()
export class PagamentoService extends ArchbaseRemoteApiService<PagamentoDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/admin/pagamentos'
  }

  public getId(entity: PagamentoDto): string {
    return entity.id
  }

  public isNewRecord(entity: PagamentoDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): PagamentoDto {
    return new PagamentoDto(data as Partial<PagamentoDto>)
  }

  /**
   * Listar pagamentos por fatura
   */
  public async listarPorFatura(faturaId: string): Promise<PagamentoDto[]> {
    const response = await this.client.get<PagamentoDto[]>(
      `${this.getEndpoint()}/fatura/${faturaId}`,
      this.configureHeaders()
    )
    return (response as unknown as Partial<PagamentoDto>[]).map((p) => new PagamentoDto(p))
  }

  /**
   * Reembolsar pagamento
   */
  public async reembolsar(id: string, valor?: number, motivo?: string): Promise<void> {
    const params = new URLSearchParams()
    if (valor) params.append('valor', valor.toString())
    if (motivo) params.append('motivo', motivo)
    const queryString = params.toString() ? `?${params.toString()}` : ''

    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/reembolsar${queryString}`,
      {},
      this.configureHeaders()
    )
  }
}

// ============================================
// CONTRATO SERVICE
// ============================================

@injectable()
export class ContratoService extends ArchbaseRemoteApiService<ContratoDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/admin/contratos'
  }

  public getId(entity: ContratoDto): string {
    return entity.id
  }

  public isNewRecord(entity: ContratoDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): ContratoDto {
    return new ContratoDto(data as Partial<ContratoDto>)
  }

  /**
   * Publicar nova versao do contrato
   */
  public async publicarNovaVersao(id: string, novoConteudo: string): Promise<ContratoDto> {
    const response = await this.client.post<string, ContratoDto>(
      `${this.getEndpoint()}/${id}/publicar-versao`,
      novoConteudo,
      this.configureHeaders()
    )
    return new ContratoDto(response as Partial<ContratoDto>)
  }

  /**
   * Listar aceites de um aluno
   */
  public async listarAceitesDoAluno(alunoId: string): Promise<ContratoAceiteDto[]> {
    const response = await this.client.get<ContratoAceiteDto[]>(
      `${this.getEndpoint()}/aluno/${alunoId}/aceites`,
      this.configureHeaders()
    )
    return (response as unknown as Partial<ContratoAceiteDto>[]).map((a) => new ContratoAceiteDto(a))
  }

  /**
   * Listar contratos pendentes de um aluno
   */
  public async listarPendentesDoAluno(alunoId: string): Promise<ContratoDto[]> {
    const response = await this.client.get<ContratoDto[]>(
      `${this.getEndpoint()}/aluno/${alunoId}/pendentes`,
      this.configureHeaders()
    )
    return (response as unknown as Partial<ContratoDto>[]).map((c) => new ContratoDto(c))
  }
}

// ============================================
// GATEWAY CONFIG SERVICE
// ============================================

@injectable()
export class GatewayConfigService extends ArchbaseRemoteApiService<GatewayConfigDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/admin/gateways'
  }

  public getId(entity: GatewayConfigDto): string {
    return entity.id
  }

  public isNewRecord(entity: GatewayConfigDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): GatewayConfigDto {
    return new GatewayConfigDto(data as Partial<GatewayConfigDto>)
  }

  /**
   * Listar gateways ativos
   */
  public async listarAtivos(): Promise<GatewayConfigDto[]> {
    const response = await this.client.get<GatewayConfigDto[]>(
      `${this.getEndpoint()}/ativos`,
      this.configureHeaders()
    )
    return (response as unknown as Partial<GatewayConfigDto>[]).map((g) => new GatewayConfigDto(g))
  }

  /**
   * Buscar gateway padrao
   */
  public async buscarPadrao(): Promise<GatewayConfigDto> {
    const response = await this.client.get<GatewayConfigDto>(
      `${this.getEndpoint()}/padrao`,
      this.configureHeaders()
    )
    return new GatewayConfigDto(response as Partial<GatewayConfigDto>)
  }

  /**
   * Ativar gateway
   */
  public async ativar(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/ativar`,
      {},
      this.configureHeaders()
    )
  }

  /**
   * Desativar gateway
   */
  public async desativar(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/desativar`,
      {},
      this.configureHeaders()
    )
  }

  /**
   * Definir como padrao
   */
  public async definirComoPadrao(id: string): Promise<void> {
    await this.client.post<unknown, void>(
      `${this.getEndpoint()}/${id}/padrao`,
      {},
      this.configureHeaders()
    )
  }
}

// ============================================
// FINANCEIRO FACADE SERVICE
// ============================================

@injectable()
export class FinanceiroFacadeService {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    private client: ArchbaseRemoteApiClient
  ) {}

  /**
   * Buscar resumo financeiro
   */
  public async getResumo(): Promise<FinanceiroResumoDto> {
    const response = await this.client.get<FinanceiroResumoDto>(
      '/api/v1/admin/relatorios/financeiro/resumo',
      {}
    )
    return new FinanceiroResumoDto(response as Partial<FinanceiroResumoDto>)
  }
}
