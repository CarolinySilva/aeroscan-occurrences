export type OccurrenceStatus =
  | 'open'
  | 'acknowledged'
  | 'resolved'

export type OccurrenceType =
  | 'intrusion'
  | 'perimeter_breach'
  | 'low_battery'
  | 'signal_loss'

export type Occurrence = {
  id: string
  siteId: string
  droneId: string
  type: OccurrenceType
  severity: number
  detectedAt: string
  status: OccurrenceStatus
  count: number
  priority: number
  note?: string
}

type OccurrenceFilters = {
  status?: OccurrenceStatus
  siteId?: string
}

const API_URL = 'http://localhost:3000'

export async function getOccurrences(
  filters: OccurrenceFilters = {},
): Promise<Occurrence[]> {
  const params = new URLSearchParams()

  if (filters.status) {
    params.set('status', filters.status)
  }

  if (filters.siteId) {
    params.set('siteId', filters.siteId)
  }

  const query = params.toString()

  const response = await fetch(
    `${API_URL}/occurrences${query ? `?${query}` : ''}`,
  )

  if (!response.ok) {
    throw new Error('Não foi possível carregar as ocorrências.')
  }

  return response.json()
}

export async function changeOccurrenceStatus(
  id: string,
  status: OccurrenceStatus,
  note?: string,
): Promise<Occurrence> {
  const response = await fetch(
    `${API_URL}/occurrences/${id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        ...(note ? { note } : {}),
      }),
    },
  )

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => null)

    throw new Error(
      error?.message ??
        'Não foi possível atualizar a ocorrência.',
    )
  }

  return response.json()
}