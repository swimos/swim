// Copyright 2015-2020 Swim inc.
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

import {HashCode, Murmur3} from "@swim/util";
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
  lineSeparator?: string | null;
  isPretty?: boolean;
  isStyled?: boolean;
}

export class InterpreterSettings implements Debug, HashCode {
  /** @hidden */
  readonly _maxScopeDepth: number;

  constructor(maxScopeDepth: number) {
    this._maxScopeDepth = maxScopeDepth;
  }

  maxScopeDepth(): number;

  maxScopeDepth(maxScopeDepth: number): InterpreterSettings;

  maxScopeDepth(maxScopeDepth?: number): number | InterpreterSettings {
    if (maxScopeDepth === void 0) {
      return this._maxScopeDepth;
    } else {
      return this.copy(maxScopeDepth);
    }
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
      return that.canEqual(this) && this._maxScopeDepth === that._maxScopeDepth;
    }
    return false;
  }

  hashCode(): number {
    if (InterpreterSettings._hashSeed === void 0) {
      InterpreterSettings._hashSeed = Murmur3.seed(InterpreterSettings);
    }
    return Murmur3.mash(Murmur3.mix(InterpreterSettings._hashSeed, this._maxScopeDepth));
  }

  debug(output: Output): void {
    output = output.write("new").write(32/*' '*/).write("InterpreterSettings")
        .write(40/*'('*/).debug(this._maxScopeDepth).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;
  private static _standard?: InterpreterSettings;

  static standard(): InterpreterSettings {
    if (InterpreterSettings._standard === void 0) {
      const maxScopeDepth = 1024;
      InterpreterSettings._standard = new InterpreterSettings(maxScopeDepth);
    }
    return InterpreterSettings._standard;
  }
}
