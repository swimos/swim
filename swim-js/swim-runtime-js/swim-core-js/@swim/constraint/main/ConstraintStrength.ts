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

import type {Mutable} from "@swim/util";

export type AnyConstraintStrength = ConstraintStrength | ConstraintStrengthInit;

export type ConstraintStrengthInit = "required" | "strong" | "medium" | "weak";

export type ConstraintStrength = number;

export const ConstraintStrength = (function () {
  const ConstraintStrength = {} as {
    readonly Required: number;
    readonly Strong: number;
    readonly Medium: number;
    readonly Weak: number;
    readonly Unbound: number;

    clip(strength: ConstraintStrength): ConstraintStrength;

    fromAny(strength: AnyConstraintStrength): ConstraintStrength;
  };

  (ConstraintStrength as Mutable<typeof ConstraintStrength>).Required = 1001001000;
  (ConstraintStrength as Mutable<typeof ConstraintStrength>).Strong = 1000000;
  (ConstraintStrength as Mutable<typeof ConstraintStrength>).Medium = 1000;
  (ConstraintStrength as Mutable<typeof ConstraintStrength>).Weak = 1;
  (ConstraintStrength as Mutable<typeof ConstraintStrength>).Unbound = -1;

  ConstraintStrength.clip = function (strength: ConstraintStrength): ConstraintStrength {
    return Math.min(Math.max(0, strength), ConstraintStrength.Required);
  };

  ConstraintStrength.fromAny = function (strength: AnyConstraintStrength): ConstraintStrength {
    if (typeof strength === "number") {
      return ConstraintStrength.clip(strength);
    } else if (strength === "required") {
      return ConstraintStrength.Required;
    } else if (strength === "strong") {
      return ConstraintStrength.Strong;
    } else if (strength === "medium") {
      return ConstraintStrength.Medium;
    } else if (strength === "weak") {
      return ConstraintStrength.Weak;
    }
    throw new TypeError("" + strength);
  };

  return ConstraintStrength;
})();
