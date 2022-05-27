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

import type {AnyTiming} from "@swim/util";
import {Animator} from "@swim/component";
import {AnyR2Point, R2Point} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {GraphicsView} from "../graphics/GraphicsView";
import type {CanvasContext} from "../canvas/CanvasContext";
import {CanvasRenderer} from "../canvas/CanvasRenderer";
import type {TypesetViewInit, TypesetView} from "./TypesetView";
import {TextRun} from "./TextRun";

/** @public */
export type AnyTextRunView = TextRunView | TextRun | TextRunViewInit | string;

/** @public */
export interface TextRunViewInit extends TypesetViewInit {
  text?: string;
}

/** @public */
export class TextRunView extends GraphicsView implements TypesetView {
  @Animator({valueType: String, value: "", updateFlags: View.NeedsRender})
  readonly text!: Animator<this, string>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({valueType: String, inherits: true, updateFlags: View.NeedsRender})
  readonly textAlign!: ThemeAnimator<this, CanvasTextAlign | undefined>;

  @ThemeAnimator({valueType: String, inherits: true, updateFlags: View.NeedsRender})
  readonly textBaseline!: ThemeAnimator<this, CanvasTextBaseline | undefined>;

  @ThemeAnimator({valueType: R2Point, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly textOrigin!: ThemeAnimator<this, R2Point | null, AnyR2Point | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

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

  protected override onRender(): void {
    super.onRender();
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer && !this.hidden && !this.culled) {
      this.renderText(renderer.context);
    }
  }

  protected renderText(context: CanvasContext): void {
    // save
    const contextFont = context.font;
    const contextTextAlign = context.textAlign;
    const contextTextBaseline = context.textBaseline;
    const contextFillStyle = context.fillStyle;

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
    const textColor = this.textColor.value;
    if (textColor !== null) {
      context.fillStyle = textColor.toString();
    }
    let textOrigin = this.textOrigin.value;
    if (textOrigin === null) {
      textOrigin = R2Point.origin();
    }
    context.fillText(this.text.getValue(), textOrigin.x, textOrigin.y);

    // restore
    context.font = contextFont;
    context.textAlign = contextTextAlign;
    context.textBaseline = contextTextBaseline;
    context.fillStyle = contextFillStyle;
  }

  override init(init: TextRun | TextRunViewInit | string): void {
    if (typeof init !== "string") {
      if (!(init instanceof TextRun)) {
        super.init(init);
      }
      this.setState(init);
    } else {
      this.text(init);
    }
  }
}
