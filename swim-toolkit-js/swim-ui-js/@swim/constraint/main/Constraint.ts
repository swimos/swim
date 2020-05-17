// Copyright 2015-2020 SWIM.AI inc.
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

import {Output, Debug, Format} from "@swim/codec";
import {ConstraintKey, ConstraintMap} from "./ConstraintMap";
import {Constrain} from "./Constrain";
import {ConstraintRelation} from "./ConstraintRelation";
import {ConstraintStrength} from "./ConstraintStrength";
import {ConstraintScope} from "./ConstraintScope";

export class Constraint implements ConstraintKey, Debug {
  /** @hidden */
  readonly _id: number;
  /** @hidden */
  readonly _scope: ConstraintScope;
  /** @hidden */
  readonly _constrain: Constrain;
  /** @hidden */
  readonly _relation: ConstraintRelation;
  /** @hidden */
  readonly _strength: ConstraintStrength;

  constructor(scope: ConstraintScope, constrain: Constrain,
              relation: ConstraintRelation, strength: ConstraintStrength) {
    this._id = ConstraintMap.nextId();
    this._scope = scope;
    this._constrain = constrain;
    this._relation = relation;
    this._strength = strength;
  }

  /** @hidden */
  get id(): number {
    return this._id;
  }

  get scope(): ConstraintScope {
    return this._scope;
  }

  get constrain(): Constrain {
    return this._constrain;
  }

  get relation(): ConstraintRelation {
    return this._relation;
  }

  get strength(): ConstraintStrength {
    return this._strength;
  }

  enabled(): boolean;
  enabled(enabled: boolean): this;
  enabled(enabled?: boolean): boolean | this {
    if (enabled === void 0) {
      return this._scope.hasConstraint(this);
    } else {
      if (enabled) {
        this._scope.addConstraint(this);
      } else {
        this._scope.removeConstraint(this);
      }
      return this;
    }
  }

  debug(output: Output): void {
    output = output.debug(this._scope).write(46/*'.'*/).write("constraint").write(40/*'('*/)
        .debug(this._constrain).write(", ").debug(this._relation).write(", ").debug(void 0).write(", ");
    if (this._strength === ConstraintStrength.Required) {
      output = output.debug("required");
    } else if (this._strength === ConstraintStrength.Strong) {
      output = output.debug("strong");
    } else if (this._strength === ConstraintStrength.Medium) {
      output = output.debug("medium");
    } else if (this._strength === ConstraintStrength.Weak) {
      output = output.debug("weak");
    } else {
      output = output.debug(this._strength);
    }
    output = output.write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }
}
