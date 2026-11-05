import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import VariantHome from './VariantHome.jsx'
import { WeddingProvider } from './WeddingContext.jsx'

const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/'

function InviteRoute({ variantId }) {
  return (
    <WeddingProvider variantId={variantId}>
      <App />
    </WeddingProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<VariantHome />} />
        <Route path="/chu-re" element={<InviteRoute variantId="chu-re" />} />
        <Route path="/co-dau" element={<InviteRoute variantId="co-dau" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
