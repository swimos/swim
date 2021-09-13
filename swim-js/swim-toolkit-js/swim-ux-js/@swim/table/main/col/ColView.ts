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

import {View, ViewFastener} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {ColViewObserver} from "./ColViewObserver";

export class ColView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initCol();
  }

  protected initCol(): void {
    this.addClass("col");
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
  }

  override readonly viewObservers!: ReadonlyArray<ColViewObserver>;

  protected createLabel(value?: string): HtmlView | null {
    const labelView = HtmlView.span.create();
    labelView.alignSelf.setState("center", View.Intrinsic);
    labelView.whiteSpace.setState("nowrap", View.Intrinsic);
    labelView.textOverflow.setState("ellipsis", View.Intrinsic);
    labelView.overflowX.setState("hidden", View.Intrinsic);
    labelView.overflowY.setState("hidden", View.Intrinsic);
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
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetLabel !== void 0) {
        viewObserver.viewWillSetLabel(newLabelView, oldLabelView, this);
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
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetLabel !== void 0) {
        viewObserver.viewDidSetLabel(newLabelView, oldLabelView, this);
      }
    }
  }

  @ViewFastener<ColView, HtmlView, string>({
    key: true,
    type: HtmlView,
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
