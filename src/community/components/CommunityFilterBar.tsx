import type { CommunityPostListTab } from '../types/community'

interface CommunityFilterBarProps {
  selectedTab: CommunityPostListTab
  searchValue: string
  companyOptions: string[]
  selectedCompany: string
  jobOptions: string[]
  selectedJob: string
  techOptions: string[]
  selectedTech: string
  onSearchChange: (value: string) => void
  onCompanyChange: (value: string) => void
  onJobChange: (value: string) => void
  onTechChange: (value: string) => void
}

function CommunityFilterBar({
  selectedTab,
  searchValue,
  companyOptions,
  selectedCompany,
  jobOptions,
  selectedJob,
  techOptions,
  selectedTech,
  onSearchChange,
  onCompanyChange,
  onJobChange,
  onTechChange,
}: CommunityFilterBarProps) {
  const showStructuredFilters = selectedTab === 'all' || selectedTab === 'roadmap' || selectedTab === 'interview'

  return (
    <section className="community-filter-shell" aria-label="게시글 검색 및 필터">
      <div className="community-search-field">
        <label htmlFor="community-search-input">검색</label>
        <input
          id="community-search-input"
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="제목, 회사, 직무, 기술 스택으로 검색"
        />
      </div>

      {showStructuredFilters ? (
        <div className="community-filter-grid">
          <label>
            <span>기업</span>
            <select value={selectedCompany} onChange={(event) => onCompanyChange(event.target.value)}>
              <option value="">전체</option>
              {companyOptions.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>직무</span>
            <select value={selectedJob} onChange={(event) => onJobChange(event.target.value)}>
              <option value="">전체</option>
              {jobOptions.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>기술 스택</span>
            <select value={selectedTech} onChange={(event) => onTechChange(event.target.value)}>
              <option value="">전체</option>
              {techOptions.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </section>
  )
}

export default CommunityFilterBar
