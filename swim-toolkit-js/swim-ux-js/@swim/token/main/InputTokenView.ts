// Copyright 2015-2021 Swim inc.
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

import type {Timing} from "@swim/mapping";
import {Color} from "@swim/style";
import {Look, MoodVector, ThemeMatrix} from "@swim/theme";
import {View, ViewFastener, PositionGesture} from "@swim/view";
import {StyleRule, StyleSheet, HtmlView, StyleView, SvgView} from "@swim/dom";
import {TokenViewInit, TokenView} from "./TokenView";
import type {InputTokenViewObserver} from "./InputTokenViewObserver";
import type {InputTokenViewController} from "./InputTokenViewController";

export interface InputTokenViewInit extends TokenViewInit {
  controller?: InputTokenViewController;
}

export class InputTokenView extends TokenView {
  constructor(node: HTMLElement) {
    super(node);
    this.onInputUpdate = this.onInputUpdate.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onInputKey = this.onInputKey.bind(this);
  }

  protected override initToken(): void {
    this.stylesheet.injectView();
    super.initToken();
    this.addClass("input-token");
    this.label.setView(this.label.createView());
  }

  override readonly viewController!: InputTokenViewController | null;

  override readonly viewObservers!: ReadonlyArray<InputTokenViewObserver>;

  override initView(init: InputTokenViewInit): void {
    super.initView(init);
  }

  protected initStylesheet(styleView: StyleView): void {
    const sheet = styleView.sheet;
    if (sheet !== null) {
      const placeholder = new InputTokenView.PlaceholderRule(sheet, "placeholder");
      sheet.setCssRule("placeholder", placeholder);
    }
  }

  /** @hidden */
  static PlaceholderRule = StyleRule.define<StyleSheet>({
    css: "::placeholder {}",
  });

  protected override initLabel(labelView: HtmlView): void {
    super.initLabel(labelView);
    labelView.paddingTop.setState(0, View.Intrinsic);
    labelView.paddingRight.setState(0, View.Intrinsic);
    labelView.paddingBottom.setState(0, View.Intrinsic);
    labelView.paddingLeft.setState(0, View.Intrinsic);
    labelView.borderTopStyle.setState("none", View.Intrinsic);
    labelView.borderRightStyle.setState("none", View.Intrinsic);
    labelView.borderBottomStyle.setState("none", View.Intrinsic);
    labelView.borderLeftStyle.setState("none", View.Intrinsic);
    labelView.boxSizing.setState("border-box", View.Intrinsic);
    labelView.backgroundColor.setState(Color.transparent(), View.Intrinsic);
    labelView.appearance.setState("none", View.Intrinsic);
    labelView.outlineStyle.setState("none", View.Intrinsic);
    labelView.pointerEvents.setState("auto", View.Intrinsic);
  }

  protected override createBodyGesture(bodyView: SvgView): PositionGesture<SvgView> | null {
    return null;
  }

  @ViewFastener<InputTokenView, StyleView>({
    key: true,
    type: HtmlView.style,
    child: true,
    observe: true,
    viewDidMount(styleView: StyleView): void {
      this.owner.initStylesheet(styleView);
    },
  })
  readonly stylesheet!: ViewFastener<this, StyleView>;

  @ViewFastener<InputTokenView, HtmlView>({
    child: false,
    type: HtmlView.input,
    observe: true,
    onSetView(labelView: HtmlView | null): void {
      if (labelView !== null) {
        if (labelView.parentView === null) {
          this.owner.labelContainer.injectView();
          const labelContainer = this.owner.labelContainer.view;
          if (labelContainer !== null) {
            labelContainer.appendChildView(labelView);
          }
        }
        this.owner.initLabel(labelView);
      }
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
  override readonly label!: ViewFastener<this, HtmlView>;

  /** @hidden */
  get placeholderLook(): Look<Color> {
    return Look.neutralColor;
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    const styleView = this.stylesheet.view;
    if (styleView !== null) {
      const placeholder = styleView.getCssRule("placeholder") as StyleRule<StyleSheet> | null;
      if (placeholder !== null) {
        placeholder.color.setState(theme.getOr(this.placeholderLook, mood, null), timing, View.Intrinsic);
      }
    }

    const labelView = this.label.view;
    if (labelView !== null) {
      labelView.font(theme.getOr(Look.font, mood, null), false, View.Intrinsic);
    }
  }

  protected onInputUpdate(event: InputEvent): void {
    const inputView = this.label.view;
    if (inputView !== null) {
      this.didUpdateInput(inputView);
    }
  }

  protected didUpdateInput(inputView: HtmlView): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.tokenDidUpdateInput !== void 0) {
        viewObserver.tokenDidUpdateInput(inputView, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.tokenDidUpdateInput !== void 0) {
      viewController.tokenDidUpdateInput(inputView, this);
    }
  }

  protected onInputChange(event: Event): void {
    const inputView = this.label.view;
    if (inputView !== null) {
      this.didChangeInput(inputView);
    }
  }

  protected didChangeInput(inputView: HtmlView): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.tokenDidChangeInput !== void 0) {
        viewObserver.tokenDidChangeInput(inputView, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.tokenDidChangeInput !== void 0) {
      viewController.tokenDidChangeInput(inputView, this);
    }
  }

  protected onInputKey(event: KeyboardEvent): void {
    const inputView = this.label.view;
    if (inputView !== null && event.key === "Enter") {
      this.didAcceptInput(inputView);
    }
  }

  protected didAcceptInput(inputView: HtmlView): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.tokenDidAcceptInput !== void 0) {
        viewObserver.tokenDidAcceptInput(inputView, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.tokenDidAcceptInput !== void 0) {
      viewController.tokenDidAcceptInput(inputView, this);
    }
  }
}
