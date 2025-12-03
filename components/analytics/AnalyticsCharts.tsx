'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';

interface AnalyticsChartsProps {
  chatbotId: string;
}

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'];

export default function AnalyticsCharts({ chatbotId }: AnalyticsChartsProps) {
  const [conversationsData, setConversationsData] = useState<any[]>([]);
  const [topQuestionsData, setTopQuestionsData] = useState<any[]>([]);
  const [outcomesData, setOutcomesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    loadData();
  }, [chatbotId, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load conversations over time
      const conversationsRes = await fetch(
        `/api/chatbots/${chatbotId}/analytics/conversations-over-time?days=${dateRange}`
      );
      if (conversationsRes.ok) {
        const conversationsData = await conversationsRes.json();
        setConversationsData(conversationsData.data || []);
      }

      // Load top questions
      const topQuestionsRes = await fetch(`/api/chatbots/${chatbotId}/analytics/top-questions`);
      if (topQuestionsRes.ok) {
        const topQuestionsData = await topQuestionsRes.json();
        setTopQuestionsData(topQuestionsData.data || []);
      }

      // Load stats for outcomes
      const statsRes = await fetch(`/api/chatbots/${chatbotId}/analytics/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const outcomes = statsData.outcomes || { resolved: 0, unresolved: 0, ongoing: 0 };
        setOutcomesData([
          { name: 'Resolved', value: outcomes.resolved },
          { name: 'Unresolved', value: outcomes.unresolved },
          { name: 'Ongoing', value: outcomes.ongoing },
        ]);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasConversations = conversationsData.some((d) => d.conversations > 0);
  const hasTopQuestions = topQuestionsData.length > 0;
  const hasOutcomes = outcomesData.some((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex gap-2">
        <Button
          variant={dateRange === 7 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDateRange(7)}
        >
          7 Days
        </Button>
        <Button
          variant={dateRange === 30 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDateRange(30)}
        >
          30 Days
        </Button>
        <Button
          variant={dateRange === 90 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDateRange(90)}
        >
          90 Days
        </Button>
      </div>

      {/* Conversations Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Conversations Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {hasConversations ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={formatDate}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="conversations"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No conversation data yet
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Most Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {hasTopQuestions ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topQuestionsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="question"
                    width={150}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => truncateText(value, 20)}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px' }}
                    formatter={(value, name, props) => [
                      value,
                      props.payload.question,
                    ]}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No question matches yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            {hasOutcomes ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={outcomesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {outcomesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No outcome data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
