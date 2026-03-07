import { useState } from 'react'

type JobCategory = {
  id: string
  label: string
  description: string
}

type JobCategorySelectorProps = {
  categories: JobCategory[]
  selectedCategories: string[]
  onToggleCategory: (id: string) => void
}

function JobCategorySelector({
  categories,
  selectedCategories,
  onToggleCategory,
}: JobCategorySelectorProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <div className="job-category-wrap">
      <div className="job-category-list" role="group" aria-label="희망 직군 카테고리">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id)
          const isExpanded = hoveredCategory === category.id

          return (
            <button
              key={category.id}
              type="button"
              className={`job-category-item ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}
              role="checkbox"
              aria-checked={isSelected}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onFocus={() => setHoveredCategory(category.id)}
              onBlur={() => setHoveredCategory(null)}
              onClick={() => onToggleCategory(category.id)}
            >
              <span className="job-category-title">{category.label}</span>
              <span className="job-category-description">{category.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export type { JobCategory }
export default JobCategorySelector
