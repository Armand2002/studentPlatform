import React from 'react';
import { Plus, Download, Eye, Edit, Mail } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  institute: string;
  classLevel: string;
  phone: string;
  totalLessons: number;
  activePackages: number;
}

interface StudentManagementProps {
  students: Student[];
}

const StudentManagement: React.FC<StudentManagementProps> = ({ students }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Gestione Studenti</h2>
      <div className="flex space-x-3">
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nuovo Studente</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </Button>
      </div>
    </div>

    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Studente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Istituto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lezioni</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pacchetti</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.institute}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.classLevel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.totalLessons}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.activePackages}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-purple-600 hover:text-purple-900">
                    <Mail className="w-4 h-4" />
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

export default StudentManagement;
