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

import type {AnyTiming} from "@swim/mapping";
import {AnyPointR2, PointR2} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ViewContextType, ViewAnimator} from "@swim/view";
import {LayerView} from "../layer/LayerView";
import type {CanvasContext} from "../canvas/CanvasContext";
import {CanvasRenderer} from "../canvas/CanvasRenderer";
import type {TypesetViewInit, TypesetView} from "./TypesetView";
import {TextRun} from "./TextRun";

export type AnyTextRunView = TextRunView | TextRun | TextRunViewInit | string;

export interface TextRunViewInit extends TypesetViewInit {
  text?: string;
}

export class TextRunView extends LayerView implements TypesetView {
  initView(init: TextRunViewInit): void {
    super.initView(init);
    this.setState(init);
  }

  @ViewAnimator({type: String, state: ""})
  declare text: ViewAnimator<this, string>;

  @ViewAnimator({type: Font, state: null, inherit: true})
  declare font: ViewAnimator<this, Font | null, AnyFont | null>;

  @ViewAnimator({type: String, inherit: true})
  declare textAlign: ViewAnimator<this, CanvasTextAlign | undefined>;

  @ViewAnimator({type: String, inherit: true})
  declare textBaseline: ViewAnimator<this, CanvasTextBaseline | undefined>;

  @ViewAnimator({type: PointR2, state: null, inherit: true})
  declare textOrigin: ViewAnimator<this, PointR2 | null, AnyPointR2 | null>;

  @ViewAnimator({type: Color, state: null, inherit: true})
  declare textColor: ViewAnimator<this, Color | null, AnyColor | null>;

  get value(): TextRun {
    return new TextRun(this.text.getValue(), this.font.getValue(), this.textAlign.getValue(),
                       this.textBaseline.getValue(), this.textOrigin.getValue(), this.textColor.getValue());
  }

  get state(): TextRun {
    return new TextRun(this.text.getState(), this.font.getState(), this.textAlign.getState(),
                       this.textBaseline.getState(), this.textOrigin.getState(), this.textColor.getState());
  }

  setState(run: TextRun | TextRunViewInit | string, timing?: AnyTiming | boolean): void {
    if (typeof run === "string") {
      this.text(run, timing);
    } else {
      if (run instanceof TextRun) {
        run = run.toAny();
      }
      if (run.text !== void 0) {
        this.text(run.text, timing);
      }
      if (run.font !== void 0) {
        this.font(run.font, timing);
      }
      if (run.textAlign !== void 0) {
        this.textAlign(run.textAlign, timing);
      }
      if (run.textBaseline !== void 0) {
        this.textBaseline(run.textBaseline, timing);
      }
      if (run.textOrigin !== void 0) {
        this.textOrigin(run.textOrigin, timing);
      }
      if (run.textColor !== void 0) {
        this.textColor(run.textColor, timing);
      }
    }
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderText(context);
      context.restore();
    }
  }

  protected renderText(context: CanvasContext): void {
    const font = this.font.value;
    if (font !== null) {
      context.font = font.toString();
    }
    const textAlign = this.textAlign.value;
    if (textAlign !== void 0) {
      context.textAlign = textAlign;
    }
    const textBaseline = this.textBaseline.value;
    if (textBaseline !== void 0) {
      context.textBaseline = textBaseline;
    }
    let textOrigin = this.textOrigin.value;
    if (textOrigin === null) {
      textOrigin = PointR2.origin();
    }
    const textColor = this.textColor.value;
    if (textColor !== null) {
      context.fillStyle = textColor.toString();
    }
    context.fillText(this.text.getValue(), textOrigin.x, textOrigin.y);
  }

  static create(): TextRunView {
    return new TextRunView();
  }

  static fromText(text: string): TextRunView {
    const view = new TextRunView();
    view.text(text);
    return view;
  }

  static fromTextRun(run: TextRun): TextRunView {
    const view = new TextRunView();
    view.setState(run);
    return view;
  }

  static fromInit(init: TextRunViewInit): TextRunView {
    const view = new TextRunView();
    view.initView(init);
    return view;
  }

  static fromAny(value: AnyTextRunView): TextRunView {
    if (value instanceof TextRunView) {
      return value;
    } else if (value instanceof TextRun) {
      return this.fromTextRun(value);
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    } else if (typeof value === "string") {
      return this.fromText(value);
    } else {
      throw new TypeError("" + value);
    }
  }
}
