import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, 
  Eye, Calendar, User, Euro, RefreshCw 
} from 'lucide-react'
import TableCard from '../components/TableCard'
import { useToast } from '../../context/ToastContext'
import reservationService from '../../services/reservationService'

const Reservations = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Charger les réservations
  const loadReservations = async () => {
    try {
      setLoading(true)
      const response = await reservationService.getReservations()
      if (response.success) {
        setReservations(response.reservations)
      }
    } catch (error) {
      console.error('Erreur chargement réservations:', error)
      toast.error('Erreur lors du chargement des réservations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  // Couleurs des statuts
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Texte des statuts
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmée'
      case 'pending': return 'En attente'
      case 'cancelled': return 'Annulée'
      case 'completed': return 'Terminée'
      default: return status
    }
  }

  // Filtrer les réservations
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.client?.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.chambre?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.chambre?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Actions sur les réservations
  const confirmReservation = async (id) => {
    try {
      const response = await reservationService.confirmReservation(id)
      if (response.success) {
        toast.success('Réservation confirmée avec succès')
        loadReservations() // Recharger la liste
      }
    } catch (error) {
      console.error('Erreur confirmation:', error)
      toast.error('Erreur lors de la confirmation')
    }
  }

  const cancelReservation = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return
    }
    
    try {
      const response = await reservationService.cancelReservation(id)
      if (response.success) {
        toast.success(response.message)
        loadReservations() // Recharger la liste
      }
    } catch (error) {
      console.error('Erreur annulation:', error)
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const viewReservation = (id) => {
    navigate(`/dashboard/reservation/${id}/edit`)
  }

  const createNewReservation = () => {
    navigate('/dashboard/add-reservation')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec boutons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Réservations</h1>
          <p className="text-gray-600 mt-1">
            {filteredReservations.length} réservation(s) trouvée(s)
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={loadReservations}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
          <button 
            onClick={createNewReservation}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Réservation</span>
          </button>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher client ou chambre..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtre statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
              <option value="completed">Terminée</option>
            </select>
          </div>

          {/* Statistiques rapides */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">En attente:</span>
              <span className="font-semibold text-blue-900">
                {reservations.filter(r => r.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des Réservations */}
      <TableCard
        title={`Réservations (${filteredReservations.length})`}
        headers={['Client', 'Chambre', 'Dates', 'Nuits', 'Statut', 'Montant', 'Actions']}
        data={filteredReservations}
        emptyMessage="Aucune réservation trouvée"
        renderRow={(reservation) => (
          <tr key={reservation._id} className="hover:bg-gray-50 border-b border-gray-200">
            {/* Client */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {reservation.client?.name} {reservation.client?.surname}
                  </div>
                  <div className="text-xs text-gray-500">
                    {reservation.client?.email}
                  </div>
                </div>
              </div>
            </td>

            {/* Chambre */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {reservation.chambre?.number}
                </div>
                <div className="text-xs text-gray-500">
                  {reservation.chambre?.name}
                </div>
              </div>
            </td>

            {/* Dates */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <div className="text-sm text-gray-900">
                  <div>{formatDate(reservation.checkIn)}</div>
                  <div className="text-xs text-gray-500">au</div>
                  <div>{formatDate(reservation.checkOut)}</div>
                </div>
              </div>
            </td>

            {/* Nuits */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
              {reservation.nuits || reservation.nights}
            </td>

            {/* Statut */}
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                {getStatusText(reservation.status)}
              </span>
            </td>

            {/* Montant */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <Euro className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm font-medium text-gray-900">
                  {reservation.totalAmount}€
                </span>
              </div>
              {reservation.acompte > 0 && (
                <div className="text-xs text-gray-500">
                  Acompte: {reservation.acompte}€
                </div>
              )}
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                {/* Voir/Modifier */}
                <button
                  onClick={() => viewReservation(reservation._id)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                  title="Voir/Modifier"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Actions conditionnelles */}
                {reservation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => confirmReservation(reservation._id)}
                      className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                      title="Confirmer"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => cancelReservation(reservation._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      title="Annuler"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}

                {reservation.status === 'confirmed' && (
                  <button
                    onClick={() => cancelReservation(reservation._id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                    title="Annuler"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        )}
      />

      {/* Pied de page informatif */}
      {reservations.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {reservations.filter(r => r.status === 'pending').length}
              </div>
              <div>En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {reservations.filter(r => r.status === 'confirmed').length}
              </div>
              <div>Confirmées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reservations.filter(r => r.status === 'completed').length}
              </div>
              <div>Terminées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {reservations.filter(r => r.status === 'cancelled').length}
              </div>
              <div>Annulées</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservations