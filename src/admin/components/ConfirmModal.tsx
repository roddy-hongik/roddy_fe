import type { ReactNode } from 'react'

type ConfirmModalProps = {
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  isDanger?: boolean
  onCancel: () => void
  onConfirm: () => void
  children?: ReactNode
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel = '취소',
  isDanger = false,
  onCancel,
  onConfirm,
  children,
}: ConfirmModalProps) {
  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
      <div className="admin-modal">
        <h3 id="admin-confirm-title">{title}</h3>
        <p>{description}</p>
        {children ? <div className="admin-modal-body">{children}</div> : null}
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`admin-btn ${isDanger ? 'danger' : 'primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
