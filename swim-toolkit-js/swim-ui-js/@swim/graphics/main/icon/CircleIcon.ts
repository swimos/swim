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

import {Equals, Equivalent, Lazy} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import type {BoxR2} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Feel, MoodVectorUpdates, MoodVector, MoodMatrix, ThemeMatrix} from "@swim/theme";
import type {GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {DrawingContext} from "../drawing/DrawingContext";
import {DrawingRenderer} from "../drawing/DrawingRenderer";
import type {PaintingContext} from "../painting/PaintingContext";
import {PaintingRenderer} from "../painting/PaintingRenderer";
import {FilledIcon} from "./FilledIcon";
import {CircleIconInterpolator} from "../"; // forward import

export class CircleIcon extends FilledIcon implements Interpolate<CircleIcon>, Equals, Equivalent, Debug {
  constructor(fillColor: Color | null, fillLook: Look<Color> | null, moodModifier: MoodMatrix | null) {
    super();
    Object.defineProperty(this, "fillColor", {
      value: fillColor,
      enumerable: true,
    });
    Object.defineProperty(this, "fillLook", {
      value: fillLook,
      enumerable: true,
    });
    Object.defineProperty(this, "moodModifier", {
      value: moodModifier,
      enumerable: true,
    });
  }

  declare readonly fillColor: Color | null;

  withFillColor(fillColor: Color | null): CircleIcon {
    if (Equals(this.fillColor, fillColor)) {
      return this;
    } else {
      return this.copy(fillColor, this.fillLook, this.moodModifier);
    }
  }

  declare readonly fillLook: Look<Color> | null;

  withFillLook(fillLook: Look<Color> | null): CircleIcon {
    if (this.fillLook === fillLook) {
      return this;
    } else {
      return this.copy(this.fillColor, fillLook, this.moodModifier);
    }
  }

  declare readonly moodModifier: MoodMatrix | null;

  withMoodModifier(moodModifier: MoodMatrix | null): CircleIcon {
    if (Equals(this.moodModifier, moodModifier)) {
      return this;
    } else {
      return this.copy(this.fillColor, this.fillLook, moodModifier);
    }
  }

  modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>): CircleIcon {
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

  isThemed(): boolean {
    return this.fillColor !== null;
  }

  withTheme(theme: ThemeMatrix, mood: MoodVector): CircleIcon {
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

  render(renderer: GraphicsRenderer, frame: BoxR2): void {
    if (renderer instanceof PaintingRenderer) {
      this.paint(renderer.context, frame);
    } else if (renderer instanceof DrawingRenderer) {
      this.draw(renderer.context, frame);
    }
  }

  paint(context: PaintingContext, frame: BoxR2): void {
    context.beginPath();
    this.draw(context, frame);
    if (this.fillColor !== null) {
      context.fillStyle = this.fillColor.toString();
    }
    context.fill();
  }

  draw(context: DrawingContext, frame: BoxR2): void {
    const centerX = (frame.xMin + frame.xMax) / 2;
    const centerY = (frame.yMin + frame.yMax) / 2;
    const width = frame.width;
    const height = frame.height;
    const radius = Math.min(width, height) / 2;
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.closePath();
  }

  protected copy(fillColor: Color | null, fillLook: Look<Color> | null,
                 moodModifier: MoodMatrix | null): CircleIcon {
    return new CircleIcon(fillColor, fillLook, moodModifier);
  }

  interpolateTo(that: CircleIcon): Interpolator<CircleIcon>;
  interpolateTo(that: unknown): Interpolator<CircleIcon> | null;
  interpolateTo(that: unknown): Interpolator<CircleIcon> | null {
    if (that instanceof CircleIcon) {
      return CircleIconInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof CircleIcon) {
      return Equivalent(this.fillColor, that.fillColor, epsilon)
          && this.fillLook === that.fillLook
          && Equivalent(this.moodModifier, that.moodModifier, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof CircleIcon) {
      return Equals(this.fillColor, that.fillColor)
          && this.fillLook === that.fillLook
          && Equals(this.moodModifier, that.moodModifier);
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("new").write(32/*' '*/).write("CircleIcon").write(40/*'('*/)
        .debug(this.fillColor).write(", ")
        .debug(this.fillLook).write(", ")
        .debug(this.moodModifier).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static create(): CircleIcon {
    return new CircleIcon(null, Look.accentColor, null);
  }
}
