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

import {AnyTiming, Timing} from "@swim/mapping";
import {Look, Feel, MoodVector, ThemeMatrix} from "@swim/theme";
import {
  ViewContextType,
  ViewFlags,
  View,
  ViewProperty,
  PositionGestureInput,
  PositionGestureDelegate,
} from "@swim/view";
import type {ViewNode, HtmlViewConstructor, HtmlView} from "@swim/dom";
import {ButtonMembraneInit, ButtonMembrane} from "@swim/button";
import {AnyTreeSeed, TreeSeed} from "./TreeSeed";
import {AnyTreeCell, TreeCell} from "./TreeCell";
import type {TreeLeafObserver} from "./TreeLeafObserver";

export type AnyTreeLeaf = TreeLeaf | TreeLeafInit | HTMLElement;

export interface TreeLeafInit extends ButtonMembraneInit {
  highlighted?: boolean;

  cells?: AnyTreeCell[];
}

export class TreeLeaf extends ButtonMembrane implements PositionGestureDelegate {
  constructor(node: HTMLElement) {
    super(node);
    this.initLeaf();
  }

  protected initLeaf(): void {
    this.addClass("tree-leaf");
    this.position.setState("relative", View.Intrinsic);
    this.height.setState(58, View.Intrinsic);
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
  }

  override readonly viewObservers!: ReadonlyArray<TreeLeafObserver>;

  override initView(init: TreeLeafInit): void {
    super.initView(init);
    if (init.highlighted === true) {
      this.highlight();
    } else if (init.highlighted === false) {
      this.unhighlight();
    }

    if (init.cells !== void 0) {
      this.addCells(init.cells);
    }
  }

  addCell(cell: AnyTreeCell, key?: string): TreeCell {
    if (key === void 0 && "key" in cell) {
      key = cell.key;
    }
    cell = TreeCell.fromAny(cell);
    this.appendChildView(cell, key);
    return cell;
  }

  addCells(cells: ReadonlyArray<AnyTreeCell>): void {
    for (let i = 0, n = cells.length; i < n; i += 1) {
      this.addCell(cells[i]!);
    }
  }

  @ViewProperty({type: TreeSeed, state: null, inherit: true})
  readonly seed!: ViewProperty<this, TreeSeed | null, AnyTreeSeed | null>;

  @ViewProperty({type: Number, inherit: true})
  readonly limbSpacing!: ViewProperty<this, number | undefined>;

  @ViewProperty({type: Boolean, state: false})
  readonly highlighted!: ViewProperty<this, boolean>;

