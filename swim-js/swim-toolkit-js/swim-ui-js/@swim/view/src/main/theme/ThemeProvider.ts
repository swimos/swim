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

import {ProviderClass, Provider} from "@swim/fastener";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {ThemeService} from "./ThemeService";
import type {View} from "../view/View";

export interface ThemeProvider<V extends View, S extends ThemeService<V> | null | undefined = ThemeService<V>> extends Provider<V, S> {
  get mood(): MoodVector;

  setMood(mood: MoodVector): void;

  get theme(): ThemeMatrix;

  setTheme(theme: ThemeMatrix): void;

  createService(): S;
}

export const ThemeProvider = (function (_super: typeof Provider) {
  const ThemeProvider = _super.extend("ThemeProvider") as ProviderClass<ThemeProvider<any, any>>;

  Object.defineProperty(ThemeProvider.prototype, "mood", {
    get<V extends View, S extends ThemeService<V>>(this: ThemeProvider<V, S>): MoodVector {
      let service: ThemeService<V> | null | undefined = this.service;
      if (service === void 0 || service === null) {
        service = ThemeService.global();
      }
      return service.mood;
    },
    configurable: true,
  });

  ThemeProvider.prototype.setMood = function <V extends View, S extends ThemeService<V>>(this: ThemeProvider<V, S>, mood: MoodVector): void {
    let service: ThemeService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ThemeService.global();
    }
    service.setMood(mood);
  };

  Object.defineProperty(ThemeProvider.prototype, "theme", {
    get<V extends View, S extends ThemeService<V>>(this: ThemeProvider<V, S>): ThemeMatrix {
      let service: ThemeService<V> | null | undefined = this.service;
      if (service === void 0 || service === null) {
        service = ThemeService.global();
      }
      return service.theme;
    },
    configurable: true,
  });

  ThemeProvider.prototype.setTheme = function <V extends View, S extends ThemeService<V>>(this: ThemeProvider<V, S>, theme: ThemeMatrix): void {
    let service: ThemeService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ThemeService.global();
    }
    service.setTheme(theme);
  };

  ThemeProvider.prototype.createService = function <V extends View, S extends ThemeService<V> | null | undefined>(this: ThemeProvider<V, S>): S {
    return ThemeService.global() as S;
  };

  return ThemeProvider;
})(Provider);
