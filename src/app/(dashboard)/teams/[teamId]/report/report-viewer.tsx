"use client";

import { type CompatibilityReport } from "@/lib/ai/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  report: CompatibilityReport;
}

export function ReportViewer({ report }: Props) {
  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Executive Summary</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{report.overallScore}</span>
              <span className="text-sm text-zinc-500">/100</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-700 leading-relaxed">{report.summary}</p>
        </CardContent>
      </Card>

      {/* Partnership Archetype */}
      <Card>
        <CardHeader>
          <CardTitle>Partnership Archetype</CardTitle>
          <CardDescription>{report.archetype.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-700">{report.archetype.description}</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-green-700 mb-2">Strengths</h4>
              <ul className="space-y-1">
                {report.archetype.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-zinc-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-700 mb-2">Watch Outs</h4>
              <ul className="space-y-1">
                {report.archetype.watchOuts.map((w, i) => (
                  <li key={i} className="text-sm text-zinc-600 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>Compatibility scores by assessment dimension</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.scores.map((score) => (
              <div key={score.dimension}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{score.dimension}</span>
                  <span className="text-sm text-zinc-500">{score.score}/{score.maxScore}</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      score.score >= 75
                        ? "bg-green-500"
                        : score.score >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alignment Map */}
      <Card>
        <CardHeader>
          <CardTitle>Alignment Map</CardTitle>
          <CardDescription>Detailed alignment analysis across all dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {report.alignmentMap.map((item) => (
              <div key={item.dimension} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{item.dimension}</h4>
                  <Badge variant={item.score >= 75 ? "success" : item.score >= 50 ? "warning" : "destructive"}>
                    {item.score}%
                  </Badge>
                </div>
                <p className="text-sm font-medium text-zinc-600">{item.summary}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.details}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Radar</CardTitle>
          <CardDescription>Potential risks to the partnership, ranked by severity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.riskRadar
              .sort((a, b) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3 };
                return order[a.severity] - order[b.severity];
              })
              .map((risk, i) => (
                <div key={i} className="p-4 rounded-lg border border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{risk.risk}</h4>
                    <Badge
                      variant={
                        risk.severity === "critical" || risk.severity === "high"
                          ? "destructive"
                          : risk.severity === "medium"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-600">{risk.description}</p>
                  <div className="bg-zinc-50 rounded p-3">
                    <p className="text-xs font-medium text-zinc-500 mb-1">Mitigation</p>
                    <p className="text-sm text-zinc-700">{risk.mitigation}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Blind Spots */}
      <Card>
        <CardHeader>
          <CardTitle>Blind Spots</CardTitle>
          <CardDescription>Things the partnership may not see about itself</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {report.blindSpots.map((spot, i) => (
              <div key={i} className="p-4 rounded-lg border border-zinc-200">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm">{spot.area}</h4>
                  <Badge variant="outline" className="text-xs">{spot.category}</Badge>
                </div>
                <p className="text-sm text-zinc-600">{spot.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Prioritized action items for the partnership</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.recommendations
              .sort((a, b) => a.priority - b.priority)
              .map((rec) => (
                <div key={rec.priority} className="flex gap-4 p-4 rounded-lg border border-zinc-200">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-medium">
                    {rec.priority}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-zinc-600">{rec.description}</p>
                    <p className="text-xs text-zinc-400">{rec.timeframe}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
