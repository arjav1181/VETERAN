import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface InsightChartsProps {
  className?: string;
}

const COLORS = ['#E8B84B', '#58A6FF', '#3FB950', '#F85149', '#BC8CFF', '#D29922', '#F778BA', '#79C0FF'];

const weeklyData = [
  { name: 'Mon', commits: 12, additions: 45, deletions: 23 },
  { name: 'Tue', commits: 8, additions: 32, deletions: 12 },
  { name: 'Wed', commits: 15, additions: 67, deletions: 34 },
  { name: 'Thu', commits: 10, additions: 28, deletions: 18 },
  { name: 'Fri', commits: 18, additions: 89, deletions: 45 },
  { name: 'Sat', commits: 6, additions: 15, deletions: 8 },
  { name: 'Sun', commits: 4, additions: 12, deletions: 5 },
];

const monthlyData = Array.from({ length: 12 }).map((_, i) => ({
  name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  commits: Math.floor(Math.random() * 200 + 50),
  contributors: Math.floor(Math.random() * 10 + 3),
}));

const languageData = [
  { name: 'TypeScript', value: 45 },
  { name: 'JavaScript', value: 25 },
  { name: 'Python', value: 12 },
  { name: 'Rust', value: 8 },
  { name: 'Go', value: 5 },
  { name: 'Other', value: 5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-xl px-3 py-2 text-sm">
      <p className="text-text-primary font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export function InsightCharts({ className }: InsightChartsProps) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-4', className)}>
      <div className="bg-primary-dark border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">Weekly Commit Activity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
            <XAxis dataKey="name" stroke="#484F58" fontSize={12} />
            <YAxis stroke="#484F58" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="commits" fill="#E8B84B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="additions" fill="#3FB950" radius={[4, 4, 0, 0]} />
            <Bar dataKey="deletions" fill="#F85149" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-primary-dark border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">Monthly Contributions</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
            <XAxis dataKey="name" stroke="#484F58" fontSize={12} />
            <YAxis stroke="#484F58" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="commits" stroke="#E8B84B" fill="#E8B84B" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="contributors" stroke="#58A6FF" fill="#58A6FF" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-primary-dark border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">Languages</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={languageData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {languageData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-text-secondary text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-primary-dark border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">Commit Timeline</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
            <XAxis dataKey="name" stroke="#484F58" fontSize={12} />
            <YAxis stroke="#484F58" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="commits" stroke="#E8B84B" strokeWidth={2} dot={{ fill: '#E8B84B', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
