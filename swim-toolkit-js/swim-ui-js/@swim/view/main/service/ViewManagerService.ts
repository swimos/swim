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

import {View} from "../View";
import {ViewManagerObserverType, ViewManager} from "../manager/ViewManager";
import {ViewService} from "./ViewService";

export abstract class ViewManagerService<V extends View, VM extends ViewManager<V>> extends ViewService<V, VM> {
  /** @hidden */
  readonly observe?: boolean;

  mount(): void {
    super.mount();
    const manager = this._manager;
    if (manager !== void 0 && !this.isInherited()) {
      manager.insertRootView(this._view);
      if (this.observe !== false) {
        manager.addViewManagerObserver(this as ViewManagerObserverType<VM>);
      }
    }
  }

  unmount(): void {
    const manager = this._manager;
    if (manager !== void 0 && !this.isInherited()) {
      if (this.observe !== false) {
        manager.removeViewManagerObserver(this as ViewManagerObserverType<VM>);
      }
      manager.removeRootView(this._view);
    }
    super.unmount();
  }
}
ViewService.Manager = ViewManagerService;
