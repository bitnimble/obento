import classNames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './table.css';

type Tuple<T, N extends number> = [T, ...T[]] & { length: N };

export type Row<N extends number> = {
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
  data?: T[],
  rowMapper: (t: T) => Row<N>,
  fetchData: () => void,
};

@observer
export class Table<T, N extends number> extends React.Component<TableProps<T, N>> {
  onMount() {
    this.props.fetchData();
  }

  render() {
    const { tableClassname, rowClassname, cellClassname, columns, data, rowMapper } = this.props;

    const tableClass = classNames(styles.table, tableClassname);
    const rowClass = classNames(styles.row, rowClassname);
    const cellClass = classNames(styles.cell, cellClassname);

    const rows = data == null
        ? (
            <tr className={cellClass} style={{ gridColumn: '1 / -1' }}>
              <td>Loading...</td>
            </tr>
        )
        : data.map((t, y) => (
            <tr className={rowClass} key={y}>
              {rowMapper(t).Cells.map((Cell, x) => (
                  <td className={cellClass} key={x}>
                    <Cell/>
                  </td>
              ))}
            </tr>
        ));
    return (
        <table className={tableClass}>
          <thead>
            <tr>
              {columns.map((c, x) => (
                  <th className={cellClass} key={x}>{c.content}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
    );
  }
}
