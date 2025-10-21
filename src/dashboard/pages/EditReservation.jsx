import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Calendar, User, Bed, Euro } from 'lucide-react'

const EditReservation = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setReservation({
        id: parseInt(id),
        client: 'Pierre Martin',
        clientId: 1,
        room: 'Suite Présidentielle',
        roomId: 1,
        checkIn: '2024-01-15',
        checkOut: '2024-01-18',
        status: 'confirmée',
        amount: 1200,
        guests: 2,
        specialRequests: 'Fleurs dans la chambre pour anniversaire',
        paymentStatus: 'complet'
      })
      setLoading(false)
    }, 1000)
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    navigate('/dashboard/reservations')
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard/reservations')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Modifier la Réservation #{reservation.id}
          </h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations client */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Informations Client</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du client
              </label>
              <input
                type="text"
                value={reservation.client}
                onChange={(e) => setReservation({...reservation, client: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de personnes
              </label>
              <input
                type="number"
                value={reservation.guests}
                onChange={(e) => setReservation({...reservation, guests: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>

        {/* Informations séjour */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Dates de Séjour</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'arrivée
              </label>
              <input
                type="date"
                value={reservation.checkIn}
                onChange={(e) => setReservation({...reservation, checkIn: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de départ
              </label>
              <input
                type="date"
                value={reservation.checkOut}
                onChange={(e) => setReservation({...reservation, checkOut: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Informations chambre */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Bed className="w-5 h-5" />
            <span>Chambre</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chambre assignée
              </label>
              <select
                value={reservation.roomId}
                onChange={(e) => setReservation({...reservation, roomId: parseInt(e.target.value), room: e.target.options[e.target.selectedIndex].text})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>Suite Présidentielle</option>
                <option value={2}>Suite Exécutive</option>
                <option value={3}>Chambre Deluxe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={reservation.status}
                onChange={(e) => setReservation({...reservation, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en attente">En attente</option>
                <option value="confirmée">Confirmée</option>
                <option value="annulée">Annulée</option>
                <option value="terminée">Terminée</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informations paiement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Euro className="w-5 h-5" />
            <span>Paiement</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant total
              </label>
              <input
                type="number"
                value={reservation.amount}
                onChange={(e) => setReservation({...reservation, amount: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut du paiement
              </label>
              <select
                value={reservation.paymentStatus}
                onChange={(e) => setReservation({...reservation, paymentStatus: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en attente">En attente</option>
                <option value="acompte">Acompte</option>
                <option value="complet">Complet</option>
                <option value="remboursé">Remboursé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Demandes spéciales */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Demandes Spéciales</h2>
          <textarea
            value={reservation.specialRequests}
            onChange={(e) => setReservation({...reservation, specialRequests: e.target.value})}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Notes ou demandes spéciales du client..."
          />
        </div>
      </div>
    </div>
  )
}

export default EditReservation