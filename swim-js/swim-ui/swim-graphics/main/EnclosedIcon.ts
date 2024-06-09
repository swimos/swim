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
import {Lazy} from "@swim/util";
import {Equals} from "@swim/util";
import {Equivalent} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import {R2Box} from "@swim/math";
import {Feel} from "@swim/theme";
import type {MoodVectorUpdates} from "@swim/theme";
import type {MoodVector} from "@swim/theme";
import {MoodMatrix} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import type {GraphicsRenderer} from "./GraphicsRenderer";
import type {DrawingContext} from "./DrawingContext";
import {DrawingRenderer} from "./DrawingRenderer";
import type {PaintingContext} from "./PaintingContext";
import {PaintingRenderer} from "./PaintingRenderer";
import {Icon} from "./Icon";

/** @public */
export class EnclosedIcon extends Icon implements Interpolate<EnclosedIcon>, Equals, Equivalent, Debug {
  constructor(outer: Icon | null, inner: Icon | null, innerScale: number, moodModifier: MoodMatrix | null,
              outerMoodModifier: MoodMatrix | null, innerMoodModifier: MoodMatrix | null) {
    super();
    this.outer = outer;
    this.inner = inner;
    this.innerScale = innerScale;
    this.moodModifier = moodModifier;
    this.outerMoodModifier = outerMoodModifier;
    this.innerMoodModifier = innerMoodModifier;
  }

  readonly outer: Icon | null;

  withOuter(outer: Icon | null): EnclosedIcon {
    if (this.outer === outer) {
      return this;
    }
    return this.copy(outer, this.inner, this.innerScale, this.moodModifier,
                     this.outerMoodModifier, this.innerMoodModifier);
  }

  readonly inner: Icon | null;

  withInner(inner: Icon | null): EnclosedIcon {
    if (this.inner === inner) {
      return this;
    }
    return this.copy(this.outer, inner, this.innerScale, this.moodModifier,
                     this.outerMoodModifier, this.innerMoodModifier);
  }

  readonly innerScale: number;

  withInnerScale(innerScale: number): EnclosedIcon {
    if (this.innerScale === innerScale) {
      return this;
    }
    return this.copy(this.outer, this.inner, innerScale, this.moodModifier,
                     this.outerMoodModifier, this.innerMoodModifier);
  }

  override readonly moodModifier: MoodMatrix | null;

  override withMoodModifier(moodModifier: MoodMatrix | null): EnclosedIcon {
    if (Equals(this.moodModifier, moodModifier)) {
      return this;
    }
    return this.copy(this.outer, this.inner, this.innerScale, moodModifier,
                     this.outerMoodModifier, this.innerMoodModifier);
  }

