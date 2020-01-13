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

import {HashCode, Murmur3} from "@swim/util";
import {Output} from "./Output";
import {Format} from "./Format";
import {Debug} from "./Debug";

/**
 * Either an [[OutputSettings]] instance, or an [[OutputSettingsInit]] object
 * initializer.
 */
export type AnyOutputSettings = OutputSettings | OutputSettingsInit;

/**
 * [[OutputSettings]] object initializer.
 */
export interface OutputSettingsInit {
  lineSeparator?: string | null;
  isPretty?: boolean;
  isStyled?: boolean;
}

/**
 * [[Output]] production parameters.  `OutputSettings` provide contextual
 * configuration parameters to output producers, such as [[Writer Writers]].
 * Uses include enabling pretty printing and styling generated output.
 * Subclasses can provide additional parameters understood by specialized
 * output producers.
 */
export class OutputSettings implements Debug, HashCode {
  /** @hidden */
  readonly _lineSeparator: string;
  /** @hidden */
  readonly _isPretty: boolean;
  /** @hidden */
  readonly _isStyled: boolean;

  protected constructor(lineSeparator: string, isPretty: boolean, isStyled: boolean) {
    this._lineSeparator = lineSeparator;
    this._isPretty = isPretty;
    this._isStyled = isStyled;
  }

  /**
   * Returns the code point sequence used to separate lines of text.
   * Defaults to the operating system's line separator.
   */
  lineSeparator(): string;

  /**
   * Returns a copy of these settings with the given `lineSeparator`.
   */
  lineSeparator(lineSeparator: string | null): OutputSettings;

  lineSeparator(lineSeparator?: string | null): string | OutputSettings {
    if (lineSeparator === void 0) {
      return this._lineSeparator;
    } else {
      return this.copy(lineSeparator, this._isPretty, this._isStyled);
    }
  }

  /**
   * Returns `true` if output producers should pretty print their output,
   * when possible.
   */
  isPretty(): boolean;

  /**
   * Returns a copy of these settings with the given `isPretty` flag.
   */
  isPretty(isPretty: boolean): OutputSettings;

  isPretty(isPretty?: boolean): boolean | OutputSettings {
    if (isPretty === void 0) {
      return this._isPretty;
    } else {
      return this.copy(this._lineSeparator, isPretty, this._isStyled);
    }
  }

  /**
   * Returns `true` if output producers should style their output,
   * when possible.
   */
  isStyled(): boolean;

  /**
   * Returns a copy of these settings with the given `isStyled` flag.
   */
  isStyled(isStyled: boolean): OutputSettings;

  isStyled(isStyled?: boolean): boolean | OutputSettings {
    if (isStyled === void 0) {
      return this._isStyled;
    } else {
      return this.copy(this._lineSeparator, this._isPretty, isStyled);
    }
  }

  protected copy(lineSeparator: string | null, isPretty: boolean, isStyled: boolean): OutputSettings {
    return OutputSettings.create(lineSeparator, isPretty, isStyled);
  }

  protected canEqual(that: unknown): boolean {
    return that instanceof OutputSettings;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof OutputSettings) {
      return that.canEqual(this) && this._lineSeparator === that._lineSeparator
          && this._isPretty === that._isPretty && this._isStyled === that._isStyled;
    }
    return false;
  }

  hashCode(): number {
    if (OutputSettings._hashSeed === void 0) {
      OutputSettings._hashSeed = Murmur3.seed(OutputSettings);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(OutputSettings._hashSeed,
        Murmur3.hash(this._lineSeparator)), Murmur3.hash(this._isPretty)),
        Murmur3.hash(this._isStyled)));
  }

  debug(output: Output): void {
    output = output.write("OutputSettings").write(46/*'.'*/);
    if (!this._isPretty && !this._isStyled) {
      output = output.write("standard");
    } else if (this._isPretty && !this._isStyled) {
      output = output.write("pretty");
    } else if (!this._isPretty && this._isStyled) {
      output = output.write("styled");
    } else {
      output = output.write("prettyStyled");
    }
    output = output.write(40/*'('*/).write(41/*')'*/);
    if (Format.lineSeparator() !== this._lineSeparator) {
      output = output.write(46/*'.'*/).write("lineSeparator").write(40/*'('*/)
          .display(this._lineSeparator).write(41/*')'*/);
    }
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;
  private static _standard?: OutputSettings;
  private static _pretty?: OutputSettings;
  private static _styled?: OutputSettings;
  private static _prettyStyled?: OutputSettings;

  /**
   * Returns `OutputSettings` configured with the system line separator,
   * pretty printing disabled, and styling disabled.
   */
  static standard(): OutputSettings {
    if (!OutputSettings._standard) {
      OutputSettings._standard = new OutputSettings(Format.lineSeparator(), false, false);
    }
    return OutputSettings._standard;
  }

  /**
   * Returns `OutputSettings` configured with the system line separator,
   * pretty printing enabled, and styling disabled.
   */
  static pretty(): OutputSettings {
    if (!OutputSettings._pretty) {
      OutputSettings._pretty = new OutputSettings(Format.lineSeparator(), true, false);
    }
    return OutputSettings._pretty;
  }

  /**
   * Returns `OutputSettings` configured with the system line separator,
   * pretty printing disabled, and styling enabled.
   */
  static styled(): OutputSettings {
    if (!OutputSettings._styled) {
      OutputSettings._styled = new OutputSettings(Format.lineSeparator(), false, true);
    }
    return OutputSettings._styled;
  }

  /**
   * Returns `OutputSettings` configured with the system line separator,
   * pretty printing enabled, and styling enabled.
   */
  static prettyStyled(): OutputSettings {
    if (!OutputSettings._prettyStyled) {
      OutputSettings._prettyStyled = new OutputSettings(Format.lineSeparator(), true, true);
    }
    return OutputSettings._prettyStyled;
  }

  /**
   * Returns `OutputSettings` configured with the given `lineSeparator`, pretty
   * rinting enabled if `isPretty` is `true`, and styling enabled if `isStyled`
   * is `true`.
   */
  static create(lineSeparator?: string | null, isPretty?: boolean, isStyled?: boolean): OutputSettings {
    if (typeof lineSeparator !== "string") {
      lineSeparator = Format.lineSeparator();
    }
    if (typeof isPretty !== "boolean") {
      isPretty = false;
    }
    if (typeof isStyled !== "boolean") {
      isStyled = false;
    }
    if (Format.lineSeparator() === lineSeparator) {
      if (!isPretty && !isStyled) {
        return OutputSettings.standard();
      } else if (isPretty && !isStyled) {
        return OutputSettings.pretty();
      } else if (!isPretty && isStyled) {
        return OutputSettings.styled();
      } else {
        return OutputSettings.prettyStyled();
      }
    }
    return new OutputSettings(lineSeparator, isPretty, isStyled);
  }

  /**
   * Converts the loosely typed `settings` to an instance of `OutputSettings`.
   */
  static fromAny(settings: AnyOutputSettings | undefined): OutputSettings {
    if (settings instanceof OutputSettings) {
      return settings;
    } else if (typeof settings === "object" && settings) {
      return OutputSettings.create(settings.lineSeparator, settings.isPretty, settings.isStyled);
    }
    return OutputSettings.standard();
  }
}
