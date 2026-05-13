import { useState, useMemo } from 'react';
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor,
  PointerSensor, useSensor, useSensors, type DragStartEvent,
  type DragEndEvent, type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, X, MoreHorizontal, Calendar, User, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectColumn, ProjectCard } from '@/types';

interface BoardViewProps {
  columns: ProjectColumn[];
  cards: ProjectCard[];
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string, position: number) => void;
  onAddCard?: (columnId: string) => void;
  className?: string;
}

function SortableCard({ card }: { card: ProjectCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-primary-dark border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing group',
        isDragging && 'opacity-50 ring-2 ring-accent'
      )}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <button {...listeners} className="mt-0.5 text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          {card.contentType === 'note' ? (
            <p className="text-sm text-text-primary">{card.note}</p>
          ) : (
            <p className="text-sm text-text-primary font-medium truncate">{card.note || 'Untitled card'}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
            <span className="flex items-center gap-1"><User size={12} />{card.creatorUsername}</span>
          </div>
        </div>
        <button className="p-0.5 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

function BoardColumn({ column, cards, onAddCard }: {
  column: ProjectColumn; cards: ProjectCard[]; onAddCard?: () => void;
}) {
  const columnCards = cards.filter(c => c.columnId === column.id).sort((a, b) => a.position - b.position);
  const cardIds = columnCards.map(c => c.id);

  return (
    <div className="flex-shrink-0 w-72 bg-surface/50 border border-border rounded-lg flex flex-col max-h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-primary">{column.name}</h3>
          <span className="text-xs text-text-muted bg-primary-dark px-1.5 py-0.5 rounded">{columnCards.length}</span>
        </div>
        <button
          onClick={onAddCard}
          className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {columnCards.map(card => (
            <SortableCard key={card.id} card={card} />
          ))}
        </SortableContext>
        {columnCards.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-text-muted border-2 border-dashed border-border rounded-lg">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}

export function BoardView({ columns, cards, onCardMove, onAddCard, className }: BoardViewProps) {
  const [activeCard, setActiveCard] = useState<ProjectCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find(c => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard) return;

    let targetColumnId: string;
    const overCard = cards.find(c => c.id === over.id);
    if (overCard) {
      targetColumnId = overCard.columnId;
    } else {
      const overColumn = columns.find(c => c.id === over.id);
      if (overColumn) {
        targetColumnId = overColumn.id;
      } else return;
    }

    const targetCards = cards.filter(c => c.columnId === targetColumnId).sort((a, b) => a.position - b.position);
    const overIndex = overCard ? targetCards.findIndex(c => c.id === over.id) : targetCards.length;
    onCardMove?.(activeCard.id, activeCard.columnId, targetColumnId, overIndex >= 0 ? overIndex : targetCards.length);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('flex gap-4 overflow-x-auto pb-4 h-full', className)}>
        {columns.map(column => (
          <BoardColumn
            key={column.id}
            column={column}
            cards={cards}
            onAddCard={() => onAddCard?.(column.id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard && (
          <div className="bg-primary-dark border-2 border-accent rounded-lg p-3 shadow-2xl">
            <p className="text-sm text-text-primary">{activeCard.note || 'Untitled card'}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
