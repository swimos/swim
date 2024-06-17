// Copyright 2015-2024 Nstream, inc.
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
import type {Instance} from "@swim/util";
import type {Creatable} from "@swim/util";
import type {Timing} from "@swim/util";
import {Property} from "@swim/component";
import {Length} from "@swim/math";
import {Focus} from "@swim/style";
import {FocusAnimator} from "@swim/style";
import type {Expansion} from "@swim/style";
import {ExpansionAnimator} from "@swim/style";
import {Look} from "@swim/theme";
import {Feel} from "@swim/theme";
import {ThemeConstraintAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewSet} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import {PositionGesture} from "@swim/view";
import {NodeView} from "@swim/dom";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import {Hyperlink} from "@swim/controller";
import {ButtonGlow} from "@swim/button";
import {TableLayout} from "./TableLayout";
import {CellView} from "./CellView";

/** @public */
export interface LeafViewObserver<V extends LeafView = LeafView> extends HtmlViewObserver<V> {
  viewWillAttachCell?(cellView: CellView, targetView: View | null, view: V): void;

  viewDidDetachCell?(cellView: CellView, view: V): void;

  viewWillHighlight?(view: V): void;

  viewDidHighlight?(view: V): void;

  viewWillUnhighlight?(view: V): void;

  viewDidUnhighlight?(view: V): void;

  viewDidEnter?(view: V): void;

  viewDidLeave?(view: V): void;

  viewDidPress?(input: PositionGestureInput, event: Event | null, view: V): void;

  viewDidLongPress?(input: PositionGestureInput, view: V): void;
}

