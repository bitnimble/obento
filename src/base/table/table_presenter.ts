import { Columns } from 'base/table/table';
import { computed, IComputedValue, IObservableValue, makeAutoObservable } from 'mobx';

export type SortDirection = 'asc' | 'desc';

export class TableStore<T, N extends number> {
  sortColumn: number;
  sortDirection: SortDirection;

  constructor(
      readonly data: IObservableValue<T[] | undefined> | IComputedValue<T[] | undefined>,
      readonly columns: Columns<T, N>,
      sortColumn: number = 0,
      sortDirection: SortDirection = 'asc',
  ) {
    makeAutoObservable(this);
    this.sortColumn = sortColumn;
    this.sortDirection = sortDirection;
  }

  @computed.struct
  get sortedData() {
    const { data, sortColumn, sortDirection, columns } = this;
    const _data = data?.get();
    const column = columns[sortColumn];
    if (!_data || !column) {
      return;
    }
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return _data.sort((a, b) => column.sort(a, b) * directionMultiplier);
  }
}

export class TablePresenter<T, N extends number> {
  constructor(private readonly store: TableStore<T, N>, private readonly onSortChange?: () => void) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  private setSortColumn(column: number) {
    if (column < 0 || column >= this.store.columns.length) {
      return;
    }
    this.store.sortColumn = column;
  }

  private setSortDirection(direction: 'asc' | 'desc') {
    this.store.sortDirection = direction;
    if (this.onSortChange) {
      this.onSortChange();
    }
  }

  onColumnClick(columnIndex: number) {
    if (columnIndex !== this.store.sortColumn) {
      this.setSortColumn(columnIndex);
      this.setSortDirection('asc');
    } else {
      this.setSortDirection(this.store.sortDirection === 'asc' ? 'desc' : 'asc');
    }
  }
}
