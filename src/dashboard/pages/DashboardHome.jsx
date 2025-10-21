import React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Euro, Bed, Calendar, Users } from 'lucide-react'
import StatCard from '../components/StatCard'
import ChartCard from '../components/ChartCard'
import TableCard from '../components/TableCard'
import {
  statsData,
  revenueData,
  occupancyData,
  recentBookings
} from '../data/mockData'

const DashboardHome = () => {
  const stats = [
    {
      title: 'Revenu Total',
      value: `€${statsData.totalRevenue.toLocaleString()}`,
      change: 12.5,
      icon: Euro,
      color: 'green'
    },
    {
      title: 'Taux Occupation',
      value: `${statsData.occupancyRate}%`,
      change: 8.2,
      icon: Bed,
      color: 'blue'
    },
    {
      title: 'Réservations',
      value: statsData.totalBookings,
      change: 15.3,
      icon: Calendar,
      color: 'orange'
    },
    {
      title: 'Chambres Libres',
      value: statsData.availableRooms,
      change: -5.2,
      icon: Users,
      color: 'purple'
    }
  ]

  return (
    <div className="space-y-6">
     
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenus Mensuels">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Taux d'Occupation Hebdomadaire">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="occupancy" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Dernières Réservations */}
      <TableCard
        title="Dernières Réservations"
        headers={['Client', 'Chambre', 'Dates', 'Statut', 'Montant']}
        data={recentBookings}
        renderRow={(booking) => (
          <tr key={booking.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {booking.client}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {booking.room}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {booking.checkIn} → {booking.checkOut}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                booking.status === 'confirmée' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              €{booking.amount}
            </td>
          </tr>
        )}
      />
    </div>
  )
}

export default DashboardHome