// Copyright 2015-2023 Swim.inc
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

import {Murmur3, Booleans, Numbers, Constructors} from "@swim/util";
import type {Output} from "../output/Output";
import {UtfErrorMode} from "./UtfErrorMode";

/** @internal */
export class UtfErrorModeReplacement extends UtfErrorMode {
  constructor(replacementChar: number, nonZero: boolean) {
    super();
    Object.defineProperty(this, "replacementChar", {
      value: replacementChar,
      enumerable: true,
    });
    Object.defineProperty(this, "nonZero", {
      value: nonZero,
      enumerable: true,
    });
  }

  override isReplacement(): boolean {
    return true;
  }

  override readonly replacementChar!: number;

  /** @internal */
  readonly nonZero!: boolean;

  override isNonZero(): boolean {
    return this.nonZero;
  }

  override asNonZero(nonZero: boolean): UtfErrorMode {
    if (this.replacementChar === 0xfffd) {
      if (nonZero) {
        return UtfErrorMode.replacementNonZero();
      } else {
        return UtfErrorMode.replacement();
      }
    } else {
      return new UtfErrorModeReplacement(this.replacementChar, nonZero);
    }
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UtfErrorModeReplacement) {
      return this.replacementChar === that.replacementChar
          && this.nonZero === that.nonZero;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(UtfErrorModeReplacement),
        Numbers.hash(this.replacementChar)), Booleans.hash(this.nonZero)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UtfErrorMode").write(46/*'.'*/)
                   .write(this.nonZero ? "replacementNonZero" : "replacement")
                   .write(40/*'('*/).write(41/*')'*/);
    return output;
  }
}
