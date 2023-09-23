// Copyright 2015-2023 Nstream, inc.
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
import {Look} from "@swim/theme";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {ColViewObserver} from "./ColView";
import {ColView} from "./ColView";

/** @public */
export interface TextColViewObserver<V extends TextColView = TextColView> extends ColViewObserver<V> {
  viewWillAttachLabel?(labelView: HtmlView, view: V): void;

  viewDidDetachLabel?(labelView: HtmlView, view: V): void;
}

/** @public */
export class TextColView extends ColView {
  protected override initCol(): void {
    super.initCol();
    this.classList.add("col-text");
  }

  declare readonly observerType?: Class<TextColViewObserver>;

  @ViewRef({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    willAttachView(labelView: HtmlView): void {
      this.owner.callObservers("viewWillAttachLabel", labelView, this.owner);
    },
    didDetachView(labelView: HtmlView): void {
      this.owner.callObservers("viewDidDetachLabel", labelView, this.owner);
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
        alignSelf: "center",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflowX: "hidden",
        overflowY: "hidden",
        color: Look.legendColor,
      });
    },
  })
  readonly label!: ViewRef<this, Like<HtmlView, string | undefined>>;
}
