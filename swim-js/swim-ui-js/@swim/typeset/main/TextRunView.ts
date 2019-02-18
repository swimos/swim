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

import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {Tween} from "@swim/transition";
import {RenderingContext} from "@swim/render";
import {
  MemberAnimator,
  ViewInit,
  TypesetViewInit,
  TypesetView,
  GraphicView,
  GraphicViewController,
} from "@swim/view";
import {TextRun} from "./TextRun";

export type AnyTextRunView = TextRunView | TextRun | TextRunViewInit | string;

export interface TextRunViewInit extends ViewInit, TypesetViewInit {
  text?: string;
}

export class TextRunView extends GraphicView implements TypesetView {
  /** @hidden */
  _viewController: GraphicViewController<TextRunView> | null;

  constructor(text: string = "") {
    super();
    this.text.setState(text);
  }

  get viewController(): GraphicViewController<TextRunView> | null {
    return this._viewController;
  }

  @MemberAnimator(String)
  text: MemberAnimator<this, string>;

  @MemberAnimator(Font, "inherit")
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(String, "inherit")
  textAlign: MemberAnimator<this, CanvasTextAlign>;

  @MemberAnimator(String, "inherit")
  textBaseline: MemberAnimator<this, CanvasTextBaseline>;

  @MemberAnimator(Color, "inherit")
  textColor: MemberAnimator<this, Color, AnyColor>;

  get value(): TextRun {
    return new TextRun(this.text.value!, this.font.value!, this.textAlign.value!,
                       this.textBaseline.value!, this.textColor.value!);
  }

  get state(): TextRun {
    return new TextRun(this.text.state!, this.font.state!, this.textAlign.state!,
                       this.textBaseline.state!, this.textColor.state!);
  }

  setState(run: TextRun | TextRunViewInit | string, tween?: Tween<any>): void {
    if (typeof run === "string") {
      this.text(run, tween);
    } else {
      if (run instanceof TextRun) {
        run = run.toAny();
      }
      if (run.key !== void 0) {
        this.key(run.key);
      }
      if (run.text !== void 0) {
        this.text(run.text, tween);
      }
      if (run.font !== void 0) {
        this.font(run.font, tween);
      }
      if (run.textAlign !== void 0) {
        this.textAlign(run.textAlign, tween);
      }
      if (run.textBaseline !== void 0) {
        this.textBaseline(run.textBaseline, tween);
      }
      if (run.textColor !== void 0) {
        this.textColor(run.textColor, tween);
      }
    }
  }

  protected onAnimate(t: number): void {
    this.text.onFrame(t);
    this.font.onFrame(t);
    this.textAlign.onFrame(t);
    this.textBaseline.onFrame(t);
    this.textColor.onFrame(t);
  }

  protected onRender(context: RenderingContext): void {
    context.save();
    const anchor = this._anchor;
    const font = this.font.value;
    if (font) {
      context.font = font.toString();
    }
    const textAlign = this.textAlign.value;
    if (textAlign) {
      context.textAlign = textAlign;
    }
    const textBaseline = this.textBaseline.value;
    if (textBaseline) {
      context.textBaseline = textBaseline;
    }
    const textColor = this.textColor.value;
    if (textColor) {
      context.fillStyle = textColor.toString();
    }
    context.fillText(this.text.value!, anchor.x, anchor.y);
    context.restore();
  }

  static fromAny(run: AnyTextRunView): TextRunView {
    if (run instanceof TextRunView) {
      return run;
    } else if (typeof run === "object" && run) {
      const view = new TextRunView();
      view.setState(run);
      return view;
    } else if (typeof run === "string") {
      return new TextRunView(run);
    }
    throw new TypeError("" + run);
  }
}
