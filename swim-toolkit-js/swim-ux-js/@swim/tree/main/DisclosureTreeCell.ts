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

import {View, ViewNodeType} from "@swim/view";
import {PositionGestureInput} from "@swim/gesture";
import {DisclosureButton} from "@swim/button";
import {TreeCell} from "./TreeCell";
import {TreeLeaf} from "./TreeLeaf";
import {TreeLimb} from "./TreeLimb";

export class DisclosureTreeCell extends TreeCell {
  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("disclosure-tree-cell");
    this.append(DisclosureButton, "button");
  }

  get button(): DisclosureButton {
    return this.getChildView("button") as DisclosureButton;
  }

  didPress(input: PositionGestureInput, event: Event | null): void {
    super.didPress(input, event);
    input.preventDefault();
    const leaf = this.parentView;
    if (leaf instanceof TreeLeaf) {
      const limb = leaf.parentView;
      if (limb instanceof TreeLimb) {
        limb.toggle();
      }
    }
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    if (childView.key === "button" && childView instanceof DisclosureButton) {
      this.onInsertButton(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (childView.key === "button" && childView instanceof DisclosureButton) {
      this.onRemoveButton(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertButton(button: DisclosureButton): void {
    // hook
  }

  protected onRemoveButton(button: DisclosureButton): void {
    // hook
  }
}
TreeCell.Disclosure = DisclosureTreeCell;
