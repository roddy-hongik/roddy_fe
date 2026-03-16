import { useState } from 'react'
import type { EdgePayload, GraphEdge, GraphRelationType } from '../../api/types/admin'

type EdgeFormModalProps = {
  mode: 'create' | 'edit'
  initialEdge: GraphEdge | null
  onClose: () => void
  onSubmit: (payload: EdgePayload) => void
}

const RELATION_TYPES: GraphRelationType[] = ['RELATED_TO', 'USED_WITH', 'PREREQUISITE_OF', 'SIMILAR_TO']

function EdgeFormModal({ mode, initialEdge, onClose, onSubmit }: EdgeFormModalProps) {
  const [source, setSource] = useState(initialEdge?.source ?? '')
  const [relationType, setRelationType] = useState<GraphRelationType>(initialEdge?.relationType ?? 'RELATED_TO')
  const [target, setTarget] = useState(initialEdge?.target ?? '')
  const [description, setDescription] = useState(initialEdge?.description ?? '')

  const handleSubmit = () => {
    if (!source.trim() || !target.trim()) {
      return
    }

    onSubmit({
      source: source.trim(),
      relationType,
      target: target.trim(),
      description: description.trim() || undefined,
    })
  }

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edge-form-title">
      <div className="admin-modal">
        <h3 id="edge-form-title">{mode === 'create' ? '관계 추가' : '관계 수정'}</h3>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Source Node</span>
            <input value={source} onChange={(event) => setSource(event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Relation Type</span>
            <select value={relationType} onChange={(event) => setRelationType(event.target.value as GraphRelationType)}>
              {RELATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Target Node</span>
            <input value={target} onChange={(event) => setTarget(event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Description (optional)</span>
            <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn secondary" onClick={onClose}>
            취소
          </button>
          <button type="button" className="admin-btn primary" onClick={handleSubmit}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

export default EdgeFormModal
