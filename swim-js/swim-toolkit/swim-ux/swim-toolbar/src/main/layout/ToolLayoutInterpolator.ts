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

import {Mutable, Interpolator, StepInterpolator} from "@swim/util";
import {Length, PxLength} from "@swim/math";
import type {Presence} from "@swim/style";
import {ToolLayout} from "./ToolLayout";

/** @internal */
export interface ToolLayoutInterpolator extends Interpolator<ToolLayout> {
  /** @internal */
  readonly key: string;
  /** @internal */
  readonly growInterpolator: Interpolator<number>;
  /** @internal */
  readonly shrinkInterpolator: Interpolator<number>;
  /** @internal */
  readonly basisInterpolator: Interpolator<Length>;
  /** @internal */
  readonly alignInterpolator: Interpolator<number>;
  /** @internal */
  readonly inAlignInterpolator: Interpolator<number>;
  /** @internal */
  readonly outAlignInterpolator: Interpolator<number>;
  /** @internal */
  readonly overlapInterpolator: Interpolator<string | undefined>;
  /** @internal */
  readonly overpadInterpolator: Interpolator<Length>;
  /** @internal */
  readonly presenceInterpolator: Interpolator<Presence>;
  /** @internal */
  readonly inPresenceInterpolator: Interpolator<Presence | null>;
  /** @internal */
  readonly outPresenceInterpolator: Interpolator<Presence | null>;
  /** @internal */
  readonly widthInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly leftInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly rightInterpolator: Interpolator<Length | null>;

  readonly 0: ToolLayout;

  readonly 1: ToolLayout;

  equals(that: unknown): boolean;
}

