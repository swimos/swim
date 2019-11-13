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

import {Constrain} from "./Constrain";
import {ConstrainVariable} from "./ConstrainVariable";
import {AnyConstraintStrength, ConstraintStrength} from "./ConstraintStrength";
import {ConstraintScope} from "./ConstraintScope";

export class ConstrainBinding extends ConstrainVariable {
  /** @hidden */
  readonly _scope: ConstraintScope;
  /** @hidden */
  _value: number;
  /** @hidden */
  _state: number;
  /** @hidden */
  _strength: ConstraintStrength;

  constructor(scope: ConstraintScope, name: string, value: number, strength: ConstraintStrength) {
    super();
    this._scope = scope;
    Object.defineProperty(this, "name", {
      value: name,
      enumerable: true,
      configurable: true,
    });
    this._value = value;
    this._state = NaN;
    this._strength = strength;
  }

  get scope(): ConstraintScope {
    return this._scope;
  }

  readonly name: string;

  get value(): number {
    return this._value;
  }

  updateValue(value: number): void {
    this._value = value;
  }

  get state(): number {
    return this._state;
  }

  setState(newState: number): void {
    const oldState = this._state;
    if (isFinite(oldState) && !isFinite(newState)) {
      this._scope.removeVariable(this);
    }
    this._state = newState;
    if (isFinite(newState)) {
      if (!isFinite(oldState)) {
        this._scope.addVariable(this);
      } else {
        this._scope.setVariable(this, newState);
      }
    }
  }

  get strength(): ConstraintStrength {
    return this._strength;
  }

  setStrength(newStrength: AnyConstraintStrength): void {
    const state = this._state;
    const oldStrength = this._strength;
    newStrength = ConstraintStrength.fromAny(newStrength);
    if (isFinite(state) && oldStrength !== newStrength) {
      this._scope.removeVariable(this);
    }
    this._strength = newStrength;
    if (isFinite(state) && oldStrength !== newStrength) {
      this._scope.addVariable(this);
    }
  }
}
Constrain.Binding = ConstrainBinding;
