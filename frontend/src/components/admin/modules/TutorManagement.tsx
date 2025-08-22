import React from 'react';
import { Plus, Upload, Search, Eye, Edit, Trash2, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Tutor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  subjects: string;
  hourlyRate: number;
  totalLessons: number;
  rating: number;
  isAvailable: boolean;
  totalEarnings: number;
  customRate?: number;
}

interface TutorManagementProps {
  tutors: Tutor[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  formatCurrency: (amount: number | undefined) => string;
}

const TutorManagement: React.FC<TutorManagementProps> = ({ 
  tutors, 
  searchTerm, 
  setSearchTerm, 
  formatCurrency 
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Gestione Tutor</h2>
      <div className="flex space-x-3">
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nuovo Tutor</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Import Excel</span>
        </Button>
      </div>
    </div>

    <Card>
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cerca tutor..." 
              className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option>Tutte le materie</option>
            <option>Matematica</option>
            <option>Italiano</option>
            <option>Inglese</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tariffa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lezioni</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guadagni</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tutors.map((tutor) => (
              <tr key={tutor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{tutor.firstName} {tutor.lastName}</div>
                    <div className="text-sm text-gray-500">{tutor.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tutor.subjects}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tutor.customRate === 0 ? 'Gratis' : `€${tutor.hourlyRate}/h`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tutor.totalLessons}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(tutor.totalEarnings)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-900">{tutor.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={tutor.isAvailable ? 'success' : 'error'}>
                    {tutor.isAvailable ? 'Disponibile' : 'Non disponibile'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

export default TutorManagement;
