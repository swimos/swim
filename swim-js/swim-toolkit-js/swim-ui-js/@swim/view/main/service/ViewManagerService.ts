// Copyright 2015-2021 Swim Inc.
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

import type {View} from "../View";
import type {ViewManager} from "../manager/ViewManager";
import type {ViewManagerObserver} from "../manager/ViewManagerObserver";
import {ViewService} from "./ViewService";

export abstract class ViewManagerService<V extends View, VM extends ViewManager<V> | null | undefined> extends ViewService<V, VM> {
  override didMount(): void {
    const manager = this.manager;
    if (manager !== void 0 && manager !== null) {
      if (!this.isInherited()) {
        manager.insertRootView(this.owner);
      }
      if (this.observe !== false) {
        manager.addViewManagerObserver(this as ViewManagerObserver);
      }
    }
    super.didMount();
  }

  override willUnmount(): void {
    super.willUnmount();
    const manager = this.manager;
    if (manager !== void 0 && manager !== null) {
      if (this.observe !== false) {
        manager.removeViewManagerObserver(this as ViewManagerObserver);
      }
      if (!this.isInherited()) {
        manager.removeRootView(this.owner);
      }
    }
  }
}
