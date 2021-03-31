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

import {HtmlView, HtmlViewController} from "@swim/dom";
import type {ButtonItem} from "./ButtonItem";
import type {ButtonStackState, ButtonStack} from "./ButtonStack";
import type {ButtonStackObserver} from "./ButtonStackObserver";

export class ButtonStackController<V extends ButtonStack = ButtonStack> extends HtmlViewController<V> implements ButtonStackObserver<V> {
  get stackState(): ButtonStackState | null {
    const view = this.view;
    return view !== null ? view.stackState : null;
  }

  get button(): HtmlView | null {
    const view = this.view;
    return view !== null ? view.button : null;
  }

  get items(): ReadonlyArray<ButtonItem> {
    const view = this.view;
    return view !== null ? view.items : [];
  }

  removeItems(): void {
    const view = this.view;
    if (view !== null) {
      view.removeItems();
    }
  }

  buttonStackWillExpand(view: V): void {
    view.modalService.presentModal(view);
  }

  buttonStackDidExpand(view: V): void {
    // hook
  }

  buttonStackWillCollapse(view: V): void {
    // hook
  }

  buttonStackDidCollapse(view: V): void {
    view.modalService.dismissModal(view);
  }

  buttonStackWillShow(view: V): void {
    // hook
  }

  buttonStackDidShow(view: V): void {
    // hook
  }

  buttonStackWillHide(view: V): void {
    // hook
  }

  buttonStackDidHide(view: V): void {
    // hook
  }
}
