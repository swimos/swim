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

import {Lazy, Murmur3, HashCode, Numbers, Constructors} from "@swim/util";
import {Output, Format, Debug} from "@swim/codec";

/**
 * Either an [[InterpreterSettings]] instance, or an [[InterpreterSettingsInit]]
 * object initializer.
 */
export type AnyInterpreterSettings = InterpreterSettings | InterpreterSettingsInit;

/**
 * [[InterpreterSettings]] object initializer.
 */
export interface InterpreterSettingsInit {
  maxScopeDepth?: number;
}

export class InterpreterSettings implements Debug, HashCode {
  constructor(maxScopeDepth: number) {
    Object.defineProperty(this, "maxScopeDepth", {
      value: maxScopeDepth,
      enumerable: true,
    });
  }

  readonly maxScopeDepth!: number;

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
