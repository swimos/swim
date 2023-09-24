// Copyright 2015-2023 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import {Equals} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {R2PointLike} from "@swim/math";
import {R2Point} from "@swim/math";
import type {R2Box} from "@swim/math";
import type {FontLike} from "@swim/style";
import {Font} from "@swim/style";
import type {ColorLike} from "@swim/style";
import {Color} from "@swim/style";
import type {GraphicsRenderer} from "./GraphicsRenderer";
import type {Graphics} from "./Graphics";
import type {CanvasContext} from "./CanvasContext";
import {CanvasRenderer} from "./CanvasRenderer";

/** @public */
export type TextRunLike = TextRun | TextRunInit | string;

/** @public */
export interface TextRunInit {
  text: string;
  font?: FontLike;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textOrigin?: R2PointLike;
  textColor?: ColorLike;
}

/** @public */
export class TextRun implements Graphics, Equals, Debug {
  constructor(text: string, font: Font | null, textAlign: CanvasTextAlign | null,
              textBaseline: CanvasTextBaseline | null, textOrigin: R2Point | null,
              textColor: Color | null) {
    this.text = text;
    this.font = font;
    this.textAlign = textAlign;
    this.textBaseline = textBaseline;
    this.textOrigin = textOrigin;
    this.textColor = textColor;
  }

  readonly text: string;

  withText(text: string): TextRun {
    if (this.text === text) {
      return this;
    }
    return this.copy(text, this.font, this.textAlign,
                     this.textBaseline, this.textOrigin, this.textColor);
  }

  readonly font: Font | null;

  withFont(font: FontLike | null): TextRun {
    font = Font.fromLike(font);
    if (this.font === font) {
      return this;
    }
    return this.copy(this.text, font, this.textAlign,
                     this.textBaseline, this.textOrigin, this.textColor);
  }

  readonly textAlign: CanvasTextAlign | null;

  withTextAlign(textAlign: CanvasTextAlign | null): TextRun {
    if (this.textAlign === textAlign) {
      return this;
    }
    return this.copy(this.text, this.font, textAlign,
                     this.textBaseline, this.textOrigin, this.textColor);
  }

  readonly textBaseline: CanvasTextBaseline | null;

  withTextBaseline(textBaseline: CanvasTextBaseline | null): TextRun {
    if (this.textBaseline === textBaseline) {
      return this;
    }
    return this.copy(this.text, this.font, this.textAlign,
                     textBaseline, this.textOrigin, this.textColor);
  }

  readonly textOrigin: R2Point | null;

  withTextOrigin(textOrigin: R2PointLike | null): TextRun | null {
    textOrigin = R2Point.fromLike(textOrigin);
    if (Equals(this.textOrigin, textOrigin)) {
      return this;
    }
    return this.copy(this.text, this.font, this.textAlign,
                     this.textBaseline, textOrigin, this.textColor);
  }

  readonly textColor: Color | null;

  withTextColor(textColor: ColorLike | null): TextRun {
    textColor = Color.fromLike(textColor);
    if (Equals(this.textColor, textColor)) {
      return this;
    }
    return this.copy(this.text, this.font, this.textAlign,
                     this.textBaseline, this.textOrigin, textColor);
  }

  render(renderer: GraphicsRenderer, frame: R2Box): void {
    if (renderer instanceof CanvasRenderer) {
      this.draw(renderer.context, frame);
    }
  }

  draw(context: CanvasContext, frame: R2Box): void {
    this.renderText(context, frame);
  }

  protected renderText(context: CanvasContext, frame: R2Box): void {
    // save
    const contextFont = context.font;
    const contextTextAlign = context.textAlign;
    const contextTextBaseline = context.textBaseline;
    const contextFillStyle = context.fillStyle;

    if (this.font !== null) {
      context.font = this.font.toString();
    }
    if (this.textAlign !== null) {
      context.textAlign = this.textAlign;
    }
    if (this.textBaseline !== null) {
      context.textBaseline = this.textBaseline;
    }
    if (this.textColor !== null) {
      context.fillStyle = this.textColor.toString();
    }
    let textOrigin = this.textOrigin;
    if (textOrigin === null) {
      textOrigin = R2Point.origin();
    }
    context.fillText(this.text, textOrigin.x, textOrigin.y);

    // restore
    context.font = contextFont;
    context.textAlign = contextTextAlign;
    context.textBaseline = contextTextBaseline;
    context.fillStyle = contextFillStyle;
  }

  protected copy(text: string, font: Font | null, textAlign: CanvasTextAlign | null,
                 textBaseline: CanvasTextBaseline | null, textOrigin: R2Point | null,
                 textColor: Color | null): TextRun {
    return new TextRun(text, font, textAlign, textBaseline, textOrigin, textColor);
  }

  toLike(): TextRunInit {
    const init: TextRunInit = {text: this.text};
    init.text = this.text;
    if (this.font !== null) {
      init.font = this.font;
    }
    if (this.font !== null) {
      init.font = this.font;
    }
    if (this.textAlign !== null) {
      init.textAlign = this.textAlign;
    }
    if (this.textBaseline !== null) {
      init.textBaseline = this.textBaseline;
    }
    if (this.textOrigin !== null) {
      init.textOrigin = this.textOrigin;
    }
    if (this.textColor !== null) {
      init.textColor = this.textColor;
    }
    return init;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TextRun) {
      return this.text === that.text
          && Equals(this.font, that.font)
          && this.textAlign === that.textAlign
          && this.textBaseline === that.textBaseline
          && Equals(this.textOrigin, that.textOrigin)
          && Equals(this.textColor, that.textColor);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("TextRun").write(46/*'.'*/).write("create").write(40/*'('*/)
                   .debug(this.text).write(41/*')'*/);
    if (this.font !== null) {
      output = output.write(46/*'.'*/).write("font").write(40/*'('*/).debug(this.font).write(41/*')'*/);
    }
    if (this.textAlign !== null) {
      output = output.write(46/*'.'*/).write("textAlign").write(40/*'('*/).debug(this.textAlign).write(41/*')'*/);
    }
    if (this.textBaseline !== null) {
      output = output.write(46/*'.'*/).write("textBaseline").write(40/*'('*/).debug(this.textBaseline).write(41/*')'*/);
    }
    if (this.textOrigin !== null) {
      output = output.write(46/*'.'*/).write("textOrigin").write(40/*'('*/).debug(this.textOrigin).write(41/*')'*/);
    }
    if (this.textColor !== null) {
      output = output.write(46/*'.'*/).write("textColor").write(40/*'('*/).debug(this.textColor).write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  static create(text: string,
                font: FontLike | null = null,
                textAlign: CanvasTextAlign | null = null,
                textBaseline: CanvasTextBaseline | null = null,
                textOrigin: R2PointLike | null = null,
                textColor: ColorLike | null = null): TextRun {
    font = Font.fromLike(font);
    textOrigin = R2Point.fromLike(textOrigin);
    textColor = Color.fromLike(textColor);
    return new TextRun(text, font, textAlign, textBaseline, textOrigin, textColor);
  }

  static fromLike<T extends TextRunLike | null | undefined>(value: T): TextRun | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof TextRun) {
      return value as TextRun | Uninitable<T>;
    } else if (typeof value === "string") {
      return TextRun.create(value);
    } else if (typeof value === "object") {
      return TextRun.create(value.text, value.font, value.textAlign, value.textBaseline,
                            value.textOrigin, value.textColor);
    }
    throw new TypeError("" + value);
  }
}