/** @internal */
export const ToolLayoutInterpolator = (function (_super: typeof Interpolator) {
  const ToolLayoutInterpolator = function (l0: ToolLayout, l1: ToolLayout): ToolLayoutInterpolator {
    const interpolator = function (u: number): ToolLayout {
      const key = interpolator.key;
      const grow = interpolator.growInterpolator(u);
      const shrink = interpolator.shrinkInterpolator(u);
      const basis = interpolator.basisInterpolator(u);
      const align = interpolator.alignInterpolator(u);
      const inAlign = interpolator.inAlignInterpolator(u);
      const outAlign = interpolator.outAlignInterpolator(u);
      const overlap = interpolator.overlapInterpolator(u === 0 ? 0 : 1);
      const overpad = interpolator.overpadInterpolator(u);
      const presence = interpolator.presenceInterpolator(u);
      const inPresence = interpolator.inPresenceInterpolator(u);
      const outPresence = interpolator.outPresenceInterpolator(u);
      const width = interpolator.widthInterpolator(u);
      const left = interpolator.leftInterpolator(u);
      const right = interpolator.rightInterpolator(u);
      return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                            overlap, overpad, presence, inPresence, outPresence,
                            width, left, right);
    } as ToolLayoutInterpolator;
    Object.setPrototypeOf(interpolator, ToolLayoutInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).key = l1.key;
    (interpolator as Mutable<typeof interpolator>).growInterpolator = Interpolator(l0.grow, l1.grow);
    (interpolator as Mutable<typeof interpolator>).shrinkInterpolator = Interpolator(l0.shrink, l1.shrink);
    (interpolator as Mutable<typeof interpolator>).basisInterpolator = l0.basis.interpolateTo(l1.basis);
    (interpolator as Mutable<typeof interpolator>).alignInterpolator = Interpolator(l0.align, l1.align);
    (interpolator as Mutable<typeof interpolator>).inAlignInterpolator = Interpolator(l0.inAlign, l1.inAlign);
    (interpolator as Mutable<typeof interpolator>).outAlignInterpolator = Interpolator(l0.outAlign, l1.outAlign);
    (interpolator as Mutable<typeof interpolator>).overlapInterpolator = Interpolator(l0.overlap, l1.overlap);
    (interpolator as Mutable<typeof interpolator>).overpadInterpolator = l0.overpad.interpolateTo(l1.overpad);
    (interpolator as Mutable<typeof interpolator>).presenceInterpolator = l0.presence.interpolateTo(l1.presence);
    (interpolator as Mutable<typeof interpolator>).inPresenceInterpolator = Interpolator(l0.inPresence, l1.inPresence);
    (interpolator as Mutable<typeof interpolator>).outPresenceInterpolator = Interpolator(l0.outPresence, l1.outPresence);
    const width0 = l0.width;
    const width1 = l1.width;
    if (l0.align !== l1.align && width0 instanceof PxLength && width1 instanceof PxLength) {
      const phase = width0.value < width1.value ? 0 : 1;
      (interpolator as Mutable<typeof interpolator>).widthInterpolator = StepInterpolator(width0, width1, phase);
    } else {
      (interpolator as Mutable<typeof interpolator>).widthInterpolator = Interpolator(width0, width1);
    }
    (interpolator as Mutable<typeof interpolator>).leftInterpolator = Interpolator(l0.left, l1.left);
    (interpolator as Mutable<typeof interpolator>).rightInterpolator = Interpolator(l0.right, l1.right);
    return interpolator;
  } as {
    (l0: ToolLayout, l1: ToolLayout): ToolLayoutInterpolator;

    /** @internal */
    prototype: ToolLayoutInterpolator;
  };

  ToolLayoutInterpolator.prototype = Object.create(_super.prototype);
  ToolLayoutInterpolator.prototype.constructor = ToolLayoutInterpolator;

  Object.defineProperty(ToolLayoutInterpolator.prototype, 0, {
    get(this: ToolLayoutInterpolator): ToolLayout {
      const key = this.key;
      const grow = this.growInterpolator[0];
      const shrink = this.shrinkInterpolator[0];
      const basis = this.basisInterpolator[0];
      const align = this.alignInterpolator[0];
      const inAlign = this.inAlignInterpolator[0];
      const outAlign = this.outAlignInterpolator[0];
      const overlap = this.overlapInterpolator[0];
      const overpad = this.overpadInterpolator[0];
      const presence = this.presenceInterpolator[0];
      const inPresence = this.inPresenceInterpolator[0];
      const outPresence = this.outPresenceInterpolator[0];
      const width = this.widthInterpolator[0];
      const left = this.leftInterpolator[0];
      const right = this.rightInterpolator[0];
      return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                            overlap, overpad, presence, inPresence, outPresence,
                            width, left, right);
    },
    configurable: true,
  });

  Object.defineProperty(ToolLayoutInterpolator.prototype, 1, {
    get(this: ToolLayoutInterpolator): ToolLayout {
      const key = this.key;
      const grow = this.growInterpolator[1];
      const shrink = this.shrinkInterpolator[1];
      const basis = this.basisInterpolator[1];
      const align = this.alignInterpolator[1];
      const inAlign = this.inAlignInterpolator[1];
      const outAlign = this.outAlignInterpolator[1];
      const overlap = this.overlapInterpolator[1];
      const overpad = this.overpadInterpolator[1];
      const presence = this.presenceInterpolator[1];
      const inPresence = this.inPresenceInterpolator[1];
      const outPresence = this.outPresenceInterpolator[1];
      const width = this.widthInterpolator[1];
      const left = this.leftInterpolator[1];
      const right = this.rightInterpolator[1];
      return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                            overlap, overpad, presence, inPresence, outPresence,
                            width, left, right);
    },
    configurable: true,
  });

  ToolLayoutInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ToolLayoutInterpolator) {
      return this.key === that.key
          && this.growInterpolator.equals(that.growInterpolator)
          && this.shrinkInterpolator.equals(that.shrinkInterpolator)
          && this.basisInterpolator.equals(that.basisInterpolator)
          && this.alignInterpolator.equals(that.alignInterpolator)
          && this.inAlignInterpolator.equals(that.inAlignInterpolator)
          && this.outAlignInterpolator.equals(that.outAlignInterpolator)
          && this.overlapInterpolator.equals(that.overlapInterpolator)
          && this.overpadInterpolator.equals(that.overpadInterpolator)
          && this.presenceInterpolator.equals(that.presenceInterpolator)
          && this.inPresenceInterpolator.equals(that.inPresenceInterpolator)
          && this.outPresenceInterpolator.equals(that.outPresenceInterpolator)
          && this.widthInterpolator.equals(that.widthInterpolator)
          && this.leftInterpolator.equals(that.leftInterpolator)
          && this.rightInterpolator.equals(that.rightInterpolator);
    }
    return false;
  };

  return ToolLayoutInterpolator;
})(Interpolator);
