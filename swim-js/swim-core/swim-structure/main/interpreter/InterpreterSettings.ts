// Copyright 2015-2024 Nstream, inc.
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

import {Lazy} from "@swim/util";
import {Murmur3} from "@swim/util";
import type {HashCode} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";

/** @public */
export class InterpreterSettings implements Debug, HashCode {
  constructor(maxScopeDepth: number) {
    this.maxScopeDepth = maxScopeDepth;
  }

  readonly maxScopeDepth: number;

  withMaxScopeDepth(maxScopeDepth: number): InterpreterSettings {
    return this.copy(maxScopeDepth);
  }

  protected copy(maxScopeDepth: number): InterpreterSettings {
    return new InterpreterSettings(maxScopeDepth);
  }

  protected canEqual(that: unknown): boolean {
    return that instanceof InterpreterSettings;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InterpreterSettings) {
      return that.canEqual(this) && this.maxScopeDepth === that.maxScopeDepth;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(InterpreterSettings),
        Numbers.hash(this.maxScopeDepth)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("new").write(32/*' '*/).write("InterpreterSettings")
                   .write(40/*'('*/).debug(this.maxScopeDepth).write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static standard(): InterpreterSettings {
    const maxScopeDepth = 1024;
    return new InterpreterSettings(maxScopeDepth);
  }
}
