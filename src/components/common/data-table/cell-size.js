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

import document from 'global/document';

export function renderedSize({
  text: {rows, columns},
  colIdx = 0,
  numRowsToCalculate = 10,
  fontSize = 12,
  font = 'Lato',
  cellPadding = 50,
  maxCellSize = 400
}) {
  if (!document) {
    return 0;
  }
  const textCanvas = document.createElement('canvas');
  document.body.appendChild(textCanvas);
  const context = textCanvas.getContext('2d');
  context.font = [fontSize, font].join('px ');
  let rowsToSample = [...Array(numRowsToCalculate)].map(() =>
    Math.floor(Math.random() * (rows.length - 1 - 0 + 1))
  );

  // IF we have less than 10 rows, lets measure all of them
  if (rows.length < numRowsToCalculate) {
    rowsToSample = Array.from(Array(rows.length).keys());
  }
  const rowWidth = Math.max(
    ...rowsToSample.map(
      rowIdx => Math.ceil(context.measureText(rows[rowIdx][colIdx]).width) + cellPadding
    )
  );
  const columnWidth = Math.ceil(context.measureText(columns[colIdx]).width) + cellPadding;
  const width = Math.max(rowWidth, columnWidth);
  textCanvas.parentElement.removeChild(textCanvas);
  return Math.min(maxCellSize, width);
}

export function expandLastCell(stateCache, width, sumSize, lastCell) {
  return {
    ...stateCache,
    [lastCell]: Math.floor(width - sumSize + stateCache[lastCell])
  };
}

export function shrinkFinalCell(propsCache, width, sumSize, lastCell) {
  return {
    ...propsCache,
    [lastCell]: Math.max(Math.floor(width - sumSize + propsCache[lastCell]), propsCache[lastCell])
  };
}

export function getSizeSum(sizeCache) {
  return Object.keys(sizeCache).reduce((acc, val) => acc + sizeCache[val], 0);
}
