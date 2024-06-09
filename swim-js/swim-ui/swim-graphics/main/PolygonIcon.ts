// Copyright 2015-2024 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import {Equals} from "@swim/util";
import {Equivalent} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {AngleLike} from "@swim/math";
import {Angle} from "@swim/math";
import type {R2Box} from "@swim/math";
import type {Color} from "@swim/style";
import {Look} from "@swim/theme";
import type {Feel} from "@swim/theme";
import type {MoodVectorUpdates} from "@swim/theme";
import type {MoodVector} from "@swim/theme";
import {MoodMatrix} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import type {GraphicsRenderer} from "./GraphicsRenderer";
import type {DrawingContext} from "./DrawingContext";
import {DrawingRenderer} from "./DrawingRenderer";
import type {PaintingContext} from "./PaintingContext";
import {PaintingRenderer} from "./PaintingRenderer";
import {FilledIcon} from "./FilledIcon";

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
    }
    return this.copy(this.sides, this.rotation, fillColor,
                     this.fillLook, this.moodModifier);
  }

  override readonly fillLook: Look<Color> | null;

  override withFillLook(fillLook: Look<Color> | null): PolygonIcon {
    if (this.fillLook === fillLook) {
      return this;
    }
    return this.copy(this.sides, this.rotation, this.fillColor,
                     fillLook, this.moodModifier);
  }

  override readonly moodModifier: MoodMatrix | null;

  override withMoodModifier(moodModifier: MoodMatrix | null): PolygonIcon {
    if (Equals(this.moodModifier, moodModifier)) {
      return this;
    }
    return this.copy(this.sides, this.rotation, this.fillColor,
                     this.fillLook, moodModifier);
  }

  override modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>): PolygonIcon {
    let oldMoodModifier = this.moodModifier;
    if (oldMoodModifier === null) {
      oldMoodModifier = MoodMatrix.empty();
    }
    const newMoodModifier = oldMoodModifier.updatedCol(feel, updates, true);
    if (newMoodModifier.equals(oldMoodModifier)) {
      return this;
    }
    return this.withMoodModifier(newMoodModifier);
  }

  override isThemed(): boolean {
    return this.fillColor !== null;
  }

  override withTheme(theme: ThemeMatrix, mood: MoodVector): PolygonIcon {
    const fillLook = this.fillLook;
    if (fillLook === null) {
      return this;
    }
    const moodModifier = this.moodModifier;
    if (moodModifier !== null) {
      mood = moodModifier.timesCol(mood, true);
    }
    return this.withFillColor(theme.getOr(fillLook, mood, null));
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
    const contextGlobalAlpha = context.globalAlpha;
    const contextFillStyle = context.fillStyle;

    context.beginPath();
    this.draw(context, frame);
    if (this.fillColor !== null) {
      context.globalAlpha = this.fillColor.alpha();
      context.fillStyle = this.fillColor.toHexString();
    }
    context.fill();

    // restore
    context.globalAlpha = contextGlobalAlpha;
    context.fillStyle = contextFillStyle;
  }

  override draw(context: DrawingContext, frame: R2Box): void {
    const sides = this.sides;
    if (sides < 3) {
      return;
    }
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

  protected copy(sides: number, rotation: Angle, fillColor: Color | null,
                 fillLook: Look<Color> | null, moodModifier: MoodMatrix | null): PolygonIcon {
    return new PolygonIcon(sides, rotation, fillColor, fillLook, moodModifier);
  }

  /** @override */
  interpolateTo(that: PolygonIcon): Interpolator<PolygonIcon>;
  interpolateTo(that: unknown): Interpolator<PolygonIcon> | null;
  interpolateTo(that: unknown): Interpolator<PolygonIcon> | null {
    if (that instanceof PolygonIcon) {
      return PolygonIconInterpolator(this, that);
    }
    return null;
  }

  /** @override */
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

  /** @override */
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

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("new").write(32/*' '*/).write("PolygonIcon").write(40/*'('*/)
                   .debug(this.sides).write(", ")
                   .debug(this.rotation).write(", ")
                   .debug(this.fillColor).write(", ")
                   .debug(this.fillLook).write(", ")
                   .debug(this.moodModifier).write(41/*')'*/);
    return output;
  }

  /** @override */
  override toString(): string {
    return Format.debug(this);
  }

  static create(sides: number, rotation?: AngleLike): PolygonIcon {
    if (rotation !== void 0) {
      rotation = Angle.fromLike(rotation);
    } else {
      rotation = Angle.zero();
    }
    return new PolygonIcon(sides, rotation, null, Look.accentColor, null);
  }
}

