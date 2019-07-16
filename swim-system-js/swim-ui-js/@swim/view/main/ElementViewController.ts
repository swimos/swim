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

import {NodeViewController} from "./NodeViewController";
import {ViewElement, ElementView} from "./ElementView";
import {ElementViewObserver} from "./ElementViewObserver";

export class ElementViewController<V extends ElementView = ElementView> extends NodeViewController<V> implements ElementViewObserver<V> {
  get node(): ViewElement | null {
    const view = this._view;
    return view ? view.node : null;
  }

  isVisible(): boolean {
    const view = this._view;
    return view ? view.isVisible() : false;
  }

  viewWillSetAttribute(name: string, value: unknown, view: V): void {
    // hook
  }

  viewDidSetAttribute(name: string, value: unknown, view: V): void {
    // hook
  }

  viewWillSetStyle(name: string, value: unknown, priority: string | undefined, view: V): void {
    // hook
  }

  viewDidSetStyle(name: string, value: unknown, priority: string | undefined, view: V): void {
    // hook
  }
}