/** @public */
export class LeafView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initLeaf();
  }

  protected initLeaf(): void {
    this.setIntrinsic<LeafView>({
      classList: ["leaf"],
      style: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: Look.backgroundColor,
      },
    });
    this.modifyMood(Feel.default, [[Feel.transparent, 1], [Feel.hovering, 0]], false);
  }

  declare readonly observerType?: Class<LeafViewObserver>;

  @Property({valueType: TableLayout, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly layout!: Property<this, TableLayout | null>;

  @Property({valueType: Number, value: 0, inherits: true, updateFlags: View.NeedsLayout})
  readonly depth!: Property<this, number>;

  @ThemeConstraintAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ThemeConstraintAnimator<this, Length | null>;

  @ThemeConstraintAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly rowHeight!: ThemeConstraintAnimator<this, Length | null>;

  @ExpansionAnimator({value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly stretch!: ExpansionAnimator<this, Expansion | null>;

  @Property({valueType: Boolean, value: false, inherits: true})
  readonly hovers!: Property<this, boolean>;

  @FocusAnimator({
    value: Focus.unfocused(),
    get transition(): Timing | boolean | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    willFocus(): void {
      this.owner.modifyMood(Feel.default, [[Feel.transparent, 0],
                                           [Feel.hovering, 1]], false);
    },
    willUnfocus(): void {
      this.owner.modifyMood(Feel.default, [[Feel.transparent, 1 - this.owner.hover.state.phase],
                                           [Feel.hovering, 0]], false);
    },
  })
  readonly hover!: FocusAnimator<this, Focus>;

  @FocusAnimator({
    value: Focus.unfocused(),
    get transition(): Timing | boolean | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    willFocus(): void {
      this.owner.callObservers("viewWillHighlight", this.owner);
      const timing = this.owner.getLook(Look.timing);
      this.owner.modifyMood(Feel.default, [[Feel.transparent, 0]], timing);
      this.owner.style.backgroundColor.setIntrinsic(Look.selectionColor, timing);
    },
    didFocus(): void {
      this.owner.callObservers("viewDidHighlight", this.owner);
    },
    willUnfocus(): void {
      this.owner.callObservers("viewWillUnhighlight", this.owner);
      const timing = this.owner.getLook(Look.timing);
      this.owner.modifyMood(Feel.default, [[Feel.transparent, 1 - this.owner.hover.state.phase]], timing);
      this.owner.style.backgroundColor.setIntrinsic(Look.backgroundColor, timing);
    },
    didUnfocus(): void {
      this.owner.callObservers("viewDidUnhighlight", this.owner);
    },
  })
  readonly highlight!: FocusAnimator<this, Focus>;

  getCell<F extends Class<CellView>>(key: string, cellViewClass: F): InstanceType<F> | null;
  getCell(key: string): CellView | null;
  getCell(key: string, cellViewClass?: Class<CellView>): CellView | null {
    if (cellViewClass === void 0) {
      cellViewClass = CellView;
    }
    const cellView = this.getChild(key);
    return cellView instanceof cellViewClass ? cellView : null;
  }

  getOrCreateCell<F extends Class<Instance<F, CellView>> & Creatable<Instance<F, CellView>>>(key: string, cellViewClass: F): InstanceType<F> {
    let cellView = this.getChild(key, cellViewClass);
    if (cellView === null) {
      cellView = cellViewClass.create();
      this.setChild(key, cellView);
    }
    return cellView!;
  }

  setCell(key: string, cellView: CellView | null): void {
    this.setChild(key, cellView);
  }

  @ViewSet({
    viewType: CellView,
    binds: true,
    initView(cellView: CellView): void {
      cellView.style.setIntrinsic({
        display: "none",
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: this.owner.style.height.state,
      });
    },
    willAttachView(cellView: CellView, target: View | null): void {
      this.owner.callObservers("viewWillAttachCell", cellView, target, this.owner);
    },
    didDetachView(cellView: CellView): void {
      this.owner.callObservers("viewDidDetachCell", cellView, this.owner);
    },
  })
  readonly cells!: ViewSet<this, CellView>;

  protected override onLayout(): void {
    this.rowHeight.recohere(this.updateTime);
    super.onLayout();
    this.layoutLeaf();
  }

  protected layoutLeaf(): void {
    const rowHeight = this.rowHeight.value;
    if (rowHeight !== null) {
      this.style.height.setIntrinsic(rowHeight);
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, displayChild: (this: this, child: View, displayFlags: ViewFlags) => void): void {
    if ((displayFlags & View.NeedsLayout) !== 0) {
      this.layoutChildren(displayFlags, displayChild);
    } else {
      super.displayChildren(displayFlags, displayChild);
    }
  }

  protected layoutChildren(displayFlags: ViewFlags, displayChild: (this: this, child: View, displayFlags: ViewFlags) => void): void {
    const layout = this.layout.value;
    const height = this.style.height.state;
    const stretch = this.stretch.getPhaseOr(1);
    type self = this;
    function layoutChild(this: self, child: View, displayFlags: ViewFlags): void {
      if (child instanceof CellView) {
        const key = child.key;
        const col = layout !== null && key !== void 0 ? layout.getCol(key) : null;
        if (col !== null) {
          child.style.setIntrinsic({
            display: !col.hidden && col.width !== null ? "flex" : "none",
            left: col.left,
            width: col.width,
            height,
            color: col.textColor,
            opacity: col.persistent ? void 0 : stretch,
          });
        } else {
          child.style.setIntrinsic({
            display: "none",
            left: null,
            width: null,
            height: null,
            color: null,
            opacity: void 0,
          });
        }
      }
      displayChild.call(this, child, displayFlags);
    }
    super.displayChildren(displayFlags, layoutChild);
  }

  @Property({valueType: Boolean, value: true, inherits: true})
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

  @Property({
    valueType: Hyperlink,
    value: null,
    didSetValue(hyperlink: Hyperlink | null): void {
      if (hyperlink !== null) {
        this.owner.setIntrinsic<LeafView>({
          attributes: {
            href: hyperlink.href,
            title: hyperlink.title,
          },
          style: {
            cursor: "pointer",
          },
        });
      } else {
        this.owner.setIntrinsic<LeafView>({
          attributes: {
            href: void 0,
            title: void 0,
          },
          style: {
            cursor: void 0,
          },
        });
      }
    },
  })
  get hyperlink(): Property<this, Hyperlink | null> {
    return Property.getter();
  }

  @PositionGesture({
    bindsOwner: true,
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      if (this.owner.glows.value) {
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
      if (this.owner.hovers.value) {
        this.owner.hover.focus(false);
      }
      this.owner.callObservers("viewDidEnter", this.owner);
    },
    didStopHovering(): void {
      if (this.owner.hovers.value) {
        this.owner.hover.unfocus();
      }
      this.owner.callObservers("viewDidLeave", this.owner);
    },
    didPress(input: PositionGestureInput, event: Event | null): void {
      if (input.defaultPrevented || !this.owner.clientBounds.contains(input.x, input.y)) {
        return;
      }
      let target = input.target;
      while (target instanceof Node && target !== this.owner.node) {
        const targetView = NodeView.get(target);
        if (targetView instanceof CellView) {
          targetView.didPress(input, event);
          break;
        }
        target = target.parentNode;
      }
      this.owner.didPress(input, event);
    },
    didLongPress(input: PositionGestureInput): void {
      if (input.defaultPrevented) {
        return;
      }
      let target = input.target;
      while (target instanceof Node && target !== this.owner.node) {
        const targetView = NodeView.get(target);
        if (targetView instanceof CellView) {
          targetView.didLongPress(input);
          break;
        }
        target = target.parentNode;
      }
      this.owner.didLongPress(input);
    },
  })
  readonly gesture!: PositionGesture<this, LeafView>;

  didPress(input: PositionGestureInput, event: Event | null): void {
    if (input.defaultPrevented) {
      return;
    }
    this.callObservers("viewDidPress", input, event, this);
    const hyperlink = Property.tryValue(this, "hyperlink");
    if (hyperlink !== null && !input.defaultPrevented) {
      input.preventDefault();
      hyperlink.activate(event);
    }
  }

  didLongPress(input: PositionGestureInput): void {
    if (input.defaultPrevented) {
      return;
    }
    this.callObservers("viewDidLongPress", input, this);
  }
}
