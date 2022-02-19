import { SortDirection } from 'base/table/table_presenter';
import classNames from 'classnames';
import { computed, IComputedValue, IObservableValue, trace } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './table.css';

type Tuple<T, N extends number> = [T, ...T[]] & { length: N };

export type Row<N extends number> = {
  className?: string,
  Cells: Tuple<React.ComponentType, N>,
};

export type Column<T> = {
  content: React.ReactNode,
  sort: (a: T, b: T) => number,
};

export type Columns<T, N extends number> = Tuple<Column<T>, N>;

type TableProps<T, N extends number> = {
  tableClassname?: string,
  rowClassname?: string,
  cellClassname?: string,
  columns: Columns<T, N>,
  data?: IObservableValue<T[] | undefined> | IComputedValue<T[] | undefined>,
  sortColumn: number,
  sortDirection: SortDirection,
  rowMapper: (t: T) => Row<N>,
  fetchData: () => void,
  onColumnClick: (columnIndex: number) => void,
};

type RowMemoProps<T, N extends number> = {
  value: T,
  rowMapper: (t: T) => Row<N>,
  cellClassname?: string,
  rowClassname?: string,
};

@observer
class RowMemo<T, N extends number> extends React.Component<RowMemoProps<T, N>> {
  render() {
    const { value, rowClassname, rowMapper } = this.props;
    const cellClass = classNames(styles.cell, this.props.cellClassname);
    const row = rowMapper(value);
    const rowClass = classNames(styles.row, rowClassname, row.className);
    return (
        <tr className={rowClass}>
          {row.Cells.map((Cell, x) => (
              <td className={cellClass} key={x}>
                <Cell/>
              </td>
          ))}
        </tr>
    );
  }
}

@observer
export class Table<T extends { id: string }, N extends number>
    extends React.Component<TableProps<T, N>> {
  onMount() {
    this.props.fetchData();
  }

  private get LoadingRow() {
    const cellClass = classNames(styles.cell, this.props.cellClassname);
    return (
        <tr className={cellClass} style={{ gridColumn: '1 / -1' }}>
          <td>Loading...</td>
        </tr>
    );
  }

  private get NoResultsRow() {
    const cellClass = classNames(styles.cell, this.props.cellClassname);
    return (
        <tr className={cellClass} style={{ gridColumn: '1 / -1' }}>
          <td>No results found.</td>
        </tr>
    );
  }

  private get Rows() {
    const { rowClassname, cellClassname, rowMapper } = this.props;
    const data = this.sortedData;
    if (!data) {
      return this.LoadingRow;
    }
    if (data.length === 0) {
      return this.NoResultsRow;
    }
    return (
        <>
          {data.map(row => (
              <RowMemo
                  value={row}
                  rowMapper={rowMapper}
                  cellClassname={cellClassname}
                  rowClassname={rowClassname}
                  key={row.id}
              />
          ))}
        </>
    );
  }

  @computed.struct
  private get sortedData() {
    const { data, sortColumn, sortDirection, columns } = this.props;
    const _data = data?.get();
    const column = columns[sortColumn];
    if (!_data || !column) {
      return;
    }
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return _data.sort((a, b) => column.sort(a, b) * directionMultiplier);
  }

  render() {
    const {
      tableClassname,
      columns,
      sortColumn,
      sortDirection,
      onColumnClick,
    } = this.props;

    const tableClass = classNames(styles.table, tableClassname);
    const cellClass = classNames(styles.cell, this.props.cellClassname);

    return (
        <table className={tableClass}>
          <thead className={styles.header}>
            <tr>
              {columns.map((c, x) => (
                  <th
                      className={cellClass}
                      key={x}
                      onMouseDown={preventDoubleClickSelection}
                      onClick={() => onColumnClick(x)}
                  >
                    {c.content} {sortColumn === x && (
                        sortDirection === 'asc' ? '🠕' : '🠗'
                    )}
                  </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {this.Rows}
          </tbody>
        </table>
    );
  }
}

const preventDoubleClickSelection = (e: React.MouseEvent) => {
  if (e.detail > 1) {
    e.preventDefault();
  }
};
