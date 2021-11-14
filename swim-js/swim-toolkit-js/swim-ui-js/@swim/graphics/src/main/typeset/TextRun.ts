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

import {Equals} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import type {GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {Graphics} from "../graphics/Graphics";
import type {CanvasContext} from "../canvas/CanvasContext";
import {CanvasRenderer} from "../canvas/CanvasRenderer";

/** @public */
export type AnyTextRun = TextRun | TextRunInit | string;

/** @public */
export interface TextRunInit {
  text: string;
  font?: AnyFont;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textOrigin?: AnyR2Point;
  textColor?: AnyColor;
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
    } else {
      return this.copy(text, this.font, this.textAlign,
                       this.textBaseline, this.textOrigin, this.textColor);
    }
  }

  readonly font: Font | null;

  withFont(font: AnyFont | null): TextRun {
    if (font !== null) {
      font = Font.fromAny(font);
    }
    if (this.font === font) {
      return this;
    } else {
      return this.copy(this.text, font, this.textAlign,
                       this.textBaseline, this.textOrigin, this.textColor);
    }
  }

  readonly textAlign: CanvasTextAlign | null;

  withTextAlign(textAlign: CanvasTextAlign | null): TextRun {
    if (this.textAlign === textAlign) {
      return this;
    } else {
      return this.copy(this.text, this.font, textAlign,
                       this.textBaseline, this.textOrigin, this.textColor);
    }
  }

  readonly textBaseline: CanvasTextBaseline | null;

  withTextBaseline(textBaseline: CanvasTextBaseline | null): TextRun {
    if (this.textBaseline === textBaseline) {
      return this;
    } else {
      return this.copy(this.text, this.font, this.textAlign,
                       textBaseline, this.textOrigin, this.textColor);
    }
  }

  readonly textOrigin: R2Point | null;

  withTextOrigin(textOrigin: AnyR2Point | null): TextRun | null {
    if (textOrigin !== null) {
      textOrigin = R2Point.fromAny(textOrigin);
    }
    if (Equals(this.textOrigin, textOrigin)) {
      return this;
    } else {
      return this.copy(this.text, this.font, this.textAlign,
                       this.textBaseline, textOrigin as R2Point, this.textColor);
    }
  }

  readonly textColor: Color | null;

  withTextColor(textColor: AnyColor | null): TextRun {
    if (textColor !== null) {
      textColor = Color.fromAny(textColor);
    }
    if (Equals(this.textColor, textColor)) {
      return this;
    } else {
      return this.copy(this.text, this.font, this.textAlign,
                       this.textBaseline, this.textOrigin, textColor);
    }
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

  toAny(): TextRunInit {
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
                font: AnyFont | null = null,
                textAlign: CanvasTextAlign | null = null,
                textBaseline: CanvasTextBaseline | null = null,
                textOrigin: AnyR2Point | null = null,
                textColor: AnyColor | null = null): TextRun {
    if (font !== null) {
      font = Font.fromAny(font);
    }
    if (textOrigin !== null) {
      textOrigin = R2Point.fromAny(textOrigin);
    }
    if (textColor !== null) {
      textColor = Color.fromAny(textColor);
    }
    return new TextRun(text, font, textAlign, textBaseline, textOrigin as R2Point, textColor);
  }

  static fromAny(value: AnyTextRun): TextRun {
    if (value instanceof TextRun) {
      return value;
    } else if (typeof value === "string") {
      return TextRun.create(value);
    } else if (typeof value === "object" && value !== null) {
      return TextRun.create(value.text, value.font, value.textAlign, value.textBaseline,
                            value.textOrigin, value.textColor);
    }
    throw new TypeError("" + value);
  }
}
