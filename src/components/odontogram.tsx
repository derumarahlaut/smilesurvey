
"use client";

import { Controller, useWatch } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMemo } from 'react';

const toothStatusCode = {
  permanent: [
    { code: '0', status: 'Sehat' },
    { code: '1', status: 'Gigi Berlubang/Karies' },
    { code: '2', status: 'Tumpatan dengan karies' },
    { code: '3', status: 'Tumpatan tanpa karies' },
    { code: '4', status: 'Gigi dicabut karena karies' },
    { code: '5', status: 'Gigi dicabut karena sebab lain' },
    { code: '6', status: 'Fissure Sealant' },
    { code: '7', status: 'Protesa cekat/mahkota cekat/implan/veneer' },
    { code: '8', status: 'Gigi tidak tumbuh' },
    { code: '9', status: 'Lain-lain' },
  ],
  primary: [
    { code: 'A', status: 'Sehat' },
    { code: 'B', status: 'Gigi Berlubang/Karies' },
    { code: 'C', status: 'Tumpatan dengan karies' },
    { code: 'D', status: 'Tumpatan tanpa karies' },
    { code: 'E', status: 'Gigi dicabut karena karies' },
  ]
};

const adultTeeth = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
};

const childTeeth = {
    upperRight: [55, 54, 53, 52, 51],
    upperLeft: [61, 62, 63, 64, 65],
    lowerLeft: [75, 74, 73, 72, 71],
    lowerRight: [85, 84, 83, 82, 81],
};

const allAdultTeethIds = Object.values(adultTeeth).flat();
const allChildTeethIds = Object.values(childTeeth).flat();


