/**
 * Base OLT Driver
 *
 * Abstract interface for communicating with OLT (Optical Line Terminal) hardware.
 *
 * Implementations should extend this to support specific OLT vendors:
 * - Huawei MA5800
 * - NOKIA isam
 * - Ciena
 * - Others
 *
 * All driver implementations must handle:
 * - Connection management
 * - Command execution
 * - Data parsing and normalization
 * - Error handling
 * - Timeout and retry logic
 */

export enum DriverMode {
  MOCK = 'mock',
  REAL = 'real',
  SIMULATION = 'simulation',
}

export interface OLTDriverConfig {
  mode: DriverMode
  vendor?: string
  host?: string
  port?: number
  username?: string
  password?: string
  timeout?: number
}

export interface OLTDevice {
  id: string
  name: string
  vendor: string
  model: string
  serialNumber: string
  softwareVersion: string
  status: 'online' | 'offline' | 'degraded'
  lastHealthCheck: Date
}

export interface OLTBoard {
  id: string
  oltId: string
  index: number
  type: string
  status: 'online' | 'offline' | 'degraded'
  ponPorts: number
}

export interface OLTPonPort {
  id: string
  boardId: string
  oltId: string
  portIndex: number
  status: 'online' | 'offline' | 'degraded'
  activeBitrate?: number
  maxBitrate?: number
  connectedOnus: number
}

export interface ONU {
  id: string
  ponPortId: string
  oltId: string
  serialNumber: string
  status: 'online' | 'offline' | 'degraded'
  signalLevel?: number
  distance?: number
  ipAddress?: string
  macAddress?: string
}

export interface DriverConfiguredOnu {
  serialNumber: string
  oltId: string
  boardIndex: number
  ponIndex: number
  onuIndex: number
  adminState: string
  operState: string
  signalLevel: number | null
  distance: number | null
  lastSeen: string
  raw: Record<string, unknown>
}

export interface DriverUnconfiguredOnu {
  serialNumber: string
  oltId: string
  boardIndex: number
  ponIndex: number
  detectedAt: string
  raw: Record<string, unknown>
}

export interface DriverOnuOperationalState {
  serialNumber: string
  operState: string
  adminState: string
  signalLevel: number | null
  distance: number | null
  uptime: number | null
  lastSeen: string
  raw: Record<string, unknown>
}

export type OperationStatus =
  | 'executed'
  | 'rejected'
  | 'failed'
  | 'timeout'
  | 'connection_error'
  | 'unsupported'
  | 'unknown_error'

export type AuthorizeOnuDriverInput = {
  serial: string
  board: number
  pon: number
  line_profile?: string
  service_profile?: string
  vlans?: number[]
}

export type AuthorizeOnuDriverResult = {
  status: OperationStatus
  message?: string
  raw_response?: unknown
}

/**
 * Base Driver Interface
 *
 * All OLT driver implementations must implement these methods.
 */
export abstract class BaseOLTDriver {
  protected config: OLTDriverConfig

  constructor(config: OLTDriverConfig) {
    this.config = config
  }

  /**
   * Connect to OLT device
   */
  abstract connect(): Promise<void>

  /**
   * Disconnect from OLT device
   */
  abstract disconnect(): Promise<void>

  /**
   * Get OLT device information
   */
  abstract getDeviceInfo(): Promise<OLTDevice>

  /**
   * Get all boards from OLT
   */
  abstract getBoards(): Promise<OLTBoard[]>

  /**
   * Get PON ports from a specific board
   */
  abstract getPonPorts(boardId: string): Promise<OLTPonPort[]>

  /**
   * Get ONUs connected to a PON port
   */
  abstract getOnusOnPort(ponPortId: string): Promise<ONU[]>

  /**
   * Get health metrics from OLT
   */
  abstract getHealthMetrics(): Promise<Record<string, unknown>>

  /**
   * Health check - simple ping/status
   */
  abstract healthCheck(): Promise<boolean>

  /**
   * Authorize a new ONU on a PON port
   */
  abstract authorizeOnu(input: AuthorizeOnuDriverInput): Promise<AuthorizeOnuDriverResult>

  /**
   * Get detailed ONU information
   */
  abstract getOnuDetails(onuId: string): Promise<ONU>

  /**
   * Execute a raw command on OLT (if supported)
   * Vendor-specific - use with caution
   */
  abstract executeCommand(command: string): Promise<string>

  /**
   * List all configured ONUs from the OLT
   */
  abstract listConfiguredOnus(): Promise<DriverConfiguredOnu[]>

