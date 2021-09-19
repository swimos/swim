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

import type {ViewContext} from "../ViewContext";
import {View} from "../View";
import type {ViewIdiom} from "../viewport/ViewIdiom";
import type {Viewport} from "../viewport/Viewport";
import {ViewportManager} from "../viewport/ViewportManager";
import {ViewService} from "./ViewService";
import {ViewManagerService} from "./ViewManagerService";

export abstract class ViewportService<V extends View, VM extends ViewportManager<V> | null | undefined = ViewportManager<V>> extends ViewManagerService<V, VM> {
  get viewContext(): ViewContext {
    let manager: ViewportManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ViewportManager.global();
    }
    return manager.viewContext;
  }

  get viewport(): Viewport {
    let manager: ViewportManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ViewportManager.global();
    }
    return manager.viewport;
  }

  get viewIdiom(): ViewIdiom {
    let manager: ViewportManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ViewportManager.global();
    }
    return manager.viewIdiom;
  }

  setViewIdiom(viewIdiom: ViewIdiom): void {
    let manager: ViewportManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ViewportManager.global();
    }
    manager.setViewIdiom(viewIdiom);
  }

  override initManager(): VM {
    return ViewportManager.global() as VM;
  }
}

ViewService({
  extends: ViewportService,
  type: ViewportManager,
  observe: false,
  manager: ViewportManager.global(),
})(View.prototype, "viewportService");
