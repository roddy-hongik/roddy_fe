import { type FormEvent, useRef, useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'
import EdgeFormModal from '../components/EdgeFormModal'
import { addGraphEdge, deleteGraphEdge, rebuildGraph, searchGraphNode, updateGraphEdge } from '../../api/services/adminService'
import type { EdgePayload, GraphEdge, GraphSearchResult } from '../../api/types/admin'
import { graphCreatedByLabelMap, graphRelationLabelMap } from '../utils/adminFormat'

const REBUILD_FAILED_MESSAGE = '그래프를 갱신하지 못했습니다. 잠시 후 다시 시도해 주세요.'

function AdminGraphPage() {
  const [keyword, setKeyword] = useState('QueryDSL')
  const [searchedKeyword, setSearchedKeyword] = useState<string | null>(null)
  const [result, setResult] = useState<GraphSearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const [isRebuilding, setIsRebuilding] = useState(false)
  const [rebuildMessage, setRebuildMessage] = useState<string | null>(null)
  const [rebuildError, setRebuildError] = useState<string | null>(null)

  const [edgeModalMode, setEdgeModalMode] = useState<'create' | 'edit' | null>(null)
  const [editingEdge, setEditingEdge] = useState<GraphEdge | null>(null)
  const [pendingDeleteEdge, setPendingDeleteEdge] = useState<GraphEdge | null>(null)
  const isDeletingRef = useRef(false)

  const searchedNode = result?.searchedNode ?? null
  const edges = result?.edges ?? []

  const loadGraph = async (nextKeyword: string) => {
    setIsLoading(true)
    setIsError(false)
    setSearchedKeyword(nextKeyword)

    try {
      setResult(await searchGraphNode(nextKeyword))
    } catch {
      setResult(null)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  // 추가·수정·삭제는 관계 하나만 돌려준다. 목록과 관계 수가 서버와 어긋나지 않도록 보던 기술을 다시 검색한다.
  const reloadGraph = () => {
    const nextKeyword = searchedNode?.name ?? searchedKeyword
    if (nextKeyword) {
      void loadGraph(nextKeyword)
    }
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (keyword.trim()) {
      void loadGraph(keyword.trim())
    }
  }

  const handleRebuild = async () => {
    setIsRebuilding(true)
    setRebuildMessage(null)
    setRebuildError(null)

    try {
      const rebuilt = await rebuildGraph()
      setRebuildMessage(
        `기술 ${rebuilt.technologyStackCount}개를 노드로 맞추고, 모집 중인 공고로 자동 관계 ${rebuilt.autoRelationCount}개를 새로 계산했습니다.`,
      )
      reloadGraph()
    } catch (error) {
      setRebuildError(error instanceof Error ? error.message : REBUILD_FAILED_MESSAGE)
    } finally {
      setIsRebuilding(false)
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

  const handleCloseEdgeModal = () => {
    setEdgeModalMode(null)
    setEditingEdge(null)
  }

  // 실패하면 모달이 오류를 보여주도록 그대로 던진다.
  const handleSubmitEdge = async (payload: EdgePayload) => {
    if (edgeModalMode === 'edit' && editingEdge) {
      await updateGraphEdge(editingEdge.id, payload)
    } else {
      await addGraphEdge(payload)
    }

    handleCloseEdgeModal()
    reloadGraph()
  }

  const handleDeleteEdge = async () => {
    if (!pendingDeleteEdge || isDeletingRef.current) {
      return
    }

    isDeletingRef.current = true
    try {
      await deleteGraphEdge(pendingDeleteEdge.id)
      reloadGraph()
    } catch (error) {
      alert(error instanceof Error ? error.message : '관계를 삭제하지 못했습니다.')
    } finally {
      isDeletingRef.current = false
      setPendingDeleteEdge(null)
    }
  }

  return (
    <section className="admin-content-panel">
      <header className="admin-section-header">
        <div>
          <h3>Graph DB 노드 관리</h3>
          <p>기술을 검색해 관계(Edge)를 추가/수정/삭제합니다. 함께 요구되는 기술(USED_WITH)은 모집 중인 공고로 자동 계산됩니다.</p>
        </div>
        <button type="button" className="admin-btn secondary" onClick={handleRebuild} disabled={isRebuilding}>
          {isRebuilding ? '갱신 중...' : '그래프 갱신'}
        </button>
      </header>

      {rebuildMessage ? (
        <p className="admin-meta" role="status">
          {rebuildMessage}
        </p>
      ) : null}
      {rebuildError ? (
        <p className="admin-error" role="alert">
          {rebuildError}
        </p>
      ) : null}

      <form className="admin-filter-row" onSubmit={handleSearch}>
        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="기술 이름이나 별칭 입력 (예: 스프링부트)"
          aria-label="기술 스택 검색"
        />
        <button type="submit" className="admin-btn primary" disabled={isLoading || !keyword.trim()}>
          {isLoading ? '검색 중...' : '검색'}
        </button>
      </form>

      {isError ? <p className="admin-error">그래프 데이터를 불러오지 못했습니다.</p> : null}
      {!isLoading && !isError && !result ? <p className="admin-meta">노드 검색을 실행해 주세요.</p> : null}
      {result && !searchedNode ? (
        <p className="admin-meta">
          기술 그래프에 없는 기술입니다. 기술 사전에 있는 기술만 노드가 되며, 그래프를 처음 쓴다면 그래프 갱신을 먼저 실행해 주세요.
        </p>
      ) : null}

      {searchedNode ? (
        <>
          <article className="admin-detail-card">
            <h4>검색 결과 노드</h4>
            <p>
              <strong>{searchedNode.name}</strong> · {searchedNode.category}
            </p>
            <p>연결된 관계 수: {searchedNode.relationCount}</p>
          </article>

          <div className="admin-section-header inner">
            <h4>관계(Edge) 목록</h4>
            <button type="button" className="admin-btn primary" onClick={handleOpenCreateModal}>
              관계 추가
            </button>
          </div>

          {edges.length === 0 ? (
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
                  {edges.map((edge) => (
                    <tr key={edge.id}>
                      <td>{edge.source}</td>
                      <td title={graphRelationLabelMap[edge.relationType]}>{edge.relationType}</td>
                      <td>{edge.target}</td>
                      <td>{graphCreatedByLabelMap[edge.createdBy]}</td>
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
          defaultSource={searchedNode?.name}
          onClose={handleCloseEdgeModal}
          onSubmit={handleSubmitEdge}
        />
      ) : null}

      {pendingDeleteEdge ? (
        <ConfirmModal
          title="관계 삭제"
          description={`${pendingDeleteEdge.source} -[${pendingDeleteEdge.relationType}]-> ${pendingDeleteEdge.target} 관계를 삭제하시겠습니까?${
            pendingDeleteEdge.createdBy === 'auto' ? ' 공고로 자동 계산한 관계라 삭제하면 다음 갱신 때 다시 생기지 않습니다.' : ''
          }`}
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
