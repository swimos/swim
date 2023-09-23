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

import type {Mutable} from "@swim/util";
import {Equals} from "@swim/util";
import {Equivalent} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {R2PathLike} from "@swim/math";
import {R2Path} from "@swim/math";
import type {R2Box} from "@swim/math";
import {Transform} from "@swim/math";
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
import type {PaintingFillRule} from "./PaintingContext";
import type {PaintingContext} from "./PaintingContext";
import {PaintingRenderer} from "./PaintingRenderer";
import {FilledIcon} from "./FilledIcon";

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
    }
    return this.copy(this.path, fillRule, this.fillColor,
                     this.fillLook, this.moodModifier);
  }

  override readonly fillColor: Color | null;

  override withFillColor(fillColor: Color | null): VectorIcon {
    if (Equals(this.fillColor, fillColor)) {
      return this;
    }
    return this.copy(this.path, this.fillRule, fillColor,
                     this.fillLook, this.moodModifier);
  }

  override readonly fillLook: Look<Color> | null;

  override withFillLook(fillLook: Look<Color> | null): VectorIcon {
    if (this.fillLook === fillLook) {
      return this;
    }
    return this.copy(this.path, this.fillRule, this.fillColor,
                     fillLook, this.moodModifier);
  }

  override readonly moodModifier: MoodMatrix | null;

  override withMoodModifier(moodModifier: MoodMatrix | null): VectorIcon {
    if (Equals(this.moodModifier, moodModifier)) {
      return this;
    }
    return this.copy(this.path, this.fillRule, this.fillColor,
                     this.fillLook, moodModifier);
  }

  override modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>): VectorIcon {
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

  override withTheme(theme: ThemeMatrix, mood: MoodVector): VectorIcon {
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
    context.fill(this.fillRule);

    // restore
    context.globalAlpha = contextGlobalAlpha;
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

  /** @override */
  interpolateTo(that: VectorIcon): Interpolator<VectorIcon>;
  interpolateTo(that: unknown): Interpolator<VectorIcon> | null;
  interpolateTo(that: unknown): Interpolator<VectorIcon> | null {
    if (that instanceof VectorIcon) {
      return VectorIconInterpolator(this, that);
    }
    return null;
  }

  /** @override */
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

  /** @override */
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

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("new").write(32/*' '*/).write("VectorIcon").write(40/*'('*/)
                   .debug(this.path).write(", ")
                   .debug(this.fillRule).write(", ")
                   .debug(this.fillColor).write(", ")
                   .debug(this.fillLook).write(", ")
                   .debug(this.moodModifier).write(41/*')'*/);
    return output;
  }

  /** @override */
  override toString(): string {
    return Format.debug(this);
  }

  static create(width: number, height: number, path: R2PathLike,
                fillRule?: PaintingFillRule): VectorIcon {
    path = R2Path.fromLike(path);
    if (width !== 1 || height !== 1) {
      path = path.transform(Transform.scale(1 / width, 1 / height));
    }
    if (fillRule === void 0) {
      fillRule = "nonzero";
    }
    return new VectorIcon(path, fillRule, null, Look.iconColor, null);
  }
}

/** @internal */
export interface VectorIconInterpolator extends Interpolator<VectorIcon> {
  /** @internal */
  readonly path: R2Path;

  /** @internal */
  readonly fillRule: PaintingFillRule;

  /** @internal */
  readonly fillColorInterpolator: Interpolator<Color | null>;

  /** @internal */
  readonly fillLook: Look<Color> | null;

  /** @internal */
  readonly moodModifier: MoodMatrix | null;

  readonly 0: VectorIcon;

  readonly 1: VectorIcon;

  equals(that: unknown): boolean;
}

/** @internal */
export const VectorIconInterpolator = (function (_super: typeof Interpolator) {
  const VectorIconInterpolator = function (i0: VectorIcon, i1: VectorIcon): VectorIconInterpolator {
    const interpolator = function (u: number): VectorIcon {
      const path = interpolator.path;
      const fillRule = interpolator.fillRule;
      const fillColor = interpolator.fillColorInterpolator(u);
      const fillLook = interpolator.fillLook;
      const moodModifier = interpolator.moodModifier;
      return new VectorIcon(path, fillRule, fillColor, fillLook, moodModifier);
    } as VectorIconInterpolator;
    Object.setPrototypeOf(interpolator, VectorIconInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).path = i1.path;
    (interpolator as Mutable<typeof interpolator>).fillRule = i1.fillRule;
    (interpolator as Mutable<typeof interpolator>).fillColorInterpolator = Interpolator(i0.fillColor, i1.fillColor);
    (interpolator as Mutable<typeof interpolator>).fillLook = i1.fillLook;
    (interpolator as Mutable<typeof interpolator>).moodModifier = i1.moodModifier;
    return interpolator;
  } as {
    (i0: VectorIcon, i1: VectorIcon): VectorIconInterpolator;

    /** @internal */
    prototype: VectorIconInterpolator;
  };

  VectorIconInterpolator.prototype = Object.create(_super.prototype);
  VectorIconInterpolator.prototype.constructor = VectorIconInterpolator;

  Object.defineProperty(VectorIconInterpolator.prototype, 0, {
    get(this: VectorIconInterpolator): VectorIcon {
      const path = this.path;
      const fillRule = this.fillRule;
      const fillColor = this.fillColorInterpolator[0];
      const fillLook = this.fillLook;
      const moodModifier = this.moodModifier;
      return new VectorIcon(path, fillRule, fillColor, fillLook, moodModifier);
    },
    configurable: true,
  });

  Object.defineProperty(VectorIconInterpolator.prototype, 1, {
    get(this: VectorIconInterpolator): VectorIcon {
      const path = this.path;
      const fillRule = this.fillRule;
      const fillColor = this.fillColorInterpolator[1];
      const fillLook = this.fillLook;
      const moodModifier = this.moodModifier;
      return new VectorIcon(path, fillRule, fillColor, fillLook, moodModifier);
    },
    configurable: true,
  });

  VectorIconInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof VectorIconInterpolator) {
      return this.path.equals(that.path)
          && this.fillRule === that.fillRule
          && this.fillColorInterpolator.equals(that.fillColorInterpolator)
          && this.fillLook === that.fillLook
          && Equals(this.moodModifier, that.moodModifier);
    }
    return false;
  };

  return VectorIconInterpolator;
})(Interpolator);
