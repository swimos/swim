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

import {Equals, Equivalent, Interpolate, Interpolator} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {AnyAngle, Angle, R2Box} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Feel, MoodVectorUpdates, MoodVector, MoodMatrix, ThemeMatrix} from "@swim/theme";
import type {GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {DrawingContext} from "../drawing/DrawingContext";
import {DrawingRenderer} from "../drawing/DrawingRenderer";
import type {PaintingContext} from "../painting/PaintingContext";
import {PaintingRenderer} from "../painting/PaintingRenderer";
import {FilledIcon} from "./FilledIcon";
import {PolygonIconInterpolator} from "../"; // forward import

/** @public */
export class PolygonIcon extends FilledIcon implements Interpolate<PolygonIcon>, Equals, Equivalent, Debug {
  constructor(sides: number, rotation: Angle, fillColor: Color | null,
              fillLook: Look<Color> | null, moodModifier: MoodMatrix | null) {
    super();
    this.sides = sides;
    this.rotation = rotation;
    this.fillColor = fillColor;
    this.fillLook = fillLook;
    this.moodModifier = moodModifier;
  }

  readonly sides: number;

  readonly rotation: Angle;

  override readonly fillColor: Color | null;

  override withFillColor(fillColor: Color | null): PolygonIcon {
    if (Equals(this.fillColor, fillColor)) {
      return this;
    } else {
      return this.copy(this.sides, this.rotation, fillColor,
                       this.fillLook, this.moodModifier);
    }
  }

  override readonly fillLook: Look<Color> | null;

  override withFillLook(fillLook: Look<Color> | null): PolygonIcon {
    if (this.fillLook === fillLook) {
      return this;
    } else {
      return this.copy(this.sides, this.rotation, this.fillColor,
                       fillLook, this.moodModifier);
    }
  }

  override readonly moodModifier: MoodMatrix | null;

  override withMoodModifier(moodModifier: MoodMatrix | null): PolygonIcon {
    if (Equals(this.moodModifier, moodModifier)) {
      return this;
    } else {
      return this.copy(this.sides, this.rotation, this.fillColor,
                       this.fillLook, moodModifier);
    }
  }

  override modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>): PolygonIcon {
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

  override withTheme(theme: ThemeMatrix, mood: MoodVector): PolygonIcon {
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
    context.fill();

    // restore
    context.fillStyle = contextFillStyle;
  }

  override draw(context: DrawingContext, frame: R2Box): void {
    const sides = this.sides;
    if (sides >= 3) {
      const centerX = (frame.xMin + frame.xMax) / 2;
      const centerY = (frame.yMin + frame.yMax) / 2;
      const width = frame.width;
      const height = frame.height;
      const radius = Math.min(width, height) / 2;
      const sector = 2 * Math.PI / sides;
      let angle = this.rotation.radValue();
      context.moveTo(centerX + radius * Math.cos(angle),
                     centerY + radius * Math.sin(angle));
      angle += sector;
      for (let i = 1; i < sides; i += 1) {
        context.lineTo(centerX + radius * Math.cos(angle),
                       centerY + radius * Math.sin(angle));
        angle += sector;
      }
      context.closePath();
    }
  }

  protected copy(sides: number, rotation: Angle, fillColor: Color | null,
                 fillLook: Look<Color> | null, moodModifier: MoodMatrix | null): PolygonIcon {
    return new PolygonIcon(sides, rotation, fillColor, fillLook, moodModifier);
  }

  interpolateTo(that: PolygonIcon): Interpolator<PolygonIcon>;
  interpolateTo(that: unknown): Interpolator<PolygonIcon> | null;
  interpolateTo(that: unknown): Interpolator<PolygonIcon> | null {
    if (that instanceof PolygonIcon) {
      return PolygonIconInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof PolygonIcon) {
      return this.sides === that.sides
          && this.rotation.equivalentTo(that.rotation, epsilon)
          && Equivalent(this.fillColor, that.fillColor, epsilon)
          && this.fillLook === that.fillLook
          && Equivalent(this.moodModifier, that.moodModifier, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof PolygonIcon) {
      return this.sides === that.sides
          && this.rotation.equals(that.rotation)
          && Equals(this.fillColor, that.fillColor)
          && this.fillLook === that.fillLook
          && Equals(this.moodModifier, that.moodModifier);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("new").write(32/*' '*/).write("PolygonIcon").write(40/*'('*/)
                   .debug(this.sides).write(", ")
                   .debug(this.rotation).write(", ")
                   .debug(this.fillColor).write(", ")
                   .debug(this.fillLook).write(", ")
                   .debug(this.moodModifier).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  static create(sides: number, rotation?: AnyAngle): PolygonIcon {
    if (rotation !== void 0) {
      rotation = Angle.fromAny(rotation);
    } else {
      rotation = Angle.zero();
    }
    return new PolygonIcon(sides, rotation, null, Look.accentColor, null);
  }
}
