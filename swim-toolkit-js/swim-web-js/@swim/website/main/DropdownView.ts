// Copyright 2015-2020 Swim inc.
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

import {Tween} from "@swim/transition";
import {View, ModalState, Modal, HtmlView, HtmlViewController} from "@swim/view";

export class DropdownView extends HtmlView implements Modal {
  /** @hidden */
  _visibleClass: string;

  constructor(node: HTMLElement) {
    super(node);
    this.onToggleClick = this.onToggleClick.bind(this);
    this._visibleClass = "dropdown-visible";
  }

  get viewController(): HtmlViewController<DropdownView> | null {
    return this._viewController;
  }

  get toggleView(): HtmlView | null {
    return this.getChildView("toggle") as HtmlView;
  }

  get menuView(): HtmlView | null {
    return this.getChildView("menu") as HtmlView;
  }

  get visibleClass(): string {
    return this._visibleClass;
  }

  set visibleClass(value: string) {
    this._visibleClass = value;
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key;
    if (childKey === "toggle") {
      this.onInsertToggleView(childView as HtmlView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    const childKey = childView.key;
    if (childKey === "toggle") {
      this.onRemoveToggleView(childView as HtmlView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertToggleView(toggleView: HtmlView): void {
    toggleView.on("click", this.onToggleClick);
  }

  protected onRemoveToggleView(toggleView: HtmlView): void {
    toggleView.off("click", this.onToggleClick);
  }

  protected onToggleClick(event: Event): void {
    const menuView = this.menuView;
    if (menuView !== null) {
      const classList = menuView.classList;
      if (classList.contains(this._visibleClass)) {
        classList.remove(this._visibleClass);
      } else {
        const rootView = this.rootView;
        if (rootView !== null) {
          rootView.presentModal(this);
        }
      }
      event.stopPropagation();
      event.preventDefault();
    }
  }

  get modalState(): ModalState {
    const menuView = this.menuView;
    if (menuView !== null) {
      const classList = menuView.classList;
      if (classList.contains(this._visibleClass)) {
        return "shown";
      }
    }
    return "hidden";
  }

  get modalView(): View | null {
    return this.menuView;
  }

  showModal(tween?: Tween<any>): void {
    const menuView = this.menuView;
    if (menuView !== null) {
      const classList = menuView.classList;
      classList.add(this._visibleClass);
    }
  }

  hideModal(tween?: Tween<any>): void {
    const menuView = this.menuView;
    if (menuView !== null) {
      const classList = menuView.classList;
      classList.remove(this._visibleClass);
    }
    const rootView = this.rootView;
    if (rootView !== null) {
      rootView.dismissModal(this);
    }
  }
}
