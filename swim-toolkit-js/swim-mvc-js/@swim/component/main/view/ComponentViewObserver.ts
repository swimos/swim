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

import {View, ViewObserverType} from "@swim/view";
import {Component} from "../Component";
import {ComponentView} from "./ComponentView";

/** @hidden */
export abstract class ComponentViewObserver<C extends Component, V extends View> extends ComponentView<C, V> {
  onSetOwnView(newView: V | null, oldView: V | null): void {
    super.onSetOwnView(newView, oldView);
    if (this._component.isMounted()) {
      if (oldView !== null) {
        oldView.removeViewObserver(this as ViewObserverType<V>);
      }
      if (newView !== null) {
        newView.addViewObserver(this as ViewObserverType<V>);
      }
    }
  }

  mount(): void {
    super.mount();
    const view = this._view;
    if (view !== null) {
      view.addViewObserver(this as ViewObserverType<V>);
    }
  }

  unmount(): void {
    const view = this._view;
    if (view !== null) {
      view.removeViewObserver(this as ViewObserverType<V>);
    }
    super.unmount();
  }
}
ComponentView.Observer = ComponentViewObserver;
