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
import {Affinity} from "@swim/fastener";
import {Look} from "@swim/theme";
import {ViewFastener} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {ColViewObserver} from "./ColViewObserver";

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

  protected createLabel(value?: string): HtmlView | null {
    const labelView = HtmlView.fromTag("span");
    labelView.alignSelf.setState("center", Affinity.Intrinsic);
    labelView.whiteSpace.setState("nowrap", Affinity.Intrinsic);
    labelView.textOverflow.setState("ellipsis", Affinity.Intrinsic);
    labelView.overflowX.setState("hidden", Affinity.Intrinsic);
    labelView.overflowY.setState("hidden", Affinity.Intrinsic);
    labelView.color.setLook(Look.neutralColor, Affinity.Intrinsic);
    if (value !== void 0) {
      labelView.text(value);
    }
    return labelView;
  }

  protected initLabel(labelView: HtmlView): void {
    // hook
  }

  protected attachLabel(labelView: HtmlView): void {
    // hook
  }

  protected detachLabel(labelView: HtmlView): void {
    // hook
  }

  protected willSetLabel(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetLabel !== void 0) {
        observer.viewWillSetLabel(newLabelView, oldLabelView, this);
      }
    }
  }

  protected onSetLabel(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
    if (oldLabelView !== null) {
      this.detachLabel(oldLabelView);
    }
    if (newLabelView !== null) {
      this.attachLabel(newLabelView);
      this.initLabel(newLabelView);
    }
  }

  protected didSetLabel(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetLabel !== void 0) {
        observer.viewDidSetLabel(newLabelView, oldLabelView, this);
      }
    }
  }

  @ViewFastener<ColView, HtmlView, string>({
    key: true,
    type: HtmlView,
    child: true,
    fromAny(value: HtmlView | string): HtmlView | null {
      if (value instanceof HtmlView) {
        return value;
      } else {
        return this.owner.createLabel(value);
      }
    },
    willSetView(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
      this.owner.willSetLabel(newLabelView, oldLabelView);
    },
    onSetView(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
      this.owner.onSetLabel(newLabelView, oldLabelView);
    },
    didSetView(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
      this.owner.didSetLabel(newLabelView, oldLabelView);
    },
  })
  readonly label!: ViewFastener<this, HtmlView, string>;
}
