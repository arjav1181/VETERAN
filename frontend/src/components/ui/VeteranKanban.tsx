import { useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../lib/utils';
import { GripVertical, Plus } from 'lucide-react';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  labels?: Array<{ text: string; color: string }>;
  assignees?: Array<{ name: string; avatar_url?: string | null }>;
  meta?: Record<string, ReactNode>;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
  limit?: number;
}

export interface VeteranKanbanProps {
  columns: KanbanColumn[];
  onColumnsChange: (columns: KanbanColumn[]) => void;
  onCardClick?: (cardId: string, columnId: string) => void;
  onAddCard?: (columnId: string) => void;
  className?: string;
}

function SortableCard({
  card,
  columnId,
  onClick,
}: {
  card: KanbanCard;
  columnId: string;
  onClick?: (cardId: string, columnId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card, columnId },
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
        'group bg-[rgb(var(--veteran-bg))] border border-surface-200 dark:border-surface-700 rounded-lg p-3 shadow-sm cursor-pointer',
        'hover:shadow-md hover:border-surface-300 dark:hover:border-surface-600 transition-all',
        isDragging && 'opacity-50 shadow-lg z-10'
      )}
      onClick={() => onClick?.(card.id, columnId)}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-100 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[rgb(var(--veteran-fg))]">{card.title}</p>
          {card.description && (
            <p className="mt-1 text-xs text-surface-500 line-clamp-2">{card.description}</p>
          )}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {card.labels.map((label, i) => (
                <span
                  key={i}
                  className="inline-block px-1.5 py-0.5 rounded text-2xs font-medium"
                  style={{ backgroundColor: label.color + '30', color: label.color }}
                >
                  {label.text}
                </span>
              ))}
            </div>
          )}
          {card.assignees && card.assignees.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {card.assignees.map((assignee, i) => (
                assignee.avatar_url ? (
                  <img
                    key={i}
                    src={assignee.avatar_url}
                    alt={assignee.name}
                    className="w-5 h-5 rounded-full ring-1 ring-[rgb(var(--veteran-bg))]"
                  />
                ) : (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full bg-surface-200 dark:bg-surface-700 ring-1 ring-[rgb(var(--veteran-bg))] flex items-center justify-center text-2xs font-medium text-surface-500"
                  >
                    {assignee.name.charAt(0).toUpperCase()}
                  </div>
                )
              ))}
            </div>
          )}
          {card.meta && Object.keys(card.meta).length > 0 && (
            <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
              {Object.entries(card.meta).map(([key, value]) => (
                <span key={key} className="flex items-center gap-1">
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumnView({
  column,
  allCards,
  onCardClick,
  onAddCard,
}: {
  column: KanbanColumn;
  allCards: KanbanCard[];
  onCardClick?: (cardId: string, columnId: string) => void;
  onAddCard?: (columnId: string) => void;
}) {
  const cardCount = column.cards.length;

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {column.color && (
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
          )}
          <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))]">{column.title}</h3>
          <span className="text-xs text-surface-400 bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded-full">
            {cardCount}{column.limit ? `/${column.limit}` : ''}
          </span>
        </div>
        {onAddCard && (
          <button
            onClick={() => onAddCard(column.id)}
            className="p-1 rounded text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 min-h-[100px] rounded-lg bg-surface-50 dark:bg-surface-800/50 p-2">
        <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} columnId={column.id} onClick={onCardClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function VeteranKanban({ columns, onColumnsChange, onCardClick, onAddCard, className }: VeteranKanbanProps) {
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const allCards = columns.flatMap((col) => col.cards);

  function handleDragStart(event: DragStartEvent) {
    const card = allCards.find((c) => c.id === event.active.id);
    if (card) setActiveCard(card);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCol = columns.find((col) => col.cards.some((c) => c.id === active.id));
    const overCol = columns.find((col) => col.cards.some((c) => c.id === over.id)) ||
                   columns.find((col) => col.id === over.id);

    if (!activeCol || !overCol || activeCol.id === overCol.id) return;

    const activeIndex = activeCol.cards.findIndex((c) => c.id === active.id);
    const overIndex = overCol.cards.findIndex((c) => c.id === over.id);

    const newColumns = columns.map((col) => {
      if (col.id === activeCol.id) {
        return { ...col, cards: col.cards.filter((c) => c.id !== active.id) };
      }
      if (col.id === overCol.id) {
        const cardToMove = activeCol.cards[activeIndex];
        const insertAt = overIndex >= 0 ? overIndex : col.cards.length;
        const newCards = [...col.cards];
        newCards.splice(insertAt, 0, cardToMove);
        return { ...col, cards: newCards };
      }
      return col;
    });

    onColumnsChange(newColumns);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const col = columns.find((c) => c.cards.some((card) => card.id === active.id));
    if (!col) return;

    const oldIndex = col.cards.findIndex((c) => c.id === active.id);
    const newIndex = col.cards.findIndex((c) => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const newCards = [...col.cards];
    const [moved] = newCards.splice(oldIndex, 1);
    newCards.splice(newIndex, 0, moved);

    const newColumns = columns.map((c) =>
      c.id === col.id ? { ...c, cards: newCards } : c
    );

    onColumnsChange(newColumns);
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('flex gap-4 overflow-x-auto pb-4 scrollbar-thin', className)}>
        {columns.map((column) => (
          <KanbanColumnView
            key={column.id}
            column={column}
            allCards={allCards}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard && (
          <div className="bg-[rgb(var(--veteran-bg))] border border-veteran-500 rounded-lg p-3 shadow-xl">
            <p className="text-sm font-medium">{activeCard.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
