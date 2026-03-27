import type { RouteDefinition } from '../_shared/types'
import { listOltsHandler } from './list-olts.handler'
import { createOltHandler } from './create-olt.handler'
import { getOltDetailsHandler } from './get-olt-details.handler'
import { getOltHealthHandler } from './get-olt-health.handler'
import { listBoardsByOltHandler } from './list-boards.handler'
import { listPonPortsByBoardHandler } from './list-pon-ports.handler'
import { listAllBoardsHandler } from './list-all-boards.handler'
import { listAllPonPortsHandler } from './list-all-pon-ports.handler'
import { updateOltHandler } from './update-olt.handler'
import { deleteOltHandler } from './delete-olt.handler'
import { getOltHistoryHandler } from './get-olt-history.handler'
import { getOltBackupsHandler } from './get-olt-backups.handler'
import { triggerOltBackupHandler } from './trigger-olt-backup.handler'
import { listUplinkPortsHandler } from './list-uplink-ports.handler'
import { updateUplinkPortHandler } from './update-uplink-port.handler'
import { deleteOltBackupHandler } from './delete-olt-backup.handler'

export const oltRoutes: RouteDefinition[] = [
  { method: 'GET',  path: '/api/olt',                  handler: listOltsHandler },
  { method: 'POST', path: '/api/olt',                  handler: createOltHandler },
  { method: 'GET',  path: '/api/olt/:id',              handler: getOltDetailsHandler },
  { method: 'PATCH', path: '/api/olt/:id',             handler: updateOltHandler },
  { method: 'DELETE',path: '/api/olt/:id',             handler: deleteOltHandler },
  { method: 'GET',  path: '/api/olt/:id/health',       handler: getOltHealthHandler },
  { method: 'GET',  path: '/api/olt/:id/history',      handler: getOltHistoryHandler },
  { method: 'GET',  path: '/api/olt/:id/backups',      handler: getOltBackupsHandler },
  { method: 'POST',   path: '/api/olt/:id/backups',               handler: triggerOltBackupHandler },
  { method: 'DELETE', path: '/api/olt/:id/backups/:backupId',     handler: deleteOltBackupHandler },
  { method: 'GET',  path: '/api/olt/:id/uplink-ports',           handler: listUplinkPortsHandler },
  { method: 'PATCH',path: '/api/olt/:id/uplink-ports/:portId',   handler: updateUplinkPortHandler },
  { method: 'GET',  path: '/api/olt/:id/boards',       handler: listBoardsByOltHandler },
  { method: 'GET',  path: '/api/boards',               handler: listAllBoardsHandler },
  { method: 'GET',  path: '/api/boards/:id/pon-ports', handler: listPonPortsByBoardHandler },
  { method: 'GET',  path: '/api/pon-ports',            handler: listAllPonPortsHandler },
]
