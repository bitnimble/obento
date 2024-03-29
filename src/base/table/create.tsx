import { Columns, Row, Table } from 'base/table/table';
import { SortDirection, TablePresenter, TableStore } from 'base/table/table_presenter';
import { IComputedValue, IObservableValue } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

// Alias N -> N2 for Row<N2>, to prevent N expanding to be a super set of both the
// column count and row cell count.
export function createTable<T extends { id: string }, N extends number, N2 extends N>(opts: {
  data: IObservableValue<T[] | undefined> | IComputedValue<T[] | undefined>,
  columns: Columns<T, N>,
  rowMapper: (t: T) => Row<N2>,
  onSortChange?: () => void,
  tableClassname?: string,
  rowClassname?: string,
  cellClassname?: string,
  defaultSortColumn?: number,
  defaultSortDirection?: SortDirection,
}) {
  const {
    data,
    columns,
    rowMapper,
    onSortChange,
    tableClassname,
    rowClassname,
    cellClassname,
    defaultSortColumn,
    defaultSortDirection,
  } = opts;
  const store = new TableStore(data, columns, defaultSortColumn, defaultSortDirection);
  const presenter = new TablePresenter(store, onSortChange);

  return {
    store,
    Component: observer(() => (
        <Table
            tableClassname={tableClassname}
            rowClassname={rowClassname}
            cellClassname={cellClassname}
            columns={store.columns}
            data={store.data.get()}
            sortColumn={store.sortColumn}
            sortDirection={store.sortDirection}
            onColumnClick={presenter.onColumnClick}
            rowMapper={rowMapper}
        />
    )),
  };
}
