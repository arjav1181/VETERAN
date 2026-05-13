import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';

interface RoadmapItem {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignee?: string;
  status?: string;
}

interface RoadmapViewProps {
  items: RoadmapItem[];
  className?: string;
}

export function RoadmapView({ items, className }: RoadmapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dateRange = useMemo(() => {
    if (items.length === 0) {
      const now = new Date();
      return { min: d3.timeMonth.offset(now, -1), max: d3.timeMonth.offset(now, 3) };
    }
    const startDates = items.map(i => i.startDate);
    const endDates = items.map(i => i.endDate);
    return {
      min: d3.timeMonth.floor(d3.min(startDates) || new Date()),
      max: d3.timeMonth.ceil(d3.max(endDates) || new Date()),
    };
  }, [items]);

  useEffect(() => {
    if (!svgRef.current || items.length === 0) return;

    const margin = { top: 40, right: 20, bottom: 30, left: 200 };
    const width = (containerRef.current?.clientWidth || 800) - margin.left - margin.right;
    const rowHeight = 40;
    const height = items.length * rowHeight + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
      .domain([dateRange.min, dateRange.max])
      .range([0, width]);

    const xAxis = d3.axisTop(xScale)
      .ticks(d3.timeMonth.every(1))
      .tickFormat(d3.timeFormat('%b') as any);

    g.append('g')
      .attr('class', 'x-axis')
      .call(xAxis)
      .call(g => g.selectAll('.domain').attr('stroke', '#21262D'))
      .call(g => g.selectAll('line').attr('stroke', '#21262D'))
      .call(g => g.selectAll('text').attr('fill', '#8B949E').attr('font-size', '11px'));

    const now = new Date();
    if (now >= dateRange.min && now <= dateRange.max) {
      g.append('line')
        .attr('x1', xScale(now))
        .attr('y1', 0)
        .attr('x2', xScale(now))
        .attr('y2', items.length * rowHeight)
        .attr('stroke', '#E8B84B')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');
    }

    items.forEach((item, i) => {
      const y = i * rowHeight;
      const x1 = xScale(item.startDate);
      const x2 = xScale(item.endDate);
      const barHeight = 20;

      g.append('text')
        .attr('x', -10)
        .attr('y', y + barHeight / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .attr('fill', '#E6EDF3')
        .text(item.title.length > 25 ? item.title.substring(0, 23) + '...' : item.title);

      const bar = g.append('rect')
        .attr('x', x1)
        .attr('y', y + 2)
        .attr('width', Math.max(x2 - x1, 4))
        .attr('height', barHeight)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', item.status === 'completed' ? '#3FB950' : '#58A6FF')
        .attr('opacity', 0.2)
        .attr('stroke', item.status === 'completed' ? '#3FB950' : '#58A6FF')
        .attr('stroke-width', 1);

      if (item.progress > 0) {
        g.append('rect')
          .attr('x', x1)
          .attr('y', y + 2)
          .attr('width', Math.max((x2 - x1) * (item.progress / 100), 4))
          .attr('height', barHeight)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('fill', item.status === 'completed' ? '#3FB950' : '#58A6FF')
          .attr('opacity', 0.8);
      }

      if (item.assignee) {
        g.append('text')
          .attr('x', x2 + 6)
          .attr('y', y + barHeight / 2 + 4)
          .attr('font-size', '10px')
          .attr('fill', '#8B949E')
          .text(item.assignee);
      }
    });

    svg.selectAll('.x-axis .domain').attr('stroke', '#21262D');
  }, [items, dateRange]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-text-muted border border-border rounded-lg bg-primary-dark">
        <p className="text-sm">No timeline items to display</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('border border-border rounded-lg bg-primary-dark overflow-x-auto p-2', className)}>
      <svg ref={svgRef} style={{ minWidth: '600px' }} />
    </div>
  );
}
