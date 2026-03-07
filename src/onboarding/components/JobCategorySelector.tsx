import { useState } from 'react'

type JobCategory = {
  id: string
  label: string
  description: string
}

type JobCategorySelectorProps = {
  categories: JobCategory[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
}

function JobCategorySelector({
  categories,
  selectedCategory,
  onSelectCategory,
}: JobCategorySelectorProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const activeId = hoveredCategory ?? selectedCategory
  const activeCategory = categories.find((category) => category.id === activeId)

  return (
    <div className="job-category-wrap">
      <div className="job-category-list" role="radiogroup" aria-label="희망 직군 카테고리">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id

          return (
            <button
              key={category.id}
              type="button"
              className={`job-category-item ${isSelected ? 'selected' : ''}`}
              role="radio"
              aria-checked={isSelected}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onFocus={() => setHoveredCategory(category.id)}
              onBlur={() => setHoveredCategory(null)}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.label}
            </button>
          )
        })}
      </div>

      <aside className="job-category-detail" aria-live="polite">
        <p className="job-category-detail-label">{activeCategory?.label ?? '카테고리를 선택해 주세요'}</p>
        <p className="job-category-detail-copy">
          {activeCategory?.description ?? '마우스를 올리거나 선택하면 상세 설명을 확인할 수 있습니다.'}
        </p>
      </aside>
    </div>
  )
}

export type { JobCategory }
export default JobCategorySelector
