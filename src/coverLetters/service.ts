import { httpClient } from '../api/client/httpClient'

export interface LetterJob { id: number; title: string; company: string }
export interface LetterAnswer { question: string; answer: string }
export interface CoverLetter {
  id: number
  title: string
  job: LetterJob | null
  version: number
  answers: LetterAnswer[]
  createdAt: string
  updatedAt: string
}
export interface LetterPage {
  coverLetters: Pick<CoverLetter, 'id' | 'title' | 'job' | 'updatedAt'>[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
export interface SaveLetter { title: string; jobPostingId: number | null; answers: LetterAnswer[]; version?: number }
const endpoint = '/api/cover-letters'
export const listLetters = (page = 0) => httpClient<LetterPage>(`${endpoint}?page=${page}&size=10`)
export const getLetter = (id: string) => httpClient<CoverLetter>(`${endpoint}/${encodeURIComponent(id)}`)
export const saveLetter = (id: string | undefined, body: SaveLetter) => httpClient<CoverLetter>(
  id ? `${endpoint}/${encodeURIComponent(id)}` : endpoint,
  { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) },
)
export const deleteLetter = (id: string, version: number) => httpClient<null>(
  `${endpoint}/${encodeURIComponent(id)}?version=${version}`, { method: 'DELETE' },
)
