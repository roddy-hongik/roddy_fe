import type { MouseEvent } from 'react'
import { useJobScrap } from '../hooks/useJobScrap'

type JobScrapButtonProps = {
  jobId: string
  className?: string
  onToggle?: (isScrapped: boolean) => void
}

function JobScrapButton({ jobId, className = '', onToggle }: JobScrapButtonProps) {
  const { isScrapped, isToggling, toggleScrap } = useJobScrap(jobId)

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    const response = await toggleScrap()
    onToggle?.(response.isScrapped)
  }

  return (
    <button
      type="button"
      className={`job-scrap-button ${isScrapped ? 'is-active' : ''} ${className}`.trim()}
      aria-pressed={isScrapped}
      disabled={isToggling}
      onClick={handleClick}
    >
      {isToggling ? '처리 중...' : isScrapped ? '스크랩됨' : '스크랩'}
    </button>
  )
}

export default JobScrapButton
