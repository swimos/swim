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

import {Tween, Transition} from "@swim/transition";
import {ViewContextType, ViewFlags, View, ViewScope} from "@swim/view";
import {ViewNode, ViewNodeType, HtmlViewConstructor, HtmlView} from "@swim/dom";
import {PositionGestureInput, PositionGestureDelegate} from "@swim/gesture";
import {Look, Feel, MoodVector, ThemeMatrix} from "@swim/theme";
import {ButtonMembraneInit, ButtonMembrane} from "@swim/button";
import {AnyTreeSeed, TreeSeed} from "./TreeSeed";
import {AnyTreeCell, TreeCell} from "./TreeCell";
import {TreeLeafObserver} from "./TreeLeafObserver";
import {TreeLeafController} from "./TreeLeafController";

export type AnyTreeLeaf = TreeLeaf | TreeLeafInit | HTMLElement;

export interface TreeLeafInit extends ButtonMembraneInit {
  viewController?: TreeLeafController;
  highlighted?: boolean;

  cells?: AnyTreeCell[];
}

export class TreeLeaf extends ButtonMembrane implements PositionGestureDelegate {
  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("tree-leaf");
    this.position.setAutoState("relative");
    this.height.setAutoState(58);
    this.overflowX.setAutoState("hidden");
    this.overflowY.setAutoState("hidden");
  }

  // @ts-ignore
  declare readonly viewController: TreeLeafController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<TreeLeafObserver>;

  initView(init: TreeLeafInit): void {
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
      this.addCell(cells[i]);
    }
  }

  @ViewScope({type: TreeSeed, inherit: true})
  seed: ViewScope<this, TreeSeed | undefined, AnyTreeSeed | undefined>;

  @ViewScope({type: Number, inherit: true})
  limbSpacing: ViewScope<this, number | undefined>;

  @ViewScope({type: Boolean, state: false})
  highlighted: ViewScope<this, boolean>;

  highlight(tween?: Tween<any>): this {
    if (!this.highlighted.state) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this.willHighlight(tween);
      this.highlighted.setState(true);
      this.onHighlight(tween);
      this.didHighlight(tween);
    }
    return this;
  }

  protected willHighlight(transition: Transition<any> | null): void {
    this.willObserve(function (viewObserver: TreeLeafObserver): void {
      if (viewObserver.leafWillHighlight !== void 0) {
        viewObserver.leafWillHighlight(transition, this);
      }
    });
  }

  protected onHighlight(transition: Transition<any> | null): void {
    this.modifyMood(Feel.default, [Feel.selected, 1]);
    if (this.backgroundColor.isAuto()) {
      this.backgroundColor.setAutoState(this.getLook(Look.backgroundColor), transition);
    }
    const selectedColor = this.getLook(Look.accentColor);
    let selectedView = this.getChildView("selected") as HtmlView | null;
    if (selectedView === null) {
      selectedView = this.prepend("div", "selected");
      selectedView.addClass("selected");
      selectedView.position.setAutoState("absolute");
      selectedView.top.setAutoState(2);
      selectedView.bottom.setAutoState(2);
      selectedView.left.setAutoState(0);
      selectedView.width.setAutoState(4);
      if (selectedColor !== void 0) {
        selectedView.backgroundColor.setAutoState(selectedColor.alpha(0));
      }
    }
    if (selectedView !== null) {
      selectedView.backgroundColor.setAutoState(selectedColor, transition);
    }
  }

  protected didHighlight(transition: Transition<any> | null): void {
    this.didObserve(function (viewObserver: TreeLeafObserver): void {
      if (viewObserver.leafDidHighlight !== void 0) {
        viewObserver.leafDidHighlight(transition, this);
      }
    });
  }

  unhighlight(tween?: Tween<any>): this {
    if (this.highlighted.state) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this.willUnhighlight(tween);
      this.highlighted.setState(false);
      this.onUnhighlight(tween);
      this.didUnhighlight(tween);
    }
    return this;
  }

  protected willUnhighlight(transition: Transition<any> | null): void {
    this.willObserve(function (viewObserver: TreeLeafObserver): void {
      if (viewObserver.leafWillUnhighlight !== void 0) {
        viewObserver.leafWillUnhighlight(transition, this);
      }
    });
  }

  protected onUnhighlight(transition: Transition<any> | null): void {
    this.modifyMood(Feel.default, [Feel.selected, void 0]);
    if (this.backgroundColor.isAuto()) {
      let backgroundColor = this.getLook(Look.backgroundColor);
      if (backgroundColor !== void 0) {
        backgroundColor = backgroundColor.alpha(0);
      }
      this.backgroundColor.setAutoState(backgroundColor, transition);
    }
    const selectedView = this.getChildView("selected") as HtmlView | null;
    if (selectedView !== null) {
      let selectedColor = this.getLook(Look.accentColor);
      if (selectedColor !== void 0) {
        selectedColor = selectedColor.alpha(0);
      }
      selectedView.backgroundColor.setAutoState(selectedColor, transition);
    }
  }

  protected didUnhighlight(transition: Transition<any> | null): void {
    this.didObserve(function (viewObserver: TreeLeafObserver): void {
      if (viewObserver.leafDidUnhighlight !== void 0) {
        viewObserver.leafDidUnhighlight(transition, this);
      }
    });
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    super.onApplyTheme(theme, mood, transition);
    if (this.backgroundColor.isAuto()) {
      let backgroundColor = this.getLook(Look.backgroundColor);
      if (backgroundColor !== void 0 && !this.highlighted.state) {
        backgroundColor = backgroundColor.alpha(0);
      }
      this.backgroundColor.setAutoState(backgroundColor, transition);
    }
    const selectedView = this.getChildView("selected") as HtmlView | null;
    if (selectedView !== null) {
      let selectedColor = this.getLook(Look.accentColor);
      if (selectedColor !== void 0 && !this.highlighted.state) {
        selectedColor = selectedColor.alpha(0);
      }
      selectedView.backgroundColor.setAutoState(selectedColor, transition);
    }
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof TreeCell) {
      this.onInsertCell(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (childView instanceof TreeCell) {
      this.onRemoveCell(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertCell(cell: TreeCell): void {
    cell.position.setAutoState("absolute");
    cell.top.setAutoState(0);
    cell.bottom.setAutoState(0);
  }

  protected onRemoveCell(cell: TreeCell): void {
    // hook
  }

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    const needsLayout = (displayFlags & View.NeedsLayout) !== 0;
    const seed = needsLayout ? this.seed.state : void 0;
    const height = needsLayout ? this.height.state : void 0;
    function layoutChildViews(this: TreeLeaf, childView: View): void {
      if (childView instanceof TreeCell) {
        const key = childView.key;
        const root = seed !== void 0 && key !== void 0 ? seed.getRoot(key) : null;
        if (root !== null) {
          childView.display.setAutoState(!root._hidden ? "flex" : "none");
          const left = root._left;
          childView.left.setAutoState(left !== null ? left : void 0);
          const width = root._width;
          childView.width.setAutoState(width !== null ? width : void 0);
          childView.height.setAutoState(height);
        } else {
          childView.display.setAutoState("none");
          childView.left.setAutoState(void 0);
          childView.width.setAutoState(void 0);
          childView.height.setAutoState(void 0);
        }
      }
      if (callback !== void 0) {
        callback.call(this, childView);
      }
    }
    super.displayChildViews(displayFlags, viewContext, needsLayout ? layoutChildViews : callback);
  }

  didHoldPress(input: PositionGestureInput): void {
    let target = input.target;
    while (target !== null && target !== this._node) {
      const targetView = (target as ViewNode).view;
      if (targetView instanceof TreeCell) {
        targetView.didPressHold(input);
        break;
      }
      target = target instanceof Node ? target.parentNode : null;
    }
  }

  didEndPress(input: PositionGestureInput, event: Event | null): void {
    super.didEndPress(input, event);
    let target = input.target;
    while (target !== null && target !== this._node) {
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
      this.didObserve(function (viewObserver: TreeLeafObserver): void {
        if (viewObserver.leafDidPress !== void 0) {
          viewObserver.leafDidPress(input, event, this);
        }
      });
    }
  }

  static fromInit(init: TreeLeafInit): TreeLeaf {
    const view = TreeLeaf.create();
    view.initView(init);
    return view;
  }

  static fromAny<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, value: InstanceType<S> | HTMLElement): InstanceType<S>;
  static fromAny(value: AnyTreeLeaf): TreeLeaf;
  static fromAny(value: AnyTreeLeaf): TreeLeaf {
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
