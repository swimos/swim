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

import type {Class, Timing} from "@swim/util";
import {Affinity, MemberFastenerClass} from "@swim/component";
import {Color} from "@swim/style";
import {Look, MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewRef} from "@swim/view";
import {StyleRule, StyleSheet, HtmlView, StyleView} from "@swim/dom";
import {TokenViewInit, TokenView} from "./TokenView";
import type {InputTokenViewObserver} from "./InputTokenViewObserver";

/** @public */
export interface InputTokenViewInit extends TokenViewInit {
}

/** @public */
export class InputTokenView extends TokenView {
  constructor(node: HTMLElement) {
    super(node);
    this.onInputUpdate = this.onInputUpdate.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onInputKey = this.onInputKey.bind(this);
  }

  override readonly observerType?: Class<InputTokenViewObserver>;

  protected override initToken(): void {
    this.stylesheet.insertView();
    super.initToken();
    this.addClass("input-token");
    this.label.attachView();
  }

  protected initStylesheet(styleView: StyleView): void {
    const sheet = styleView.sheet;
    if (sheet !== null) {
      const placeholder = InputTokenView.PlaceholderRule.create(sheet);
      sheet.setFastener("placeholder", placeholder);
    }
  }

  /** @internal */
  static PlaceholderRule = StyleRule.define<StyleSheet>("PlaceholderRule", {
    css: "::placeholder {}",
  });

  protected override initLabel(labelView: HtmlView): void {
    super.initLabel(labelView);
    labelView.paddingTop.setState(0, Affinity.Intrinsic);
    labelView.paddingRight.setState(0, Affinity.Intrinsic);
    labelView.paddingBottom.setState(0, Affinity.Intrinsic);
    labelView.paddingLeft.setState(0, Affinity.Intrinsic);
    labelView.borderTopStyle.setState("none", Affinity.Intrinsic);
    labelView.borderRightStyle.setState("none", Affinity.Intrinsic);
    labelView.borderBottomStyle.setState("none", Affinity.Intrinsic);
    labelView.borderLeftStyle.setState("none", Affinity.Intrinsic);
    labelView.boxSizing.setState("border-box", Affinity.Intrinsic);
    labelView.backgroundColor.setState(Color.transparent(), Affinity.Intrinsic);
    labelView.appearance.setState("none", Affinity.Intrinsic);
    labelView.outlineStyle.setState("none", Affinity.Intrinsic);
    labelView.pointerEvents.setState("auto", Affinity.Intrinsic);
  }

  @ViewRef<InputTokenView, StyleView>({
    key: true,
    type: StyleView,
    binds: true,
    observes: true,
    viewDidMount(styleView: StyleView): void {
      this.owner.initStylesheet(styleView);
    },
  })
  readonly stylesheet!: ViewRef<this, StyleView>;
  static readonly stylesheet: MemberFastenerClass<InputTokenView, "stylesheet">;

  @ViewRef<InputTokenView, HtmlView>({
    type: HtmlView.forTag("input"),
    observes: true,
    didAttachView(labelView: HtmlView): void {
      if (labelView.parent === null) {
        this.owner.labelContainer.insertView();
        const labelContainer = this.owner.labelContainer.view;
        if (labelContainer !== null) {
          labelContainer.appendChild(labelView);
        }
      }
      this.owner.initLabel(labelView);
    },
    viewDidMount(labelView: HtmlView): void {
      labelView.on("input", this.owner.onInputUpdate as EventListener);
      labelView.on("change", this.owner.onInputChange);
      labelView.on("keydown", this.owner.onInputKey);
    },
    viewWillUnmount(labelView: HtmlView): void {
      labelView.off("input", this.owner.onInputUpdate as EventListener);
      labelView.off("change", this.owner.onInputChange);
      labelView.off("keydown", this.owner.onInputKey);
    },
  })
  override readonly label!: ViewRef<this, HtmlView>;
  static override readonly label: MemberFastenerClass<InputTokenView, "label">;

  /** @internal */
  get placeholderLook(): Look<Color> {
    return Look.placeholderColor;
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    const styleView = this.stylesheet.view;
    if (styleView !== null) {
      const placeholder = styleView.getFastener("placeholder", StyleRule);
      if (placeholder !== null) {
        placeholder.color.setState(theme.getOr(this.placeholderLook, mood, null), timing, Affinity.Intrinsic);
      }
    }

    const labelView = this.label.view;
    if (labelView !== null) {
      labelView.font(theme.getOr(Look.font, mood, null), false, Affinity.Intrinsic);
    }
  }

  protected onInputUpdate(event: InputEvent): void {
    const inputView = this.label.view;
    if (inputView !== null) {
      this.didUpdateInput(inputView);
    }
  }

  protected didUpdateInput(inputView: HtmlView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.tokenDidUpdateInput !== void 0) {
        observer.tokenDidUpdateInput(inputView, this);
      }
    }
  }

  protected onInputChange(event: Event): void {
    const inputView = this.label.view;
    if (inputView !== null) {
      this.didChangeInput(inputView);
    }
  }

  protected didChangeInput(inputView: HtmlView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.tokenDidChangeInput !== void 0) {
        observer.tokenDidChangeInput(inputView, this);
      }
    }
  }

  protected onInputKey(event: KeyboardEvent): void {
    const inputView = this.label.view;
    if (inputView !== null && event.key === "Enter") {
      this.didAcceptInput(inputView);
    }
  }

  protected didAcceptInput(inputView: HtmlView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.tokenDidAcceptInput !== void 0) {
        observer.tokenDidAcceptInput(inputView, this);
      }
    }
  }

  override init(init: InputTokenViewInit): void {
    super.init(init);
  }
}
