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
import {Length} from "@swim/math";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ViewRef} from "@swim/view";
import type {StyleSheet} from "@swim/dom";
import {StyleRule} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import {StyleView} from "@swim/dom";
import type {ToolViewObserver} from "./ToolView";
import {ToolView} from "./ToolView";

/** @public */
export interface SearchToolViewObserver<V extends SearchToolView = SearchToolView> extends ToolViewObserver<V> {
  viewWillAttachInput?(inputView: HtmlView, view: V): void;

  viewDidDetachInput?(inputView: HtmlView, view: V): void;

  viewDidUpdateSearch?(query: string, inputView: HtmlView, view: V): void;

  viewDidSubmitSearch?(query: string, inputView: HtmlView, view: V): void;

  viewDidCancelSearch?(inputView: HtmlView, view: V): void;
}

/** @public */
export class SearchToolView extends ToolView {
  protected override initTool(): void {
    super.initTool();
    this.classList.add("tool-search");
  }

  declare readonly observerType?: Class<SearchToolViewObserver>;

  @ViewRef({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    init(): void {
      this.onInput = this.onInput.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
    },
    initView(inputView: HtmlView): void {
      inputView.style.setIntrinsic({
        position: "relative",
        left: 0,
        top: 0,
        width: Length.pct(100),
        height: 30,
      });
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
      return HtmlView.fromTag("input").setIntrinsic({
        attributes: {
          type: "search",
        },
        style: {
          paddingTop: 3,
          paddingRight: 15,
          paddingBottom: 3,
          paddingLeft: 15,
          userSelect: "none",
        },
      });
    },
  })
  readonly input!: ViewRef<this, HtmlView> & {
    onInput(event: InputEvent): void,
    onKeyDown(event: KeyboardEvent): void,
  };

  @ViewRef({
    viewType: StyleView,
    viewKey: true,
    binds: true,
  })
  readonly stylesheet!: ViewRef<this, StyleView>;

  @StyleRule({
    inherits: true,
    get parent(): StyleSheet | null {
      const styleView = this.owner.stylesheet.view;
      return styleView !== null ? styleView.sheet : null;
    },
    selector: "input",
    init(): void {
      this.style.setIntrinsic({
        appearance: "none",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: Look.borderColor,
        borderRadius: 10,
        outlineWidth: 0,
        outlineStyle: "none",
        outlineColor: Color.transparent(),
        backgroundColor: Color.transparent(),
        color: Look.textColor,
      });
      this.setStyle("transition", "border 100ms ease-out");
    },
  })
  readonly inputRule!: StyleRule<this>;

  @StyleRule({
    inherits: true,
    get parent(): StyleSheet | null {
      const styleView = this.owner.stylesheet.view;
      return styleView !== null ? styleView.sheet : null;
    },
    selector: "input:focus",
    init(): void {
      this.style.setIntrinsic({
        borderWidth: 2,
        borderColor: Look.focusColor,
      });
      this.setStyle("transition", "border 100ms ease-out");
    },
  })
  readonly inputFocusRule!: StyleRule<this>;

  @StyleRule({
    inherits: true,
    get parent(): StyleSheet | null {
      const styleView = this.owner.stylesheet.view;
      return styleView !== null ? styleView.sheet : null;
    },
    selector: "input::placeholder",
    init(): void {
      this.style.color.setIntrinsic(Look.placeholderColor);
    },
  })
  readonly inputPlaceholderRule!: StyleRule<this>;

  @StyleRule({
    inherits: true,
    get parent(): StyleSheet | null {
      const styleView = this.owner.stylesheet.view;
      return styleView !== null ? styleView.sheet : null;
    },
    selector: "input::-webkit-search-cancel-button",
    init(): void {
      this.setStyle("-webkit-appearance", "none");
    },
  })
  readonly inputSearchCancelButtonRule!: StyleRule<this>;

  protected override onLayout(): void {
    super.onLayout();
    this.layoutTool();
  }

  protected layoutTool(): void {
    const inputView = this.input.view;
    if (inputView === null) {
      return;
    }
    const toolWidth = this.style.width.pxValue();
    const toolHeight = this.style.height.pxValue();
    const inputWidth = inputView.style.width.pxValue();
    const inputHeight = inputView.style.height.pxValue();
    const excessWidth = toolWidth - inputWidth;
    const excessHeight = toolHeight - inputHeight;
    inputView.style.setIntrinsic({
      left: (toolWidth !== 0 ? excessWidth : inputWidth) * this.xAlign.value,
      top: excessHeight * 0.5,
    });
    this.effectiveWidth.set(inputWidth);
  }
}
