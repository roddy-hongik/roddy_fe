import { useEffect, useState } from 'react'
import { AUTH_CHANGE_EVENT } from '../../auth/utils/authEvents'
import { isJobScrapped, JOB_SCRAP_STORAGE_KEY, toggleJobScrap, getJobScrapStorageKey } from '../services/jobScrapService'
import { RODDY_DATA_CHANGE_EVENT } from '../../shared/utils/localStorageSync'

export function useJobScrap(jobId: string) {
  const [isScrapped, setIsScrapped] = useState(() => isJobScrapped(jobId))
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    setIsScrapped(isJobScrapped(jobId))

    const syncState = () => {
      setIsScrapped(isJobScrapped(jobId))
    }

    const handleDataChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string }>
      if (customEvent.detail?.key === JOB_SCRAP_STORAGE_KEY) {
        syncState()
      }
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== null && event.key !== getJobScrapStorageKey()) {
        return
      }

      syncState()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)
    window.addEventListener(AUTH_CHANGE_EVENT, syncState)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)
      window.removeEventListener(AUTH_CHANGE_EVENT, syncState)
    }
  }, [jobId])

  const handleToggle = async () => {
    setIsToggling(true)

    try {
      const response = await toggleJobScrap(jobId, !isScrapped)
      setIsScrapped(response.isScrapped)
      return response
    } finally {
      setIsToggling(false)
    }
  }

  return {
    isScrapped,
    isToggling,
    toggleScrap: handleToggle,
  }
}
