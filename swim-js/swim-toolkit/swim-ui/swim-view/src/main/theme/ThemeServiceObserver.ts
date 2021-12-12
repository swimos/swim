// Copyright 2015-2021 Swim.inc
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

import type {Timing} from "@swim/util";
import type {ServiceObserver} from "@swim/component";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import type {ThemeService} from "./ThemeService";
import type {View} from "../view/View";

/** @public */
export interface ThemeServiceObserver<V extends View = View, S extends ThemeService<V> = ThemeService<V>> extends ServiceObserver<V, S> {
  serviceWillApplyTheme?(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, service: S): void;

  serviceDidApplyTheme?(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, service: S): void;
}
