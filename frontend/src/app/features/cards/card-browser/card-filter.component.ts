import { Component, input, output, model, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MONSTER_RACES, SPELL_RACES, TRAP_RACES,
  MONSTER_TYPES, SPELL_TYPES, TRAP_TYPES,
  ATTRIBUTES, LEVELS, BAN_STATUS, ORDER_OPTIONS,
} from './card-browser.constants';
import { BtnComponent } from '../../../shared/components/common/button/btn.component';
import { CardFilter } from '../../../core/models/card.model';

export type CardFilterState = Omit<CardFilter, 'page' | 'pageSize'>;

@Component({
  selector: 'app-card-filter',
  standalone: true,
  imports: [FormsModule, BtnComponent],
  templateUrl: './card-filter.component.html',
})
export class CardFilterComponent {
  readonly attributes  = ATTRIBUTES;
  readonly levels      = LEVELS;
  readonly banStatuses = BAN_STATUS;
  readonly orderOptions = ORDER_OPTIONS;
  readonly monsterTypes = MONSTER_TYPES;
  readonly spellTypes   = SPELL_TYPES;
  readonly trapTypes    = TRAP_TYPES;

  // Search bar
  filterName = '';

  // Advanced filters
  filterDesc      = '';
  filterCategory  = '';
  filterType      = '';
  filterRace      = '';
  filterAttribute = '';
  filterLevel     = '';
  filterMinAtk    = '';
  filterMaxAtk    = '';
  filterMinDef    = '';
  filterMaxDef    = '';
  filterBan       = '';
  filterOrder     = 'newest';

  readonly showFilters = signal(false);

  readonly searched = output<CardFilterState>();
  readonly cleared  = output<void>();

  get availableRaces(): string[] {
    if (this.filterCategory === 'Monster') return MONSTER_RACES;
    if (this.filterCategory === 'Spell')   return SPELL_RACES;
    if (this.filterCategory === 'Trap')    return TRAP_RACES;
    return [...MONSTER_RACES, ...SPELL_RACES, ...TRAP_RACES].filter((v, i, a) => a.indexOf(v) === i);
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterDesc || this.filterCategory || this.filterType || this.filterRace ||
              this.filterAttribute || this.filterLevel || this.filterMinAtk || this.filterMaxAtk ||
              this.filterMinDef || this.filterMaxDef || this.filterBan || this.filterOrder !== 'newest');
  }

  get hasAny(): boolean {
    return !!(this.filterName || this.hasActiveFilters);
  }

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  onTextInput(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.emit(), 400);
  }

  onCategoryChange(): void {
    this.filterType = '';
    this.filterRace = '';
    if (this.filterCategory !== 'Monster') {
      this.filterAttribute = '';
      this.filterLevel = '';
      this.filterMinAtk = '';
      this.filterMaxAtk = '';
      this.filterMinDef = '';
      this.filterMaxDef = '';
    }
    this.emit();
  }

  emit(): void {
    this.searched.emit({
      name:      this.filterName      || undefined,
      desc:      this.filterDesc      || undefined,
      category:  this.filterCategory  || undefined,
      type:      this.filterType      || undefined,
      race:      this.filterRace      || undefined,
      attribute: this.filterAttribute || undefined,
      level:     this.filterLevel     ? +this.filterLevel  : undefined,
      minAtk:    this.filterMinAtk    ? +this.filterMinAtk : undefined,
      maxAtk:    this.filterMaxAtk    ? +this.filterMaxAtk : undefined,
      minDef:    this.filterMinDef    ? +this.filterMinDef : undefined,
      maxDef:    this.filterMaxDef    ? +this.filterMaxDef : undefined,
      banTcg:    this.filterBan       || undefined,
      orderBy:   this.filterOrder     || undefined,
    });
  }

  clear(): void {
    this.filterName = '';
    this.filterDesc = '';
    this.filterCategory = '';
    this.filterType = '';
    this.filterRace = '';
    this.filterAttribute = '';
    this.filterLevel = '';
    this.filterMinAtk = '';
    this.filterMaxAtk = '';
    this.filterMinDef = '';
    this.filterMaxDef = '';
    this.filterBan = '';
    this.filterOrder = 'newest';
    this.cleared.emit();
  }
}
