import React from 'react';
import { Info } from 'lucide-react';

const InfoCard = ({ title, text }) => (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
        <div className="flex items-start">
            <Info className="text-blue-500 mr-3 mt-1 flex-shrink-0" size={20} />
            <div>
                <h4 className="font-bold text-blue-800 text-sm uppercase mb-1">{title}</h4>
                <p className="text-blue-700 text-sm leading-relaxed">{text}</p>
            </div>
        </div>
    </div>
);

export default InfoCard;
