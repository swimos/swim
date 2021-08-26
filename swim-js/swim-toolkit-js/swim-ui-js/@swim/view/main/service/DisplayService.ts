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
import {DisplayManager} from "../display/DisplayManager";
import {ViewService} from "./ViewService";
import {ViewManagerService} from "./ViewManagerService";

export abstract class DisplayService<V extends View> extends ViewManagerService<V, DisplayManager<V>> {
  updatedViewContext(viewContext: ViewContext): ViewContext {
    let manager = this.manager;
    if (manager === void 0) {
      manager = DisplayManager.global();
    }
    return manager.updatedViewContext(viewContext);
  }

  override initManager(): DisplayManager<V> {
    return DisplayManager.global();
  }
}

ViewService({
  extends: DisplayService,
  type: DisplayManager,
  observe: false,
})(View.prototype, "displayService");
