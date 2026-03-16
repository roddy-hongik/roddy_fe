import { useEffect, useState } from 'react'
import { isJobScrapped, toggleJobScrap } from '../services/jobScrapService'
import { RODDY_DATA_CHANGE_EVENT } from '../../shared/utils/localStorageSync'

const JOB_SCRAP_STORAGE_KEY = 'roddy.jobs.scraps.v1'

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

    window.addEventListener('storage', syncState)
    window.addEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)

    return () => {
      window.removeEventListener('storage', syncState)
      window.removeEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)
    }
  }, [jobId])

  const handleToggle = async () => {
    setIsToggling(true)

    try {
      const response = await toggleJobScrap(jobId)
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
