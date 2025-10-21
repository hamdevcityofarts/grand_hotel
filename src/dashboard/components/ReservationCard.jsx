import React from 'react'
import { Calendar, User, Bed, Euro, CheckCircle, XCircle, Clock, Edit } from 'lucide-react'

const ReservationCard = ({ reservation, onConfirm, onCancel, onEdit }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'confirmée':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-500'
        }
      case 'en attente':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          iconColor: 'text-yellow-500'
        }
      case 'annulée':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-500'
        }
      case 'terminée':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: CheckCircle,
          iconColor: 'text-gray-500'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          iconColor: 'text-gray-500'
        }
    }
  }

  const statusConfig = getStatusConfig(reservation.status)
  const StatusIcon = statusConfig.icon

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Réservation #{reservation.id}
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
              <StatusIcon className={`w-4 h-4 mr-1 ${statusConfig.iconColor}`} />
              {reservation.status}
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">{reservation.client}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Bed className="w-4 h-4 mr-2" />
            <span>{reservation.room}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Check-in</p>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(reservation.checkIn)}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Check-out</p>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(reservation.checkOut)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-lg font-bold text-gray-900">
          <Euro className="w-5 h-5 mr-1" />
          {reservation.amount}
        </div>
        
        <div className="flex space-x-2">
          {reservation.status === 'en attente' && (
            <>
              <button
                onClick={() => onConfirm(reservation.id)}
                className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center space-x-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirmer</span>
              </button>
              <button
                onClick={() => onCancel(reservation.id)}
                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center space-x-1"
              >
                <XCircle className="w-4 h-4" />
                <span>Annuler</span>
              </button>
            </>
          )}
          <button
            onClick={() => onEdit(reservation)}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center space-x-1"
          >
            <Edit className="w-4 h-4" />
            <span>Modifier</span>
          </button>
        </div>
      </div>

      {reservation.specialRequests && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800 mb-1">Demandes spéciales</p>
          <p className="text-sm text-blue-700">{reservation.specialRequests}</p>
        </div>
      )}
    </div>
  )
}

export default ReservationCard