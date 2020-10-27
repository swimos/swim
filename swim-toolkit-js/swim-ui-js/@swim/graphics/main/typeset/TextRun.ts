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

import {Equals, Objects} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {AnyPointR2, PointR2, BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {Renderer, CanvasContext, CanvasRenderer, Graphics} from "@swim/render";

export type AnyTextRun = TextRun | TextRunInit | string;

export interface TextRunInit {
  text: string;
  font?: AnyFont;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textOrigin?: AnyPointR2;
  textColor?: AnyColor;
}

export class TextRun implements Graphics, Equals, Debug {
  /** @hidden */
  readonly _text: string;
  /** @hidden */
  readonly _font: Font | null;
  /** @hidden */
  readonly _textAlign: CanvasTextAlign | null;
  /** @hidden */
  readonly _textBaseline: CanvasTextBaseline | null;
  /** @hidden */
  readonly _textOrigin: PointR2 | null;
  /** @hidden */
  readonly _textColor: Color | null;

  constructor(text: string, font: Font | null, textAlign: CanvasTextAlign | null,
              textBaseline: CanvasTextBaseline | null, textOrigin: PointR2 | null,
              textColor: Color | null) {
    this._text = text;
    this._font = font;
    this._textAlign = textAlign;
    this._textBaseline = textBaseline;
    this._textOrigin = textOrigin;
    this._textColor = textColor;
  }

  text(): string;
  text(text: string): TextRun;
  text(text?: string): string | TextRun {
    if (text === void 0) {
      return this._text;
    } else {
      if (this._text === text) {
        return this;
      } else {
        return this.copy(text, this._font, this._textAlign,
                         this._textBaseline, this._textOrigin, this._textColor);
      }
    }
  }

  font(): Font | null;
  font(font: AnyFont | null): TextRun;
  font(font?: AnyFont | null): Font | null | TextRun {
    if (font === void 0) {
      return this._font;
    } else {
      if (font !== null) {
        font = Font.fromAny(font);
      }
      if (this._font === font) {
        return this;
      } else {
        return this.copy(this._text, font, this._textAlign,
                         this._textBaseline, this._textOrigin, this._textColor);
      }
    }
  }

  textAlign(): CanvasTextAlign | null;
  textAlign(textAlign: CanvasTextAlign | null): TextRun;
  textAlign(textAlign?: CanvasTextAlign | null): CanvasTextAlign | null | TextRun {
    if (textAlign === void 0) {
      return this._textAlign;
    } else {
      if (this._textAlign === textAlign) {
        return this;
      } else {
        return this.copy(this._text, this._font, textAlign,
                         this._textBaseline, this._textOrigin, this._textColor);
      }
    }
  }

  textBaseline(): CanvasTextBaseline | null;
  textBaseline(textBaseline: CanvasTextBaseline | null): TextRun;
  textBaseline(textBaseline?: CanvasTextBaseline | null): CanvasTextBaseline | null | TextRun {
    if (textBaseline === void 0) {
      return this._textBaseline;
    } else {
      if (this._textBaseline === textBaseline) {
        return this;
      } else {
        return this.copy(this._text, this._font, this._textAlign,
                         textBaseline, this._textOrigin, this._textColor);
      }
    }
  }

  textOrigin(): PointR2 | null;
  textOrigin(textOrigin: AnyPointR2 | null): TextRun | null;
  textOrigin(textOrigin?: AnyPointR2 | null): PointR2 | null | TextRun {
    if (textOrigin === void 0) {
      return this._textOrigin;
    } else {
      if (textOrigin !== null) {
        textOrigin = PointR2.fromAny(textOrigin);
      }
      if (Objects.equal(this._textOrigin, textOrigin)) {
        return this;
      } else {
        return this.copy(this._text, this._font, this._textAlign,
                         this._textBaseline, textOrigin as PointR2, this._textColor);
      }
    }
  }

  textColor(): Color | null;
  textColor(textColor: AnyColor | null): TextRun;
  textColor(textColor?: AnyColor | null): Color | null | TextRun {
    if (textColor === void 0) {
      return this._textColor;
    } else {
      if (textColor !== null) {
        textColor = Color.fromAny(textColor);
      }
      if (Objects.equal(this._textColor, textColor)) {
        return this;
      } else {
        return this.copy(this._text, this._font, this._textAlign,
                         this._textBaseline, this._textOrigin, textColor);
      }
    }
  }

  render(renderer: Renderer, frame: BoxR2): void {
    if (renderer instanceof CanvasRenderer) {
      this.draw(renderer.context, frame);
    }
  }

  draw(context: CanvasContext, frame: BoxR2) {
    this.renderText(context, frame);
  }

  protected renderText(context: CanvasContext, frame: BoxR2): void {
    context.save();
    if (this._font !== null) {
      context.font = this._font.toString();
    }
    if (this._textAlign !== null) {
      context.textAlign = this._textAlign;
    }
    if (this._textBaseline !== null) {
      context.textBaseline = this._textBaseline;
    }
    let textOrigin = this._textOrigin;
    if (textOrigin === null) {
      textOrigin = PointR2.origin();
    }
    if (this._textColor !== null) {
      context.fillStyle = this._textColor.toString();
    }
    context.fillText(this._text, textOrigin.x, textOrigin.y);
    context.restore();
  }

  protected copy(text: string, font: Font | null, textAlign: CanvasTextAlign | null,
                 textBaseline: CanvasTextBaseline | null, textOrigin: PointR2 | null,
                 textColor: Color | null): TextRun {
    return new TextRun(text, font, textAlign, textBaseline, textOrigin, textColor);
  }

  toAny(): TextRunInit {
    const init: TextRunInit = {text: this._text};
    init.text = this._text;
    if (this._font !== null) {
      init.font = this._font;
    }
    if (this._font !== null) {
      init.font = this._font;
    }
    if (this._textAlign !== null) {
      init.textAlign = this._textAlign;
    }
    if (this._textBaseline !== null) {
      init.textBaseline = this._textBaseline;
    }
    if (this._textOrigin !== null) {
      init.textOrigin = this._textOrigin;
    }
    if (this._textColor !== null) {
      init.textColor = this._textColor;
    }
    return init;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TextRun) {
      return this._text === that._text
          && Objects.equal(this._font, that._font)
          && this._textAlign === that._textAlign
          && this._textBaseline === that._textBaseline
          && Objects.equal(this._textOrigin, that._textOrigin)
          && Objects.equal(this._textColor, that._textColor);
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("TextRun").write(46/*'.'*/).write("from").write(40/*'('*/)
        .debug(this._text).write(41/*')'*/);
    if (this._font !== null) {
      output = output.write(46/*'.'*/).write("font").write(40/*'('*/).debug(this._font).write(41/*')'*/);
    }
    if (this._textAlign !== null) {
      output = output.write(46/*'.'*/).write("textAlign").write(40/*'('*/).debug(this._textAlign).write(41/*')'*/);
    }
    if (this._textBaseline !== null) {
      output = output.write(46/*'.'*/).write("textBaseline").write(40/*'('*/).debug(this._textBaseline).write(41/*')'*/);
    }
    if (this._textOrigin !== null) {
      output = output.write(46/*'.'*/).write("textOrigin").write(40/*'('*/).debug(this._textOrigin).write(41/*')'*/);
    }
    if (this._textColor !== null) {
      output = output.write(46/*'.'*/).write("textColor").write(40/*'('*/).debug(this._textColor).write(41/*')'*/);
    }
  }

  toString(): string {
    return Format.debug(this);
  }

  static from(text: string,
              font: AnyFont | null = null,
              textAlign: CanvasTextAlign | null = null,
              textBaseline: CanvasTextBaseline | null = null,
              textOrigin: AnyPointR2 | null = null,
              textColor: AnyColor | null = null): TextRun {
    if (font !== null) {
      font = Font.fromAny(font);
    }
    if (textOrigin !== null) {
      textOrigin = PointR2.fromAny(textOrigin);
    }
    if (textColor !== null) {
      textColor = Color.fromAny(textColor);
    }
    return new TextRun(text, font, textAlign, textBaseline, textOrigin as PointR2, textColor);
  }

  static fromAny(run: AnyTextRun): TextRun {
    if (run instanceof TextRun) {
      return run;
    } else if (typeof run === "string") {
      return TextRun.from(run);
    } else if (typeof run === "object" && run !== null) {
      return TextRun.from(run.text, run.font, run.textAlign, run.textBaseline,
                          run.textOrigin, run.textColor);
    }
    throw new TypeError("" + run);
  }
}
