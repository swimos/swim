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

import type {Class, Initable} from "@swim/util";
import {Affinity, MemberFastenerClass} from "@swim/component";
import {Length} from "@swim/math";
import {ViewContextType, AnyView, ViewRef} from "@swim/view";
import {HtmlViewInit, HtmlView} from "@swim/dom";
import {ToolView} from "./ToolView";
import type {TitleToolViewObserver} from "./TitleToolViewObserver";

/** @public */
export class TitleToolView extends ToolView {
  protected override initTool(): void {
    super.initTool();
    this.addClass("tool-title");
    this.pointerEvents.setState("none", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<TitleToolViewObserver>;

  @ViewRef<TitleToolView, HtmlView & Initable<HtmlViewInit | string>, {create(value?: string): HtmlView}>({
    implements: true,
    key: true,
    type: HtmlView,
    binds: true,
    initView(contentView: HtmlView): void {
      contentView.position.setState("absolute", Affinity.Intrinsic);
      contentView.left.setState(0, Affinity.Intrinsic);
      contentView.top.setState(0, Affinity.Intrinsic);
    },
    willAttachView(contentView: HtmlView): void {
      this.owner.callObservers("viewWillAttachContent", contentView, this.owner);
    },
    didDetachView(contentView: HtmlView): void {
      this.owner.callObservers("viewDidDetachContent", contentView, this.owner);
    },
    create(value?: string): HtmlView {
      const contentView = HtmlView.fromTag("span");
      contentView.display.setState("flex", Affinity.Intrinsic);
      contentView.alignItems.setState("center", Affinity.Intrinsic);
      contentView.whiteSpace.setState("nowrap", Affinity.Intrinsic);
      contentView.textOverflow.setState("ellipsis", Affinity.Intrinsic);
      if (value !== void 0) {
        contentView.text(value);
      }
      return contentView;
    },
    fromAny(value: AnyView<HtmlView> | string): HtmlView {
      if (typeof value === "string") {
        return this.create(value);
      } else {
        return HtmlView.fromAny(value);
      }
    },
  })
  readonly content!: ViewRef<this, HtmlView & Initable<HtmlViewInit | string>> & {create(value?: string): HtmlView};
  static readonly content: MemberFastenerClass<TitleToolView, "content">;

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutTool();
  }

  protected layoutTool(): void {
    const contentView = this.content.view;
    if (contentView !== null) {
      let toolWidth: Length | number | null = this.width.value;
      toolWidth = toolWidth instanceof Length ? toolWidth.pxValue() : this.node.offsetWidth;
      let contentWidth: Length | number | null = contentView.width.value;
      contentWidth = contentWidth instanceof Length ? contentWidth.pxValue(toolWidth) : contentView.node.offsetWidth;
      const excessWidth = toolWidth - contentWidth;
      const xAlign = this.xAlign.value;
      contentView.left.setState(excessWidth * xAlign, Affinity.Intrinsic);
      contentView.top.setState(0, Affinity.Intrinsic);
      contentView.maxWidth.setState(toolWidth, Affinity.Intrinsic);
      contentView.height.setState(this.height.value, Affinity.Intrinsic);
      if (this.effectiveWidth.state === null && contentWidth !== 0) {
        this.effectiveWidth.setState(contentWidth);
      }
    }
  }
}
