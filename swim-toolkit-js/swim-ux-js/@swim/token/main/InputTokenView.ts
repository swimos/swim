// Copyright 2015-2020 Swim inc.
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

import {Color} from "@swim/color";
import {Transition} from "@swim/transition";
import {StyleRule, StyleSheet} from "@swim/style";
import {Subview, ViewNodeType, HtmlView, StyleView} from "@swim/view";
import {PositionGesture} from "@swim/gesture";
import {Look, MoodVector, ThemeMatrix, ThemedSvgView} from "@swim/theme";
import {TokenViewInit, TokenView} from "./TokenView";
import {InputTokenViewObserver} from "./InputTokenViewObserver";
import {InputTokenViewController} from "./InputTokenViewController";

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

  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("input-token");
  }

  // @ts-ignore
  declare readonly viewController: InputTokenViewController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<InputTokenViewObserver>;

  initView(init: InputTokenViewInit): void {
    super.initView(init);
  }

  protected initSubviews(): void {
    this.stylesheet.insert();
    super.initSubviews();
    this.label.setSubview(this.label.createSubview());
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

  protected initLabel(labelView: HtmlView): void {
    super.initLabel(labelView);
    labelView.paddingTop.setAutoState(0);
    labelView.paddingRight.setAutoState(0);
    labelView.paddingBottom.setAutoState(0);
    labelView.paddingLeft.setAutoState(0);
    labelView.borderTopStyle.setAutoState("none");
    labelView.borderRightStyle.setAutoState("none");
    labelView.borderBottomStyle.setAutoState("none");
    labelView.borderLeftStyle.setAutoState("none");
    labelView.boxSizing.setAutoState("border-box");
    labelView.backgroundColor.setAutoState(Color.transparent());
    labelView.appearance.setAutoState("none");
    labelView.outlineStyle.setAutoState("none");
    labelView.pointerEvents.setAutoState("auto");
  }

  protected createBodyGesture(bodyView: ThemedSvgView): PositionGesture<ThemedSvgView> | null {
    return null;
  }

  @Subview<InputTokenView, StyleView>({
    child: true,
    type: StyleView,
    viewDidMount(styleView: StyleView): void {
      this.view.initStylesheet(styleView);
    },
  })
  readonly stylesheet: Subview<this, StyleView>;

  @Subview<InputTokenView, HtmlView>({
    child: false,
    type: HtmlView,
    tag: "input",
    onSetSubview(labelView: HtmlView | null): void {
      if (labelView !== null) {
        if (labelView.parentView === null) {
          this.view.labelContainer.insert();
          const labelContainer = this.view.labelContainer.subview;
          if (labelContainer !== null) {
            labelContainer.appendChildView(labelView);
          }
        }
        this.view.initLabel(labelView);
      }
    },
    viewDidMount(labelView: HtmlView): void {
      labelView.on("input", this.view.onInputUpdate);
      labelView.on("change", this.view.onInputChange);
      labelView.on("keydown", this.view.onInputKey);
    },
    viewWillUnmount(labelView: HtmlView): void {
      labelView.off("input", this.view.onInputUpdate);
      labelView.off("change", this.view.onInputChange);
      labelView.off("keydown", this.view.onInputKey);
    },
  })
  readonly label: Subview<this, HtmlView>;

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    super.onApplyTheme(theme, mood, transition);
    const styleView = this.stylesheet.subview;
    if (styleView !== null) {
      const placeholder = styleView.getCssRule("placeholder") as StyleRule<StyleSheet> | null;
      if (placeholder !== null) {
        placeholder.color.setAutoState(theme.inner(mood, Look.mutedColor), transition);
      }
    }

    const labelView = this.label.subview;
    if (labelView !== null) {
      const font = theme.inner(mood, Look.font);
      if (font !== void 0) {
        if (font._style !== void 0) {
          labelView.fontStyle.setAutoState(font._style);
        }
        if (font._variant !== void 0) {
          labelView.fontVariant.setAutoState(font._variant);
        }
        if (font._weight !== void 0) {
          labelView.fontWeight.setAutoState(font._weight);
        }
        if (font._stretch !== void 0) {
          labelView.fontStretch.setAutoState(font._stretch);
        }
        if (font._size !== void 0) {
          labelView.fontSize.setAutoState(font._size);
        }
        if (font._height !== void 0) {
          labelView.lineHeight.setAutoState(font._height);
        }
        labelView.fontFamily.setAutoState(font._family);
      }
    }
  }

  protected onInputUpdate(event: InputEvent): void {
    const inputView = this.label.subview;
    if (inputView !== null) {
      this.didUpdateInput(inputView);
    }
  }

  protected didUpdateInput(inputView: HtmlView): void {
    this.didObserve(function (viewObserver: InputTokenViewObserver): void {
      if (viewObserver.tokenDidUpdateInput !== void 0) {
        viewObserver.tokenDidUpdateInput(inputView, this);
      }
    });
  }

  protected onInputChange(event: Event): void {
    const inputView = this.label.subview;
    if (inputView !== null) {
      this.didChangeInput(inputView);
    }
  }

  protected didChangeInput(inputView: HtmlView): void {
    this.didObserve(function (viewObserver: InputTokenViewObserver): void {
      if (viewObserver.tokenDidChangeInput !== void 0) {
        viewObserver.tokenDidChangeInput(inputView, this);
      }
    });
  }

  protected onInputKey(event: KeyboardEvent): void {
    const inputView = this.label.subview;
    if (inputView !== null && event.key === "Enter") {
      this.didAcceptInput(inputView);
    }
  }

  protected didAcceptInput(inputView: HtmlView): void {
    this.didObserve(function (viewObserver: InputTokenViewObserver): void {
      if (viewObserver.tokenDidAcceptInput !== void 0) {
        viewObserver.tokenDidAcceptInput(inputView, this);
      }
    });
  }
}
