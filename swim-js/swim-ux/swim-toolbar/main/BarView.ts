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
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {Feel} from "@swim/theme";
import {ThemeConstraintAnimator} from "@swim/theme";
import type {ViewInsets} from "@swim/view";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewSet} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import type {ToolLayout} from "./ToolLayout";
import {BarLayout} from "./BarLayout";
import {ToolView} from "./ToolView";

/** @public */
export type BarPlacement = "top" | "bottom" | "none";

/** @public */
export interface BarViewObserver<V extends BarView = BarView> extends HtmlViewObserver<V> {
  viewDidSetPlacement?(placement: BarPlacement, view: V): void;

  viewDidSetEffectiveHeight?(effectiveHeight: Length | null, view: V): void;

  viewDidSetBarLayout?(barLayout: BarLayout | null, view: V): void;

  viewDidSetBarHeight?(barHeight: Length | null, view: V): void;

  viewWillAttachTool?(toolView: ToolView, targetView: View | null, view: V): void;

  viewDidDetachTool?(toolView: ToolView, view: V): void;

  viewDidDismissTool?(toolView: ToolView, toolLayout: ToolLayout, view: V): void;
}

/** @public */
export class BarView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initBar();
  }

  protected initBar(): void {
    this.setIntrinsic<BarView>({
      classList: ["bar"],
      style: {
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      },
    });
    this.modifyMood(Feel.default, [[Feel.primary, 1]]);
  }

  declare readonly observerType?: Class<BarViewObserver>;

  @Property({
    valueType: String,
    value: "none",
    updateFlags: View.NeedsResize | View.NeedsLayout,
    didSetValue(placement: BarPlacement): void {
      this.owner.callObservers("viewDidSetPlacement", placement, this.owner);
      this.owner.barHeight.applyEdgeInsets(this.owner.edgeInsets.value);
      this.owner.edgeInsets.decohereOutlets();
    },
  })
  readonly placement!: Property<this, BarPlacement>;

  @Animator({
    valueType: BarLayout,
    value: null,
    inherits: true,
    updateFlags: View.NeedsLayout,
    didSetValue(newLayout: BarLayout | null, oldLayout: BarLayout | null): void {
      if (newLayout !== null && newLayout.width === null) {
        this.owner.requireUpdate(View.NeedsResize);
      }
      this.owner.callObservers("viewDidSetBarLayout", newLayout, this.owner);
    },
    transformState(newLayout: BarLayout | null): BarLayout | null {
      if (newLayout !== null && newLayout.width === null) {
        newLayout = this.resized(newLayout);
      }
      return newLayout;
    },
    resized(newLayout: BarLayout): BarLayout {
      const oldLayout = this.value;
      if (oldLayout !== null && oldLayout.width !== null) {
        newLayout = newLayout.resized(oldLayout.width, oldLayout.left, oldLayout.right, oldLayout.spacing);
      }
      return newLayout;
    },
  })
  readonly layout!: Animator<this, BarLayout | null> & {
    resized(layout: BarLayout): BarLayout,
  };

  @ThemeConstraintAnimator({
    valueType: Length,
    value: null,
    updateFlags: View.NeedsResize,
    didSetValue(barHeight: Length | null): void {
      this.owner.callObservers("viewDidSetBarHeight", barHeight, this.owner);
      this.applyEdgeInsets(this.owner.edgeInsets.value);
    },
    applyEdgeInsets(edgeInsets: ViewInsets): void {
      let height = this.value;
      if (height !== null) {
        const placement = this.owner.placement.value;
        if (placement === "top") {
          height = height.plus(edgeInsets.insetTop);
        } else if (placement === "bottom") {
          height = height.plus(edgeInsets.insetBottom);
        }
        this.owner.style.height.setIntrinsic(height);
      }
    },
  })
  readonly barHeight!: ThemeConstraintAnimator<this, Length | null> & {
    /** @internal */
    applyEdgeInsets(edgeInsets: ViewInsets): void,
  };

  @Property({valueType: Length, value: Length.zero(), updateFlags: View.NeedsResize})
  readonly toolSpacing!: Property<this, Length | null>;

  @Property({
    extends: true,
    didSetValue(edgeInsets: ViewInsets): void {
      this.owner.barHeight.applyEdgeInsets(edgeInsets);
    },
    getOutletValue(outlet: Property<unknown, ViewInsets>): ViewInsets {
      let edgeInsets = this.value;
      let insetTop = edgeInsets.insetTop;
      const insetRight = edgeInsets.insetRight;
      let insetBottom = edgeInsets.insetBottom;
      const insetLeft = edgeInsets.insetLeft;
      const placement = this.owner.placement.value;
      if (placement === "top" && insetBottom !== 0) {
        insetBottom = 0;
        edgeInsets = {insetTop, insetRight, insetBottom, insetLeft};
      } else if (placement === "bottom" && insetTop !== 0) {
        insetTop = 0;
        edgeInsets = {insetTop, insetRight, insetBottom, insetLeft};
      }
      return edgeInsets;
    },
  })
  override get edgeInsets(): Property<this, ViewInsets> & HtmlView["edgeInsets"] {
    return Property.getter();
  }

  getTool<F extends Class<ToolView>>(key: string, toolViewClass: F): InstanceType<F> | null;
  getTool(key: string): ToolView | null;
  getTool(key: string, toolViewClass?: Class<ToolView>): ToolView | null {
    if (toolViewClass === void 0) {
      toolViewClass = ToolView;
    }
    const toolView = this.getChild(key);
    return toolView instanceof toolViewClass ? toolView : null;
  }

  getOrCreateTool<F extends Class<Instance<F, ToolView>> & Creatable<Instance<F, ToolView>>>(key: string, toolViewClass: F): InstanceType<F> {
    let toolView = this.getChild(key, toolViewClass);
    if (toolView === null) {
      toolView = toolViewClass.create();
      this.setChild(key, toolView);
    }
    return toolView!;
  }

  setTool(key: string, toolView: ToolView | null): void {
    this.setChild(key, toolView);
  }

  @ViewSet({
    viewType: ToolView,
    binds: true,
    initView(toolView: ToolView): void {
      toolView.style.setIntrinsic({
        display: "none",
        position: "absolute",
        left: 0,
        width: 0,
        height: this.owner.barHeight.value,
      });
    },
    willAttachView(toolView: ToolView, target: View | null): void {
      this.owner.callObservers("viewWillAttachTool", toolView, target, this.owner);
    },
    didDetachView(toolView: ToolView): void {
      this.owner.callObservers("viewDidDetachTool", toolView, this.owner);
    },
  })
  readonly tools!: ViewSet<this, ToolView>;

  protected override onResize(): void {
    super.onResize();
    this.resizeBar();
  }

  protected resizeBar(): void {
    const placement = this.placement.value;
    if (placement === "top") {
      this.resizeBarTop();
    } else if (placement === "bottom") {
      this.resizeBarBottom();
    } else if (placement === "none") {
      this.resizeBarNone();
    }
  }

  protected resizeBarTop(): void {
    this.classList.remove("bar-bottom");
    this.classList.add("bar-top");

    const edgeInsets = this.edgeInsets.value;
    let height = this.barHeight.value;
    if (height !== null) {
      height = height.plus(edgeInsets.insetTop);
      this.style.height.setIntrinsic(height);
    }

    const oldLayout = !this.layout.derived ? this.layout.state : null;
    if (oldLayout !== void 0 && oldLayout !== null) {
      const barWidth = this.style.width.pxState();
      const insetLeft = edgeInsets.insetLeft;
      const insetRight = edgeInsets.insetRight;
      const spacing = this.toolSpacing.getValue().pxValue(barWidth);
      const newLayout = oldLayout.resized(barWidth, insetLeft, insetRight, spacing);
      this.layout.set(newLayout);
    }
  }

  protected resizeBarBottom(): void {
    this.classList.remove("bar-top");
    this.classList.add("bar-bottom");

    const edgeInsets = this.edgeInsets.value;
    let height = this.barHeight.value;
    if (height !== null) {
      height = height.plus(edgeInsets.insetBottom);
      this.style.height.setIntrinsic(height);
    }

    const oldLayout = !this.layout.derived ? this.layout.state : null;
    if (oldLayout !== void 0 && oldLayout !== null) {
      const barWidth = this.style.width.pxState();
      const insetLeft = edgeInsets.insetLeft;
      const insetRight = edgeInsets.insetRight;
      const spacing = this.toolSpacing.getValue().pxValue(barWidth);
      const newLayout = oldLayout.resized(barWidth, insetLeft, insetRight, spacing);
      this.layout.set(newLayout);
    }
  }

  protected resizeBarNone(): void {
    this.classList.remove("bar-top");
    this.classList.remove("bar-bottom");

    const oldLayout = !this.layout.derived ? this.layout.state : null;
    if (oldLayout !== void 0 && oldLayout !== null) {
      const barWidth = this.style.width.pxState();
      const spacing = this.toolSpacing.getValue().pxValue(barWidth);
      const newLayout = oldLayout.resized(barWidth, 0, 0, spacing);
      this.layout.set(newLayout);
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
    const placement = this.placement.value;
    const edgeInsets = this.edgeInsets.value;
    const toolTop = placement === "top" ? Length.px(edgeInsets.insetTop) : null;
    const toolBottom = placement === "bottom" ? Length.px(edgeInsets.insetBottom) : null;
    const toolHeight = this.barHeight.value;
    const layout = this.layout.value;
    type self = this;
    function layoutChild(this: self, child: View, displayFlags: ViewFlags): void {
      if (child instanceof ToolView) {
        const key = child.key;
        const tool = layout !== null && key !== void 0 ? layout.getTool(key) : null;
        if (tool !== null) {
          child.xAlign.setIntrinsic(tool.align);
          child.style.setIntrinsic({
            display: !tool.presence.dismissed ? "flex" : "none",
            left: tool.left,
            top: toolTop,
            bottom: toolBottom,
            width: tool.width !== null && tool.width.value !== 0 ? tool.width : null,
            height: toolHeight,
            opacity: tool.presence.phase !== 1 ? tool.presence.phase : void 0,
          });
          child.style.pointerEvents.setState(tool.presence.dismissing ? "none" : void 0, Affinity.Transient);
          if (tool.presence.dismissed) {
            this.callObservers("viewDidDismissTool", child, tool, this);
          }
        } else {
          child.style.setIntrinsic({
            display: "none",
            left: null,
            top: null,
            bottom: null,
            width: null,
            height: null,
            opacity: void 0,
          });
          child.style.pointerEvents.setState(void 0, Affinity.Transient);
        }
      }
      displayChild.call(this, child, displayFlags);
    }
    super.displayChildren(displayFlags, layoutChild);
  }

  protected override didLayout(): void {
    this.layoutTools();
    super.didLayout();
  }

  protected layoutTools(): void {
    const layout = this.layout.value;
    const tools = layout !== null ? layout.tools : null;
    const toolCount = tools !== null ? tools.length : 0;
    for (let i = 0; i < toolCount; i += 1) {
      const tool = tools![i]!;
      const toolView = this.getChild(tool.key);
      if (toolView instanceof ToolView) {
        if (tool.overlap !== void 0) {
          const overlapView = this.getChild(tool.overlap);
          if (overlapView instanceof ToolView) {
            const toolX = toolView.node.offsetLeft;
            const overlapX = toolView.node.offsetLeft;
            let overlapWidth = overlapView.effectiveWidth.value;
            if (overlapWidth !== null) {
              overlapWidth = overlapWidth.plus(tool.overpad);
            }
            if (toolX <= overlapX) {
              toolView.style.setIntrinsic({
                paddingLeft: null,
                paddingRight: overlapWidth,
              });
            } else {
              toolView.style.setIntrinsic({
                paddingLeft: overlapWidth,
                paddingRight: null,
              });
            }
          } else {
            toolView.style.setIntrinsic({
              paddingLeft: null,
              paddingRight: null,
            });
          }
        } else {
          toolView.style.setIntrinsic({
            paddingLeft: null,
            paddingRight: null,
          });
        }
      }
    }
  }
}
