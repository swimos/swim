// Copyright 2015-2021 Swim.inc
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
import {Affinity, MemberFastenerClass, Property, Animator} from "@swim/component";
import {AnyLength, Length} from "@swim/math";
import {Feel, ThemeConstraintAnimator} from "@swim/theme";
import {ViewportInsets, ViewContextType, ViewFlags, ViewCreator, View, ViewSet} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {AnyBarLayout, BarLayout} from "../layout/BarLayout";
import {ToolView} from "../tool/ToolView";
import type {BarViewObserver} from "./BarViewObserver";

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
    this.edgeInsets.setValue({
      insetTop: 0,
      insetRight: 0,
      insetBottom: 0,
      insetLeft: 0,
    }, Affinity.Intrinsic);

    this.modifyMood(Feel.default, [[Feel.transparent, 1], [Feel.primary, 1]]);
  }

  override readonly observerType?: Class<BarViewObserver>;

  @Animator<BarView, BarLayout | null, BarLayout | null, {resized(layout: BarLayout): BarLayout}>({
    implements: true,
    type: BarLayout,
    inherits: true,
    value: null,
    updateFlags: View.NeedsLayout,
    willSetValue(newLayout: BarLayout | null, oldLayout: BarLayout | null): void {
      this.owner.callObservers("viewWillSetLayout", newLayout, oldLayout, this.owner);
    },
    didSetValue(newLayout: BarLayout | null, oldLayout: BarLayout | null): void {
      if (newLayout !== null && newLayout.width === null) {
        this.owner.requireUpdate(View.NeedsResize);
      }
      this.owner.callObservers("viewDidSetLayout", newLayout, oldLayout, this.owner);
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
  readonly layout!: Animator<this, BarLayout | null, AnyBarLayout | null> & {resized(layout: BarLayout): BarLayout};

  @ThemeConstraintAnimator({type: Length, inherits: true, value: null, updateFlags: View.NeedsResize})
  readonly barHeight!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @Property({type: Length, value: Length.zero(), updateFlags: View.NeedsResize})
  readonly toolSpacing!: Property<this, Length | null, AnyLength | null>;

  @Property({type: Object, inherits: true, value: null, updateFlags: View.NeedsResize})
  readonly edgeInsets!: Property<this, ViewportInsets | null>;

  getTool<F extends abstract new (...args: any) => ToolView>(key: string, toolViewClass: F): InstanceType<F> | null;
  getTool(key: string): ToolView | null;
  getTool(key: string, toolViewClass?: abstract new (...args: any) => ToolView): ToolView | null {
    if (toolViewClass === void 0) {
      toolViewClass = ToolView;
    }
    const toolView = this.getChild(key);
    return toolView instanceof toolViewClass ? toolView : null;
  }

  getOrCreateTool<F extends ViewCreator<F, ToolView>>(key: string, toolViewClass: F): InstanceType<F> {
    let toolView = this.getChild(key, toolViewClass);
    if (toolView === null) {
      toolView = toolViewClass.create();
      this.setChild(key, toolView);
    }
    return toolView!;
  }

  setTool(key: string, toolView: ToolView): void {
    this.setChild(key, toolView);
  }

  @ViewSet<BarView, ToolView>({
    type: ToolView,
    binds: true,
    initView(toolView: ToolView): void {
      toolView.display.setState("none", Affinity.Intrinsic);
      toolView.position.setState("absolute", Affinity.Intrinsic);
      toolView.left.setState(0, Affinity.Intrinsic);
      toolView.top.setState(0, Affinity.Intrinsic);
      toolView.width.setState(0, Affinity.Intrinsic);
      toolView.height.setState(this.owner.height.state, Affinity.Intrinsic);
    },
    willAttachView(toolView: ToolView, target: View | null): void {
      this.owner.callObservers("viewWillAttachTool", toolView, target, this.owner);
    },
    didDetachView(toolView: ToolView): void {
      this.owner.callObservers("viewDidDetachTool", toolView, this.owner);
    },
  })
  readonly tools!: ViewSet<this, ToolView>;
  static readonly tools: MemberFastenerClass<BarView, "tools">;

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.resizeBar(viewContext);
  }

  protected resizeBar(viewContext: ViewContextType<this>): void {
    const oldLayout = !this.layout.inherited ? this.layout.state : null;
    if (oldLayout !== void 0 && oldLayout !== null) {
      let width: Length | number | null = this.width.state;
      width = width instanceof Length ? width.pxValue(this.node.offsetWidth) : this.node.offsetWidth;
      let edgeInsets = this.edgeInsets.superValue;
      if ((edgeInsets === void 0 || edgeInsets === null) && this.edgeInsets.hasAffinity(Affinity.Intrinsic)) {
        edgeInsets = viewContext.viewport.safeArea;
      }
      const insetLeft = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetLeft : 0;
      const insetRight = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetRight : 0;
      const spacing = this.toolSpacing.getValue().pxValue(width);
      const newLayout = oldLayout.resized(width, insetLeft, insetRight, spacing);
      this.layout.setState(newLayout);
    }

    const barHeight = this.barHeight.value;
    if (barHeight !== null) {
      let edgeInsets = this.edgeInsets.superValue;
      if ((edgeInsets === void 0 || edgeInsets === null) && this.edgeInsets.hasAffinity(Affinity.Intrinsic)) {
        edgeInsets = viewContext.viewport.safeArea;
      }
      const insetTop = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetTop : 0;
      this.height.setState(barHeight.plus(insetTop), Affinity.Intrinsic);
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    if ((displayFlags & View.NeedsLayout) !== 0) {
      this.layoutChildViews(displayFlags, viewContext, displayChild);
    } else {
      super.displayChildren(displayFlags, viewContext, displayChild);
    }
  }

  protected layoutChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                            viewContext: ViewContextType<this>) => void): void {
    const layout = this.layout.value;
    let edgeInsets = this.edgeInsets.superValue;
    if ((edgeInsets === void 0 || edgeInsets === null) && this.edgeInsets.hasAffinity(Affinity.Intrinsic)) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    let height: Length | number | null = this.height.state;
    height = height instanceof Length ? height.pxValue() : this.node.offsetHeight;
    const toolTop = edgeInsets !== void 0 && edgeInsets !== null ? edgeInsets.insetTop : 0;
    const toolHeight = this.barHeight.value;
    type self = this;
    function layoutChildView(this: self, child: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      if (child instanceof ToolView) {
        const key = child.key;
        const tool = layout !== null && key !== void 0 ? layout.getTool(key) : null;
        if (tool !== null) {
          child.display.setState(!tool.presence.dismissed ? "flex" : "none", Affinity.Intrinsic);
          child.left.setState(tool.left, Affinity.Intrinsic);
          child.top.setState(toolTop, Affinity.Intrinsic);
          child.width.setState(tool.width, Affinity.Intrinsic);
          child.height.setState(toolHeight, Affinity.Intrinsic);
          child.opacity.setState(tool.presence.phase !== 1 ? tool.presence.phase : void 0, Affinity.Intrinsic);
          child.xAlign.setState(tool.align, Affinity.Intrinsic);
          child.pointerEvents.setState(tool.presence.dismissing ? "none" : void 0, Affinity.Transient);
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
      displayChild.call(this, child, displayFlags, viewContext);
    }
    super.displayChildren(displayFlags, viewContext, layoutChildView);
  }

  protected override didLayout(viewContext: ViewContextType<this>): void {
    this.layoutTools();
    super.didLayout(viewContext);
  }

  protected layoutTools(): void {
    const layout = this.layout.value;
    const tools = layout !== null ? layout.tools : null;
    const toolCount = tools !== null ? tools.length : 0;
    for (let i = 0; i < toolCount; i += 1) {
      const tool = tools![i]!;
      if (tool.overlap !== void 0) {
        const toolView = this.getChild(tool.key);
        if (toolView instanceof ToolView) {
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
        }
      }
    }
  }
}
