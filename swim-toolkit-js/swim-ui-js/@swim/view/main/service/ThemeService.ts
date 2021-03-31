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

import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "../View";
import {ThemeManager} from "../theme/ThemeManager";
import {ViewService} from "./ViewService";
import {ViewManagerService} from "./ViewManagerService";

export abstract class ThemeService<V extends View> extends ViewManagerService<V, ThemeManager<V>> {
  get mood(): MoodVector {
    return this.manager.mood;
  }

  setMood(mood: MoodVector): void {
    this.manager.setMood(mood);
  }

  get theme(): ThemeMatrix {
    return this.manager.theme;
  }

  setTheme(theme: ThemeMatrix): void {
    this.manager.setTheme(theme);
  }

  initManager(): ThemeManager<V> {
    return ThemeManager.global();
  }
}

ViewService({type: ThemeManager, observe: false})(View.prototype, "themeService");
