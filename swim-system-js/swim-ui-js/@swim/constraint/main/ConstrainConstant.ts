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

import {Output, Debug, Format} from "@swim/codec";
import {ConstraintMap} from "./ConstraintMap";
import {Constrain} from "./Constrain";
import {ConstrainTerm} from "./ConstrainTerm";
import {ConstrainVariable} from "./ConstrainVariable";

export class ConstrainConstant extends ConstrainTerm implements Debug {
  /** @hidden */
  readonly _value: number;

  constructor(value: number) {
    super();
    this._value = value;
  }

  isConstant(): boolean {
    return true;
  }

  get value(): number {
    return this._value;
  }

  get coefficient(): number {
    return 0;
  }

  get variable(): ConstrainVariable | null {
    return null;
  }

  get terms(): ConstraintMap<ConstrainVariable, number> {
    return new ConstraintMap<ConstrainVariable, number>();
  }

  get constant(): number {
    return this._value;
  }

  plus(that: Constrain | number): Constrain {
    if (typeof that === "number") {
      that = Constrain.constant(that);
    }
    if (that instanceof ConstrainConstant) {
      return Constrain.constant(this._value + that._value);
    } else {
      return Constrain.sum(this, that);
    }
  }

  opposite(): ConstrainTerm {
    return Constrain.constant(-this._value);
  }

  minus(that: Constrain | number): Constrain {
    if (typeof that === "number") {
      that = Constrain.constant(that);
    }
    if (that instanceof ConstrainConstant) {
      return Constrain.constant(this._value - that._value);
    } else {
      return Constrain.sum(this, that.opposite());
    }
  }

  times(scalar: number): Constrain {
    return Constrain.constant(this._value * scalar);
  }

  divide(scalar: number): Constrain {
    return Constrain.constant(this._value / scalar);
  }

  debug(output: Output): void {
    output = output.write("Constrain").write(46/*'.'*/).write("constant").write(40/*'('*/)
        .debug(this._value).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }
}
Constrain.Constant = ConstrainConstant;
