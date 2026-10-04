import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import NewScan from './pages/NewScan'
import Results from './pages/Results'
import IssueDetail from './pages/IssueDetail'
import History from './pages/History'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="scan" element={<NewScan />} />
        <Route path="results" element={<Results />} />
        <Route path="results/issue/:index" element={<IssueDetail />} />
        <Route path="history" element={<History />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
