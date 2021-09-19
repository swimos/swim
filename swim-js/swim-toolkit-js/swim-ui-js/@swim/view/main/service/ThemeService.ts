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

import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "../View";
import {ThemeManager} from "../theme/ThemeManager";
import {ViewService} from "./ViewService";
import {ViewManagerService} from "./ViewManagerService";

export abstract class ThemeService<V extends View, VM extends ThemeManager<V> | null | undefined = ThemeManager<V>> extends ViewManagerService<V, VM> {
  get mood(): MoodVector {
    let manager: ThemeManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ThemeManager.global();
    }
    return manager.mood;
  }

  setMood(mood: MoodVector): void {
    let manager: ThemeManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ThemeManager.global();
    }
    manager.setMood(mood);
  }

  get theme(): ThemeMatrix {
    let manager: ThemeManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ThemeManager.global();
    }
    return manager.theme;
  }

  setTheme(theme: ThemeMatrix): void {
    let manager: ThemeManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ThemeManager.global();
    }
    manager.setTheme(theme);
  }

  override initManager(): VM {
    return ThemeManager.global() as VM;
  }
}

ViewService({
  extends: ThemeService,
  type: ThemeManager,
  observe: false,
  manager: ThemeManager.global(),
})(View.prototype, "themeService");