  override modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>): EnclosedIcon {
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

  /** @internal */
  readonly outerMoodModifier: MoodMatrix | null;

  withOuterMoodModifier(outerMoodModifier: MoodMatrix | null): EnclosedIcon {
    if (Equals(this.outerMoodModifier, outerMoodModifier)) {
      return this;
    }
    return this.copy(this.outer, this.inner, this.innerScale, this.moodModifier,
                     outerMoodModifier, this.innerMoodModifier);
  }

  modifyOuterMood(feel: Feel, updates: MoodVectorUpdates<Feel>): EnclosedIcon {
    let oldOuterMoodModifier = this.outerMoodModifier;
    if (oldOuterMoodModifier === null) {
      oldOuterMoodModifier = MoodMatrix.empty();
    }
    const newOuterMoodModifier = oldOuterMoodModifier.updatedCol(feel, updates, true);
    if (newOuterMoodModifier.equals(oldOuterMoodModifier)) {
      return this;
    }
    return this.withOuterMoodModifier(newOuterMoodModifier);
  }

  /** @internal */
  readonly innerMoodModifier: MoodMatrix | null;

  withInnerMoodModifier(innerMoodModifier: MoodMatrix | null): EnclosedIcon {
    if (Equals(this.innerMoodModifier, innerMoodModifier)) {
      return this;
    }
    return this.copy(this.outer, this.inner, this.innerScale, this.moodModifier,
                     this.outerMoodModifier, innerMoodModifier);
  }

  modifyInnerMood(feel: Feel, updates: MoodVectorUpdates<Feel>): EnclosedIcon {
    let oldInnerMoodModifier = this.innerMoodModifier;
    if (oldInnerMoodModifier === null) {
      oldInnerMoodModifier = MoodMatrix.empty();
    }
    const newInnerMoodModifier = oldInnerMoodModifier.updatedCol(feel, updates, true);
    if (newInnerMoodModifier.equals(oldInnerMoodModifier)) {
      return this;
    }
    return this.withInnerMoodModifier(newInnerMoodModifier);
  }

  override isThemed(): boolean {
    const outer = this.outer;
    const inner = this.inner;
    return (outer === null || outer.isThemed())
        && (inner === null || inner.isThemed());
  }

  override withTheme(theme: ThemeMatrix, mood: MoodVector): EnclosedIcon {
    const moodModifier = this.moodModifier;
    const outerMoodModifier = this.outerMoodModifier;
    const innerMoodModifier = this.innerMoodModifier;

    let modifiedMood = mood;
    if (moodModifier !== null) {
      modifiedMood = moodModifier.timesCol(modifiedMood, true);
    }

    const oldOuter = this.outer;
    let newOuter: Icon | null;
    if (oldOuter === null) {
      newOuter = null;
    } else {
      let outerMood = modifiedMood;
      if (outerMoodModifier !== null) {
        outerMood = outerMoodModifier.timesCol(outerMood, true);
      }
      newOuter = oldOuter.withTheme(theme, outerMood);
    }

    const oldInner = this.inner;
    let newInner: Icon | null;
    if (oldInner === null) {
      newInner = null;
    } else {
      let innerMood = modifiedMood;
      if (innerMoodModifier !== null) {
        innerMood = innerMoodModifier.timesCol(innerMood, true);
      }
      newInner = oldInner.withTheme(theme, innerMood);
    }

    if (newOuter === oldOuter && newInner === oldInner) {
      return this;
    }
    return this.copy(newOuter, newInner, this.innerScale, moodModifier,
                     outerMoodModifier, innerMoodModifier);
  }

  override render(renderer: GraphicsRenderer, frame: R2Box): void {
    if (renderer instanceof PaintingRenderer) {
      this.paint(renderer.context, frame);
    } else if (renderer instanceof DrawingRenderer) {
      this.draw(renderer.context, frame);
    }
  }

  override paint(context: PaintingContext, frame: R2Box): void {
    const outer = this.outer;
    if (outer !== null) {
      outer.paint(context, this.outerFrame(frame));
    }
    const inner = this.inner;
    if (inner !== null) {
      inner.paint(context, this.innerFrame(frame));
    }
  }

  override draw(context: DrawingContext, frame: R2Box): void {
    const outer = this.outer;
    if (outer !== null) {
      outer.draw(context, this.outerFrame(frame));
    }
    const inner = this.inner;
    if (inner !== null) {
      inner.draw(context, this.innerFrame(frame));
    }
  }

  outerFrame(frame: R2Box): R2Box {
    return frame;
  }

  innerFrame(frame: R2Box): R2Box {
    let {xMin, xMax, yMin, yMax} = frame;
    let width = xMax - xMin;
    let height = yMax - yMin;
    const innerScale = this.innerScale;
    if (innerScale !== 1) {
      const cx = (xMin + xMax) / 2;
      const cy = (yMin + yMax) / 2;
      width = width * innerScale;
      height = height * innerScale;
      xMin = cx - width / 2;
      yMin = cy - height / 2;
      xMax = cx + width / 2;
      yMax = cy + height / 2;
    }
    if (width > height) {
      const ex = (width - height) / 2;
      xMin += ex;
      xMax -= ex;
    } else if (width < height) {
      const ey = (height - width) / 2;
      yMin += ey;
      yMax -= ey;
    }
    if (width === height && innerScale === 1) {
      return frame;
    }
    return new R2Box(xMin, yMin, xMax, yMax);
  }

  protected copy(outer: Icon | null, inner: Icon | null, innerScale: number, moodModifier: MoodMatrix | null,
                 outerMoodModifier: MoodMatrix | null, innerMoodModifier: MoodMatrix | null): EnclosedIcon {
    return new EnclosedIcon(outer, inner, innerScale, moodModifier, outerMoodModifier, innerMoodModifier);
  }

  /** @override */
  interpolateTo(that: EnclosedIcon): Interpolator<EnclosedIcon>;
  interpolateTo(that: unknown): Interpolator<EnclosedIcon> | null;
  interpolateTo(that: unknown): Interpolator<EnclosedIcon> | null {
    if (that instanceof EnclosedIcon) {
      return EnclosedIconInterpolator(this, that);
    }
    return null;
  }

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof EnclosedIcon) {
      return Equivalent(this.outer, that.outer, epsilon)
          && Equivalent(this.inner, that.inner, epsilon)
          && Equivalent(this.innerScale, that.innerScale, epsilon)
          && Equivalent(this.moodModifier, that.moodModifier, epsilon)
          && Equivalent(this.outerMoodModifier, that.outerMoodModifier, epsilon)
          && Equivalent(this.innerMoodModifier, that.innerMoodModifier, epsilon);
    }
    return false;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof EnclosedIcon) {
      return Equals(this.outer, that.outer)
          && Equals(this.inner, that.inner)
          && Equals(this.innerScale, that.innerScale)
          && Equals(this.moodModifier, that.moodModifier)
          && Equals(this.outerMoodModifier, that.outerMoodModifier)
          && Equals(this.innerMoodModifier, that.innerMoodModifier);
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("new").write(32/*' '*/).write("EnclosedIcon").write(40/*'('*/)
                   .debug(this.outer).write(", ")
                   .debug(this.inner).write(", ")
                   .debug(this.innerScale).write(", ")
                   .debug(this.moodModifier).write(", ")
                   .debug(this.outerMoodModifier).write(", ")
                   .debug(this.innerMoodModifier).write(41/*')'*/);
    return output;
  }

  /** @override */
  override toString(): string {
    return Format.debug(this);
  }

  static create(outer: Icon | null, inner: Icon | null): EnclosedIcon {
    return new EnclosedIcon(outer, inner, 1, null, null, null);
  }

  static embossed(outer: Icon | null, inner: Icon | null): EnclosedIcon {
    return new EnclosedIcon(outer, inner, 1, null, null, EnclosedIcon.embossedMoodModifier);
  }

  @Lazy
  static get embossedMoodModifier(): MoodMatrix {
    return MoodMatrix.empty().updatedCol(Feel.default, [[Feel.embossed, 1]], true);
  }
}

