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

import type {Class} from "@swim/util";
import {Affinity, MemberFastenerClass, Property} from "@swim/fastener";
import {AnyLength, Length} from "@swim/math";
import {AnyFocus, Focus, AnyExpansion, Expansion} from "@swim/style";
import {
  Look,
  Feel,
  ThemeAnimator,
  FocusThemeAnimator,
  ExpansionThemeAnimator,
  ThemeConstraintAnimator,
} from "@swim/theme";
import {
  PositionGestureInput,
  PositionGesture,
  ViewContextType,
  ViewFlags,
  View,
  ViewSet,
} from "@swim/view";
import {ViewNode, HtmlViewClass, HtmlView} from "@swim/dom";
import {ButtonGlow} from "@swim/button";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import {CellView} from "../cell/CellView";
import type {LeafViewObserver} from "./LeafViewObserver";

export class LeafView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initLeaf();
  }

  protected initLeaf(): void {
    this.addClass("leaf");
    this.position.setState("relative", Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);

    const highlightPhase = this.highlight.getPhase();
    const hoverPhase = this.hover.getPhase();
    const backgroundPhase = Math.max(highlightPhase, hoverPhase);
    this.modifyMood(Feel.default, [[Feel.transparent, 1 - backgroundPhase],
                                   [Feel.hovering, hoverPhase * (1 - highlightPhase)],
                                   [Feel.selected, highlightPhase]], false);
  }

  override readonly observerType?: Class<LeafViewObserver>;

  @Property({type: TableLayout, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly layout!: Property<this, TableLayout | null, AnyTableLayout | null>;

  @Property({type: Number, inherits: true, state: 0, updateFlags: View.NeedsLayout})
  readonly depth!: Property<this, number>;

  @ThemeConstraintAnimator({type: Length, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @ThemeConstraintAnimator({type: Length, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowHeight!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Expansion, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly stretch!: ExpansionThemeAnimator<this, Expansion | null, AnyExpansion | null>;

  @Property({type: Boolean, inherits: true, state: false})
  readonly hovers!: Property<this, boolean>;

  @ThemeAnimator<LeafView, Focus, AnyFocus>({
    type: Focus,
    state: Focus.unfocused(),
    didSetValue(newHover: Focus, oldHover: Focus): void {
      const highlightPhase = this.owner.highlight.getPhase();
      const hoverPhase = newHover.phase;
      const backgroundPhase = Math.max(highlightPhase, hoverPhase);
      this.owner.modifyMood(Feel.default, [[Feel.transparent, 1 - backgroundPhase],
                                           [Feel.hovering, hoverPhase * (1 - highlightPhase)],
                                           [Feel.selected, highlightPhase]], false);
      if (backgroundPhase !== 0) {
        this.owner.backgroundColor.setLook(Look.backgroundColor, Affinity.Intrinsic);
      } else {
        this.owner.backgroundColor.setLook(null, Affinity.Intrinsic);
        this.owner.backgroundColor.setState(null, Affinity.Intrinsic);
      }
    },
  })
  readonly hover!: FocusThemeAnimator<this>;

  @ThemeAnimator<LeafView, Focus, AnyFocus>({
    type: Focus,
    state: Focus.unfocused(),
    willFocus(): void {
      this.owner.callObservers("viewWillHighlight", this.owner);
    },
    didFocus(): void {
      this.owner.callObservers("viewDidHighlight", this.owner);
    },
    willUnfocus(): void {
      this.owner.callObservers("viewWillUnhighlight", this.owner);
    },
    didUnfocus(): void {
      this.owner.callObservers("viewDidUnhighlight", this.owner);
    },
    didSetValue(newHighlight: Focus, oldHighlight: Focus): void {
      const highlightPhase = newHighlight.phase;
      const hoverPhase = this.owner.hover.getPhase();
      const backgroundPhase = Math.max(highlightPhase, hoverPhase);
      this.owner.modifyMood(Feel.default, [[Feel.transparent, 1 - backgroundPhase],
                                           [Feel.hovering, hoverPhase * (1 - highlightPhase)],
                                           [Feel.selected, highlightPhase]], false);
      if (backgroundPhase !== 0) {
        this.owner.backgroundColor.setLook(Look.backgroundColor, Affinity.Intrinsic);
      } else {
        this.owner.backgroundColor.setLook(null, Affinity.Intrinsic);
        this.owner.backgroundColor.setState(null, Affinity.Intrinsic);
      }
    },
  })
  readonly highlight!: FocusThemeAnimator<this>;

  getCell(key: string): CellView | null;
  getCell<V extends CellView>(key: string, cellViewClass: Class<V>): V | null;
  getCell(key: string, cellViewClass?: Class<CellView>): CellView | null {
    if (cellViewClass === void 0) {
      cellViewClass = CellView;
    }
    const cellView = this.getChild(key);
    return cellView instanceof cellViewClass ? cellView : null;
  }

  getOrCreateCell<V extends CellView>(key: string, cellViewClass: HtmlViewClass<V>): V {
    let cellView = this.getChild(key) as V | null;
    if (!(cellView instanceof cellViewClass)) {
      cellView = cellViewClass.create();
      this.setChild(key, cellView);
    }
    return cellView;
  }

  setCell(key: string, cellView: CellView): void {
    this.setChild(key, cellView);
  }

  @ViewSet<LeafView, CellView>({
    type: CellView,
    binds: true,
    initView(cellView: CellView): void {
      cellView.display.setState("none", Affinity.Intrinsic);
      cellView.position.setState("absolute", Affinity.Intrinsic);
      cellView.left.setState(0, Affinity.Intrinsic);
      cellView.top.setState(0, Affinity.Intrinsic);
      cellView.width.setState(0, Affinity.Intrinsic);
      cellView.height.setState(this.owner.height.state, Affinity.Intrinsic);
    },
    willAttachView(cellView: CellView, targetView: View | null): void {
      this.owner.callObservers("viewWillAttachCell", cellView, targetView, this.owner);
    },
    didDetachView(cellView: CellView): void {
      this.owner.callObservers("viewDidDetachCell", cellView, this.owner);
    },
  })
  readonly cells!: ViewSet<this, CellView>;
  static readonly cells: MemberFastenerClass<LeafView, "cells">;

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutLeaf();
  }

  protected layoutLeaf(): void {
    const rowHeight = this.rowHeight.value;
    if (rowHeight !== null) {
      this.height.setState(rowHeight, Affinity.Intrinsic);
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, childView: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    if ((displayFlags & View.NeedsLayout) !== 0) {
      this.layoutChildViews(displayFlags, viewContext, displayChild);
    } else {
      super.displayChildren(displayFlags, viewContext, displayChild);
    }
  }

  protected layoutChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChild: (this: this, childView: View, displayFlags: ViewFlags,
                                            viewContext: ViewContextType<this>) => void): void {
    const layout = this.layout.state;
    const height = this.height.state;
    const stretch = this.stretch.getPhaseOr(1);
    type self = this;
    function layoutChildView(this: self, childView: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      if (childView instanceof CellView) {
        const key = childView.key;
        const col = layout !== null && key !== void 0 ? layout.getCol(key) : null;
        if (col !== null) {
          childView.display.setState(!col.hidden ? "flex" : "none", Affinity.Intrinsic);
          childView.left.setState(col.left, Affinity.Intrinsic);
          childView.width.setState(col.width, Affinity.Intrinsic);
          childView.height.setState(height, Affinity.Intrinsic);
          const textColor = col.textColor;
          if (textColor instanceof Look) {
            childView.color.setLook(textColor, Affinity.Intrinsic);
          } else {
            childView.color.setState(textColor, Affinity.Intrinsic);
          }
          if (!col.persistent) {
            childView.opacity.setState(stretch, Affinity.Intrinsic);
          }
        } else {
          childView.display.setState("none", Affinity.Intrinsic);
          childView.left.setState(null, Affinity.Intrinsic);
          childView.width.setState(null, Affinity.Intrinsic);
          childView.height.setState(null, Affinity.Intrinsic);
        }
      }
      displayChild.call(this, childView, displayFlags, viewContext);
    }
    super.displayChildren(displayFlags, viewContext, layoutChildView);
  }

  @Property({type: Boolean, inherits: true, state: true})
  readonly glows!: Property<this, boolean>;

  protected glow(input: PositionGestureInput): void {
    if (input.detail instanceof ButtonGlow) {
      input.detail.fade(input.x, input.y);
      input.detail = void 0;
    }
    if (input.detail === void 0) {
      const delay = input.inputType === "mouse" ? 0 : 100;
      input.detail = this.prependChild(ButtonGlow);
      (input.detail as ButtonGlow).glow(input.x, input.y, void 0, delay);
    }
  }

  @PositionGesture<LeafView, LeafView>({
    self: true,
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      if (this.owner.glows.state) {
        this.owner.glow(input);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (input.isRunaway()) {
        this.cancelPress(input, event);
      } else if (!this.owner.clientBounds.contains(input.x, input.y)) {
        input.clearHoldTimer();
        this.beginHover(input, event);
        if (input.detail instanceof ButtonGlow) {
          input.detail.fade(input.x, input.y);
          input.detail = void 0;
        }
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      if (!this.owner.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
        if (input.detail instanceof ButtonGlow) {
          input.detail.fade(input.x, input.y);
          input.detail = void 0;
        }
      } else if (input.detail instanceof ButtonGlow) {
        input.detail.pulse(input.x, input.y);
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      if (!this.owner.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
      }
      if (input.detail instanceof ButtonGlow) {
        input.detail.fade(input.x, input.y);
        input.detail = void 0;
      }
    },
    didStartHovering(): void {
      if (this.owner.hovers.state) {
        this.owner.hover.focus(false);
      }
      this.owner.callObservers("viewDidEnter", this.owner);
    },
    didStopHovering(): void {
      if (this.owner.hovers.state) {
        this.owner.hover.unfocus();
      }
      this.owner.callObservers("viewDidLeave", this.owner);
    },
    didPress(input: PositionGestureInput, event: Event | null): void {
      if (this.owner.clientBounds.contains(input.x, input.y)) {
        if (!input.defaultPrevented) {
          let target = input.target;
          while (target !== null && target !== this.owner.node) {
            const targetView = (target as ViewNode).view;
            if (targetView instanceof CellView) {
              targetView.onPress(input, event);
              targetView.didPress(input, event);
              break;
            }
            target = target instanceof Node ? target.parentNode : null;
          }
        }
        if (!input.defaultPrevented) {
          this.owner.callObservers("viewDidPress", input, event, this.owner);
        }
      }
    },
    didLongPress(input: PositionGestureInput): void {
      if (!input.defaultPrevented) {
        let target = input.target;
        while (target !== null && target !== this.owner.node) {
          const targetView = (target as ViewNode).view;
          if (targetView instanceof CellView) {
            targetView.onLongPress(input);
            targetView.didLongPress(input);
            break;
          }
          target = target instanceof Node ? target.parentNode : null;
        }
      }
      if (!input.defaultPrevented) {
        this.owner.callObservers("viewDidLongPress", input, this.owner);
      }
    },
  })
  readonly gesture!: PositionGesture<this, LeafView>;
  static readonly gesture: MemberFastenerClass<LeafView, "gesture">;
}
