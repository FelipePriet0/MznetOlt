export type UpdateOnuInput = {
  id: number
  patch: Partial<{
    // move
    olt_id: number
    board_id: number
    pon_port_id: number
    onu_index: number | null
    // identification
    serial_number: string
    onu_type_id: number | null
    external_id: string | null
    // service/config
    pon_type: string | null
    mode: string | null
    vlan_id: number | null
    tr069_enabled: boolean | null
    voip_enabled: boolean | null
    catv_enabled: boolean | null
    mgmt_ip: string | null
    odb_id: number | null
    odb_splitter: string | null
    download_profile: string | null
    upload_profile: string | null
    profile: string | null
    // location/contact
    name: string | null
    address: string | null
    contact: string | null
    latitude: number | null
    longitude: number | null
    zone_id: number | null
    odb_port: string | null
    tr069_profile: string | null
  }>
}
