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

import {Murmur3} from "@swim/util";
import {Booleans} from "@swim/util";
import {Constructors} from "@swim/util";
import type {Output} from "../output/Output";
import {UtfErrorMode} from "./UtfErrorMode";

/** @internal */
export class UtfErrorModeFatal extends UtfErrorMode {
  constructor(nonZero: boolean) {
    super();
    Object.defineProperty(this, "nonZero", {
      value: nonZero,
      enumerable: true,
    });
  }

  override isFatal(): boolean {
    return true;
  }

  override get replacementChar(): number {
    return 0xfffd;
  }

  /** @internal */
  readonly nonZero!: boolean;

  override isNonZero(): boolean {
    return this.nonZero;
  }

  override asNonZero(nonZero: boolean): UtfErrorMode {
    if (nonZero) {
      return UtfErrorMode.fatalNonZero();
    } else {
      return UtfErrorMode.fatal();
    }
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UtfErrorModeFatal) {
      return this.nonZero === that.nonZero;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(UtfErrorModeFatal),
        Booleans.hash(this.nonZero)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UtfErrorMode").write(46/*'.'*/)
                   .write(this.nonZero ? "fatalNonZero" : "fatal")
                   .write(40/*'('*/).write(41/*')'*/);
    return output;
  }
}
