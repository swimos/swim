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

import type {Class, Initable} from "@swim/util";
import {Affinity, MemberFastenerClass} from "@swim/component";
import {Look} from "@swim/theme";
import {AnyView, ViewRef} from "@swim/view";
import {HtmlViewInit, HtmlView} from "@swim/dom";
import type {ColViewObserver} from "./ColViewObserver";

/** @public */
export class ColView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initCol();
  }

  protected initCol(): void {
    this.addClass("col");
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<ColViewObserver>;

  @ViewRef<ColView, HtmlView & Initable<HtmlViewInit | string>, {createView(value?: string): HtmlView}>({
    implements: true,
    key: true,
    type: HtmlView,
    binds: true,
    willAttachView(labelView: HtmlView): void {
      this.owner.callObservers("viewWillAttachLabel", labelView, this.owner);
    },
    didDetachView(labelView: HtmlView): void {
      this.owner.callObservers("viewDidDetachLabel", labelView, this.owner);
    },
    createView(value?: string): HtmlView {
      const labelView = HtmlView.fromTag("span");
      labelView.alignSelf.setState("center", Affinity.Intrinsic);
      labelView.whiteSpace.setState("nowrap", Affinity.Intrinsic);
      labelView.textOverflow.setState("ellipsis", Affinity.Intrinsic);
      labelView.overflowX.setState("hidden", Affinity.Intrinsic);
      labelView.overflowY.setState("hidden", Affinity.Intrinsic);
      labelView.color.setLook(Look.legendColor, Affinity.Intrinsic);
      if (value !== void 0) {
        labelView.text(value);
      }
      return labelView;
    },
    fromAny(value: AnyView<HtmlView> | string): HtmlView {
      if (typeof value === "string") {
        return this.createView(value);
      } else {
        return HtmlView.fromAny(value);
      }
    },
  })
  readonly label!: ViewRef<this, HtmlView & Initable<HtmlViewInit | string>> & {create(value?: string): HtmlView};
  static readonly label: MemberFastenerClass<ColView, "label">;
}
