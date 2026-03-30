import { supabase } from '@/shared/lib/supabase'
import type { ListOnusInput, OnuItem, OnuRow } from './types'

export async function listOnusRepository(
  input: Required<Pick<ListOnusInput, 'page' | 'page_size'>> & Omit<ListOnusInput, 'page' | 'page_size'>
): Promise<{ data: OnuItem[]; total: number }> {
  const {
    olt_id, board_id, pon_port_id,
    status, admin_state,
    serial_number, search,
    zone_id, onu_type_id,
    olt_ids, board_ids, pon_port_ids, zone_ids, onu_type_ids,
    pon_type_in, vlan_ids, mode_in,
    download_profiles, upload_profiles, profile_in,
    tr069_enabled, catv_enabled,
    mgmt_ip_filter, odb_filter,
    status_in, admin_state_in,
    signal_levels,
    page, page_size,
  } = input

  const from = (page - 1) * page_size
  const to = from + page_size - 1

  // Resolve zone filters → olt_ids (foreign-table filter doesn't work on left-join)
  let resolved_olt_ids: number[] | undefined

  if (zone_ids && zone_ids.length) {
    const { data: zoneOlts, error: zoneErr } = await supabase
      .from('olts').select('id').in('zone_id', zone_ids)
    if (zoneErr) throw zoneErr
    resolved_olt_ids = (zoneOlts ?? []).map((r: { id: number }) => r.id)
    if (resolved_olt_ids.length === 0) return { data: [], total: 0 }
  } else if (zone_id !== undefined) {
    const { data: zoneOlts, error: zoneErr } = await supabase
      .from('olts').select('id').eq('zone_id', zone_id)
    if (zoneErr) throw zoneErr
    resolved_olt_ids = (zoneOlts ?? []).map((r: { id: number }) => r.id)
    if (resolved_olt_ids.length === 0) return { data: [], total: 0 }
  }

  let query = supabase
    .from('onus')
    .select(
      [
        'id, serial_number, name, status, admin_state, last_known_signal, last_seen_at,',
        'olt_id, board_id, pon_port_id, onu_type_id,',
        'onu_index, mode, vlan_id, tr069_enabled, catv_enabled, voip_enabled, odb_splitter, odb_id,',
        'created_at,',
        'olts(name, zones(name)),',
        'boards(name),',
        'pon_ports(name)'
      ].join(' '),
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (olt_ids && olt_ids.length)           query = query.in('olt_id', olt_ids)
  else if (olt_id !== undefined)           query = query.eq('olt_id', olt_id)

  if (board_ids && board_ids.length)       query = query.in('board_id', board_ids)
  else if (board_id !== undefined)         query = query.eq('board_id', board_id)

  if (pon_port_ids && pon_port_ids.length) query = query.in('pon_port_id', pon_port_ids)
  else if (pon_port_id !== undefined)      query = query.eq('pon_port_id', pon_port_id)

  if (onu_type_ids && onu_type_ids.length) query = query.in('onu_type_id', onu_type_ids)
  else if (onu_type_id !== undefined)      query = query.eq('onu_type_id', onu_type_id)

  if (resolved_olt_ids !== undefined)             query = query.in('olt_id', resolved_olt_ids)
  if (status !== undefined)                       query = query.eq('status', status)
  if (admin_state !== undefined)                  query = query.eq('admin_state', admin_state)
  if (serial_number !== undefined)                query = query.ilike('serial_number', `%${serial_number}%`)
  if (search !== undefined)                       query = query.or(`serial_number.ilike.%${search}%,name.ilike.%${search}%`)
  // Service column filters
  if (pon_type_in?.length)                        query = query.in('pon_type', pon_type_in)
  if (vlan_ids?.length)                           query = query.in('vlan_id', vlan_ids)
  if (mode_in?.length)                            query = query.in('mode', mode_in)
  if (download_profiles?.length)                  query = query.in('download_profile', download_profiles)
  if (upload_profiles?.length)                    query = query.in('upload_profile', upload_profiles)
  if (profile_in?.length)                         query = query.in('profile', profile_in)
  if (tr069_enabled !== undefined)                query = query.eq('tr069_enabled', tr069_enabled)
  if (catv_enabled !== undefined)                 query = query.eq('catv_enabled', catv_enabled)
  if (mgmt_ip_filter === 'with')                  query = query.not('mgmt_ip', 'is', null)
  if (mgmt_ip_filter === 'without')               query = query.is('mgmt_ip', null)
  if (odb_filter === 'with')                      query = query.not('odb_splitter', 'is', null)
  if (odb_filter === 'without')                   query = query.is('odb_splitter', null)

  // Multi-select status/admin_state
  if (status_in && status_in.length && (!admin_state_in || !admin_state_in.length)) {
    query = query.in('status', status_in)
  } else if (admin_state_in && admin_state_in.length && (!status_in || !status_in.length)) {
    query = query.in('admin_state', admin_state_in)
  } else if (status_in && status_in.length && admin_state_in && admin_state_in.length) {
    const sVals = status_in.map((s) => s.replace(/[,()]/g, '')).join(',')
    const aVals = admin_state_in.map((s) => s.replace(/[,()]/g, '')).join(',')
    // OR across columns: status in (...) OR admin_state in (...)
    query = query.or(`status.in.(${sVals}),admin_state.in.(${aVals})`)
  }

  // Signal levels -> conditions over last_known_signal (dBm)
  if (signal_levels && signal_levels.length) {
    // Exclude NULLs explicitly when any signal filter is active
    query = query.not('last_known_signal', 'is', null)
    const set = new Set(signal_levels)
    const hasGood = set.has('good')
    const hasWarn = set.has('warning')
    const hasCrit = set.has('critical')
    // Simplify contiguous unions
    if ((hasCrit && hasWarn && hasGood) || (hasCrit && hasGood && !hasWarn)) {
      // all three or disjoint (critical+good): use OR for disjoint
      if (hasCrit && hasGood && !hasWarn) {
        query = query.or('last_known_signal.lt.-27,last_known_signal.gt.-24')
      }
      // else all three -> no filter
    } else if (hasCrit && hasWarn && !hasGood) {
      query = query.lt('last_known_signal', -24)
    } else if (hasWarn && hasGood && !hasCrit) {
      query = query.gte('last_known_signal', -27)
    } else if (hasGood && !hasWarn && !hasCrit) {
      query = query.gt('last_known_signal', -24)
    } else if (hasWarn && !hasGood && !hasCrit) {
      // between -27 and -24 (inclusive lower, exclusive upper)
      query = query.gte('last_known_signal', -27).lt('last_known_signal', -24)
    } else if (hasCrit && !hasWarn && !hasGood) {
      query = query.lt('last_known_signal', -27)
    }
  }

  const { data, count, error } = await query

  if (error) throw error

  const items = (data as unknown as OnuRow[]).map((row) => ({
    id: row.id,
    serial_number: row.serial_number,
    name: row.name ?? null,
    status: row.status,
    admin_state: row.admin_state,
    last_known_signal: row.last_known_signal,
    last_seen_at: row.last_seen_at,
    olt_id: row.olt_id,
    olt_name: row.olts.name,
    board_id: row.board_id,
    board_name: row.boards.name,
    pon_port_id: row.pon_port_id,
    pon_port_name: row.pon_ports.name,
    onu_type_id: row.onu_type_id,
    onu_vendor: null,
    onu_model: null,
    zone_name: row.olts?.zones?.name ?? null,
    onu_index: row.onu_index ?? null,
    mode: row.mode ?? null,
    vlan_id: row.vlan_id ?? null,
    tr069_enabled: row.tr069_enabled ?? null,
    catv_enabled: row.catv_enabled ?? null,
    voip_enabled: row.voip_enabled ?? null,
    odb_splitter: row.odb_splitter ?? null,
    odb_name: null,
    created_at: row.created_at,
  }))

  return { data: items, total: count ?? 0 }
}
