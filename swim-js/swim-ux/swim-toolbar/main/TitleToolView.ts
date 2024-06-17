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
import type {Like} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {PositionGestureInput} from "@swim/view";
import {PositionGesture} from "@swim/view";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {ToolViewObserver} from "./ToolView";
import {ToolView} from "./ToolView";

/** @public */
export interface TitleToolViewObserver<V extends TitleToolView = TitleToolView> extends ToolViewObserver<V> {
  viewWillAttachContent?(contentView: HtmlView, view: V): void;

  viewDidDetachContent?(contentView: HtmlView, view: V): void;
}

/** @public */
export class TitleToolView extends ToolView {
  protected override initTool(): void {
    super.initTool();
    this.setIntrinsic<TitleToolView>({
      classList: ["tool-title"],
      style: {
        overflowX: "hidden",
      },
    });
  }

  declare readonly observerType?: Class<TitleToolViewObserver>;

  @ViewRef({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    initView(contentView: HtmlView): void {
      contentView.style.setIntrinsic({
        position: "relative",
        left: 0,
        top: 0,
      });
    },
    willAttachView(contentView: HtmlView): void {
      this.owner.callObservers("viewWillAttachContent", contentView, this.owner);
    },
    didDetachView(contentView: HtmlView): void {
      this.owner.callObservers("viewDidDetachContent", contentView, this.owner);
    },
    fromLike(value: HtmlView | LikeType<HtmlView> | string | undefined): HtmlView {
      if (value === void 0 || typeof value === "string") {
        let view = this.view;
        if (view === null) {
          view = this.createView();
        }
        view.text.setState(value);
        return view;
      }
      return super.fromLike(value);
    },
    createView(): HtmlView {
      return HtmlView.fromTag("span").style.setIntrinsic({
        display: "block",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflowX: "hidden",
        overflowY: "hidden",
      });
    },
  })
  readonly content!: ViewRef<this, Like<HtmlView, string | undefined>>;

  protected override onLayout(): void {
    super.onLayout();
    this.layoutTool();
  }

  protected layoutTool(): void {
    const contentView = this.content.view;
    if (contentView === null) {
      return;
    }
    const contentWidth = contentView.style.width.pxValue();
    const toolWidth = this.style.width.pxValue();
    contentView.style.setIntrinsic({
      left: (toolWidth !== 0 ? toolWidth - contentWidth : contentWidth) * this.xAlign.value,
      top: 0,
      height: this.style.height.value,
      lineHeight: this.style.height.value,
    });
    if (this.effectiveWidth.value === null && contentWidth !== 0) {
      this.effectiveWidth.set(contentWidth);
    }
  }

  @PositionGesture({
    bindsOwner: true,
    didPress(input: PositionGestureInput, event: Event | null): void {
      if (!input.defaultPrevented && this.owner.clientBounds.contains(input.x, input.y)) {
        this.owner.didPress(input, event);
      }
    },
    didLongPress(input: PositionGestureInput): void {
      if (!input.defaultPrevented) {
        this.owner.didLongPress(input);
      }
    },
  })
  readonly gesture!: PositionGesture<this, HtmlView>;

  didPress(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("viewDidPress", input, event, this);
  }

  didLongPress(input: PositionGestureInput): void {
    this.callObservers("viewDidLongPress", input, this);
  }
}
