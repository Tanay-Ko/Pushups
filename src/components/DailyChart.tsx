import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DailyTotal } from '../utils/stats'

interface DailyChartProps {
  data: DailyTotal[]
}

// Skill tree domain color mapping
const DOMAIN_COLORS: Record<string, { fill: string; name: string }> = {
  Push: { fill: '#f59e0b', name: 'Push' },
  Pull: { fill: '#0ea5e9', name: 'Pull' },
  Core: { fill: '#10b981', name: 'Core' },
  Legs: { fill: '#f43f5e', name: 'Legs' },
  Skill: { fill: '#a855f7', name: 'Skill' },
}

export function DailyChart({ data }: DailyChartProps) {
  return (
    <div className="space-y-3">
      {/* Domain Legend */}
      <div className="flex flex-wrap items-center justify-end gap-3 px-1 text-[11px] font-semibold text-muted">
        {Object.entries(DOMAIN_COLORS).map(([domain, config]) => (
          <div key={domain} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: config.fill }}
            />
            <span>{config.name}</span>
          </div>
        ))}
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#737373', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#737373', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,15,15,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              labelStyle={{ color: '#a3a3a3', fontWeight: 'bold', marginBottom: '4px' }}
              itemStyle={{ color: '#fafafa', padding: '2px 0' }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              formatter={(value: any, name: any) => [`${value} pts`, name]}
            />
            {/* Stacked Bars with Skill Tree Domain Colors */}
            <Bar dataKey="Push" stackId="a" fill={DOMAIN_COLORS.Push.fill} />
            <Bar dataKey="Pull" stackId="a" fill={DOMAIN_COLORS.Pull.fill} />
            <Bar dataKey="Core" stackId="a" fill={DOMAIN_COLORS.Core.fill} />
            <Bar dataKey="Legs" stackId="a" fill={DOMAIN_COLORS.Legs.fill} />
            <Bar dataKey="Skill" stackId="a" fill={DOMAIN_COLORS.Skill.fill} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
