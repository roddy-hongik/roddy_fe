import { type FormEvent, useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'
import EdgeFormModal from '../components/EdgeFormModal'
import { addGraphEdge, deleteGraphEdge, searchGraphNode, updateGraphEdge } from '../../api/services/adminService'
import type { EdgePayload, GraphEdge, GraphSearchResult } from '../../api/types/admin'
import { formatDate } from '../utils/adminFormat'

function AdminGraphPage() {
  const [keyword, setKeyword] = useState('QueryDSL')
  const [result, setResult] = useState<GraphSearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const [edgeModalMode, setEdgeModalMode] = useState<'create' | 'edit' | null>(null)
  const [editingEdge, setEditingEdge] = useState<GraphEdge | null>(null)
  const [pendingDeleteEdge, setPendingDeleteEdge] = useState<GraphEdge | null>(null)

  const handleSearch = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setIsLoading(true)
    setIsError(false)

    try {
      const response = await searchGraphNode(keyword)
      setResult(response)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingEdge(null)
    setEdgeModalMode('create')
  }

  const handleOpenEditModal = (edge: GraphEdge) => {
    setEditingEdge(edge)
    setEdgeModalMode('edit')
  }

  const handleSubmitEdge = async (payload: EdgePayload) => {
    if (!result) {
      return
    }

    const nextEdges = edgeModalMode === 'create' ? await addGraphEdge(payload) : await updateGraphEdge(editingEdge?.id ?? '', payload)

    setResult({
      searchedNode: result.searchedNode
        ? {
            ...result.searchedNode,
            relationCount: nextEdges.length,
          }
        : null,
      edges: nextEdges,
    })

    setEdgeModalMode(null)
    setEditingEdge(null)
  }

  const handleDeleteEdge = async () => {
    if (!pendingDeleteEdge || !result) {
      return
    }

    const nextEdges = await deleteGraphEdge(pendingDeleteEdge.id)
    setResult({
      searchedNode: result.searchedNode
        ? {
            ...result.searchedNode,
            relationCount: nextEdges.length,
          }
        : null,
      edges: nextEdges,
    })
    setPendingDeleteEdge(null)
  }

  return (
    <section className="admin-content-panel">
      <header className="admin-section-header">
        <div>
          <h3>Graph DB 노드 관리</h3>
          <p>노드 검색 후 관계(Edge)를 수동으로 추가/수정/삭제합니다.</p>
        </div>
      </header>

      <form className="admin-filter-row" onSubmit={handleSearch}>
        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="기술 스택 키워드 입력"
          aria-label="기술 스택 검색"
        />
        <button type="submit" className="admin-btn primary" disabled={isLoading}>
          {isLoading ? '검색 중...' : '검색'}
        </button>
      </form>

      {isError ? <p className="admin-error">그래프 데이터를 불러오지 못했습니다.</p> : null}
      {!isLoading && !result ? <p className="admin-meta">노드 검색을 실행해 주세요.</p> : null}

      {result?.searchedNode ? (
        <article className="admin-detail-card">
          <h4>검색 결과 노드</h4>
          <p>
            <strong>{result.searchedNode.name}</strong> · {result.searchedNode.category}
          </p>
          <p>연결된 관계 수: {result.searchedNode.relationCount}</p>
          <p className="admin-meta">기준일: {formatDate(new Date().toISOString())}</p>
        </article>
      ) : null}

      {result ? (
        <>
          <div className="admin-section-header inner">
            <h4>관계(Edge) 목록</h4>
            <button type="button" className="admin-btn primary" onClick={handleOpenCreateModal}>
              관계 추가
            </button>
          </div>

          {result.edges.length === 0 ? (
            <p className="admin-meta">연결된 관계가 없습니다.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Relation Type</th>
                    <th>Target</th>
                    <th>생성 주체</th>
                    <th>신뢰도</th>
                    <th>설명</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {result.edges.map((edge) => (
                    <tr key={edge.id}>
                      <td>{edge.source}</td>
                      <td>{edge.relationType}</td>
                      <td>{edge.target}</td>
                      <td>{edge.createdBy}</td>
                      <td>{Math.round(edge.confidence * 100)}%</td>
                      <td>{edge.description ?? '-'}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button type="button" className="admin-btn secondary" onClick={() => handleOpenEditModal(edge)}>
                            수정
                          </button>
                          <button type="button" className="admin-btn danger" onClick={() => setPendingDeleteEdge(edge)}>
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}

      {edgeModalMode ? (
        <EdgeFormModal
          key={`${edgeModalMode}-${editingEdge?.id ?? 'new'}`}
          mode={edgeModalMode}
          initialEdge={editingEdge}
          onClose={() => {
            setEdgeModalMode(null)
            setEditingEdge(null)
          }}
          onSubmit={(payload) => {
            void handleSubmitEdge(payload)
          }}
        />
      ) : null}

      {pendingDeleteEdge ? (
        <ConfirmModal
          title="관계 삭제"
          description={`${pendingDeleteEdge.source} -[${pendingDeleteEdge.relationType}]-> ${pendingDeleteEdge.target} 관계를 삭제하시겠습니까?`}
          confirmLabel="삭제"
          isDanger
          onCancel={() => setPendingDeleteEdge(null)}
          onConfirm={() => {
            void handleDeleteEdge()
          }}
        />
      ) : null}
    </section>
  )
}

export default AdminGraphPage
