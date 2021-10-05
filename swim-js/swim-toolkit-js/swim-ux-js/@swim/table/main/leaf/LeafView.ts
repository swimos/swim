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
import {Affinity, Property} from "@swim/fastener";
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
  ViewContextType,
  ViewFlags,
  View,
  ViewFastener,
  PositionGestureInput,
  PositionGesture,
} from "@swim/view";
import {ViewNode, HtmlViewClass, HtmlView} from "@swim/dom";
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

  protected didSetDepth(newDepth: number, oldDepth: number): void {
    // hook
  }

  @Property<LeafView, number>({
    type: Number,
    inherits: true,
    state: 0,
    updateFlags: View.NeedsLayout,
    didSetState(newDepth: number, oldDepth: number): void {
      this.owner.didSetDepth(newDepth, oldDepth);
    },
  })
  readonly depth!: Property<this, number>;

  @ThemeConstraintAnimator({type: Length, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @ThemeConstraintAnimator({type: Length, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowHeight!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Expansion, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly stretch!: ExpansionThemeAnimator<this, Expansion | null, AnyExpansion | null>;

  protected didSetHover(newHover: Focus, oldHover: Focus): void {
    const highlightPhase = this.highlight.getPhase();
    const hoverPhase = newHover.phase;
    const backgroundPhase = Math.max(highlightPhase, hoverPhase);
    this.modifyMood(Feel.default, [[Feel.transparent, 1 - backgroundPhase],
                                   [Feel.hovering, hoverPhase * (1 - highlightPhase)],
                                   [Feel.selected, highlightPhase]], false);
    if (backgroundPhase !== 0) {
      this.backgroundColor.setLook(Look.backgroundColor, Affinity.Intrinsic);
    } else {
      this.backgroundColor.setLook(null, Affinity.Intrinsic);
      this.backgroundColor.setState(null, Affinity.Intrinsic);
    }
  }

  @Property({type: Boolean, inherits: true, state: false})
  readonly hovers!: Property<this, boolean>;

  @ThemeAnimator<LeafView, Focus, AnyFocus>({
    type: Focus,
    state: Focus.unfocused(),
    didSetValue(newHover: Focus, oldHover: Focus): void {
      this.owner.didSetHover(newHover, oldHover);
    },
  })
  readonly hover!: FocusThemeAnimator<this>;

  protected willHighlight(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillHighlight !== void 0) {
        observer.viewWillHighlight(this);
      }
    }
  }

  protected onHighlight(): void {
    // hook
  }

  protected didHighlight(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidHighlight !== void 0) {
        observer.viewDidHighlight(this);
      }
    }
  }

  protected willUnhighlight(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillUnhighlight !== void 0) {
        observer.viewWillUnhighlight(this);
      }
    }
  }

  protected onUnhighlight(): void {
    // hook
  }

  protected didUnhighlight(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidUnhighlight !== void 0) {
        observer.viewDidUnhighlight(this);
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
      this.backgroundColor.setLook(Look.backgroundColor, Affinity.Intrinsic);
    } else {
      this.backgroundColor.setLook(null, Affinity.Intrinsic);
      this.backgroundColor.setState(null, Affinity.Intrinsic);
    }
  }

  @ThemeAnimator<LeafView, Focus, AnyFocus>({
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
    if (this.mounted) {
      cellFastener.mount();
    }
  }

  removeCell(cellView: CellView): void {
    const cellFasteners = this.cellFasteners as ViewFastener<this, CellView>[];
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.view === cellView) {
        cellFastener.setView(null);
        if (this.mounted) {
          cellFastener.unmount();
        }
        cellFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initCell(cellView: CellView, cellFastener: ViewFastener<this, CellView>): void {
    cellView.display.setState("none", Affinity.Intrinsic);
    cellView.position.setState("absolute", Affinity.Intrinsic);
    cellView.left.setState(0, Affinity.Intrinsic);
    cellView.top.setState(0, Affinity.Intrinsic);
    cellView.width.setState(0, Affinity.Intrinsic);
    cellView.height.setState(this.height.state, Affinity.Intrinsic);
  }

  protected attachCell(cellView: CellView, cellFastener: ViewFastener<this, CellView>): void {
    // hook
  }

  protected detachCell(cellView: CellView, cellFastener: ViewFastener<this, CellView>): void {
    // hook
  }

  protected willSetCell(newCellView: CellView | null, oldCellView: CellView | null,
                        targetView: View | null, cellFastener: ViewFastener<this, CellView>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetCell !== void 0) {
        observer.viewWillSetCell(newCellView, oldCellView, targetView, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetCell !== void 0) {
        observer.viewDidSetCell(newCellView, oldCellView, targetView, this);
      }
    }
  }

  /** @internal */
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
    return LeafView.CellFastener.create(this, cellView.key ?? "cell");
  }

  /** @internal */
  readonly cellFasteners: ReadonlyArray<ViewFastener<this, CellView>>;

  /** @internal */
  protected mountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.mount();
    }
  }

  /** @internal */
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

  protected override onInsertChild(childView: View, targetView: View | null): void {
    super.onInsertChild(childView, targetView);
    const cellView = this.detectCell(childView);
    if (cellView !== null) {
      this.insertCell(cellView, targetView);
    }
  }

  protected override onRemoveChild(childView: View): void {
    super.onRemoveChild(childView);
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

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountCellFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountCellFasteners();
    super.unmountFasteners();
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

  protected onEnter(): void {
    if (this.hovers.state) {
      this.hover.focus(false);
    }
  }

  protected didEnter(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidEnter !== void 0) {
        observer.viewDidEnter(this);
      }
    }
  }

  protected onLeave(): void {
    if (this.hovers.state) {
      this.hover.unfocus();
    }
  }

  protected didLeave(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidLeave !== void 0) {
        observer.viewDidLeave(this);
      }
    }
  }

  protected onPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didPress(input: PositionGestureInput, event: Event | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidPress !== void 0) {
        observer.viewDidPress(input, event, this);
      }
    }
  }

  protected onLongPress(input: PositionGestureInput): void {
    // hook
  }

  protected didLongPress(input: PositionGestureInput): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidLongPress !== void 0) {
        observer.viewDidLongPress(input, this);
      }
    }
  }

  /** @internal */
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
    eager: true,
    self: true,
  })
  readonly gesture!: PositionGesture<this, LeafView>;
}