const ToothSelect = ({ control, name, label, type = 'permanent' }: { control: any; name: string; label: string, type?: 'permanent' | 'primary' }) => (
  <div className="flex flex-col items-center">
    <span className="text-xs">{label}</span>
    <Controller
      name={`odontogram-chart.${name}`}
      control={control}
      render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger className="w-[60px] h-8 bg-yellow-200 border-gray-400">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            {toothStatusCode[type].map(item => (
              <SelectItem key={item.code} value={item.code}>{item.code}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  </div>
);

const ToothRow = ({ control, teethRight, teethLeft, type = 'permanent' } : { control: any, teethRight: number[], teethLeft: number[], type?: 'permanent' | 'primary'}) => (
    <div className="flex justify-center items-center gap-1">
        <div className="flex justify-end flex-1 gap-1">
            {teethRight.map(tooth => <ToothSelect key={tooth} control={control} name={`tooth-${tooth}`} label={String(tooth)} type={type} />)}
        </div>
        <div className="w-px h-12 bg-black mx-1"></div>
        <div className="flex justify-start flex-1 gap-1">
            {teethLeft.map(tooth => <ToothSelect key={tooth} control={control} name={`tooth-${tooth}`} label={String(tooth)} type={type} />)}
        </div>
    </div>
);

const ScoreTable = ({ title, scores }: { title: string, scores: { label: string, value: number }[] }) => (
  <div className="w-32">
    <h4 className="font-bold text-center mb-1">{title}</h4>
    <table className="w-full border-collapse border border-black">
      <tbody>
        {scores.map((score, index) => (
          <tr key={score.label}>
            <td className="border border-black px-2 font-mono">{score.label}</td>
            <td className="border border-black px-2 bg-green-200 text-center font-bold">{score.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


export function Odontogram({ form }: { form: any }) {
  const { control } = form;
  const odontogramData = useWatch({ control, name: 'odontogram-chart' });

  const scores = useMemo(() => {
    const dmf = { D: 0, M: 0, F: 0 };
    const def = { d: 0, e: 0, f: 0 };

    if (odontogramData) {
      // DMF-T Calculation (Gigi Tetap)
      // D = Decay (1, 2), M = Missing (4), F = Filling (3)
      allAdultTeethIds.forEach(id => {
        const status = odontogramData[`tooth-${id}`];
        if (status === '1' || status === '2') dmf.D++;
        if (status === '4') dmf.M++;
        if (status === '3') dmf.F++;
      });
      
      // def-t Calculation (Gigi Sulung)
      // d = decay (B, C), e = evoliation/extracted (E), f = filling (D)
      allChildTeethIds.forEach(id => {
        const status = odontogramData[`tooth-${id}`];
        if (status === 'B' || status === 'C') def.d++;
        if (status === 'E') def.e++;
        if (status === 'D') def.f++;
      });
    }

    const dmfTotal = dmf.D + dmf.M + dmf.F;
    const defTotal = def.d + def.e + def.f;

    return {
      dmfScores: [
        { label: 'D', value: dmf.D },
        { label: 'M', value: dmf.M },
        { label: 'F', value: dmf.F },
        { label: 'DMF-T', value: dmfTotal },
      ],
      defScores: [
        { label: 'd', value: def.d },
        { label: 'e', value: def.e },
        { label: 'f', value: def.f },
        { label: 'def-t', value: defTotal },
      ],
    };

  }, [odontogramData]);

  return (
    <div className="w-full p-4 border rounded-lg space-y-4">
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4">
        <div>
          <h4 className="font-bold">Gigi Tetap</h4>
          {toothStatusCode.permanent.map(item => <p key={item.code} className="text-sm">{item.code} = {item.status}</p>)}
        </div>
        <div>
          <h4 className="font-bold">Gigi Sulung</h4>
          {toothStatusCode.primary.map(item => <p key={item.code} className="text-sm">{item.code} = {item.status}</p>)}
        </div>
      </div>

      <div className="flex justify-center gap-8 items-start">
        {/* Odontogram Chart */}
        <div className="space-y-2 flex-grow">
          <div className="flex justify-between text-sm font-bold px-4">
            <span>RA Kanan</span>
            <span>RA Kiri</span>
          </div>
          <ToothRow control={control} teethRight={adultTeeth.upperRight} teethLeft={adultTeeth.upperLeft} type="permanent" />
          <ToothRow control={control} teethRight={childTeeth.upperRight.slice().reverse()} teethLeft={childTeeth.upperLeft} type="primary" />
          <div className="border-t-2 border-black my-2"></div>
          <ToothRow control={control} teethRight={childTeeth.lowerRight.slice().reverse()} teethLeft={childTeeth.lowerLeft} type="primary" />
          <ToothRow control={control} teethRight={adultTeeth.lowerRight} teethLeft={adultTeeth.lowerLeft} type="permanent" />
          <div className="flex justify-between text-sm font-bold px-4">
            <span>RB Kanan</span>
            <span>RB Kiri</span>
          </div>
        </div>
      </div>
      
      {/* Score Tables */}
      <div className="flex justify-center gap-8 items-start py-4 border-t">
        <ScoreTable title="def-t" scores={scores.defScores} />
        <ScoreTable title="DMF-T" scores={scores.dmfScores} />
      </div>


      {/* Other Clinical Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
              <Label>Gusi berdarah</Label>
              <Controller
                  name="odontogram-chart.bleedingGums"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="0">0 = Tidak</SelectItem>
                              <SelectItem value="1">1 = Ya</SelectItem>
                          </SelectContent>
                      </Select>
                  )} />
          </div>
          <div className="space-y-2">
              <Label>Lesi Mukosa Oral</Label>
              <Controller
                  name="odontogram-chart.oralLesion"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="0">0 = Tidak</SelectItem>
                              <SelectItem value="1">1 = Ya</SelectItem>
                          </SelectContent>
                      </Select>
                  )} />
          </div>
          <div className="space-y-2">
              <Label>Kebutuhan perawatan segera</Label>
              <Controller
                  name="odontogram-chart.treatmentNeed"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Pilih kebutuhan" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="0">0 = tidak perlu perawatan</SelectItem>
                              <SelectItem value="1">1 = perlu, tidak segera</SelectItem>
                              <SelectItem value="2">2 = perlu, segera</SelectItem>
                          </SelectContent>
                      </Select>
                  )} />
          </div>
          <div className="space-y-2">
              <Label>Rujukan</Label>
              <Controller
                  name="odontogram-chart.referral"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Pilih status rujukan" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="0">0 = tidak perlu rujukan</SelectItem>
                              <SelectItem value="1">1 = rujukan ke:</SelectItem>
                          </SelectContent>
                      </Select>
                  )} />
              <Controller
                  name="odontogram-chart.referralLocation"
                  control={control}
                  render={({ field }) => (
                     <Input {...field} placeholder="Lokasi rujukan" className="mt-2" />
                  )} />
          </div>
      </div>
    </div>
  );
}
