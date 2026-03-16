import type { CommunityPostListTab } from '../types/community'

const POST_TABS: Array<{ key: CommunityPostListTab; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'general', label: '자유글' },
  { key: 'roadmap', label: '로드맵 공유' },
  { key: 'interview', label: '합격 후기 / 인터뷰' },
]

interface PostTypeTabsProps {
  selectedTab: CommunityPostListTab
  onSelectTab: (tab: CommunityPostListTab) => void
}

function PostTypeTabs({ selectedTab, onSelectTab }: PostTypeTabsProps) {
  return (
    <div className="community-type-tabs" role="tablist" aria-label="커뮤니티 게시글 유형">
      {POST_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          className={`community-type-tab ${selectedTab === tab.key ? 'is-active' : ''}`}
          aria-selected={selectedTab === tab.key}
          onClick={() => onSelectTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default PostTypeTabs