/** @internal */
export interface PolygonIconInterpolator extends Interpolator<PolygonIcon> {
  /** @internal */
  readonly sides: number;

  /** @internal */
  readonly rotationInterpolator: Interpolator<Angle>;

  /** @internal */
  readonly fillColorInterpolator: Interpolator<Color | null>;

  /** @internal */
  readonly fillLook: Look<Color> | null;

  /** @internal */
  readonly moodModifier: MoodMatrix | null;

  readonly 0: PolygonIcon;

  readonly 1: PolygonIcon;

  equals(that: unknown): boolean;
}

/** @internal */
export const PolygonIconInterpolator = (function (_super: typeof Interpolator) {
  const PolygonIconInterpolator = function (i0: PolygonIcon, i1: PolygonIcon): PolygonIconInterpolator {
    const interpolator = function (u: number): PolygonIcon {
      const sides = interpolator.sides;
      const rotation = interpolator.rotationInterpolator(u);
      const fillColor = interpolator.fillColorInterpolator(u);
      const fillLook = interpolator.fillLook;
      const moodModifier = interpolator.moodModifier;
      return new PolygonIcon(sides, rotation, fillColor, fillLook, moodModifier);
    } as PolygonIconInterpolator;
    Object.setPrototypeOf(interpolator, PolygonIconInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).sides = i1.sides;
    (interpolator as Mutable<typeof interpolator>).rotationInterpolator = i0.rotation.interpolateTo(i1.rotation);
    (interpolator as Mutable<typeof interpolator>).fillColorInterpolator = Interpolator(i0.fillColor, i1.fillColor);
    (interpolator as Mutable<typeof interpolator>).fillLook = i1.fillLook;
    (interpolator as Mutable<typeof interpolator>).moodModifier = i1.moodModifier;
    return interpolator;
  } as {
    (i0: PolygonIcon, i1: PolygonIcon): PolygonIconInterpolator;

    /** @internal */
    prototype: PolygonIconInterpolator;
  };

  PolygonIconInterpolator.prototype = Object.create(_super.prototype);
  PolygonIconInterpolator.prototype.constructor = PolygonIconInterpolator;

  Object.defineProperty(PolygonIconInterpolator.prototype, 0, {
    get(this: PolygonIconInterpolator): PolygonIcon {
      const sides = this.sides;
      const rotation = this.rotationInterpolator[0];
      const fillColor = this.fillColorInterpolator[0];
      const fillLook = this.fillLook;
      const moodModifier = this.moodModifier;
      return new PolygonIcon(sides, rotation, fillColor, fillLook, moodModifier);
    },
    configurable: true,
  });

  Object.defineProperty(PolygonIconInterpolator.prototype, 1, {
    get(this: PolygonIconInterpolator): PolygonIcon {
      const sides = this.sides;
      const rotation = this.rotationInterpolator[1];
      const fillColor = this.fillColorInterpolator[1];
      const fillLook = this.fillLook;
      const moodModifier = this.moodModifier;
      return new PolygonIcon(sides, rotation, fillColor, fillLook, moodModifier);
    },
    configurable: true,
  });

  PolygonIconInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof PolygonIconInterpolator) {
      return this.sides === that.sides
          && this.rotationInterpolator.equals(that.rotationInterpolator)
          && this.fillColorInterpolator.equals(that.fillColorInterpolator)
          && this.fillLook === that.fillLook
          && Equals(this.moodModifier, that.moodModifier);
    }
    return false;
  };

  return PolygonIconInterpolator;
})(Interpolator);
