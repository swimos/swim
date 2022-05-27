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

import {Mutable, Interpolator} from "@swim/util";
import type {Length} from "@swim/math";
import {Presence} from "@swim/style";
import type {ToolLayout} from "./ToolLayout";
import {BarLayout} from "./BarLayout";

/** @internal */
export interface BarLayoutInterpolator extends Interpolator<BarLayout> {
  /** @internal */
  readonly widthInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly leftInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly rightInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly spacingInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly toolInterpolators: ReadonlyArray<Interpolator<ToolLayout>>;

  readonly 0: BarLayout;

  readonly 1: BarLayout;

  equals(that: unknown): boolean;
}

/** @internal */
export const BarLayoutInterpolator = (function (_super: typeof Interpolator) {
  const BarLayoutInterpolator = function (l0: BarLayout, l1: BarLayout): BarLayoutInterpolator {
    const interpolator = function (u: number): BarLayout {
      const width = interpolator.widthInterpolator(u);
      const left = interpolator.leftInterpolator(u);
      const right = interpolator.rightInterpolator(u);
      const spacing = interpolator.spacingInterpolator(u);
      const toolInterpolators = interpolator.toolInterpolators;
      const tools = new Array<ToolLayout>();
      for (let i = 0; i < toolInterpolators.length; i += 1) {
        tools.push(toolInterpolators[i]!(u));
      }
      return new BarLayout(width, left, right, spacing, tools);
    } as BarLayoutInterpolator;
    Object.setPrototypeOf(interpolator, BarLayoutInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).widthInterpolator = Interpolator(l0.width, l1.width);
    (interpolator as Mutable<typeof interpolator>).leftInterpolator = Interpolator(l0.left, l1.left);
    (interpolator as Mutable<typeof interpolator>).rightInterpolator = Interpolator(l0.right, l1.right);
    (interpolator as Mutable<typeof interpolator>).spacingInterpolator = Interpolator(l0.spacing, l1.spacing);
    const tools0 = l0.tools;
    const tools1 = l1.tools;
    const toolInterpolators = new Array<Interpolator<ToolLayout>>();
    for (let i = 0; i < tools0.length; i += 1) {
      let tool0 = tools0[i]!;
      let tool1 = l1.getTool(tool0.key);
      if (tool1 === null && !tool0.presence.dismissed && tool0.outPresence !== null) {
        tool1 = tool0.withPresence(tool0.outPresence);
        tool1 = tool1.withAlign(tool1.outAlign);
        tool0 = tool0.withPresence(tool0.presence.asDismissing());
      } else if (tool1 !== null && tool0.presence.dismissed) {
        tool0 = tool0.withPresence(tool0.presence.asPresenting());
      }
      if (tool1 !== null) {
        toolInterpolators.push(tool0.interpolateTo(tool1));
      }
    }
    for (let i = 0; i < tools1.length; i += 1) {
      let tool1 = tools1[i]!;
      let tool0 = l0.getTool(tool1.key);
      if (tool0 === null) {
        const inPresence = tool1.inPresence !== null ? tool1.inPresence : tool1.presence;
        tool0 = tool1.withPresence(inPresence.asPresenting());
        tool1 = tool1.withPresence(Presence.presented());
        tool0 = tool0.withAlign(tool0.inAlign);
        toolInterpolators.push(tool0.interpolateTo(tool1));
      }
    }
    (interpolator as Mutable<typeof interpolator>).toolInterpolators = toolInterpolators;
    return interpolator;
  } as {
    (l0: BarLayout, l1: BarLayout): BarLayoutInterpolator;

    /** @internal */
    prototype: BarLayoutInterpolator;
  };

  BarLayoutInterpolator.prototype = Object.create(_super.prototype);
  BarLayoutInterpolator.prototype.constructor = BarLayoutInterpolator;

  Object.defineProperty(BarLayoutInterpolator.prototype, 0, {
    get(this: BarLayoutInterpolator): BarLayout {
      const width = this.widthInterpolator[0];
      const left = this.leftInterpolator[0];
      const right = this.rightInterpolator[0];
      const spacing = this.spacingInterpolator[0];
      const toolInterpolators = this.toolInterpolators;
      const tools = new Array<ToolLayout>();
      for (let i = 0; i < toolInterpolators.length; i += 1) {
        tools.push(toolInterpolators[i]![0]);
      }
      return new BarLayout(width, left, right, spacing, tools);
    },
    configurable: true,
  });

  Object.defineProperty(BarLayoutInterpolator.prototype, 1, {
    get(this: BarLayoutInterpolator): BarLayout {
      const width = this.widthInterpolator[1];
      const left = this.leftInterpolator[1];
      const right = this.rightInterpolator[1];
      const spacing = this.spacingInterpolator[1];
      const toolInterpolators = this.toolInterpolators;
      const tools = new Array<ToolLayout>();
      for (let i = 0; i < toolInterpolators.length; i += 1) {
        tools.push(toolInterpolators[i]![1]);
      }
      return new BarLayout(width, left, right, spacing, tools);
    },
    configurable: true,
  });

  BarLayoutInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BarLayoutInterpolator) {
      if (this.widthInterpolator.equals(that.widthInterpolator) &&
          this.leftInterpolator.equals(that.leftInterpolator) &&
          this.rightInterpolator.equals(that.rightInterpolator) &&
          this.spacingInterpolator.equals(that.spacingInterpolator)) {
        const n = this.toolInterpolators.length;
        if (n === that.toolInterpolators.length) {
          for (let i = 0; i < n; i += 1) {
            if (!this.toolInterpolators[i]!.equals(that.toolInterpolators[i]!)) {
              return false;
            }
          }
          return true;
        }
      }
    }
    return false;
  };

  return BarLayoutInterpolator;
})(Interpolator);
