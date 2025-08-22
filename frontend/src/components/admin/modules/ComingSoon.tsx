import React from 'react';
import { Card } from '@/components/ui/Card';
import { Clock, Wrench } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>

    <Card className="p-12">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <Wrench className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Modulo in Sviluppo</h3>
        <p className="text-gray-500 mb-4">
          {description || `Il modulo ${title} è attualmente in fase di sviluppo e sarà disponibile presto.`}
        </p>
        <div className="flex items-center justify-center text-sm text-gray-400">
          <Clock className="h-4 w-4 mr-2" />
          <span>Prossimo aggiornamento</span>
        </div>
      </div>
    </Card>
  </div>
);

export default ComingSoon;
