import { useState, type MouseEvent } from 'react'
import { toggleJobScrap } from '../services/jobPostingService'

const FAILURE_HINT = '스크랩 상태를 바꾸지 못했습니다. 다시 시도해주세요.'

type JobScrapButtonProps = {
  jobPostingId: number
  /** 목록/상세 응답이 이미 스크랩 여부를 알려주므로 상태는 화면이 들고 있는다. */
  isScrapped: boolean
  className?: string
  /** 같은 공고를 가리키는 버튼이 여러 개일 때, 화면이 전체를 한 번에 잠글 수 있도록 연다. */
  disabled?: boolean
  onToggled?: (isScrapped: boolean) => void
  onTogglingChange?: (isToggling: boolean) => void
}

function JobScrapButton({
  jobPostingId,
  isScrapped,
  className = '',
  disabled = false,
  onToggled,
  onTogglingChange,
}: JobScrapButtonProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setIsToggling(true)
    setHasFailed(false)
    onTogglingChange?.(true)

    try {
      const response = await toggleJobScrap(jobPostingId)
      onToggled?.(response.isScrapped)
    } catch {
      /** 요청이 깨져도 조용히 삼키지 않고, 버튼이 직접 다시 시도하라고 알린다. */
      setHasFailed(true)
    } finally {
      setIsToggling(false)
      onTogglingChange?.(false)
    }
  }

  const label = isToggling ? '처리 중...' : hasFailed ? '다시 시도' : isScrapped ? '스크랩됨' : '스크랩'

  return (
    <button
      type="button"
      className={`job-scrap-button ${isScrapped ? 'is-active' : ''} ${className}`.trim()}
      aria-pressed={isScrapped}
      aria-live="polite"
      title={hasFailed ? FAILURE_HINT : undefined}
      disabled={isToggling || disabled}
      onClick={handleClick}
    >
      {label}
    </button>
  )
}

export default JobScrapButton
