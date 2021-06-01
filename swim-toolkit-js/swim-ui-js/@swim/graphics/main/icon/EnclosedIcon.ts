// Copyright 2015-2021 Swim inc.
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
import {R2Box} from "@swim/math";
import {Feel, MoodVectorUpdates, MoodVector, MoodMatrix, ThemeMatrix} from "@swim/theme";
import type {GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {DrawingContext} from "../drawing/DrawingContext";
import {DrawingRenderer} from "../drawing/DrawingRenderer";
import type {PaintingContext} from "../painting/PaintingContext";
import {PaintingRenderer} from "../painting/PaintingRenderer";
import {Icon} from "./Icon";
import {EnclosedIconInterpolator} from "../"; // forward import

export class EnclosedIcon extends Icon implements Interpolate<EnclosedIcon>, Equals, Equivalent, Debug {
  constructor(outer: Icon | null, inner: Icon | null, innerScale: number, moodModifier: MoodMatrix | null,
              outerMoodModifier: MoodMatrix | null, innerMoodModifier: MoodMatrix | null) {
    super();
    Object.defineProperty(this, "outer", {
      value: outer,
      enumerable: true,
    });
    Object.defineProperty(this, "inner", {
      value: inner,
      enumerable: true,
    });
    Object.defineProperty(this, "innerScale", {
      value: innerScale,
      enumerable: true,
    });
    Object.defineProperty(this, "moodModifier", {
      value: moodModifier,
      enumerable: true,
    });
    Object.defineProperty(this, "outerMoodModifier", {
      value: outerMoodModifier,
      enumerable: true,
    });
    Object.defineProperty(this, "innerMoodModifier", {
      value: innerMoodModifier,
      enumerable: true,
    });
  }

  readonly outer!: Icon | null;

  withOuter(outer: Icon | null): EnclosedIcon {
    if (this.outer === outer) {
      return this;
    } else {
      return this.copy(outer, this.inner, this.innerScale, this.moodModifier,
                       this.outerMoodModifier, this.innerMoodModifier);
    }
  }

  readonly inner!: Icon | null;

  withInner(inner: Icon | null): EnclosedIcon {
    if (this.inner === inner) {
      return this;
    } else {
      return this.copy(this.outer, inner, this.innerScale, this.moodModifier,
                       this.outerMoodModifier, this.innerMoodModifier);
    }
  }

  readonly innerScale!: number;

  withInnerScale(innerScale: number): EnclosedIcon {
    if (this.innerScale === innerScale) {
      return this;
    } else {
      return this.copy(this.outer, this.inner, innerScale, this.moodModifier,
                       this.outerMoodModifier, this.innerMoodModifier);
    }
  }

  override readonly moodModifier!: MoodMatrix | null;

  override withMoodModifier(moodModifier: MoodMatrix | null): EnclosedIcon {
    if (Equals(this.moodModifier, moodModifier)) {
      return this;
    } else {
      return this.copy(this.outer, this.inner, this.innerScale, moodModifier,
                       this.outerMoodModifier, this.innerMoodModifier);
    }
  }

  override modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>): EnclosedIcon {
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

  /** @hidden */
  readonly outerMoodModifier!: MoodMatrix | null;

  withOuterMoodModifier(outerMoodModifier: MoodMatrix | null): EnclosedIcon {
    if (Equals(this.outerMoodModifier, outerMoodModifier)) {
      return this;
    } else {
      return this.copy(this.outer, this.inner, this.innerScale, this.moodModifier,
                       outerMoodModifier, this.innerMoodModifier);
    }
  }

  modifyOuterMood(feel: Feel, updates: MoodVectorUpdates<Feel>): EnclosedIcon {
    let oldOuterMoodModifier = this.outerMoodModifier;
    if (oldOuterMoodModifier === null) {
      oldOuterMoodModifier = MoodMatrix.empty();
    }
    const newOuterMoodModifier = oldOuterMoodModifier.updatedCol(feel, updates, true);
    if (!newOuterMoodModifier.equals(oldOuterMoodModifier)) {
      return this.withOuterMoodModifier(newOuterMoodModifier);
    } else {
      return this;
    }
  }

  /** @hidden */
  readonly innerMoodModifier!: MoodMatrix | null;

  withInnerMoodModifier(innerMoodModifier: MoodMatrix | null): EnclosedIcon {
    if (Equals(this.innerMoodModifier, innerMoodModifier)) {
      return this;
    } else {
      return this.copy(this.outer, this.inner, this.innerScale, this.moodModifier,
                       this.outerMoodModifier, innerMoodModifier);
    }
  }

  modifyInnerMood(feel: Feel, updates: MoodVectorUpdates<Feel>): EnclosedIcon {
    let oldInnerMoodModifier = this.innerMoodModifier;
    if (oldInnerMoodModifier === null) {
      oldInnerMoodModifier = MoodMatrix.empty();
    }
    const newInnerMoodModifier = oldInnerMoodModifier.updatedCol(feel, updates, true);
    if (!newInnerMoodModifier.equals(oldInnerMoodModifier)) {
      return this.withInnerMoodModifier(newInnerMoodModifier);
    } else {
      return this;
    }
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
    if (oldOuter !== null) {
      let outerMood = modifiedMood;
      if (outerMoodModifier !== null) {
        outerMood = outerMoodModifier.timesCol(outerMood, true);
      }
      newOuter = oldOuter.withTheme(theme, outerMood);
    } else {
      newOuter = null;
    }

    const oldInner = this.inner;
    let newInner: Icon | null;
    if (oldInner !== null) {
      let innerMood = modifiedMood;
      if (innerMoodModifier !== null) {
        innerMood = innerMoodModifier.timesCol(innerMood, true);
      }
      newInner = oldInner.withTheme(theme, innerMood);
    } else {
      newInner = null;
    }

    if (oldOuter !== newOuter || oldInner !== newInner) {
      return this.copy(newOuter, newInner, this.innerScale, moodModifier,
                       outerMoodModifier, innerMoodModifier);
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
    if (width !== height || innerScale !== 1) {
      return new R2Box(xMin, yMin, xMax, yMax);
    } else {
      return frame;
    }
  }

  protected copy(outer: Icon | null, inner: Icon | null, innerScale: number, moodModifier: MoodMatrix | null,
                 outerMoodModifier: MoodMatrix | null, innerMoodModifier: MoodMatrix | null): EnclosedIcon {
    return new EnclosedIcon(outer, inner, innerScale, moodModifier, outerMoodModifier, innerMoodModifier);
  }

  interpolateTo(that: EnclosedIcon): Interpolator<EnclosedIcon>;
  interpolateTo(that: unknown): Interpolator<EnclosedIcon> | null;
  interpolateTo(that: unknown): Interpolator<EnclosedIcon> | null {
    if (that instanceof EnclosedIcon) {
      return EnclosedIconInterpolator(this, that);
    } else {
      return null;
    }
  }

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

  debug(output: Output): void {
    output = output.write("new").write(32/*' '*/).write("EnclosedIcon").write(40/*'('*/)
        .debug(this.outer).write(", ")
        .debug(this.inner).write(", ")
        .debug(this.innerScale).write(", ")
        .debug(this.moodModifier).write(", ")
        .debug(this.outerMoodModifier).write(", ")
        .debug(this.innerMoodModifier).write(41/*')'*/);
  }

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
