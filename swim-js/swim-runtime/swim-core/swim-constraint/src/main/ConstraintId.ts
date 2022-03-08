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

/** @public */
export interface ConstraintId {
  /** @internal */
  readonly id: number;
}

/** @public */
export const ConstraintId = (function () {
  const ConstraintId = {} as {
    /** @internal */
    next(): number;
  };

  let nextId = 1;
  ConstraintId.next = function (): number {
    const id = ~~nextId;
    nextId += 1;
    return id;
  };

  return ConstraintId;
})();
