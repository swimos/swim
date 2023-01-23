// Copyright 2015-2023 Swim.inc
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
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ViewRef} from "@swim/view";
import {StyleRule, HtmlView, StyleView} from "@swim/dom";
import {ToolView} from "./ToolView";
import type {SearchToolViewObserver} from "./SearchToolViewObserver";

/** @public */
export class SearchToolView extends ToolView {
  protected override initTool(): void {
    super.initTool();
    this.addClass("tool-search");
  }

  override readonly observerType?: Class<SearchToolViewObserver>;

  @ViewRef<SearchToolView["input"]>({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    init(): void {
      this.onInput = this.onInput.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
    },
    initView(inputView: HtmlView): void {
      inputView.position.setState("relative", Affinity.Intrinsic);
      inputView.left.setState(0, Affinity.Intrinsic);
      inputView.top.setState(0, Affinity.Intrinsic);
      inputView.width.setState(Length.pct(100), Affinity.Intrinsic);
      inputView.height.setState(30, Affinity.Intrinsic);
    },
    willAttachView(inputView: HtmlView): void {
      this.owner.callObservers("viewWillAttachInput", inputView, this.owner);
    },
    didDetachView(inputView: HtmlView): void {
      this.owner.callObservers("viewDidDetachInput", inputView, this.owner);
    },
    didAttachView(inputView: HtmlView): void {
      inputView.addEventListener("input", this.onInput as EventListener);
      inputView.addEventListener("keydown", this.onKeyDown);
    },
    willDetachView(inputView: HtmlView): void {
      inputView.removeEventListener("input", this.onInput as EventListener);
      inputView.removeEventListener("keydown", this.onKeyDown);
    },
    onInput(event: InputEvent): void {
      const inputView = this.view;
      if (inputView !== null) {
        const query = (inputView.node as HTMLInputElement).value;
        this.owner.callObservers("viewDidUpdateSearch", query, inputView, this.owner);
      }
    },
    onKeyDown(event: KeyboardEvent): void {
      const inputView = this.view;
      if (inputView !== null) {
        if (event.key === "Enter") {
          const query = (inputView.node as HTMLInputElement).value;
          this.owner.callObservers("viewDidSubmitSearch", query, inputView, this.owner);
        } else if (event.key === "Escape") {
          this.owner.callObservers("viewDidCancelSearch", inputView, this.owner);
        }
      }
    },
    createView(): HtmlView {
      const inputView = HtmlView.fromTag("input");
      inputView.type.setState("search", Affinity.Intrinsic);
      inputView.paddingTop.setState(3, Affinity.Intrinsic);
      inputView.paddingRight.setState(15, Affinity.Intrinsic);
      inputView.paddingBottom.setState(3, Affinity.Intrinsic);
      inputView.paddingLeft.setState(15, Affinity.Intrinsic);
      inputView.userSelect.setState("auto", Affinity.Intrinsic);
      return inputView;
    },
  })
  readonly input!: ViewRef<this, HtmlView> & {
    onInput(event: InputEvent): void,
    onKeyDown(event: KeyboardEvent): void,
  };
  static readonly input: FastenerClass<SearchToolView["input"]>;

  @ViewRef<SearchToolView["stylesheet"]>({
    viewType: StyleView,
    viewKey: true,
    binds: true,
    initView(styleView: StyleView): void {
      const sheet = styleView.sheet;
      sheet.setFastener("input", SearchToolView.InputRule.create(sheet));
      sheet.setFastener("inputFocus", SearchToolView.InputFocusRule.create(sheet));
      sheet.setFastener("inputPlaceholder", SearchToolView.InputPlaceholderRule.create(sheet));
      sheet.setFastener("inputSearchCancelButton", SearchToolView.InputSearchCancelButtonRule.create(sheet));
    },
  })
  readonly stylesheet!: ViewRef<this, StyleView>;
  static readonly stylesheet: FastenerClass<SearchToolView["stylesheet"]>;

