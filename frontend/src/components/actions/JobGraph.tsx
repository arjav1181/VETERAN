import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';
import type { CIJob } from '@/types';

interface JobGraphProps {
  jobs: CIJob[];
  onJobClick?: (jobId: string) => void;
  className?: string;
}

export function JobGraph({ jobs, onJobClick, className }: JobGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || jobs.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', '100%');

    const width = 600;
    const height = jobs.length * 80 + 40;
    svg.attr('height', height);

    const g = svg.append('g').attr('transform', 'translate(40, 20)');

    const nodes = jobs.map((job, i) => ({
      id: job.id,
      name: job.name,
      status: job.status,
      conclusion: job.conclusion,
      x: 0,
      y: i * 80,
    }));

    const edges: { source: number; target: number }[] = [];
    jobs.forEach((job, i) => {
      job.dependencies.forEach(dep => {
        const depIndex = jobs.findIndex(j => j.name === dep);
        if (depIndex >= 0) {
          edges.push({ source: depIndex, target: i });
        }
      });
    });

    g.selectAll('path')
      .data(edges)
      .enter()
      .append('path')
      .attr('d', (d: { source: number; target: number }) => {
        const source = nodes[d.source];
        const target = nodes[d.target];
        if (!source || !target) return '';
        return `M${source.x + 80} ${source.y + 25} C${source.x + 160} ${source.y + 25}, ${target.x - 40} ${target.y + 25}, ${target.x} ${target.y + 25}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#21262D')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    g.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#21262D');

    const nodeGroups = g.selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: { x: number; y: number }) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (_event: unknown, d: { id: string }) => onJobClick?.(d.id));

    nodeGroups.append('rect')
      .attr('width', 160)
      .attr('height', 50)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', (d: { status: string; conclusion: string | null }) => {
        if (d.status === 'completed' && d.conclusion === 'success') return '#3FB95020';
        if (d.status === 'completed' && d.conclusion === 'failure') return '#F8514920';
        if (d.status === 'in_progress') return '#58A6FF20';
        return '#13161E';
      })
      .attr('stroke', (d: { status: string; conclusion: string | null }) => {
        if (d.status === 'completed' && d.conclusion === 'success') return '#3FB950';
        if (d.status === 'completed' && d.conclusion === 'failure') return '#F85149';
        if (d.status === 'in_progress') return '#58A6FF';
        return '#21262D';
      })
      .attr('stroke-width', 1.5);

    nodeGroups.append('text')
      .attr('x', 80)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#E6EDF3')
      .attr('font-weight', '500')
      .text((d: { name: string }) => d.name.length > 20 ? d.name.substring(0, 18) + '...' : d.name);

    nodeGroups.append('text')
      .attr('x', 80)
      .attr('y', 36)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#8B949E')
      .text((d: { status: string; conclusion: string | null }) => d.conclusion || d.status);
  }, [jobs, onJobClick]);

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted border border-border rounded-lg bg-primary-dark">
        <p className="text-sm">No jobs to display</p>
      </div>
    );
  }

  return (
    <div className={cn('border border-border rounded-lg bg-primary-dark overflow-x-auto p-4', className)}>
      <svg ref={svgRef} style={{ minWidth: '600px' }} />
    </div>
  );
}
