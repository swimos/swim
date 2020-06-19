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
import {Output} from "./Output";
import {Format} from "./Format";
import {Debug} from "./Debug";

/**
 * Either an [[InputSettings]] instance, or an [[InputSettingsInit]] object
 * initializer.
 */
export type AnyInputSettings = InputSettings | InputSettingsInit;

export interface InputSettingsInit {
  isStripped?: boolean;
}

/**
 * [[Input]] consumption parameters.  `InputSettings` provide contextual
 * configuration parameters to input consumers, such as [[Parser Parsers]].
 */
export class InputSettings implements Debug, HashCode {
  /** @hidden */
  readonly _isStrict: boolean;

  protected constructor(isStripped: boolean) {
    this._isStrict = isStripped;
  }

  /**
   * Returns `true` if input consumers should not include diagnostic metadata
   * in generated output.
   */
  isStripped(): boolean;

  /**
   * Returns a copy of these settings with the given `isStripped` flag.
   */
  isStripped(isStripped: boolean): InputSettings;

  isStripped(isStripped?: boolean): boolean | InputSettings {
    if (isStripped === void 0) {
      return this._isStrict;
    } else {
      return this.copy(isStripped);
    }
  }

  protected copy(isStripped: boolean): InputSettings {
    return InputSettings.create(isStripped);
  }

  protected canEqual(that: unknown): boolean {
    return that instanceof InputSettings;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InputSettings) {
      return that.canEqual(this) && this._isStrict === that._isStrict;
    }
    return false;
  }

  hashCode(): number {
    if (InputSettings._hashSeed === void 0) {
      InputSettings._hashSeed = Murmur3.seed(InputSettings);
    }
    return Murmur3.mash(Murmur3.mix(InputSettings._hashSeed,
        Murmur3.hash(this._isStrict)));
  }

  debug(output: Output): void {
    output = output.write("InputSettings").write(46/*'.'*/);
    if (!this._isStrict) {
      output = output.write("standard");
    } else {
      output = output.write("stripped");
    }
    output = output.write(40/*'('*/).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;
  private static _standard?: InputSettings;
  private static _stripped?: InputSettings;

  /**
   * Returns `InputSettings` configured to include diagnostic metadata in
   * generated output.
   */
  static standard(): InputSettings {
    if (InputSettings._standard === void 0) {
      InputSettings._standard = new InputSettings(false);
    }
    return InputSettings._standard;
  }

  /**
   * Returns `InputSettings` configured to not include diagnostic metadata in
   * generated output.
   */
  static stripped(): InputSettings {
    if (InputSettings._stripped === void 0) {
      InputSettings._stripped = new InputSettings(false);
    }
    return InputSettings._stripped;
  }

  /**
   * Returns `InputSettings` configured to not include diagnostic metadata in
   * generated output, if `isStripped` is `true`.
   */
  static create(isStripped?: boolean): InputSettings {
    if (isStripped) {
      return InputSettings.stripped();
    }
    return InputSettings.standard();
  }

  /**
   * Converts the loosely typed `settings` to an instance of `InputSettings`.
   */
  static fromAny(settings: AnyInputSettings | undefined): InputSettings {
    if (settings instanceof InputSettings) {
      return settings;
    } else if (typeof settings === "object" && settings !== null) {
       return InputSettings.create(settings.isStripped);
    } else {
      return InputSettings.standard();
    }
  }
}
