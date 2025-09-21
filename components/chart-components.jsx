"use client"

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

// Threat Statistics Bar Chart
export function ThreatStatsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
        <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--card-foreground))",
          }}
        />
        <Bar dataKey="threats" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Activity Timeline Line Chart
export function ActivityTimelineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="time" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
        <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--card-foreground))",
          }}
        />
        <Area
          type="monotone"
          dataKey="activity"
          stroke="hsl(var(--chart-1))"
          fillOpacity={1}
          fill="url(#activityGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Threat Distribution Pie Chart
export function ThreatDistributionChart({ data }) {
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--card-foreground))",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Security Score Gauge (simplified as bar)
export function SecurityScoreChart({ score }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "hsl(var(--chart-4))"
    if (score >= 60) return "hsl(var(--chart-5))"
    return "hsl(var(--destructive))"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Security Score</span>
        <span className="text-2xl font-bold" style={{ color: getScoreColor(score) }}>
          {score}/100
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: getScoreColor(score),
          }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {score >= 80
          ? "Excellent security posture"
          : score >= 60
            ? "Good security, room for improvement"
            : "Security needs attention"}
      </div>
    </div>
  )
}
