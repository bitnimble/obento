import { Columns, Row, Table } from 'base/table/table';
import { TablePresenter, TableStore } from 'base/table/table_presenter';
import { IComputedValue, IObservableValue } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

// Alias N -> N2 for Row<N2>, to prevent N expanding to be a super set of both the
// column count and row cell count.
export function createTable<T, N extends number, N2 extends N>(opts: {
  data: IObservableValue<T[] | undefined> | IComputedValue<T[] | undefined>,
  columns: Columns<T, N>,
  rowMapper: (t: T) => Row<N2>,
  fetchData: () => void,
  tableClassname?: string,
  rowClassname?: string,
  cellClassname?: string,
  defaultSortColumn?: number,
}) {
  const {
    data,
    columns,
    rowMapper,
    fetchData,
    tableClassname,
    rowClassname,
    cellClassname,
    defaultSortColumn,
  } = opts;
  const store = new TableStore(data, columns, defaultSortColumn);
  const presenter = new TablePresenter(store);

  return observer(() => (
      <Table
          tableClassname={tableClassname}
          rowClassname={rowClassname}
          cellClassname={cellClassname}
          columns={store.columns}
          data={store.sortedData}
          rowMapper={rowMapper}
          fetchData={fetchData}
      />
  ));
}