/** @internal */
export interface EnclosedIconInterpolator extends Interpolator<EnclosedIcon> {
  /** @internal */
  readonly outerInterpolator: Interpolator<Icon | null>;

  /** @internal */
  readonly innerInterpolator: Interpolator<Icon | null>;

  /** @internal */
  readonly innerScaleInterpolator: Interpolator<number>;

  /** @internal */
  readonly moodModifier: MoodMatrix | null;

  /** @internal */
  readonly outerMoodModifier: MoodMatrix | null;

  /** @internal */
  readonly innerMoodModifier: MoodMatrix | null;

  readonly 0: EnclosedIcon;

  readonly 1: EnclosedIcon;

  equals(that: unknown): boolean;
}

/** @internal */
export const EnclosedIconInterpolator = (function (_super: typeof Interpolator) {
  const EnclosedIconInterpolator = function (i0: EnclosedIcon, i1: EnclosedIcon): EnclosedIconInterpolator {
    const interpolator = function (u: number): EnclosedIcon {
      const outer = interpolator.outerInterpolator(u);
      const inner = interpolator.innerInterpolator(u);
      const innerScale = interpolator.innerScaleInterpolator(u);
      const moodModifier = interpolator.moodModifier;
      const outerMoodModifier = interpolator.outerMoodModifier;
      const innerMoodModifier = interpolator.innerMoodModifier;
      return new EnclosedIcon(outer, inner, innerScale, moodModifier,
                              outerMoodModifier, innerMoodModifier);
    } as EnclosedIconInterpolator;
    Object.setPrototypeOf(interpolator, EnclosedIconInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).outerInterpolator = Interpolator(i0.outer, i1.outer);
    (interpolator as Mutable<typeof interpolator>).innerInterpolator = Interpolator(i0.inner, i1.inner);
    (interpolator as Mutable<typeof interpolator>).innerScaleInterpolator = Interpolator(i0.innerScale, i1.innerScale);
    (interpolator as Mutable<typeof interpolator>).moodModifier = i1.moodModifier;
    (interpolator as Mutable<typeof interpolator>).outerMoodModifier = i1.outerMoodModifier;
    (interpolator as Mutable<typeof interpolator>).innerMoodModifier = i1.innerMoodModifier;
    return interpolator;
  } as {
    (i0: EnclosedIcon, i1: EnclosedIcon): EnclosedIconInterpolator;

    /** @internal */
    prototype: EnclosedIconInterpolator;
  };

  EnclosedIconInterpolator.prototype = Object.create(_super.prototype);
  EnclosedIconInterpolator.prototype.constructor = EnclosedIconInterpolator;

  Object.defineProperty(EnclosedIconInterpolator.prototype, 0, {
    get(this: EnclosedIconInterpolator): EnclosedIcon {
      const outer = this.outerInterpolator[0];
      const inner = this.innerInterpolator[0];
      const innerScale = this.innerScaleInterpolator[0];
      const moodModifier = this.moodModifier;
      const outerMoodModifier = this.outerMoodModifier;
      const innerMoodModifier = this.innerMoodModifier;
      return new EnclosedIcon(outer, inner, innerScale, moodModifier,
                              outerMoodModifier, innerMoodModifier);
    },
    configurable: true,
  });

  Object.defineProperty(EnclosedIconInterpolator.prototype, 1, {
    get(this: EnclosedIconInterpolator): EnclosedIcon {
      const outer = this.outerInterpolator[1];
      const inner = this.innerInterpolator[1];
      const innerScale = this.innerScaleInterpolator[1];
      const moodModifier = this.moodModifier;
      const outerMoodModifier = this.outerMoodModifier;
      const innerMoodModifier = this.innerMoodModifier;
      return new EnclosedIcon(outer, inner, innerScale, moodModifier,
                              outerMoodModifier, innerMoodModifier);
    },
    configurable: true,
  });

  EnclosedIconInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof EnclosedIconInterpolator) {
      return this.outerInterpolator.equals(that.outerInterpolator)
          && this.innerInterpolator.equals(that.innerInterpolator)
          && this.innerScaleInterpolator.equals(that.innerScaleInterpolator)
          && Equals(this.moodModifier, that.moodModifier)
          && Equals(this.outerMoodModifier, that.outerMoodModifier)
          && Equals(this.innerMoodModifier, that.innerMoodModifier);
    }
    return false;
  };

  return EnclosedIconInterpolator;
})(Interpolator);
