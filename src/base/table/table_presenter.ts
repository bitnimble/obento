import { Columns } from 'base/table/table';
import { IComputedValue, IObservableValue, makeAutoObservable } from 'mobx';

export class TableStore<T, N extends number> {
  sortColumn: number;
  sortDirection: 'asc' | 'desc' = 'asc';

  get sortedData() {
    const { sortColumn, sortDirection, columns } = this;
    const data = this.data.get();
    if (!data || data.length === 0) {
      return;
    }
    const column = columns[sortColumn];
    if (!column) {
      return;
    }
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;

    return data.sort((a: T, b: T) => column.sort(a, b) * directionMultiplier);
  }

  constructor(
      private readonly data: IObservableValue<T[] | undefined> | IComputedValue<T[] | undefined>,
      readonly columns: Columns<T, N>,
      sortColumn: number = 0,
  ) {
    makeAutoObservable(this);
    this.sortColumn = sortColumn;
  }
}

export class TablePresenter<T, N extends number> {
  constructor(private readonly store: TableStore<T, N>) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setSortColumn(column: number) {
    if (column < 0 || column >= this.store.columns.length) {
      return;
    }
    this.store.sortColumn = column;
  }

  setSortDirection(direction: 'asc' | 'desc') {
    this.store.sortDirection = direction;
  }
}
