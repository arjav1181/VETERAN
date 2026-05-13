import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { cn, formatRelativeTime, formatShortSha } from '@/lib/utils';

interface CommitNode {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorAvatar?: string | null;
  date: string;
  branch?: string;
  isCurrentBranch?: boolean;
  parents: string[];
  x?: number;
  y?: number;
  lane?: number;
}

interface CommitGraphProps {
  commits: CommitNode[];
  currentBranch?: string;
  className?: string;
  onCommitClick?: (sha: string) => void;
}

export function CommitGraph({ commits, currentBranch, className, onCommitClick }: CommitGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; commit: CommitNode } | null>(null);

  useEffect(() => {
    if (!svgRef.current || commits.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = containerRef.current?.clientWidth || 800;
    const height = Math.max(commits.length * 36 + 40, 100);
    const nodeRadius = 5;
    const branchColors = d3.scaleOrdinal(d3.schemeSet2);

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const lanes = new Map<string, number>();
    const laneAssignments = new Map<string, number>();

    const getLane = (sha: string): number => {
      if (laneAssignments.has(sha)) return laneAssignments.get(sha)!;
      const existing = new Set(laneAssignments.values());
      let lane = 0;
      while (existing.has(lane)) lane++;
      laneAssignments.set(sha, lane);
      return lane;
    };

    const sorted = [...commits].reverse();
    sorted.forEach((commit, i) => {
      commit.y = 20 + i * 36;
      commit.lane = getLane(commit.sha);
    });

    sorted.forEach((commit) => {
      commit.parents.forEach((parentSha) => {
        if (!laneAssignments.has(parentSha)) {
          laneAssignments.set(parentSha, commit.lane!);
        }
      });
    });

    const maxLane = Math.max(...Array.from(laneAssignments.values()), 2);
    const laneWidth = 20;
    const graphWidth = (maxLane + 1) * laneWidth + 20;

    const g = svg.append('g');

    sorted.forEach((commit) => {
      commit.parents.forEach((parentSha) => {
        const parent = sorted.find(c => c.sha === parentSha);
        if (parent && parent.y !== undefined && commit.y !== undefined) {
          const x1 = graphWidth - (laneAssignments.get(commit.sha)! * laneWidth + 10);
          const x2 = graphWidth - (laneAssignments.get(parentSha)! * laneWidth + 10);
          const y1 = commit.y;
          const y2 = parent.y;

          g.append('path')
            .attr('d', d3.linkVertical()({
              source: [x1, y1],
              target: [x2, y2],
            } as any))
            .attr('fill', 'none')
            .attr('stroke', branchColors(commit.branch || ''))
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.5);
        }
      });
    });

    sorted.forEach((commit) => {
      if (commit.y === undefined) return;
      const x = graphWidth - (commit.lane! * laneWidth + 10);

      const circle = g.append('circle')
        .attr('cx', x)
        .attr('cy', commit.y)
        .attr('r', nodeRadius)
        .attr('fill', commit.isCurrentBranch ? '#E8B84B' : '#58A6FF')
        .attr('stroke', commit.isCurrentBranch ? '#E8B84B' : '#58A6FF')
        .attr('stroke-width', commit.isCurrentBranch ? 3 : 1.5)
        .style('cursor', 'pointer')
        .on('mouseenter', (event: MouseEvent) => {
          const rect = svgRef.current!.getBoundingClientRect();
          setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top - 10, commit });
        })
        .on('mouseleave', () => setTooltip(null))
        .on('click', () => onCommitClick?.(commit.sha));

      if (commit.isCurrentBranch) {
        circle.attr('r', 7);
      }

      g.append('text')
        .attr('x', graphWidth + 8)
        .attr('y', commit.y + 4)
        .attr('font-size', '12px')
        .attr('font-family', "'JetBrains Mono', monospace")
        .attr('fill', '#8B949E')
        .text(formatShortSha(commit.sha));

      g.append('text')
        .attr('x', graphWidth + 75)
        .attr('y', commit.y + 4)
        .attr('font-size', '12px')
        .attr('fill', '#E6EDF3')
        .attr('max-width', '400px')
        .text(commit.message.length > 60 ? commit.message.substring(0, 60) + '...' : commit.message);

      const dateStr = formatRelativeTime(commit.date);
      g.append('text')
        .attr('x', width - 10)
        .attr('y', commit.y + 4)
        .attr('font-size', '11px')
        .attr('fill', '#484F58')
        .attr('text-anchor', 'end')
        .text(dateStr);
    });

    const branchLabels = [...new Set(commits.filter(c => c.branch).map(c => c.branch!))];
    branchLabels.forEach((branch, i) => {
      const commit = sorted.find(c => c.branch === branch);
      if (!commit || commit.y === undefined) return;
      const x = graphWidth - (commit.lane! * laneWidth + 10);

      const label = g.append('g')
        .attr('transform', `translate(${x + 12}, ${commit.y - 6})`);

      label.append('rect')
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', commit.isCurrentBranch ? '#E8B84B' : '#58A6FF')
        .attr('opacity', 0.15)
        .attr('width', branch.length * 7.5 + 12)
        .attr('height', 16);

      label.append('text')
        .attr('x', 6)
        .attr('y', 12)
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', commit.isCurrentBranch ? '#E8B84B' : '#58A6FF')
        .text(branch);
    });
  }, [commits, currentBranch, onCommitClick]);

  if (commits.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-text-muted border border-border rounded-lg bg-primary-dark">
        <p className="text-sm">No commits to display</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative border border-border rounded-lg bg-primary-dark overflow-hidden', className)}>
      <svg ref={svgRef} className="w-full" />
      {tooltip && (
        <div
          className="absolute z-10 bg-surface border border-border rounded-lg shadow-xl px-3 py-2 text-sm pointer-events-none animate-fade-in"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <p className="font-medium text-text-primary">{tooltip.commit.message}</p>
          <p className="text-text-muted text-xs mt-1">{tooltip.commit.authorName} - {formatRelativeTime(tooltip.commit.date)}</p>
          <p className="text-text-muted text-xs font-mono">{tooltip.commit.shortSha}</p>
        </div>
      )}
    </div>
  );
}
