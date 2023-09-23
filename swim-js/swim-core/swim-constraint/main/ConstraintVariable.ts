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

import type {ConstraintSymbol} from "./ConstraintSymbol";
import type {ConstraintTerm} from "./ConstraintTerm";
import type {ConstraintStrength} from "./Constraint";

/** @public */
export interface ConstraintVariable extends ConstraintSymbol, ConstraintTerm {
  readonly name: PropertyKey;

  readonly strength: ConstraintStrength;

  /** @internal */
  evaluateConstraintVariable(): void;
}
