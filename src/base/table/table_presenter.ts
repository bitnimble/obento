import { Columns } from 'base/table/table';
import { makeAutoObservable } from 'mobx';

export type SortDirection = 'asc' | 'desc';

export class TableStore<T, N extends number> {
  sortColumn: number;
  sortDirection: SortDirection;

  constructor(
      readonly columns: Columns<T, N>,
      sortColumn: number = 0,
      sortDirection: SortDirection = 'asc',
  ) {
    makeAutoObservable(this);
    this.sortColumn = sortColumn;
    this.sortDirection = sortDirection;
  }
}

export class TablePresenter<T, N extends number> {
  constructor(private readonly store: TableStore<T, N>) {
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
