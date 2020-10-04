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

import {View} from "./View";
import {ViewObserverType} from "./ViewObserver";
import {Subview} from "./Subview";

/** @hidden */
export abstract class SubviewObserver<V extends View, S extends View> extends Subview<V, S> {
  onSetOwnSubview(newSubview: S | null, oldSubview: S | null): void {
    super.onSetOwnSubview(newSubview, oldSubview);
    if (this._view.isMounted()) {
      if (oldSubview !== null) {
        oldSubview.removeViewObserver(this as ViewObserverType<S>);
      }
      if (newSubview !== null) {
        newSubview.addViewObserver(this as ViewObserverType<S>);
      }
    }
  }

  mount(): void {
    super.mount();
    const subview = this._subview;
    if (subview !== null) {
      subview.addViewObserver(this as ViewObserverType<S>);
    }
  }

  unmount(): void {
    const subview = this._subview;
    if (subview !== null) {
      subview.removeViewObserver(this as ViewObserverType<S>);
    }
    super.unmount();
  }
}
Subview.Observer = SubviewObserver;
