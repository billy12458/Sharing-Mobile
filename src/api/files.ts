import api from './client'

/**
 * Placeholder API module. The endpoint names will be aligned with the
 * existing QuickySharing backend after the mobile skeleton is confirmed to run.
 */
export const filesApi = {
  list(params?: Record<string, unknown>) {
    return api.get('/file/list', { params })
  },
}
