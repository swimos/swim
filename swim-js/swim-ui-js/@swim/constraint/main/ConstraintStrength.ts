// Copyright 2015-2019 SWIM.AI inc.
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

export type AnyConstraintStrength = ConstraintStrength | ConstraintStrengthInit;

export type ConstraintStrengthInit = "required" | "strong" | "medium" | "weak";

export type ConstraintStrength = number;

export const ConstraintStrength = {
  Required: 1001001000,
  Strong: 1000000,
  Medium: 1000,
  Weak: 1,
  Unbound: -1,

  clip(strength: ConstraintStrength): ConstraintStrength {
    return Math.min(Math.max(0, strength), ConstraintStrength.Required);
  },

  fromAny(strength: AnyConstraintStrength): ConstraintStrength {
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
  },
};
