import { JOB_TRACK_TAGS } from '../constants/jobTrackTags'
import type { JobTrackTagKey } from '../types/community'

interface TagSelectorProps {
  selectedTag: JobTrackTagKey | 'all'
  onSelectTag: (tag: JobTrackTagKey | 'all') => void
  includeAll?: boolean
}

function TagSelector({ selectedTag, onSelectTag, includeAll = false }: TagSelectorProps) {
  return (
    <div className="community-tag-group" role="tablist" aria-label="직무 태그 선택">
      {includeAll && (
        <button
          type="button"
          role="tab"
          className={`community-tag-chip ${selectedTag === 'all' ? 'is-active' : ''}`}
          aria-selected={selectedTag === 'all'}
          onClick={() => onSelectTag('all')}
        >
          전체
        </button>
      )}

      {JOB_TRACK_TAGS.map((tag) => (
        <button
          key={tag.key}
          type="button"
          role="tab"
          className={`community-tag-chip ${selectedTag === tag.key ? 'is-active' : ''}`}
          aria-selected={selectedTag === tag.key}
          onClick={() => onSelectTag(tag.key)}
          title={tag.description}
        >
          {tag.label}
        </button>
      ))}
    </div>
  )
}

export default TagSelector