  /** @internal */
  static InputRule = StyleRule.define("InputRule", {
    css: "input {"
       + "  transition: border 100ms ease-out;"
       + "}",
    init(): void {
      this.appearance.setState("none", Affinity.Intrinsic);
      this.borderTopWidth.setState(1, Affinity.Intrinsic);
      this.borderTopStyle.setState("solid", Affinity.Intrinsic);
      this.borderTopColor.setLook(Look.borderColor, Affinity.Intrinsic);
      this.borderRightWidth.setState(1, Affinity.Intrinsic);
      this.borderRightStyle.setState("solid", Affinity.Intrinsic);
      this.borderRightColor.setLook(Look.borderColor, Affinity.Intrinsic);
      this.borderBottomWidth.setState(1, Affinity.Intrinsic);
      this.borderBottomStyle.setState("solid", Affinity.Intrinsic);
      this.borderBottomColor.setLook(Look.borderColor, Affinity.Intrinsic);
      this.borderLeftWidth.setState(1, Affinity.Intrinsic);
      this.borderLeftStyle.setState("solid", Affinity.Intrinsic);
      this.borderLeftColor.setLook(Look.borderColor, Affinity.Intrinsic);
      this.borderTopLeftRadius.setState(10, Affinity.Intrinsic);
      this.borderTopRightRadius.setState(10, Affinity.Intrinsic);
      this.borderBottomLeftRadius.setState(10, Affinity.Intrinsic);
      this.borderBottomRightRadius.setState(10, Affinity.Intrinsic);
      this.outlineWidth.setState(0, Affinity.Intrinsic);
      this.outlineStyle.setState("none", Affinity.Intrinsic);
      this.outlineColor.setState(Color.transparent(), Affinity.Intrinsic);
      this.backgroundColor.setState(Color.transparent(), Affinity.Intrinsic);
      this.color.setLook(Look.textColor, Affinity.Intrinsic);
    },
  });

  /** @internal */
  static InputFocusRule = StyleRule.define("InputFocusRule", {
    css: "input:focus {"
       + "  transition: border 100ms ease-out;"
       + "}",
    init(): void {
      this.borderTopWidth.setState(2, Affinity.Intrinsic);
      this.borderTopColor.setLook(Look.focusColor, Affinity.Intrinsic);
      this.borderRightWidth.setState(2, Affinity.Intrinsic);
      this.borderRightColor.setLook(Look.focusColor, Affinity.Intrinsic);
      this.borderBottomWidth.setState(2, Affinity.Intrinsic);
      this.borderBottomColor.setLook(Look.focusColor, Affinity.Intrinsic);
      this.borderLeftWidth.setState(2, Affinity.Intrinsic);
      this.borderLeftColor.setLook(Look.focusColor, Affinity.Intrinsic);
    },
  });

  /** @internal */
  static InputPlaceholderRule = StyleRule.define("InputPlaceholderRule", {
    css: "input::placeholder {}",
    init(): void {
      this.color.setLook(Look.placeholderColor, Affinity.Intrinsic);
    },
  });

  /** @internal */
  static InputSearchCancelButtonRule = StyleRule.define("InputSearchCancelButtonRule", {
    css: "input::-webkit-search-cancel-button {"
       + "  -webkit-appearance: none;"
       + "}",
  });

  protected override onLayout(): void {
    super.onLayout();
    this.layoutTool();
  }

  protected layoutTool(): void {
    const inputView = this.input.view;
    if (inputView !== null) {
      const toolWidth = this.width.pxValue();
      const toolHeight = this.height.pxValue();
      const inputWidth = inputView.width.pxValue();
      const inputHeight = inputView.height.pxValue();
      const excessWidth = toolWidth - inputWidth;
      const excessHeight = toolHeight - inputHeight;
      const xAlign = this.xAlign.value;
      if (toolWidth !== 0) {
        inputView.left.setState(excessWidth * xAlign, Affinity.Intrinsic);
      } else {
        inputView.left.setState(inputWidth * xAlign, Affinity.Intrinsic);
      }
      inputView.top.setState(excessHeight * 0.5, Affinity.Intrinsic);
      this.effectiveWidth.setValue(inputWidth);
    }
  }
}
