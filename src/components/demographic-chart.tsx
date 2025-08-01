
"use client"

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface DemographicChartProps {
  title: string;
  data: Record<string, number>;
}

export function DemographicChart({ title, data }: DemographicChartProps) {
  const { chartData, chartConfig } = useMemo(() => {
    const preparedData = Object.entries(data)
      .filter(([key]) => key !== 'Jumlah') // Exclude total from the chart itself
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort for better visualization

    const config: ChartConfig = {
      value: {
        label: "Jumlah",
        color: "hsl(var(--chart-1))",
      },
    };

    return { chartData: preparedData, chartConfig: config };
  }, [data]);

  const total = data['Jumlah'] || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} (Total: {total})</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={150} 
                  tick={{ 
                    fontSize: 12, 
                    fill: 'hsl(var(--foreground))',
                    // @ts-ignore
                    textAnchor: "start",
                    dx: -145
                  }}
                  tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                   <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-muted-foreground">Tidak ada data untuk kategori ini.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
