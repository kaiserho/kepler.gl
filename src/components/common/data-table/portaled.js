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
import debounce from 'lodash.debounce';
import styled from 'styled-components';
import {canUseDOM} from 'exenv';
import {Motion, spring} from 'react-motion';
import Portal from 'react-portal/lib/Portal';
import Modal from 'react-modal';

const listeners = {};

const startListening = () => Object.keys(listeners).forEach(key => listeners[key]());

const getPageOffset = () => ({
  x:
    window.pageXOffset !== undefined
      ? window.pageXOffset
      : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
  y:
    window.pageYOffset !== undefined
      ? window.pageYOffset
      : (document.documentElement || document.body.parentNode || document.body).scrollTop
});

const addEventListeners = () => {
  if (document && document.body)
    document.body.addEventListener('mousewheel', debounce(startListening, 100, true));
  window.addEventListener('resize', debounce(startListening, 50, true));
};

if (canUseDOM) {
  if (document.body) {
    addEventListeners();
  } else {
    document.addEventListener('DOMContentLoaded', addEventListeners);
  }
}

let listenerIdCounter = 0;
function subscribe(fn) {
  listenerIdCounter += 1;
  const id = listenerIdCounter;
  listeners[id] = fn;
  return () => delete listeners[id];
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Reset = styled.div`
  font-size: 12px;
  font-family: 'Lato', 'Open Sans';

  * {
    box-sizing: border-box;
  }
`;
export default class Portaled extends Component {
  static defaultProps = {
    left: 0,
    top: 0,
    component: 'span',
    closeOnEsc: true,
    onHide: () => null
  };

  state = {
    right: 0,
    left: 0,
    top: 0,
    isPortalOpened: false,
    isVisible: false,
    isAnimated: false
  };

  UNSAFE_componentWillMount() {
    if (this.props.isOpened) {
      this.setState({
        isPortalOpened: true,
        isVisible: true
      });
    }
  }

  componentDidMount() {
    // relative
    this.handleScroll = () => {
      if (this.element) {
        const rect = this.element.getBoundingClientRect();
        const pageOffset = getPageOffset();
        const top = pageOffset.y + rect.top;
        const right = window.innerWidth - rect.right - pageOffset.x;
        const left = pageOffset.x + rect.left;

        if (top !== this.state.top || left !== this.state.left || right !== this.state.right) {
          this.setState({left, top, right});
        }
      }
    };
    this.unsubscribe = subscribe(this.handleScroll);
    this.handleScroll();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {isOpened} = this.props;
    const {isVisible, isPortalOpened} = this.state;

    const willOpen = !isOpened && nextProps.isOpened;
    if (willOpen) this.setState({isPortalOpened: true, isAnimated: true});

    const willClose = isOpened && !nextProps.isOpened;
    if (willClose) this.setState({isVisible: false, isAnimated: true});

    const hasReopened = willOpen && !isVisible && isPortalOpened;
    if (hasReopened) this.setState({isVisible: true, isAnimated: true});
  }

  componentDidUpdate(prevProps) {
    const didOpen = this.props.isOpened && !prevProps.isOpened;
    if (didOpen) {
      window.requestAnimationFrame(() => {
        if (this._unmounted) return;
        this.setState({isVisible: true});
      });
    }
    this.handleScroll();
  }

  componentWillUnmount() {
    this._unmounted = true;
    this.unsubscribe();
  }

  handleRest = () => {
    if (!this.state.isVisible) {
      this.setState({isPortalOpened: false, isAnimated: false});
      this.props.onHide();
    } else {
      this.setState({isAnimated: false});
    }
  };

  render() {
    const {
      // relative
      component: Comp,
      top,
      left,
      right,
      fullWidth,
      overlay,
      overlayZIndex,

      // Mortal
      children,
      portalProps
    } = this.props;

    const {isPortalOpened, isVisible, isAnimated} = this.state;

    const fromLeftOrRight =
      right !== undefined ? {right: this.state.right + right} : {left: this.state.left + left};

    const horizontalPosition = fullWidth
      ? {right: this.state.right + right, left: this.state.left + left}
      : fromLeftOrRight;

    if (!isPortalOpened) {
      return null;
    }

    return (
      <Comp
        ref={element => {
          this.element = element;
        }}
      >
        <Portal className="portal" {...portalProps}>
          {overlay && (
            <Overlay
              key="overlay"
              onClick={() => overlay()}
              style={{
                zIndex: overlayZIndex,
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none'
              }}
            />
          )}
          <div
            key="item"
            style={{
              position: 'absolute',
              opacity: isVisible ? 1 : 0,
              top: this.state.top + top,
              ...horizontalPosition
            }}
          >
            {/* {children(motion, isVisible, isAnimated)} */}
            {children}
          </div>
        </Portal>
      </Comp>
    );
  }
}
