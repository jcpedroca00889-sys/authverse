import { motion } from 'framer-motion'
import { useSellerDashboard } from './hooks/useSellerDashboard'
import { SellerHeader } from './components/SellerHeader'
import { TabNavigation } from './components/TabNavigation'
import { ListingForm } from './components/ListingForm'
import { ListingsTab } from './components/ListingsTab'
import { OrdersTab } from './components/OrdersTab'
import { EditModal } from './components/EditModal'

export default function SellerDashboardPage() {
  const {
    user, tab, setTab, listings, orders, submitting,
    editing, setEditing, confirmDelete, setConfirmDelete,
    loadingOrders, handleCreate, handleUpdate, handleDelete, toggleStatus,
  } = useSellerDashboard()

  if (!user) return null

  return (
    <div className="mx-auto max-w-6xl px-3 pb-4 pt-5 sm:px-6">
      <SellerHeader username={user.username} />

      <TabNavigation activeTab={tab} listingsCount={listings.length} onTabChange={setTab} />

      {tab === 'anunciar' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ListingForm submitting={submitting} onSubmit={handleCreate} />
        </motion.div>
      )}

      {tab === 'anuncios' && (
        <ListingsTab
          listings={listings}
          confirmDelete={confirmDelete}
          onToggleStatus={toggleStatus}
          onEdit={setEditing}
          onDelete={handleDelete}
          onConfirmDeleteChange={setConfirmDelete}
          onNavigateAnunciar={() => setTab('anunciar')}
        />
      )}

      {tab === 'vendas' && (
        <OrdersTab orders={orders} loading={loadingOrders} />
      )}

      <EditModal
        editing={editing}
        submitting={submitting}
        onUpdate={handleUpdate}
        onClose={() => setEditing(null)}
      />
    </div>
  )
}