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

import React, {Component} from 'react';
import styled from 'styled-components';

import {qbColors} from './theme';
import {hexToRgb} from 'utils/color-utils';

const Container = styled.div`
  z-index: 5;
  border-radius: 3px;
  background-color: ${props => qbColors.white};
  position: absolute;
  box-shadow: 0 0 2px 1px rgba(${p => `${hexToRgb(qbColors.black)}`}, 0.2);
  display: flex;
  flex-direction: column;
  font-weight: 500;
  justify-content: center;
  padding: 5px 0;

  > div {
    color: ${props => qbColors.baseGrey2};
    line-height: 16px;
    font-weight: 400;
    font-size: 12px;
    display: flex;
    align-items: center;
    padding: 5px 15px;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
      color: ${props => qbColors.baseBlue2};
      background-color: ${props => qbColors.baseBlue4};
    }
  }

  .delete {
    color: ${props => qbColors.orange};
  }
`;
export default class MoreOptions extends Component {
  render() {
    const {className, children, height, width} = this.props;

    return (
      <Container className={className} height={height} width={width}>
        {children && children}
      </Container>
    );
  }
}
