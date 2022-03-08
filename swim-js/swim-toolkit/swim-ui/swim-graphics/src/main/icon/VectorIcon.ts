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

import {Equals, Equivalent, Interpolate, Interpolator} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {AnyR2Path, R2Path, R2Box, Transform} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Feel, MoodVectorUpdates, MoodVector, MoodMatrix, ThemeMatrix} from "@swim/theme";
import type {GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {DrawingContext} from "../drawing/DrawingContext";
import {DrawingRenderer} from "../drawing/DrawingRenderer";
import type {PaintingFillRule, PaintingContext} from "../painting/PaintingContext";
import {PaintingRenderer} from "../painting/PaintingRenderer";
import {FilledIcon} from "./FilledIcon";
import {VectorIconInterpolator} from "../"; // forward import

/** @public */
export class VectorIcon extends FilledIcon implements Interpolate<VectorIcon>, Equals, Equivalent, Debug {
  constructor(path: R2Path, fillRule: PaintingFillRule, fillColor: Color | null,
              fillLook: Look<Color> | null, moodModifier: MoodMatrix | null) {
    super();
    this.path = path;
    this.fillRule = fillRule;
    this.fillColor = fillColor;
    this.fillLook = fillLook;
    this.moodModifier = moodModifier;
  }

  readonly path: R2Path;

  readonly fillRule: PaintingFillRule;

  withFillRule(fillRule: PaintingFillRule): VectorIcon {
    if (Equals(this.fillRule, fillRule)) {
      return this;
    } else {
      return this.copy(this.path, fillRule, this.fillColor,
                       this.fillLook, this.moodModifier);
    }
  }

  override readonly fillColor: Color | null;

  override withFillColor(fillColor: Color | null): VectorIcon {
    if (Equals(this.fillColor, fillColor)) {
      return this;
    } else {
      return this.copy(this.path, this.fillRule, fillColor,
                       this.fillLook, this.moodModifier);
    }
  }

  override readonly fillLook: Look<Color> | null;

  override withFillLook(fillLook: Look<Color> | null): VectorIcon {
    if (this.fillLook === fillLook) {
      return this;
    } else {
      return this.copy(this.path, this.fillRule, this.fillColor,
                       fillLook, this.moodModifier);
    }
  }

  override readonly moodModifier: MoodMatrix | null;

  override withMoodModifier(moodModifier: MoodMatrix | null): VectorIcon {
    if (Equals(this.moodModifier, moodModifier)) {
      return this;
    } else {
      return this.copy(this.path, this.fillRule, this.fillColor,
                       this.fillLook, moodModifier);
    }
  }

  override modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>): VectorIcon {
    let oldMoodModifier = this.moodModifier;
    if (oldMoodModifier === null) {
      oldMoodModifier = MoodMatrix.empty();
    }
    const newMoodModifier = oldMoodModifier.updatedCol(feel, updates, true);
    if (!newMoodModifier.equals(oldMoodModifier)) {
      return this.withMoodModifier(newMoodModifier);
    } else {
      return this;
    }
  }

  override isThemed(): boolean {
    return this.fillColor !== null;
  }

  override withTheme(theme: ThemeMatrix, mood: MoodVector): VectorIcon {
    const fillLook = this.fillLook;
    if (fillLook !== null) {
      const moodModifier = this.moodModifier;
      if (moodModifier !== null) {
        mood = moodModifier.timesCol(mood, true);
      }
      return this.withFillColor(theme.getOr(fillLook, mood, null));
    } else {
      return this;
    }
  }

  override render(renderer: GraphicsRenderer, frame: R2Box): void {
    if (renderer instanceof PaintingRenderer) {
      this.paint(renderer.context, frame);
    } else if (renderer instanceof DrawingRenderer) {
      this.draw(renderer.context, frame);
    }
  }

  override paint(context: PaintingContext, frame: R2Box): void {
    // save
    const contextFillStyle = context.fillStyle;

    context.beginPath();
    this.draw(context, frame);
    if (this.fillColor !== null) {
      context.fillStyle = this.fillColor.toString();
    }
    context.fill(this.fillRule);

    // restore
    context.fillStyle = contextFillStyle;
  }

  override draw(context: DrawingContext, frame: R2Box): void {
    const transform = Transform.scale(frame.width, frame.height).translate(frame.x, frame.y);
    this.path.transformDraw(context, transform);
  }

  protected copy(path: R2Path, fillRule: PaintingFillRule, fillColor: Color | null,
                 fillLook: Look<Color> | null, moodModifier: MoodMatrix | null): VectorIcon {
    return new VectorIcon(path, fillRule, fillColor, fillLook, moodModifier);
  }

  interpolateTo(that: VectorIcon): Interpolator<VectorIcon>;
  interpolateTo(that: unknown): Interpolator<VectorIcon> | null;
  interpolateTo(that: unknown): Interpolator<VectorIcon> | null {
    if (that instanceof VectorIcon) {
      return VectorIconInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof VectorIcon) {
      return this.path.equivalentTo(that.path, epsilon)
          && this.fillRule === that.fillRule
          && Equivalent(this.fillColor, that.fillColor, epsilon)
          && this.fillLook === that.fillLook
          && Equivalent(this.moodModifier, that.moodModifier, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof VectorIcon) {
      return this.path.equals(that.path)
          && this.fillRule === that.fillRule
          && Equals(this.fillColor, that.fillColor)
          && this.fillLook === that.fillLook
          && Equals(this.moodModifier, that.moodModifier);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("new").write(32/*' '*/).write("VectorIcon").write(40/*'('*/)
                   .debug(this.path).write(", ")
                   .debug(this.fillRule).write(", ")
                   .debug(this.fillColor).write(", ")
                   .debug(this.fillLook).write(", ")
                   .debug(this.moodModifier).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  static create(width: number, height: number, path: AnyR2Path,
                fillRule?: PaintingFillRule): VectorIcon {
    path = R2Path.fromAny(path);
    if (width !== 1 || height !== 1) {
      path = path.transform(Transform.scale(1 / width, 1 / height));
    }
    if (fillRule === void 0) {
      fillRule = "nonzero";
    }
    return new VectorIcon(path, fillRule, null, Look.iconColor, null);
  }
}
