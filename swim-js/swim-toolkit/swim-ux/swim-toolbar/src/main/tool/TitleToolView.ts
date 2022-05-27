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

import type {Class} from "@swim/util";
import {Affinity, FastenerClass} from "@swim/component";
import {Length} from "@swim/math";
import {PositionGestureInput, PositionGesture, ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {ToolView} from "./ToolView";
import type {TitleToolViewObserver} from "./TitleToolViewObserver";

/** @public */
export class TitleToolView extends ToolView {
  protected override initTool(): void {
    super.initTool();
    this.addClass("tool-title");
    this.overflowX.setState("hidden", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<TitleToolViewObserver>;

  @ViewRef<TitleToolView["content"]>({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    initView(contentView: HtmlView): void {
      contentView.position.setState("relative", Affinity.Intrinsic);
      contentView.left.setState(0, Affinity.Intrinsic);
      contentView.top.setState(0, Affinity.Intrinsic);
    },
    willAttachView(contentView: HtmlView): void {
      this.owner.callObservers("viewWillAttachContent", contentView, this.owner);
    },
    didDetachView(contentView: HtmlView): void {
      this.owner.callObservers("viewDidDetachContent", contentView, this.owner);
    },
    setText(content: string | undefined): HtmlView {
      let contentView = this.view;
      if (contentView === null) {
        contentView = this.createView();
        this.setView(contentView);
      }
      contentView.text(content);
      return contentView;
    },
    createView(): HtmlView {
      const contentView = HtmlView.fromTag("span");
      contentView.display.setState("block", Affinity.Intrinsic);
      contentView.whiteSpace.setState("nowrap", Affinity.Intrinsic);
      contentView.textOverflow.setState("ellipsis", Affinity.Intrinsic);
      contentView.overflowX.setState("hidden", Affinity.Intrinsic);
      contentView.overflowY.setState("hidden", Affinity.Intrinsic);
      return contentView;
    },
  })
  readonly content!: ViewRef<this, HtmlView> & {
    setText(content: string | undefined): HtmlView,
  };
  static readonly content: FastenerClass<TitleToolView["content"]>;

  protected override onLayout(): void {
    super.onLayout();
    this.layoutTool();
  }

  protected layoutTool(): void {
    const contentView = this.content.view;
    if (contentView !== null) {
      let contentWidth: Length | number | null = contentView.width.value;
      contentWidth = contentWidth instanceof Length ? contentWidth.pxValue() : contentView.node.offsetWidth;
      let toolWidth: Length | number | null = this.width.value;
      toolWidth = toolWidth instanceof Length ? toolWidth.pxValue() : 0;
      const excessWidth = toolWidth - contentWidth;
      const xAlign = this.xAlign.value;
      if (toolWidth !== 0) {
        contentView.left.setState(excessWidth * xAlign, Affinity.Intrinsic);
      } else {
        contentView.left.setState(contentWidth * xAlign, Affinity.Intrinsic);
      }
      contentView.top.setState(0, Affinity.Intrinsic);
      contentView.height.setState(this.height.value, Affinity.Intrinsic);
      contentView.lineHeight.setState(this.height.value, Affinity.Intrinsic);
      if (this.effectiveWidth.value === null && contentWidth !== 0) {
        this.effectiveWidth.setValue(contentWidth);
      }
    }
  }

  @PositionGesture<TitleToolView["gesture"]>({
    bindsOwner: true,
    didPress(input: PositionGestureInput, event: Event | null): void {
      if (!input.defaultPrevented && this.owner.clientBounds.contains(input.x, input.y)) {
        this.owner.onPress(input, event);
        this.owner.didPress(input, event);
      }
    },
    didLongPress(input: PositionGestureInput): void {
      if (!input.defaultPrevented) {
        this.owner.onLongPress(input);
        this.owner.didLongPress(input);
      }
    },
  })
  readonly gesture!: PositionGesture<this, HtmlView>;
  static readonly gesture: FastenerClass<TitleToolView["gesture"]>;

  onPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  didPress(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("viewDidPress", input, event, this);
  }

  onLongPress(input: PositionGestureInput): void {
    // hook
  }

  didLongPress(input: PositionGestureInput): void {
    this.callObservers("viewDidLongPress", input, this);
  }
}
