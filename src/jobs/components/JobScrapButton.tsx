import { useState, type MouseEvent } from 'react'
import { toggleJobScrap } from '../services/jobPostingService'

type JobScrapButtonProps = {
  jobPostingId: number
  /** 목록/상세 응답이 이미 스크랩 여부를 알려주므로 상태는 화면이 들고 있는다. */
  isScrapped: boolean
  className?: string
  onToggled?: (isScrapped: boolean) => void
}

function JobScrapButton({ jobPostingId, isScrapped, className = '', onToggled }: JobScrapButtonProps) {
  const [isToggling, setIsToggling] = useState(false)

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setIsToggling(true)

    try {
      const response = await toggleJobScrap(jobPostingId)
      onToggled?.(response.isScrapped)
    } finally {
      setIsToggling(false)
    }
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
