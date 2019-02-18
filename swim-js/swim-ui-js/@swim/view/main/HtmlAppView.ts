// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {View} from "./View";
import {AppView} from "./AppView";
import {AppViewObserver} from "./AppViewObserver";
import {HtmlView} from "./HtmlView";
import {HtmlAppViewController} from "./HtmlAppViewController";
import {PopoverOptions, Popover} from "./Popover";

export class HtmlAppView extends HtmlView implements AppView {
  /** @hidden */
  _viewController: HtmlAppViewController | null;
  /** @hidden */
  readonly _popovers: Popover[];
  /** @hidden */
  _resizeTimer: number; // debounces resize events
  /** @hidden */
  _scrollTimer: number; // debounces scroll events

  constructor(node: HTMLElement, key: string | null = null) {
    super(node, key);
    this.throttleResize = this.throttleResize.bind(this);
    this.doResize = this.doResize.bind(this);
    this.throttleScroll = this.throttleScroll.bind(this);
    this.doScroll = this.doScroll.bind(this);
    this.onClick = this.onClick.bind(this);
    this._popovers = [];
    this._resizeTimer = 0;
    this._scrollTimer = 0;
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.throttleResize);
      window.addEventListener("scroll", this.throttleScroll, {passive: true});
      window.addEventListener('click', this.onClick);
    }
  }

  get viewController(): HtmlAppViewController | null {
    return this._viewController;
  }

  get appView(): this {
    return this;
  }

  get popovers(): ReadonlyArray<Popover> {
    return this._popovers;
  }

  togglePopover(popover: Popover, options?: PopoverOptions): void {
    const popoverState = popover.popoverState;
    if (popoverState === "hidden" || popoverState === "hiding") {
      this.showPopover(popover, options);
    } else if (popoverState === "shown" || popoverState === "showing") {
      this.hidePopover(popover);
    }
  }

  showPopover(popover: Popover, options: PopoverOptions = {}): void {
    this.willShowPopover(popover, options);
    if (options && !options.multi) {
      this.hidePopovers();
    }
    if (this._popovers.indexOf(popover) < 0) {
      this._popovers.push(popover);
    }
    const popoverView = popover.popoverView;
    if (popoverView && !popoverView.isMounted()) {
      this.insertPopoverView(popoverView);
    }
    this.onShowPopover(popover, options);
    popover.showPopover(true);
    this.didShowPopover(popover, options);
  }

  protected insertPopoverView(popoverView: View): void {
    // subclasses can override to change popover container
    this.appendChildView(popoverView);
  }

  protected willShowPopover(popover: Popover, options: PopoverOptions): void {
    this.willObserve(function (viewObserver: AppViewObserver): void {
      if (viewObserver.viewWillShowPopover) {
        viewObserver.viewWillShowPopover(popover, options, this);
      }
    });
  }

  protected onShowPopover(popover: Popover, options: PopoverOptions): void {
    // hook
  }

  protected didShowPopover(popover: Popover, options: PopoverOptions): void {
    this.didObserve(function (viewObserver: AppViewObserver): void {
      if (viewObserver.viewDidShowPopover) {
        viewObserver.viewDidShowPopover(popover, options, this);
      }
    });
  }

  hidePopover(popover: Popover): void {
    const popovers = this._popovers;
    const index = popovers.indexOf(popover);
    if (index >= 0) {
      this.willHidePopover(popover);
      popovers.splice(index, 1);
      this.onHidePopover(popover);
      popover.hidePopover(true);
      this.didHidePopover(popover);
    }
  }

  protected willHidePopover(popover: Popover): void {
    this.willObserve(function (viewObserver: AppViewObserver): void {
      if (viewObserver.viewWillHidePopover) {
        viewObserver.viewWillHidePopover(popover, this);
      }
    });
  }

  protected onHidePopover(popover: Popover): void {
    // hook
  }

  protected didHidePopover(popover: Popover): void {
    this.didObserve(function (viewObserver: AppViewObserver): void {
      if (viewObserver.viewDidHidePopover) {
        viewObserver.viewDidHidePopover(popover, this);
      }
    });
  }

  hidePopovers(): void {
    const popovers = this._popovers;
    while (popovers.length) {
      const popover = popovers[0];
      this.willHidePopover(popover);
      popovers.shift();
      this.onHidePopover(popover);
      popover.hidePopover(true);
      this.didHidePopover(popover);
    }
  }

  throttleResize(): void {
    if (!this._resizeTimer) {
      this._resizeTimer = setTimeout(this.doResize, 16) as any;
    }
  }

  /** @hidden */
  doResize(): void {
    this._resizeTimer = 0;
    this.cascadeResize();
  }

  /** @hidden */
  throttleScroll(): void {
    if (!this._scrollTimer) {
      this._scrollTimer = setTimeout(this.doScroll, 16) as any;
    }
  }

  /** @hidden */
  doScroll(): void {
    this._scrollTimer = 0;
    this.cascadeScroll();
  }

  protected onUnmount(): void {
    if (this._resizeTimer) {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = 0;
    }
    if (this._scrollTimer) {
      clearTimeout(this._scrollTimer);
      this._scrollTimer = 0;
    }
    super.onUnmount();
  }

  protected onClick(event: Event): void {
    this.onFallthroughClick(event);
  }

  protected onFallthroughClick(event: Event): void {
    this.hidePopovers();
  }
}
