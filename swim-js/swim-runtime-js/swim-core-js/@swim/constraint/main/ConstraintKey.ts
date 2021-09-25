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

export interface ConstraintKey {
  readonly id: number;
}

export const ConstraintKey = {} as {
  /** @hidden */
  idCount: number;

  nextId(): number;
};

(ConstraintKey as Mutable<typeof ConstraintKey>).idCount = 0;

ConstraintKey.nextId = function (): number {
  const nextId = ConstraintKey.idCount + 1;
  (ConstraintKey as Mutable<typeof ConstraintKey>).idCount = nextId;
  return nextId;
};
