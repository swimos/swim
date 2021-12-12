// Copyright 2015-2021 Swim.inc
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

import {Lazy, Murmur3, HashCode, Booleans, Constructors} from "@swim/util";
import type {Output} from "../output/Output";
import type {Debug} from "../format/Debug";
import {Format} from "../format/Format";

/**
 * Either an [[InputSettings]] instance, or an [[InputSettingsInit]] object
 * initializer.
 * @public
 */
export type AnyInputSettings = InputSettings | InputSettingsInit;

/**
 * [[InputSettings]] object initializer.
 * @public
 */
export interface InputSettingsInit {
  isStripped?: boolean;
}

/**
 * [[Input]] consumption parameters. `InputSettings` provide contextual
 * configuration parameters to input consumers, such as [[Parser Parsers]].
 * @public
 */
export class InputSettings implements HashCode, Debug {
  protected constructor(stripped: boolean) {
    Object.defineProperty(this, "stripped", {
      value: stripped,
      enumerable: true,
    });
  }

  /** @internal */
  readonly stripped!: boolean;

  /**
   * Returns `true` if input consumers should not include diagnostic metadata
   * in generated output.
   */
  isStripped(): boolean {
    return this.stripped;
  }

  /**
   * Returns a copy of these settings with the given `stripped` flag.
   */
  asStripped(stripped: boolean): InputSettings {
    return this.copy(stripped);
  }

  protected copy(stripped: boolean): InputSettings {
    return InputSettings.create(stripped);
  }

  protected canEqual(that: unknown): boolean {
    return that instanceof InputSettings;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InputSettings) {
      return that.canEqual(this) && this.stripped === that.stripped;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(InputSettings),
        Booleans.hash(this.stripped)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("InputSettings").write(46/*'.'*/);
    if (!this.stripped) {
      output = output.write("standard");
    } else {
      output = output.write("stripped");
    }
    output = output.write(40/*'('*/).write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  /**
   * Returns `InputSettings` configured to include diagnostic metadata in
   * generated output.
   */
  @Lazy
  static standard(): InputSettings {
    return new InputSettings(false);
  }

  /**
   * Returns `InputSettings` configured to omit diagnostic metadata in
   * generated output.
   */
  @Lazy
  static stripped(): InputSettings {
    return new InputSettings(true);
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
