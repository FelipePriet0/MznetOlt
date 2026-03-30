import { supabase } from '@/shared/lib/supabase'
import type { CreateOltInput, CreateOltOutput } from './types'

export async function existsOltByMgmtIp(mgmt_ip: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('olts')
    .select('id')
    .eq('mgmt_ip', mgmt_ip)
    .maybeSingle()

  if (error) throw error
  return !!data
}

export async function existsLocationById(id: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('locations')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return !!data
}

export async function existsZoneById(id: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('zones')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return !!data
}

export async function createOltRepository(input: CreateOltInput): Promise<CreateOltOutput> {
  const { data, error } = await supabase
    .from('olts')
    .insert({
      name:               input.name,
      vendor:             input.vendor,
      mgmt_ip:            input.mgmt_ip,
      location_id:        input.location_id ?? null,
      zone_id:            input.zone_id ?? null,
      tcp_port:           input.tcp_port ?? 2333,
      telnet_user:        input.telnet_user ?? null,
      telnet_password:    input.telnet_password ?? null,
      snmp_ro_community:  input.snmp_ro_community ?? null,
      snmp_rw_community:  input.snmp_rw_community ?? null,
      snmp_udp_port:      input.snmp_udp_port ?? 2161,
      iptv_enabled:       input.iptv_enabled ?? false,
      hw_version:         input.hw_version ?? null,
      pon_type:           input.pon_type ?? 'GPON',
    })
    .select(`
      id, name, vendor, mgmt_ip,
      location_id, zone_id,
      tcp_port, telnet_user, telnet_password,
      snmp_ro_community, snmp_rw_community, snmp_udp_port,
      iptv_enabled, hw_version, pon_type,
      created_at, updated_at
    `)
    .single()

  if (error) throw error

  return data as CreateOltOutput
}
