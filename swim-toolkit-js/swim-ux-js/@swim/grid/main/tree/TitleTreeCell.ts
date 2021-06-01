// Copyright 2015-2021 Swim inc.
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

import type {Timing} from "@swim/mapping";
import {Look, MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import {TreeCell} from "./TreeCell";

export class TitleTreeCell extends TreeCell {
  protected override initCell(): void {
    super.initCell();
    this.addClass("title-tree-cell");
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    this.color.setState(theme.getOr(Look.accentColor, mood, null), timing, View.Intrinsic);
  }
}
