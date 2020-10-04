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

import {ViewInit, View, ViewScope} from "@swim/view";
import {Look} from "../look/Look";
import {Feel} from "../feel/Feel";
import {MoodVector} from "../mood/MoodVector";
import {MoodMatrix} from "../mood/MoodMatrix";
import {ThemedViewController} from "./ThemedViewController";
import {ThemeMatrix} from "../theme/ThemeMatrix";

export interface ThemedViewInit extends ViewInit {
  viewController?: ThemedViewController;
  mood?: MoodVector;
  moodModifier?: MoodMatrix;
  theme?: ThemeMatrix;
  themeModifier?: MoodMatrix;
}

export interface ThemedView extends View {
  readonly viewController: ThemedViewController | null

  initView(init: ThemedViewInit): void;

  mood: ViewScope<this, MoodVector | undefined>;

  moodModifier: ViewScope<this, MoodMatrix | undefined>;

  theme: ViewScope<this, ThemeMatrix | undefined>;

  themeModifier: ViewScope<this, MoodMatrix | undefined>;

  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel>): T | undefined

  getLookOr<T, V>(look: Look<T, unknown>, elseValue: V, mood?: MoodVector<Feel>): T | V;

  modifyMood(feel: Feel, ...entries: [Feel, number | undefined][]): void;

  modifyTheme(feel: Feel, ...entries: [Feel, number | undefined][]): void;
}

/** @hidden */
export const ThemedView = {
  is(object: unknown): object is ThemedView {
    if (typeof object === "object" && object !== null) {
      const view = object as ThemedView;
      return "mood" in view
          && "moodModifier" in view
          && "theme" in view
          && "themeModifier" in view;
    }
    return false;
  },
};
