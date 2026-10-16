import { useState } from 'react'
import type { EdgePayload, GraphEdge, GraphRelationType } from '../../api/types/admin'
import { graphRelationLabelMap } from '../utils/adminFormat'

type EdgeFormModalProps = {
  mode: 'create' | 'edit'
  initialEdge: GraphEdge | null
  /** 추가할 때 Source 에 미리 채울 기술. 보통 검색한 기술이다. */
  defaultSource?: string
  onClose: () => void
  /** 저장에 실패하면 던진다. 모달은 닫히지 않고 입력을 고칠 수 있게 오류를 보여준다. */
  onSubmit: (payload: EdgePayload) => Promise<void>
}

const RELATION_TYPES: GraphRelationType[] = ['RELATED_TO', 'USED_WITH', 'PREREQUISITE_OF', 'SIMILAR_TO']

function EdgeFormModal({ mode, initialEdge, defaultSource = '', onClose, onSubmit }: EdgeFormModalProps) {
  const [source, setSource] = useState(initialEdge?.source ?? defaultSource)
  const [relationType, setRelationType] = useState<GraphRelationType>(initialEdge?.relationType ?? 'RELATED_TO')
  const [target, setTarget] = useState(initialEdge?.target ?? '')
  const [description, setDescription] = useState(initialEdge?.description ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!source.trim() || !target.trim()) {
      setError('Source 와 Target 기술을 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        source: source.trim(),
        relationType,
        target: target.trim(),
        description: description.trim() || undefined,
      })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '관계를 저장하지 못했습니다.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edge-form-title">
      <div className="admin-modal">
        <h3 id="edge-form-title">{mode === 'create' ? '관계 추가' : '관계 수정'}</h3>
        <p>기술 사전에 있는 기술끼리만 이을 수 있고, 별칭(예: 자바)으로 입력해도 됩니다.</p>
        {mode === 'edit' && initialEdge?.createdBy === 'auto' ? (
          <p>공고로 자동 계산한 관계입니다. 고치면 어드민이 만든 관계가 되어 다음 갱신 때 덮어쓰지 않습니다.</p>
        ) : null}
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Source Node</span>
            <input value={source} maxLength={100} onChange={(event) => setSource(event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Relation Type</span>
            <select value={relationType} onChange={(event) => setRelationType(event.target.value as GraphRelationType)}>
              {RELATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type} · {graphRelationLabelMap[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Target Node</span>
            <input value={target} maxLength={100} onChange={(event) => setTarget(event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Description (optional)</span>
            <textarea rows={3} value={description} maxLength={500} onChange={(event) => setDescription(event.target.value)} />
          </label>
        </div>
        {error ? (
          <div className="admin-error" role="alert">
            {error}
          </div>
        ) : null}
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn secondary" onClick={onClose} disabled={isSubmitting}>
            취소
          </button>
          <button type="button" className="admin-btn primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EdgeFormModal