  /**
   * List all unconfigured (detected but not authorized) ONUs from the OLT
   */
  abstract listUnconfiguredOnus(): Promise<DriverUnconfiguredOnu[]>

  /**
   * Get operational state of a specific ONU by serial number
   */
  abstract getOnuOperationalState(serialNumber: string): Promise<DriverOnuOperationalState>
}

/**
 * Mock OLT Driver (for development/testing)
 */
export class MockOLTDriver extends BaseOLTDriver {
  async connect(): Promise<void> {
    console.log('[MockOLTDriver] Connected (mock)')
  }

  async disconnect(): Promise<void> {
    console.log('[MockOLTDriver] Disconnected (mock)')
  }

  async getDeviceInfo(): Promise<OLTDevice> {
    return {
      id: 'olt-1',
      name: 'MockOLT-1',
      vendor: 'Mock Vendor',
      model: 'Mock Model 2000',
      serialNumber: 'MOCK-SN-001',
      softwareVersion: '1.0.0-mock',
      status: 'online',
      lastHealthCheck: new Date(),
    }
  }

  async getBoards(): Promise<OLTBoard[]> {
    return [
      {
        id: 'board-1',
        oltId: 'olt-1',
        index: 1,
        type: 'GPON',
        status: 'online',
        ponPorts: 16,
      },
    ]
  }

  async getPonPorts(boardId: string): Promise<OLTPonPort[]> {
    return [
      {
        id: 'pon-1-1',
        boardId,
        oltId: 'olt-1',
        portIndex: 1,
        status: 'online',
        activeBitrate: 2500000000,
        maxBitrate: 2500000000,
        connectedOnus: 5,
      },
    ]
  }

  async getOnusOnPort(ponPortId: string): Promise<ONU[]> {
    return [
      {
        id: 'onu-1',
        ponPortId,
        oltId: 'olt-1',
        serialNumber: 'MOCK-ONU-001',
        status: 'online',
        signalLevel: -28,
        distance: 5000,
      },
    ]
  }

  async getHealthMetrics(): Promise<Record<string, unknown>> {
    return {
      cpuUsage: 35,
      memoryUsage: 42,
      diskUsage: 55,
      uptime: 864000,
    }
  }

  async healthCheck(): Promise<boolean> {
    return true
  }

  async authorizeOnu(input: AuthorizeOnuDriverInput): Promise<AuthorizeOnuDriverResult> {
    return {
      status: 'executed',
      message: `Simulated authorization for ${input.serial}`,
      raw_response: { request: input },
    }
  }

  async getOnuDetails(onuId: string): Promise<ONU> {
    return {
      id: onuId,
      ponPortId: 'pon-1-1',
      oltId: 'olt-1',
      serialNumber: 'MOCK-ONU-DETAIL',
      status: 'online',
      signalLevel: -28,
      distance: 5000,
      ipAddress: '192.168.1.10',
      macAddress: '00:11:22:33:44:55',
    }
  }

  async executeCommand(command: string): Promise<string> {
    return `[MockOLTDriver] Command executed: ${command}\nNo actual device connected`
  }

  async listConfiguredOnus(): Promise<DriverConfiguredOnu[]> {
    return [
      {
        serialNumber: 'MOCK-ONU-001',
        oltId: 'olt-1',
        boardIndex: 0,
        ponIndex: 0,
        onuIndex: 1,
        adminState: 'enabled',
        operState: 'online',
        signalLevel: -22.5,
        distance: 3200,
        lastSeen: new Date().toISOString(),
        raw: {},
      },
      {
        serialNumber: 'MOCK-ONU-002',
        oltId: 'olt-1',
        boardIndex: 0,
        ponIndex: 1,
        onuIndex: 1,
        adminState: 'enabled',
        operState: 'offline',
        signalLevel: null,
        distance: null,
        lastSeen: new Date().toISOString(),
        raw: {},
      },
    ]
  }

  async listUnconfiguredOnus(): Promise<DriverUnconfiguredOnu[]> {
    return [
      {
        serialNumber: 'MOCK-UNCONF-001',
        oltId: 'olt-1',
        boardIndex: 0,
        ponIndex: 2,
        detectedAt: new Date().toISOString(),
        raw: {},
      },
    ]
  }

  async getOnuOperationalState(
    serialNumber: string
  ): Promise<DriverOnuOperationalState> {
    return {
      serialNumber,
      operState: 'online',
      adminState: 'enabled',
      signalLevel: -23.1,
      distance: 4500,
      uptime: 86400,
      lastSeen: new Date().toISOString(),
      raw: {},
    }
  }
}
