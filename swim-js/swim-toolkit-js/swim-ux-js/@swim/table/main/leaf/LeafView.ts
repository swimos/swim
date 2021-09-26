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

import {AnyLength, Length} from "@swim/math";
import {AnyFocus, Focus, AnyExpansion, Expansion} from "@swim/style";
import {Look, Feel} from "@swim/theme";
import {
  ViewContextType,
  ViewFlags,
  ViewClass,
  View,
  ViewProperty,
  ViewAnimator,
  ViewAnimatorConstraint,
  FocusViewAnimator,
  ExpansionViewAnimator,
  ViewFastener,
  PositionGestureInput,
  PositionGesture,
} from "@swim/view";
import {ViewNode, NodeViewConstructor, HtmlView} from "@swim/dom";
import {ButtonGlow} from "@swim/button";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import {CellView} from "../cell/CellView";
import type {LeafViewObserver} from "./LeafViewObserver";

export class LeafView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.cellFasteners = [];
    this.initLeaf();
  }

  protected initLeaf(): void {
    this.addClass("leaf");
    this.position.setState("relative", View.Intrinsic);
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);

    const highlightPhase = this.highlight.getPhase();
    const hoverPhase = this.hover.getPhase();
    const backgroundPhase = Math.max(highlightPhase, hoverPhase);
    this.modifyMood(Feel.default, [[Feel.transparent, 1 - backgroundPhase],
                                   [Feel.hovering, hoverPhase * (1 - highlightPhase)],
                                   [Feel.selected, highlightPhase]], false);
  }

  override readonly viewObservers!: ReadonlyArray<LeafViewObserver>;

  @ViewProperty({type: TableLayout, inherit: true, state: null, updateFlags: View.NeedsLayout})
  readonly layout!: ViewProperty<this, TableLayout | null, AnyTableLayout | null>;

  protected didSetDepth(newDepth: number, oldDepth: number): void {
    // hook
  }

  @ViewProperty<LeafView, number>({
    type: Number,
    inherit: true,
    state: 0,
    updateFlags: View.NeedsLayout,
    didSetState(newDepth: number, oldDepth: number): void {
      this.owner.didSetDepth(newDepth, oldDepth);
    },
  })
  readonly depth!: ViewProperty<this, number>;

  @ViewAnimatorConstraint({type: Length, inherit: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ViewAnimatorConstraint<this, Length | null, AnyLength | null>;

  @ViewAnimatorConstraint({type: Length, inherit: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowHeight!: ViewAnimatorConstraint<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Expansion, inherit: true, state: null, updateFlags: View.NeedsLayout})
  readonly stretch!: ExpansionViewAnimator<this, Expansion | null, AnyExpansion | null>;

  protected didSetHover(newHover: Focus, oldHover: Focus): void {
    const highlightPhase = this.highlight.getPhase();
    const hoverPhase = newHover.phase;
    const backgroundPhase = Math.max(highlightPhase, hoverPhase);
    this.modifyMood(Feel.default, [[Feel.transparent, 1 - backgroundPhase],
                                   [Feel.hovering, hoverPhase * (1 - highlightPhase)],
                                   [Feel.selected, highlightPhase]], false);
    if (backgroundPhase !== 0) {
      this.backgroundColor.setLook(Look.backgroundColor, View.Intrinsic);
    } else {
      this.backgroundColor.setLook(null, View.Intrinsic);
      this.backgroundColor.setState(null, View.Intrinsic);
    }
  }

  @ViewProperty({type: Boolean, inherit: true, state: false})
  readonly hovers!: ViewProperty<this, boolean>;

  @ViewAnimator<LeafView, Focus, AnyFocus>({
    type: Focus,
    state: Focus.unfocused(),
    didSetValue(newHover: Focus, oldHover: Focus): void {
      this.owner.didSetHover(newHover, oldHover);
    },
  })
  readonly hover!: FocusViewAnimator<this>;

  protected willHighlight(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillHighlight !== void 0) {
        viewObserver.viewWillHighlight(this);
      }
    }
  }

  protected onHighlight(): void {
    // hook
  }

  protected didHighlight(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidHighlight !== void 0) {
        viewObserver.viewDidHighlight(this);
      }
    }
  }

  protected willUnhighlight(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillUnhighlight !== void 0) {
        viewObserver.viewWillUnhighlight(this);
      }
    }
  }

  protected onUnhighlight(): void {
    // hook
  }

  protected didUnhighlight(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidUnhighlight !== void 0) {
        viewObserver.viewDidUnhighlight(this);
      }
    }
  }

  protected didSetHighlight(newHighlight: Focus, oldHighlight: Focus): void {
    const highlightPhase = newHighlight.phase;
    const hoverPhase = this.hover.getPhase();
    const backgroundPhase = Math.max(highlightPhase, hoverPhase);
    this.modifyMood(Feel.default, [[Feel.transparent, 1 - backgroundPhase],
                                   [Feel.hovering, hoverPhase * (1 - highlightPhase)],
                                   [Feel.selected, highlightPhase]], false);
    if (backgroundPhase !== 0) {
      this.backgroundColor.setLook(Look.backgroundColor, View.Intrinsic);
    } else {
      this.backgroundColor.setLook(null, View.Intrinsic);
      this.backgroundColor.setState(null, View.Intrinsic);
    }
  }

  @ViewAnimator<LeafView, Focus, AnyFocus>({
    type: Focus,
    state: Focus.unfocused(),
    willFocus(): void {
      this.owner.willHighlight();
      this.owner.onHighlight();
    },
    didFocus(): void {
      this.owner.didHighlight();
    },
    willUnfocus(): void {
      this.owner.willUnhighlight();
    },
    didUnfocus(): void {
      this.owner.onUnhighlight();
      this.owner.didUnhighlight();
    },
    didSetValue(newHighlight: Focus, oldHighlight: Focus): void {
      this.owner.didSetHighlight(newHighlight, oldHighlight);
    },
  })
  readonly highlight!: FocusViewAnimator<this>;

  getCell(key: string): CellView | null;
  getCell<V extends CellView>(key: string, cellViewClass: ViewClass<V>): V | null;
  getCell(key: string, cellViewClass?: ViewClass<CellView>): CellView | null {
    if (cellViewClass === void 0) {
      cellViewClass = CellView;
    }
    const cellView = this.getChildView(key);
    return cellView instanceof cellViewClass ? cellView : null;
  }

  getOrCreateCell<V extends CellView>(key: string, cellViewConstructor: NodeViewConstructor<V>): V {
    let cellView = this.getChildView(key) as V | null;
    if (!(cellView instanceof cellViewConstructor)) {
      cellView = HtmlView.fromConstructor(cellViewConstructor);
      this.setChildView(key, cellView);
    }
    return cellView;
  }

  setCell(key: string, cellView: CellView): void {
    this.setChildView(key, cellView);
  }

  insertCell(cellView: CellView, targetView: View | null = null): void {
    const cellFasteners = this.cellFasteners as ViewFastener<this, CellView>[];
    let targetIndex = cellFasteners.length;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.view === cellView) {
        return;
      } else if (cellFastener.view === targetView) {
        targetIndex = i;
      }
    }
    const cellFastener = this.createCellFastener(cellView);
    cellFasteners.splice(targetIndex, 0, cellFastener);
    cellFastener.setView(cellView, targetView);
    if (this.isMounted()) {
      cellFastener.mount();
    }
  }

  removeCell(cellView: CellView): void {
    const cellFasteners = this.cellFasteners as ViewFastener<this, CellView>[];
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.view === cellView) {
        cellFastener.setView(null);
        if (this.isMounted()) {
          cellFastener.unmount();
        }
        cellFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initCell(cellView: CellView, cellFastener: ViewFastener<this, CellView>): void {
    cellView.display.setState("none", View.Intrinsic);
    cellView.position.setState("absolute", View.Intrinsic);
    cellView.left.setState(0, View.Intrinsic);
    cellView.top.setState(0, View.Intrinsic);
    cellView.width.setState(0, View.Intrinsic);
    cellView.height.setState(this.height.state, View.Intrinsic);
  }

  protected attachCell(cellView: CellView, cellFastener: ViewFastener<this, CellView>): void {
    // hook
  }

  protected detachCell(cellView: CellView, cellFastener: ViewFastener<this, CellView>): void {
    // hook
  }

  protected willSetCell(newCellView: CellView | null, oldCellView: CellView | null,
                        targetView: View | null, cellFastener: ViewFastener<this, CellView>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetCell !== void 0) {
        viewObserver.viewWillSetCell(newCellView, oldCellView, targetView, this);
      }
    }
  }

  protected onSetCell(newCellView: CellView | null, oldCellView: CellView | null,
                      targetView: View | null, cellFastener: ViewFastener<this, CellView>): void {
    if (oldCellView !== null) {
      this.detachCell(oldCellView, cellFastener);
    }
    if (newCellView !== null) {
      this.attachCell(newCellView, cellFastener);
      this.initCell(newCellView, cellFastener);
    }
  }

  protected didSetCell(newCellView: CellView | null, oldCellView: CellView | null,
                       targetView: View | null, cellFastener: ViewFastener<this, CellView>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetCell !== void 0) {
        viewObserver.viewDidSetCell(newCellView, oldCellView, targetView, this);
      }
    }
  }

  /** @hidden */
  static CellFastener = ViewFastener.define<LeafView, CellView>({
    type: CellView,
    child: false,
    willSetView(newCellView: CellView | null, oldCellView: CellView | null, targetView: View | null): void {
      this.owner.willSetCell(newCellView, oldCellView, targetView, this);
    },
    onSetView(newCellView: CellView | null, oldCellView: CellView | null, targetView: View | null): void {
      this.owner.onSetCell(newCellView, oldCellView, targetView, this);
    },
    didSetView(newCellView: CellView | null, oldCellView: CellView | null, targetView: View | null): void {
      this.owner.didSetCell(newCellView, oldCellView, targetView, this);
    },
  });

  protected createCellFastener(cellView: CellView): ViewFastener<this, CellView> {
    return new LeafView.CellFastener(this, cellView.key, "cell");
  }

  /** @hidden */
  readonly cellFasteners: ReadonlyArray<ViewFastener<this, CellView>>;

  /** @hidden */
  protected mountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.mount();
    }
  }

  /** @hidden */
  protected unmountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.unmount();
    }
  }

  protected detectCell(view: View): CellView | null {
    return view instanceof CellView ? view : null;
  }

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    const cellView = this.detectCell(childView);
    if (cellView !== null) {
      this.insertCell(cellView, targetView);
    }
  }

  protected override onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    const cellView = this.detectCell(childView);
    if (cellView !== null) {
      this.removeCell(cellView);
    }
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutLeaf();
  }

  protected layoutLeaf(): void {
    const rowHeight = this.rowHeight.value;
    if (rowHeight !== null) {
      this.height.setState(rowHeight, View.Intrinsic);
    }
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
          childView.display.setState(!col.hidden ? "flex" : "none", View.Intrinsic);
          childView.left.setState(col.left, View.Intrinsic);
          childView.width.setState(col.width, View.Intrinsic);
          childView.height.setState(height, View.Intrinsic);
          const textColor = col.textColor;
          if (textColor instanceof Look) {
            childView.color.setLook(textColor, View.Intrinsic);
          } else {
            childView.color.setState(textColor, View.Intrinsic);
          }
          if (!col.persistent) {
            childView.opacity.setState(stretch, View.Intrinsic);
          }
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

  /** @hidden */
  protected override mountViewFasteners(): void {
    super.mountViewFasteners();
    this.mountCellFasteners();
  }

  /** @hidden */
  protected override unmountViewFasteners(): void {
    this.unmountCellFasteners();
    super.unmountViewFasteners();
  }

  @ViewProperty({type: Boolean, inherit: true, state: true})
  readonly glows!: ViewProperty<this, boolean>;

  protected glow(input: PositionGestureInput): void {
    if (input.detail instanceof ButtonGlow) {
      input.detail.fade(input.x, input.y);
      input.detail = void 0;
    }
    if (input.detail === void 0) {
      const delay = input.inputType === "mouse" ? 0 : 100;
      input.detail = this.prepend(ButtonGlow);
      (input.detail as ButtonGlow).glow(input.x, input.y, void 0, delay);
    }
  }

  protected onEnter(): void {
    if (this.hovers.state) {
      this.hover.focus(false);
    }
  }

  protected didEnter(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidEnter !== void 0) {
        viewObserver.viewDidEnter(this);
      }
    }
  }

  protected onLeave(): void {
    if (this.hovers.state) {
      this.hover.unfocus();
    }
  }

  protected didLeave(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidLeave !== void 0) {
        viewObserver.viewDidLeave(this);
      }
    }
  }

  protected onPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didPress(input: PositionGestureInput, event: Event | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidPress !== void 0) {
        viewObserver.viewDidPress(input, event, this);
      }
    }
  }

  protected onLongPress(input: PositionGestureInput): void {
    // hook
  }

  protected didLongPress(input: PositionGestureInput): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidLongPress !== void 0) {
        viewObserver.viewDidLongPress(input, this);
      }
    }
  }

  /** @hidden */
  static Gesture = PositionGesture.define<LeafView, LeafView>({
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
      this.owner.onEnter();
      this.owner.didEnter();
    },
    didStopHovering(): void {
      this.owner.onLeave();
      this.owner.didLeave();
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
          this.owner.onPress(input, event);
          this.owner.didPress(input, event);
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
        this.owner.onLongPress(input);
        this.owner.didLongPress(input);
      }
    },
  });

  @PositionGesture<LeafView, LeafView>({
    extends: LeafView.Gesture,
    self: true,
  })
  readonly gesture!: PositionGesture<this, LeafView>;
}