  highlight(timing?: AnyTiming | boolean): void {
    if (!this.highlighted.state) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      this.willHighlight(timing as Timing | boolean);
      this.highlighted.setState(true);
      this.onHighlight(timing as Timing | boolean);
      this.didHighlight(timing as Timing | boolean);
    }
  }

  protected willHighlight(timing: Timing | boolean): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.leafWillHighlight !== void 0) {
        viewObserver.leafWillHighlight(timing, this);
      }
    }
  }

  protected onHighlight(timing: Timing | boolean): void {
    this.modifyMood(Feel.default, [[Feel.selected, 1]]);
    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      this.backgroundColor.setState(this.getLookOr(Look.backgroundColor, null), timing, View.Intrinsic);
    }
    const selectedColor = this.getLookOr(Look.accentColor, null);
    let selectedView = this.getChildView("selected") as HtmlView | null;
    if (selectedView === null) {
      selectedView = this.prepend("div", "selected");
      selectedView.addClass("selected");
      selectedView.position.setState("absolute", View.Intrinsic);
      selectedView.top.setState(2, View.Intrinsic);
      selectedView.bottom.setState(2, View.Intrinsic);
      selectedView.left.setState(0, View.Intrinsic);
      selectedView.width.setState(4, View.Intrinsic);
      if (selectedColor !== null) {
        selectedView.backgroundColor.setState(selectedColor.alpha(0), View.Intrinsic);
      }
    }
    if (selectedView !== null) {
      selectedView.backgroundColor.setState(selectedColor, timing, View.Intrinsic);
    }
  }

  protected didHighlight(timing: Timing | boolean): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.leafDidHighlight !== void 0) {
        viewObserver.leafDidHighlight(timing, this);
      }
    }
  }

  unhighlight(timing?: AnyTiming | boolean): void {
    if (this.highlighted.state) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      this.willUnhighlight(timing as Timing | boolean);
      this.highlighted.setState(false);
      this.onUnhighlight(timing as Timing | boolean);
      this.didUnhighlight(timing as Timing | boolean);
    }
  }

  protected willUnhighlight(timing: Timing | boolean): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.leafWillUnhighlight !== void 0) {
        viewObserver.leafWillUnhighlight(timing, this);
      }
    }
  }

  protected onUnhighlight(timing: Timing | boolean): void {
    this.modifyMood(Feel.default, [[Feel.selected, void 0]]);
    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      let backgroundColor = this.getLookOr(Look.backgroundColor, null);
      if (backgroundColor !== null) {
        backgroundColor = backgroundColor.alpha(0);
      }
      this.backgroundColor.setState(backgroundColor, timing, View.Intrinsic);
    }
    const selectedView = this.getChildView("selected") as HtmlView | null;
    if (selectedView !== null) {
      let selectedColor = this.getLookOr(Look.accentColor, null);
      if (selectedColor !== null) {
        selectedColor = selectedColor.alpha(0);
      }
      selectedView.backgroundColor.setState(selectedColor, timing, View.Intrinsic);
    }
  }

  protected didUnhighlight(timing: Timing | boolean): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.leafDidUnhighlight !== void 0) {
        viewObserver.leafDidUnhighlight(timing, this);
      }
    }
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      let backgroundColor = this.getLookOr(Look.backgroundColor, null);
      if (backgroundColor !== null && !this.highlighted.state) {
        backgroundColor = backgroundColor.alpha(0);
      }
      this.backgroundColor.setState(backgroundColor, timing, View.Intrinsic);
    }
    const selectedView = this.getChildView("selected") as HtmlView | null;
    if (selectedView !== null) {
      let selectedColor = this.getLookOr(Look.accentColor, null);
      if (selectedColor !== null && !this.highlighted.state) {
        selectedColor = selectedColor.alpha(0);
      }
      selectedView.backgroundColor.setState(selectedColor, timing, View.Intrinsic);
    }
  }

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof TreeCell) {
      this.onInsertCell(childView);
    }
  }

  protected override onRemoveChildView(childView: View): void {
    if (childView instanceof TreeCell) {
      this.onRemoveCell(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertCell(cell: TreeCell): void {
    cell.position.setState("absolute", View.Intrinsic);
    cell.top.setState(0, View.Intrinsic);
    cell.bottom.setState(0, View.Intrinsic);
  }

  protected onRemoveCell(cell: TreeCell): void {
    // hook
  }

  protected override displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                       displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                          viewContext: ViewContextType<this>) => void): void {
    if ((displayFlags & View.NeedsLayout) !== 0) {
      this.layoutChildViews(displayFlags, viewContext, displayChildView);
    } else {
      super.displayChildViews(displayFlags, viewContext, displayChildView);
    }
  }

  protected layoutChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                viewContext: ViewContextType<this>) => void): void {
    const seed = this.seed.state;
    const height = this.height.state;
    type self = this;
    function layoutChildView(this: self, childView: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      if (childView instanceof TreeCell) {
        const key = childView.key;
        const root = seed !== null && key !== void 0 ? seed.getRoot(key) : null;
        if (root !== null) {
          childView.display.setState(!root.hidden ? "flex" : "none", View.Intrinsic);
          childView.left.setState(root.left, View.Intrinsic);
          childView.width.setState(root.width, View.Intrinsic);
          childView.height.setState(height, View.Intrinsic);
        } else {
          childView.display.setState("none", View.Intrinsic);
          childView.left.setState(null, View.Intrinsic);
          childView.width.setState(null, View.Intrinsic);
          childView.height.setState(null, View.Intrinsic);
        }
      }
      displayChildView.call(this, childView, displayFlags, viewContext);
    }
    super.displayChildViews(displayFlags, viewContext, layoutChildView);
  }

  override didEndPress(input: PositionGestureInput, event: Event | null): void {
    super.didEndPress(input, event);
    let target = input.target;
    while (target !== null && target !== this.node) {
      const targetView = (target as ViewNode).view;
      if (targetView instanceof TreeCell) {
        targetView.didPress(input, event);
        break;
      }
      target = target instanceof Node ? target.parentNode : null;
    }
  }

  didPress(input: PositionGestureInput, event: Event | null): void {
    if (!input.defaultPrevented) {
      const viewObservers = this.viewObservers;
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        if (viewObserver.leafDidPress !== void 0) {
          viewObserver.leafDidPress(input, event, this);
        }
      }
    }
  }

  didLongPress(input: PositionGestureInput): void {
    let target = input.target;
    while (target !== null && target !== this.node) {
      const targetView = (target as ViewNode).view;
      if (targetView instanceof TreeCell) {
        targetView.didLongPress(input);
        break;
      }
      target = target instanceof Node ? target.parentNode : null;
    }

    if (!input.defaultPrevented) {
      const viewObservers = this.viewObservers;
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        if (viewObserver.leafDidLongPress !== void 0) {
          viewObserver.leafDidLongPress(input, this);
        }
      }
    }
  }

  static fromInit(init: TreeLeafInit): TreeLeaf {
    const view = TreeLeaf.create();
    view.initView(init);
    return view;
  }

  static override fromAny<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, value: InstanceType<S> | HTMLElement): InstanceType<S>;
  static override fromAny(value: AnyTreeLeaf): TreeLeaf;
  static override fromAny(value: AnyTreeLeaf): TreeLeaf {
    if (value instanceof this) {
      return value;
    } else if (value instanceof HTMLElement) {
      return this.fromNode(value);
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
