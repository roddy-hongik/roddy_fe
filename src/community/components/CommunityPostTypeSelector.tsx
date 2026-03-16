import type { CommunityPostType } from '../types/community'

const POST_TYPE_OPTIONS: Array<{ type: CommunityPostType; label: string; description: string }> = [
  {
    type: 'general',
    label: '일반 게시글',
    description: '자유 질문, 경험 공유, 토론형 글 작성',
  },
  {
    type: 'roadmap',
    label: '로드맵 공유',
    description: '저장한 학습 로드맵을 구조화된 게시글로 공유',
  },
  {
    type: 'interview',
    label: '합격 후기 / 현직자 인터뷰',
    description: '기업, 직무, 준비 과정 중심의 템플릿형 후기 작성',
  },
]

interface CommunityPostTypeSelectorProps {
  selectedType: CommunityPostType
  onSelectType: (type: CommunityPostType) => void
}

function CommunityPostTypeSelector({ selectedType, onSelectType }: CommunityPostTypeSelectorProps) {
  return (
    <section className="community-type-selector" aria-label="게시글 유형 선택">
      {POST_TYPE_OPTIONS.map((option) => (
        <button
          key={option.type}
          type="button"
          className={`community-type-option ${selectedType === option.type ? 'is-active' : ''}`}
          onClick={() => onSelectType(option.type)}
        >
          <strong>{option.label}</strong>
          <p>{option.description}</p>
        </button>
      ))}
    </section>
  )
}

export default CommunityPostTypeSelector
