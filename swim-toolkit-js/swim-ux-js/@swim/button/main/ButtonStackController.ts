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

import {HtmlView} from "@swim/dom";
import {ThemedHtmlViewController} from "@swim/theme";
import {ButtonItem} from "./ButtonItem";
import {ButtonStackState, ButtonStack} from "./ButtonStack";
import {ButtonStackObserver} from "./ButtonStackObserver";

export class ButtonStackController<V extends ButtonStack = ButtonStack> extends ThemedHtmlViewController<V> implements ButtonStackObserver<V> {
  get stackState(): ButtonStackState | null {
    return this._view !== null ? this._view.stackState : null;
  }

  get button(): HtmlView | null {
    return this._view !== null ? this._view.button : null;
  }

  get items(): ReadonlyArray<ButtonItem> {
    return this._view !== null ? this._view.items : [];
  }

  removeItems(): void {
    if (this._view !== null) {
      this._view.removeItems();
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
