// Copyright 2015-2021 Swim.inc
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

/** @public */
export type Affinity = number;

/** @public */
export const Affinity = (function () {
  const Affinity = {} as {
    readonly Transient: Affinity;
    readonly Inherited: Affinity;
    readonly Intrinsic: Affinity;
    readonly Extrinsic: Affinity;

    readonly Reflexive: Affinity;

    /** @internal */
    readonly Shift: number;
    /** @internal */
    readonly Mask: number;
  };

  (Affinity as Mutable<typeof Affinity>).Transient = 0;
  (Affinity as Mutable<typeof Affinity>).Inherited = 1;
  (Affinity as Mutable<typeof Affinity>).Intrinsic = 2;
  (Affinity as Mutable<typeof Affinity>).Extrinsic = 3;

  (Affinity as Mutable<typeof Affinity>).Reflexive = 1 << 2;

  (Affinity as Mutable<typeof Affinity>).Shift = 2;
  (Affinity as Mutable<typeof Affinity>).Mask = (1 << Affinity.Shift) - 1;

  return Affinity;
})();
