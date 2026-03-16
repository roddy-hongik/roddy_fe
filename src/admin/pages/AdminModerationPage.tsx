import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'
import StatusBadge from '../components/StatusBadge'
import { getAdminUsers, getReportedContents, removeReportedContent, updateAdminUserStatus } from '../../api/services/adminService'
import type { AdminUser, AdminUserStatus, ContentType, ReportedContent } from '../../api/types/admin'
import { contentTypeLabelMap, formatDate, formatDateTime } from '../utils/adminFormat'

type ModerationTab = 'users' | 'contents'

function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<ModerationTab>('users')

  const [users, setUsers] = useState<AdminUser[]>([])
  const [isUsersLoading, setIsUsersLoading] = useState(true)
  const [isUsersError, setIsUsersError] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | AdminUserStatus>('all')
  const [userSort, setUserSort] = useState<'reports' | 'latest'>('reports')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [pendingUserAction, setPendingUserAction] = useState<{ user: AdminUser; nextStatus: AdminUserStatus } | null>(null)

  const [contents, setContents] = useState<ReportedContent[]>([])
  const [isContentsLoading, setIsContentsLoading] = useState(true)
  const [isContentsError, setIsContentsError] = useState(false)
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | ContentType>('all')
  const [contentSort, setContentSort] = useState<'reports' | 'latest'>('reports')
  const [selectedContent, setSelectedContent] = useState<ReportedContent | null>(null)
  const [pendingDeleteContent, setPendingDeleteContent] = useState<ReportedContent | null>(null)
  const [deleteReason, setDeleteReason] = useState('')

  useEffect(() => {
    let isMounted = true

    getAdminUsers()
      .then((response) => {
        if (!isMounted) {
          return
        }

        setUsers(response)
        setSelectedUser(response[0] ?? null)
        setIsUsersError(false)
      })
      .catch(() => {
        if (isMounted) {
          setIsUsersError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsUsersLoading(false)
        }
      })

    getReportedContents()
      .then((response) => {
        if (!isMounted) {
          return
        }
        setContents(response)
        setSelectedContent(response[0] ?? null)
        setIsContentsError(false)
      })
      .catch(() => {
        if (isMounted) {
          setIsContentsError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsContentsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = userSearch.trim().toLowerCase()

    const next = users.filter((user) => {
      if (userStatusFilter !== 'all' && user.status !== userStatusFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return user.nickname.toLowerCase().includes(normalizedSearch) || user.email.toLowerCase().includes(normalizedSearch)
    })

    return next.sort((a, b) => {
      if (userSort === 'reports') {
        return b.reportCount - a.reportCount
      }

      return +new Date(b.lastActiveAt) - +new Date(a.lastActiveAt)
    })
  }, [userSearch, userSort, userStatusFilter, users])

  const filteredContents = useMemo(() => {
    const next = contents.filter((content) => {
      if (contentTypeFilter === 'all') {
        return true
      }
      return content.type === contentTypeFilter
    })

    return next.sort((a, b) => {
      if (contentSort === 'reports') {
        return b.reportCount - a.reportCount
      }

      return +new Date(b.createdAt) - +new Date(a.createdAt)
    })
  }, [contentSort, contentTypeFilter, contents])

  const handleChangeUserStatus = async () => {
    if (!pendingUserAction) {
      return
    }

    const updatedUsers = await updateAdminUserStatus(pendingUserAction.user.id, pendingUserAction.nextStatus)
    setUsers(updatedUsers)
    setSelectedUser(updatedUsers.find((user) => user.id === pendingUserAction.user.id) ?? null)
    setPendingUserAction(null)
  }

  const handleDeleteContent = async () => {
    if (!pendingDeleteContent) {
      return
    }

    const nextContents = await removeReportedContent(pendingDeleteContent.id)
    setContents(nextContents)
    setSelectedContent(nextContents[0] ?? null)
    setPendingDeleteContent(null)
    setDeleteReason('')
  }

  return (
    <section className="admin-content-panel">
      <header className="admin-section-header">
        <div>
          <h3>유저 및 커뮤니티 관리</h3>
          <p>신고 기반으로 유저 상태와 커뮤니티 콘텐츠를 관리합니다.</p>
        </div>
      </header>

      <div className="admin-tab-row" role="tablist" aria-label="관리 탭">
        <button type="button" className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          유저 관리
        </button>
        <button type="button" className={`admin-tab-btn ${activeTab === 'contents' ? 'active' : ''}`} onClick={() => setActiveTab('contents')}>
          커뮤니티 관리
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="admin-filter-row">
            <input
              type="search"
              placeholder="유저명 또는 이메일 검색"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              aria-label="유저 검색"
            />
            <select value={userStatusFilter} onChange={(event) => setUserStatusFilter(event.target.value as 'all' | AdminUserStatus)}>
              <option value="all">전체 상태</option>
              <option value="active">정상</option>
              <option value="suspended">정지</option>
            </select>
            <select value={userSort} onChange={(event) => setUserSort(event.target.value as 'reports' | 'latest')}>
              <option value="reports">신고 많은 순</option>
              <option value="latest">최근 활동 순</option>
            </select>
          </div>

          {isUsersLoading ? <p className="admin-meta">유저 목록을 불러오는 중입니다...</p> : null}
          {isUsersError ? <p className="admin-error">유저 목록 조회에 실패했습니다.</p> : null}
          {!isUsersLoading && !isUsersError && filteredUsers.length === 0 ? <p className="admin-meta">조회된 유저가 없습니다.</p> : null}

          {!isUsersLoading && !isUsersError && filteredUsers.length > 0 ? (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>유저명</th>
                      <th>이메일</th>
                      <th>상태</th>
                      <th>신고 횟수</th>
                      <th>가입일</th>
                      <th>최근 활동일</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.nickname}</td>
                        <td>{user.email}</td>
                        <td>
                          <StatusBadge type="user" value={user.status} />
                        </td>
                        <td>{user.reportCount}</td>
                        <td>{formatDate(user.joinedAt)}</td>
                        <td>{formatDateTime(user.lastActiveAt)}</td>
                        <td>
                          <div className="admin-table-actions">
                            <button type="button" className="admin-btn secondary" onClick={() => setSelectedUser(user)}>
                              상세
                            </button>
                            {user.status === 'active' ? (
                              <button
                                type="button"
                                className="admin-btn danger"
                                onClick={() => setPendingUserAction({ user, nextStatus: 'suspended' })}
                              >
                                정지
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="admin-btn primary"
                                onClick={() => setPendingUserAction({ user, nextStatus: 'active' })}
                              >
                                정지 해제
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedUser ? (
                <section className="admin-detail-card">
                  <h4>유저 상세</h4>
                  <p>
                    <strong>{selectedUser.nickname}</strong> ({selectedUser.email})
                  </p>
                  <p>상태: {selectedUser.status === 'active' ? '정상' : '정지'} · 신고 {selectedUser.reportCount}회</p>
                  <p>가입일: {formatDate(selectedUser.joinedAt)} · 최근 활동: {formatDateTime(selectedUser.lastActiveAt)}</p>
                </section>
              ) : null}
            </>
          ) : null}
        </>
      ) : (
        <>
          <div className="admin-filter-row">
            <select value={contentTypeFilter} onChange={(event) => setContentTypeFilter(event.target.value as 'all' | ContentType)}>
              <option value="all">전체 타입</option>
              <option value="post">게시글</option>
              <option value="comment">댓글</option>
            </select>
            <select value={contentSort} onChange={(event) => setContentSort(event.target.value as 'reports' | 'latest')}>
              <option value="reports">신고 많은 순</option>
              <option value="latest">최신순</option>
            </select>
          </div>

          {isContentsLoading ? <p className="admin-meta">신고 콘텐츠를 불러오는 중입니다...</p> : null}
          {isContentsError ? <p className="admin-error">신고 콘텐츠 조회에 실패했습니다.</p> : null}
          {!isContentsLoading && !isContentsError && filteredContents.length === 0 ? <p className="admin-meta">신고된 콘텐츠가 없습니다.</p> : null}

          {!isContentsLoading && !isContentsError && filteredContents.length > 0 ? (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>타입</th>
                      <th>작성자</th>
                      <th>내용 요약</th>
                      <th>신고 횟수</th>
                      <th>작성일</th>
                      <th>상태</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContents.map((content) => (
                      <tr key={content.id}>
                        <td>{contentTypeLabelMap[content.type]}</td>
                        <td>{content.author}</td>
                        <td>{content.contentPreview}</td>
                        <td>{content.reportCount}</td>
                        <td>{formatDateTime(content.createdAt)}</td>
                        <td>
                          <StatusBadge type="content" value={content.status} />
                        </td>
                        <td>
                          <div className="admin-table-actions">
                            <button type="button" className="admin-btn secondary" onClick={() => setSelectedContent(content)}>
                              상세
                            </button>
                            <button type="button" className="admin-btn danger" onClick={() => setPendingDeleteContent(content)}>
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedContent ? (
                <section className="admin-detail-card">
                  <h4>콘텐츠 상세</h4>
                  <p>
                    {contentTypeLabelMap[selectedContent.type]} · {selectedContent.author}
                  </p>
                  <p>{selectedContent.fullContent}</p>
                </section>
              ) : null}
            </>
          ) : null}
        </>
      )}

      {pendingUserAction ? (
        <ConfirmModal
          title={pendingUserAction.nextStatus === 'suspended' ? '유저 정지' : '정지 해제'}
          description={`${pendingUserAction.user.nickname} 계정 상태를 변경하시겠습니까?`}
          confirmLabel={pendingUserAction.nextStatus === 'suspended' ? '정지 실행' : '정지 해제'}
          isDanger={pendingUserAction.nextStatus === 'suspended'}
          onCancel={() => setPendingUserAction(null)}
          onConfirm={() => {
            void handleChangeUserStatus()
          }}
        />
      ) : null}

      {pendingDeleteContent ? (
        <ConfirmModal
          title="콘텐츠 삭제"
          description="신고된 콘텐츠를 삭제하시겠습니까?"
          confirmLabel="삭제"
          isDanger
          onCancel={() => {
            setPendingDeleteContent(null)
            setDeleteReason('')
          }}
          onConfirm={() => {
            void handleDeleteContent()
          }}
        >
          <label className="admin-field">
            <span>삭제 사유 (optional)</span>
            <textarea rows={3} value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} />
          </label>
        </ConfirmModal>
      ) : null}
    </section>
  )
}

export default AdminModerationPage
