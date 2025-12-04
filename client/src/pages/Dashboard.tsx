import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MetricsCards } from "../components/MetricsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { mockAPI, MetricsSummary } from "@/mocks/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { FlaskConical, Database, Network, ArrowRight } from "lucide-react";

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await mockAPI.getMetricsSummary();
        setMetrics(data);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  const classDistData = metrics.per_class.map((c) => ({
    name: c.label,
    samples: c.support,
  }));

  const perClassMetrics = metrics.per_class.map((c) => ({
    name: c.label,
    precision: c.precision,
    recall: c.recall,
    f1: c.f1,
  }));

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Acute Lymphoblastic Leukemia (ALL) Classification Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Deep learning model for automated classification of Acute Lymphoblastic Leukemia subtypes
        </p>
      </div>

      {/* KPI Cards */}
      <MetricsCards
        accuracy={metrics.accuracy}
        macroF1={metrics.macro_f1}
        inferenceMs={4.96}
        datasetSize={metrics.dataset_size}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <Card className="card-gradient shadow-soft">
          <CardHeader>
            <CardTitle>Class Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classDistData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="samples" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Per-Class Metrics */}
        <Card className="card-gradient shadow-soft">
          <CardHeader>
            <CardTitle>Per-Class Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={perClassMetrics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={[0.9, 1]} 
                  tick={{ fontSize: 12 }} 
                  ticks={[0.9, 0.92, 0.94, 0.96, 0.98, 1.0]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="precision"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="recall"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="f1"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        <Link to="/demo" className="group">
          <Card className="card-gradient shadow-soft hover:shadow-glow transition-smooth cursor-pointer h-full">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-smooth">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Try Live Demo</h3>
              <p className="text-sm text-muted-foreground">
                Upload images and see real-time predictions with Grad-CAM visualization
              </p>
              <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-smooth">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/explore" className="group">
          <Card className="card-gradient shadow-soft hover:shadow-glow transition-smooth cursor-pointer h-full">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-smooth">
                <Database className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-lg">Explore Data</h3>
              <p className="text-sm text-muted-foreground">
                Browse the dataset with interactive filters and detailed metadata
              </p>
              <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-smooth">
                View Gallery <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* <Link to="/interpret" className="group">
          <Card className="card-gradient shadow-soft hover:shadow-glow transition-smooth cursor-pointer h-full">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-smooth">
                <Network className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold text-lg">See How It Works</h3>
              <p className="text-sm text-muted-foreground">
                Visualize embeddings and understand model decision-making process
              </p>
              <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-smooth">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link> */}
      </div>
    </div>
  );
};
