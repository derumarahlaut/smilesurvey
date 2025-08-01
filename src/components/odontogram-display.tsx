
"use client";

import { useMemo } from 'react';

const toothStatusCodeMap: Record<string, string> = {
    // Gigi Tetap
    '0': 'Sehat', '1': 'Karies', '2': 'Tumpatan+Karies', '3': 'Tumpatan',
    '4': 'Dicabut (Karies)', '5': 'Dicabut (Lain)', '6': 'Sealant',
    '7': 'Protesa', '8': 'Tidak Tumbuh', '9': 'Lain-lain',
    // Gigi Sulung
    'A': 'Sehat', 'B': 'Karies', 'C': 'Tumpatan+Karies',
    'D': 'Tumpatan', 'E': 'Dicabut (Karies)',
};

const adultTeeth = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
  lowerRight: [41, 42, 43, 44, 45, 46, 47, 48],
};

const childTeeth = {
    upperRight: [55, 54, 53, 52, 51],
    upperLeft: [61, 62, 63, 64, 65],
    lowerLeft: [71, 72, 73, 74, 75],
    lowerRight: [81, 82, 83, 84, 85],
};

const ToothDisplay = ({ label, value }: { label: string; value: string }) => {
    const statusColor = useMemo(() => {
        if (['1', '2', '4', 'B', 'C', 'E'].includes(value)) return 'bg-red-200 border-red-400';
        if (['3', '6', '7', 'D'].includes(value)) return 'bg-blue-200 border-blue-400';
        if (value === '5' || value === '8' || value === '9') return 'bg-gray-200 border-gray-400';
        return 'bg-yellow-200 border-gray-400';
    }, [value]);
    
    return (
        <div className="flex flex-col items-center">
            <span className="text-xs">{label}</span>
            <div className={`w-[60px] h-8 flex items-center justify-center rounded border text-sm font-semibold ${statusColor}`}>
                {value || '-'}
            </div>
        </div>
    );
};

const ToothRowDisplay = ({ patientData, teethRight, teethLeft } : { patientData: any, teethRight: number[], teethLeft: number[] }) => {
    const getToothValue = (toothId: number) => {
        const key = `Status Gigi ${toothId}`;
        return patientData?.[key] || (adultTeeth.upperRight.includes(toothId) || adultTeeth.upperLeft.includes(toothId) || adultTeeth.lowerLeft.includes(toothId) || adultTeeth.lowerRight.includes(toothId) ? '0' : 'A');
    }

    return (
        <div className="flex justify-center items-center gap-1">
            <div className="flex justify-end flex-1 gap-1">
                {teethRight.map(tooth => <ToothDisplay key={tooth} label={String(tooth)} value={getToothValue(tooth)} />)}
            </div>
            <div className="w-px h-12 bg-black mx-1"></div>
            <div className="flex justify-start flex-1 gap-1">
                {teethLeft.map(tooth => <ToothDisplay key={tooth} label={String(tooth)} value={getToothValue(tooth)} />)}
            </div>
        </div>
    );
};

export function OdontogramDisplay({ patientData }: { patientData: any }) {

  return (
    <div className="w-full p-4 border rounded-lg space-y-4 bg-gray-50">
        <div className="space-y-2 flex-grow">
          <div className="flex justify-between text-sm font-bold px-4">
            <span>RA Kanan</span>
            <span>RA Kiri</span>
          </div>

          <div className="flex items-center gap-2">
              <span className="text-xs font-medium w-16 text-center transform -rotate-90">Gigi Tetap</span>
              <div className="flex-1">
                <ToothRowDisplay patientData={patientData} teethRight={adultTeeth.upperRight} teethLeft={adultTeeth.upperLeft} />
              </div>
          </div>
          <div className="flex items-center gap-2">
              <span className="text-xs font-medium w-16 text-center transform -rotate-90">Gigi Susu</span>
              <div className="flex-1">
                <ToothRowDisplay patientData={patientData} teethRight={childTeeth.upperRight.slice().reverse()} teethLeft={childTeeth.upperLeft} />
              </div>
          </div>
          
          <div className="border-t-2 border-black my-2"></div>

          <div className="flex items-center gap-2">
               <span className="text-xs font-medium w-16 text-center transform -rotate-90">Gigi Susu</span>
               <div className="flex-1">
                <ToothRowDisplay patientData={patientData} teethRight={childTeeth.lowerRight.slice().reverse()} teethLeft={childTeeth.lowerLeft} />
               </div>
          </div>
           <div className="flex items-center gap-2">
               <span className="text-xs font-medium w-16 text-center transform -rotate-90">Gigi Tetap</span>
               <div className="flex-1">
                <ToothRowDisplay patientData={patientData} teethRight={adultTeeth.lowerRight.slice().reverse()} teethLeft={adultTeeth.lowerLeft} />
               </div>
          </div>

          <div className="flex justify-between text-sm font-bold px-4">
            <span>RB Kanan</span>
            <span>RB Kiri</span>
          </div>
        </div>
    </div>
  );
}
