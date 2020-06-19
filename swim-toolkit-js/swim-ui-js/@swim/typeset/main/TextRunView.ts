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

import {AnyPointR2, PointR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {Tween} from "@swim/transition";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  ViewAnimator,
  GraphicsViewContext,
  GraphicsViewController,
  GraphicsLeafView,
  TypesetViewInit,
  TypesetView,
} from "@swim/view";
import {TextRun} from "./TextRun";

export type AnyTextRunView = TextRunView | TextRun | TextRunViewInit | string;

export interface TextRunViewInit extends TypesetViewInit {
  text?: string;
}

export class TextRunView extends GraphicsLeafView implements TypesetView {
  get viewController(): GraphicsViewController<TextRunView> | null {
    return this._viewController;
  }

  @ViewAnimator(String, {value: ""})
  text: ViewAnimator<this, string>;

  @ViewAnimator(Font, {inherit: true})
  font: ViewAnimator<this, Font, AnyFont>;

  @ViewAnimator(String, {inherit: true})
  textAlign: ViewAnimator<this, CanvasTextAlign>;

  @ViewAnimator(String, {inherit: true})
  textBaseline: ViewAnimator<this, CanvasTextBaseline>;

  @ViewAnimator(PointR2, {inherit: true})
  textOrigin: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator(Color, {inherit: true})
  textColor: ViewAnimator<this, Color, AnyColor>;

  get value(): TextRun {
    return new TextRun(this.text.value!, this.font.value!, this.textAlign.value!,
                       this.textBaseline.value!, this.textOrigin.value!, this.textColor.value!);
  }

  get state(): TextRun {
    return new TextRun(this.text.state!, this.font.state!, this.textAlign.state!,
                       this.textBaseline.state!, this.textOrigin.state!, this.textColor.state!);
  }

  setState(run: TextRun | TextRunViewInit | string, tween?: Tween<any>): void {
    if (typeof run === "string") {
      this.text(run, tween);
    } else {
      if (run instanceof TextRun) {
        run = run.toAny();
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
      if (run.textOrigin !== void 0) {
        this.textOrigin(run.textOrigin, tween);
      }
      if (run.textColor !== void 0) {
        this.textColor(run.textColor, tween);
      }
      if (run.hidden !== void 0) {
        this.setHidden(run.hidden);
      }
      if (run.culled !== void 0) {
        this.setCulled(run.culled);
      }
    }
  }

  protected onRender(viewContext: GraphicsViewContext): void {
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
    if (font !== void 0) {
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
    if (textOrigin === void 0) {
      textOrigin = PointR2.origin();
    }
    const textColor = this.textColor.value;
    if (textColor !== void 0) {
      context.fillStyle = textColor.toString();
    }
    context.fillText(this.text.value!, textOrigin.x, textOrigin.y);
  }

  static fromAny(run: AnyTextRunView): TextRunView {
    if (run instanceof TextRunView) {
      return run;
    } else if (typeof run === "string" || typeof run === "object" && run !== null) {
      const view = new TextRunView();
      view.setState(run);
      return view;
    }
    throw new TypeError("" + run);
  }
}
