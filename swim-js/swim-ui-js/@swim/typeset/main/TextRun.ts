// Copyright 2015-2019 SWIM.AI inc.
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
import {PointR2, BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {RenderingContext, Graphic} from "@swim/render";

export type AnyTextRun = TextRun | TextRunInit | string;

export interface TextRunInit {
  text: string;
  font?: AnyFont | null;
  textAlign?: CanvasTextAlign | null;
  textBaseline?: CanvasTextBaseline | null;
  textColor?: AnyColor | null;
}

export class TextRun implements Graphic, Equals, Debug {
  /** @hidden */
  readonly _text: string;
  /** @hidden */
  readonly _font: Font | null;
  /** @hidden */
  readonly _textAlign: CanvasTextAlign | null;
  /** @hidden */
  readonly _textBaseline: CanvasTextBaseline | null;
  /** @hidden */
  readonly _textColor: Color | null;

  constructor(text: string, font: Font | null, textAlign: CanvasTextAlign | null,
              textBaseline: CanvasTextBaseline | null, textColor: Color | null) {
    this._text = text;
    this._font = font;
    this._textAlign = textAlign;
    this._textBaseline = textBaseline;
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
        return this.copy(text, this._font, this._textAlign, this._textBaseline, this._textColor);
      }
    }
  }

  font(): Font | null;
  font(font: AnyFont | null): TextRun;
  font(font?: AnyFont | null): Font | null | TextRun {
    if (font === void 0) {
      return this._font;
    } else {
      font = font !== null ? Font.fromAny(font) : null;
      if (this._font === font) {
        return this;
      } else {
        return this.copy(this._text, font, this._textAlign, this._textBaseline, this._textColor);
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
        return this.copy(this._text, this._font, textAlign, this._textBaseline, this._textColor);
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
        return this.copy(this._text, this._font, this._textAlign, textBaseline, this._textColor);
      }
    }
  }

  textColor(): Color | null;
  textColor(textColor: AnyColor | null): TextRun;
  textColor(textColor?: AnyColor | null): Color | null | TextRun {
    if (textColor === void 0) {
      return this._textColor;
    } else {
      textColor = textColor !== null ? Color.fromAny(textColor) : null;
      if (this._textColor === textColor) {
        return this;
      } else {
        return this.copy(this._text, this._font, this._textAlign, this._textBaseline, textColor);
      }
    }
  }

  render(context: RenderingContext, bounds: BoxR2, anchor: PointR2): void {
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
    if (this._textColor !== null) {
      context.fillStyle = this._textColor.toString();
    }
    context.fillText(this._text, anchor.x, anchor.y);
    context.restore();
  }

  protected copy(text: string, font: Font | null, textAlign: CanvasTextAlign | null,
                 textBaseline: CanvasTextBaseline | null, textColor: Color | null): TextRun {
    return new TextRun(text, font, textAlign, textBaseline, textColor);
  }

  toAny(): TextRunInit {
    const init: TextRunInit = {text: this._text};
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
    if (this._textColor !== null) {
      init.textColor = this._textColor;
    }
    return init;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TextRun) {
      return this._text === that._text && Objects.equal(this._font, that._font)
          && this._textAlign === that._textAlign && this._textBaseline === that._textBaseline
          && Objects.equal(this._textColor, that._textColor) ;
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
              textColor: AnyColor | null = null): TextRun {
    font = font !== null ? Font.fromAny(font) : null;
    textColor = textColor !== null ? Color.fromAny(textColor) : null;
    return new TextRun(text, font, textAlign, textBaseline, textColor);
  }

  static fromAny(run: AnyTextRun): TextRun {
    if (run instanceof TextRun) {
      return run;
    } else if (typeof run === "object" && run) {
      return TextRun.from(run.text, run.font, run.textAlign, run.textBaseline, run.textColor);
    } else if (typeof run === "string") {
      return TextRun.from(run);
    }
    throw new TypeError("" + run);
  }
}
