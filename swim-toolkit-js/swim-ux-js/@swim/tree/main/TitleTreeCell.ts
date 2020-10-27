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

import {Transition} from "@swim/transition";
import {ViewNodeType} from "@swim/dom";
import {Look, MoodVector, ThemeMatrix} from "@swim/theme";
import {TreeCell} from "./TreeCell";

export class TitleTreeCell extends TreeCell {
  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("title-tree-cell");
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    super.onApplyTheme(theme, mood, transition);
    this.color.setAutoState(theme.inner(mood, Look.accentColor), transition);
  }
}
TreeCell.Title = TitleTreeCell;
