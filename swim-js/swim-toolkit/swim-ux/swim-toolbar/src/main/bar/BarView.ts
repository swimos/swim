// Copyright 2015-2022 Swim.inc
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

import type {Class, Instance, Creatable} from "@swim/util";
import {Affinity, FastenerClass, Property, Animator} from "@swim/component";
import {AnyLength, Length} from "@swim/math";
import {Feel, ThemeConstraintAnimator} from "@swim/theme";
import {ViewInsets, ViewFlags, View, ViewSet} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {AnyBarLayout, BarLayout} from "../layout/BarLayout";
import {ToolView} from "../tool/ToolView";
import type {BarViewObserver} from "./BarViewObserver";

/** @public */
export type BarPlacement = "top" | "bottom" | "none";

/** @public */
export class BarView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initBar();
  }

  protected initBar(): void {
    this.addClass("bar");
    this.position.setState("relative", Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
    this.userSelect.setState("none", Affinity.Intrinsic);

    this.modifyMood(Feel.default, [[Feel.primary, 1]]);
  }

  override readonly observerType?: Class<BarViewObserver>;

  @Property<BarView["placement"]>({
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

  @Animator<BarView["layout"]>({
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
  readonly layout!: Animator<this, BarLayout | null, AnyBarLayout | null> & {
    resized(layout: BarLayout): BarLayout,
  };

  @ThemeConstraintAnimator<BarView["barHeight"]>({
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
        this.owner.height.setState(height, Affinity.Intrinsic);
      }
    },
  })
  readonly barHeight!: ThemeConstraintAnimator<this, Length | null, AnyLength | null> & {
    /** @internal */
    applyEdgeInsets(edgeInsets: ViewInsets): void,
  };

  @Property({valueType: Length, value: Length.zero(), updateFlags: View.NeedsResize})
  readonly toolSpacing!: Property<this, Length | null, AnyLength | null>;

  @Property<BarView["edgeInsets"]>({
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
  override readonly edgeInsets!: Property<this, ViewInsets> & HtmlView["edgeInsets"];

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

  @ViewSet<BarView["tools"]>({
    viewType: ToolView,
    binds: true,
    initView(toolView: ToolView): void {
      toolView.display.setState("none", Affinity.Intrinsic);
      toolView.position.setState("absolute", Affinity.Intrinsic);
      toolView.left.setState(0, Affinity.Intrinsic);
      toolView.width.setState(0, Affinity.Intrinsic);
      toolView.height.setState(this.owner.barHeight.value, Affinity.Intrinsic);
    },
    willAttachView(toolView: ToolView, target: View | null): void {
      this.owner.callObservers("viewWillAttachTool", toolView, target, this.owner);
    },
    didDetachView(toolView: ToolView): void {
      this.owner.callObservers("viewDidDetachTool", toolView, this.owner);
    },
  })
  readonly tools!: ViewSet<this, ToolView>;
  static readonly tools: FastenerClass<BarView["tools"]>;

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
    this.addClass("bar-top")
        .removeClass("bar-bottom");

    const edgeInsets = this.edgeInsets.value;
    let height = this.barHeight.value;
    if (height !== null) {
      height = height.plus(edgeInsets.insetTop);
      this.height.setState(height, Affinity.Intrinsic);
    }

    const oldLayout = !this.layout.derived ? this.layout.state : null;
    if (oldLayout !== void 0 && oldLayout !== null) {
      const barWidth = this.width.pxState();
      const insetLeft = edgeInsets.insetLeft;
      const insetRight = edgeInsets.insetRight;
      const spacing = this.toolSpacing.getValue().pxValue(barWidth);
      const newLayout = oldLayout.resized(barWidth, insetLeft, insetRight, spacing);
      this.layout.setState(newLayout);
    }
  }

  protected resizeBarBottom(): void {
    this.removeClass("bar-top")
        .addClass("bar-bottom");

    const edgeInsets = this.edgeInsets.value;
    let height = this.barHeight.value;
    if (height !== null) {
      height = height.plus(edgeInsets.insetBottom);
      this.height.setState(height, Affinity.Intrinsic);
    }

    const oldLayout = !this.layout.derived ? this.layout.state : null;
    if (oldLayout !== void 0 && oldLayout !== null) {
      const barWidth = this.width.pxState();
      const insetLeft = edgeInsets.insetLeft;
      const insetRight = edgeInsets.insetRight;
      const spacing = this.toolSpacing.getValue().pxValue(barWidth);
      const newLayout = oldLayout.resized(barWidth, insetLeft, insetRight, spacing);
      this.layout.setState(newLayout);
    }
  }

  protected resizeBarNone(): void {
    this.removeClass("bar-top")
        .removeClass("bar-bottom");

    const oldLayout = !this.layout.derived ? this.layout.state : null;
    if (oldLayout !== void 0 && oldLayout !== null) {
      const barWidth = this.width.pxState();
      const spacing = this.toolSpacing.getValue().pxValue(barWidth);
      const newLayout = oldLayout.resized(barWidth, 0, 0, spacing);
      this.layout.setState(newLayout);
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
          child.display.setState(!tool.presence.dismissed ? "flex" : "none", Affinity.Intrinsic);
          child.left.setState(tool.left, Affinity.Intrinsic);
          child.top.setState(toolTop, Affinity.Intrinsic);
          child.bottom.setState(toolBottom, Affinity.Intrinsic);
          child.width.setState(tool.width !== null && tool.width.value !== 0 ? tool.width : null, Affinity.Intrinsic);
          child.height.setState(toolHeight, Affinity.Intrinsic);
          child.opacity.setState(tool.presence.phase !== 1 ? tool.presence.phase : void 0, Affinity.Intrinsic);
          child.xAlign.setState(tool.align, Affinity.Intrinsic);
          child.pointerEvents.setState(tool.presence.dismissing ? "none" : void 0, Affinity.Transient);
          if (tool.presence.dismissed) {
            this.callObservers("viewDidDismissTool", child, tool, this);
          }
        } else {
          child.display.setState("none", Affinity.Intrinsic);
          child.left.setState(null, Affinity.Intrinsic);
          child.top.setState(null, Affinity.Intrinsic);
          child.width.setState(null, Affinity.Intrinsic);
          child.height.setState(null, Affinity.Intrinsic);
          child.opacity.setState(void 0, Affinity.Intrinsic);
          child.pointerEvents.setState(void 0, Affinity.Transient);
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
              toolView.paddingLeft.setState(null, Affinity.Intrinsic);
              toolView.paddingRight.setState(overlapWidth, Affinity.Intrinsic);
            } else {
              toolView.paddingLeft.setState(overlapWidth, Affinity.Intrinsic);
              toolView.paddingRight.setState(null, Affinity.Intrinsic);
            }
          } else {
            toolView.paddingLeft.setState(null, Affinity.Intrinsic);
            toolView.paddingRight.setState(null, Affinity.Intrinsic);
          }
        } else {
          toolView.paddingLeft.setState(null, Affinity.Intrinsic);
          toolView.paddingRight.setState(null, Affinity.Intrinsic);
        }
      }
    }
  }
}
