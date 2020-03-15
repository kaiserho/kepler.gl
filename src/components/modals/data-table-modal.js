// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React from 'react';
import styled from 'styled-components';
// import DataGridFactory from 'components/common/datagrid';
import DatasetLabel from 'components/common/dataset-label';
import DataTableFactory from 'components/common/data-table';
import {createSelector} from 'reselect';
import {renderedSize} from 'components/common/data-table/cell-size';

const dgSettings = {
  sidePadding: '38px',
  verticalPadding: '16px',
  height: '36px'
};

const StyledModal = styled.div`
  min-height: 70vh;
  overflow: hidden;
`;

const DatasetCatalog = styled.div`
  display: flex;
  padding: ${dgSettings.verticalPadding} ${dgSettings.sidePadding} 0;
`;

export const DatasetModalTab = styled.div`
  align-items: center;
  border-bottom: 3px solid ${props => (props.active ? 'black' : 'transparent')};
  cursor: pointer;
  display: flex;
  height: 35px;
  margin: 0 3px;
  padding: 0 5px;

  :first-child {
    margin-left: 0;
    padding-left: 0;
  }
`;

export const DatasetTabs = React.memo(({activeDataset, datasets, showDatasetTable}) => (
  <DatasetCatalog className="dataset-modal-catalog">
    {Object.values(datasets).map(dataset => (
      <DatasetModalTab
        className="dataset-modal-tab"
        active={dataset === activeDataset}
        key={dataset.id}
        onClick={() => showDatasetTable(dataset.id)}
      >
        <DatasetLabel dataset={dataset} />
      </DatasetModalTab>
    ))}
  </DatasetCatalog>
));

DatasetTabs.displayName = 'DatasetTabs';

DataTableModalFactory.deps = [DataTableFactory];

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 70vh;
  max-height: 70vh;
`;

function DataTableModalFactory(DataTable) {
  class DataTableModal extends React.Component {
    fields = props => (props.datasets[props.dataId] || {}).fields;
    rows = props => (props.datasets[props.dataId] || {}).allData;
    columns = createSelector(this.fields, fields => fields.map(f => f.name));
    dedupedColMeta = createSelector(this.fields, fields =>
      fields.reduce(
        (acc, {name, type}) => ({
          ...acc,
          [name]: type
        }),
        {}
      )
    );
    cellSizeCache = createSelector(this.columns, this.rows, (columns, rows) =>
      columns.reduce(
        (acc, val, colIdx) => ({
          ...acc,
          [val]: renderedSize({
            text: {
              rows,
              columns
            },
            colIdx,
            optionsButton: 33
          })
        }),
        {}
      )
    );

    render() {
      const {datasets, dataId, showDatasetTable} = this.props;
      if (!datasets || !dataId) {
        return null;
      }

      const activeDataset = datasets[dataId];
      const rows = this.rows(this.props);
      const columns = this.columns(this.props);
      const dedupedColMeta = this.dedupedColMeta(this.props);
      const cellSizeCache = this.cellSizeCache(this.props);

      return (
        <StyledModal className="dataset-modal" id="dataset-modal">
          <TableContainer>
            <DatasetTabs
              activeDataset={activeDataset}
              datasets={datasets}
              showDatasetTable={showDatasetTable}
            />
            <DataTable
              rows={rows}
              rowCount={rows.length}
              columns={columns}
              dedupedColumns={columns}
              dedupedColMeta={dedupedColMeta}
              pinnedColumns={columns.slice(0, 3)}
              cellSizeCache={cellSizeCache}
              unpinnedColumns={columns.slice(3, columns.length)}
              hoverHighlight
            />
          </TableContainer>
        </StyledModal>
      );
    }
  }

  return DataTableModal;
}

export default DataTableModalFactory;
