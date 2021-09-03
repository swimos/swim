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

import {Lazy, Murmur3, HashCode, Booleans, Numbers, Strings, Constructors} from "@swim/util";
import type {Output} from "../output/Output";
import type {Debug} from "../format/Debug";
import {Format} from "../format/Format";

/**
 * Either an [[OutputSettings]] instance, or an [[OutputSettingsInit]] object
 * initializer.
 */
export type AnyOutputSettings = OutputSettings | OutputSettingsInit;

/**
 * [[OutputSettings]] object initializer.
 */
export interface OutputSettingsInit {
  lineSeparator?: string;
  isPretty?: boolean;
  isStyled?: boolean;
  precision?: number;
}

/**
 * [[Output]] production parameters.  `OutputSettings` provide contextual
 * configuration parameters to output producers, such as [[Writer Writers]].
 * Uses include enabling pretty printing and styling generated output.
 * Subclasses can provide additional parameters understood by specialized
 * output producers.
 */
export class OutputSettings implements Debug, HashCode {
  protected constructor(lineSeparator: string, pretty: boolean,
                        styled: boolean, precision: number) {
    Object.defineProperty(this, "lineSeparator", {
      value: lineSeparator,
      enumerable: true,
    });
    Object.defineProperty(this, "pretty", {
      value: pretty,
      enumerable: true,
    });
    Object.defineProperty(this, "styled", {
      value: styled,
      enumerable: true,
    });
    Object.defineProperty(this, "precision", {
      value: precision,
      enumerable: true,
    });
  }

  /**
   * The Unicode code point sequence used to separate lines of text.
   * Defaults to the runtime operating system's line separator.
   */
  readonly lineSeparator!: string;

  /**
   * Returns a copy of these settings with the given `lineSeparator`.
   */
  withLineSeparator(lineSeparator: string | undefined): string | OutputSettings {
    return this.copy(lineSeparator, this.pretty, this.styled, this.precision);
  }

  /** @hidden */
  readonly pretty!: boolean;

  /**
   * Returns `true` if output producers should pretty print their output,
   * when possible.
   */
  isPretty(): boolean {
    return this.pretty;
  }

  /**
   * Returns a copy of these settings with the given `pretty` flag.
   */
  asPretty(pretty: boolean): OutputSettings {
    return this.copy(this.lineSeparator, pretty, this.styled, this.precision);
  }

  /** @hidden */
  readonly styled!: boolean;

  /**
   * Returns `true` if output producers should style their output,
   * when possible.
   */
  isStyled(): boolean {
    return this.styled;
  }

  /**
   * Returns a copy of these settings with the given `styled` flag.
   */
  asStyled(styled: boolean): OutputSettings {
    return this.copy(this.lineSeparator, this.pretty, styled, this.precision);
  }

  /**
   * Returns the numeric precision output producers should use
   * when formatting numbers.
   */
  readonly precision!: number;

  /**
   * Returns a copy of these settings with the given numeric `precision`.
   */
  withPrecision(precision: number): OutputSettings {
    return this.copy(this.lineSeparator, this.pretty, this.styled, precision);
  }

  protected copy(lineSeparator: string | undefined, pretty: boolean,
                 styled: boolean, precision: number): OutputSettings {
    return OutputSettings.create(lineSeparator, pretty, styled, precision);
  }

  protected canEqual(that: unknown): boolean {
    return that instanceof OutputSettings;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof OutputSettings) {
      return that.canEqual(this) && this.lineSeparator === that.lineSeparator
          && this.pretty === that.pretty && this.styled === that.styled
          && this.precision === that.precision;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(OutputSettings), Strings.hash(this.lineSeparator)),
        Booleans.hash(this.pretty)), Booleans.hash(this.styled)),
        Numbers.hash(this.precision)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("OutputSettings").write(46/*'.'*/);
    if (!this.pretty && !this.styled) {
      output = output.write("standard");
    } else if (this.pretty && !this.styled) {
      output = output.write("pretty");
    } else if (!this.pretty && this.styled) {
      output = output.write("styled");
    } else {
      output = output.write("prettyStyled");
    }
    output = output.write(40/*'('*/).write(41/*')'*/);
    if (this.lineSeparator !== Format.lineSeparator) {
      output = output.write(46/*'.'*/).write("lineSeparator").write(40/*'('*/)
                     .display(this.lineSeparator).write(41/*')'*/);
    }
    if (this.precision !== -1) {
      output = output.write(46/*'.'*/).write("precision").write(40/*'('*/)
                     .display(this.precision).write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  /**
   * Returns `OutputSettings` configured with the system line separator,
   * pretty printing disabled, and styling disabled.
   */
  @Lazy
  static standard(): OutputSettings {
    return new OutputSettings(Format.lineSeparator, false, false, -1);
  }

  /**
   * Returns `OutputSettings` configured with the system line separator,
   * pretty printing enabled, and styling disabled.
   */
  @Lazy
  static pretty(): OutputSettings {
    return new OutputSettings(Format.lineSeparator, true, false, -1);
  }

  /**
   * Returns `OutputSettings` configured with the system line separator,
   * pretty printing disabled, and styling enabled.
   */
  @Lazy
  static styled(): OutputSettings {
    return new OutputSettings(Format.lineSeparator, false, true, -1);
  }

  /**
   * Returns `OutputSettings` configured with the system line separator,
   * pretty printing enabled, and styling enabled.
   */
  @Lazy
  static prettyStyled(): OutputSettings {
    return new OutputSettings(Format.lineSeparator, true, true, -1);
  }

  /**
   * Returns `OutputSettings` configured with the given `lineSeparator`, pretty
   * rinting enabled if `isPretty` is `true`, styling enabled if `isStyled` is
   * `true`, and with the given numeric `precision`.
   */
  static create(lineSeparator?: string, pretty?: boolean,
                styled?: boolean, precision?: number): OutputSettings {
    if (typeof lineSeparator !== "string") {
      lineSeparator = Format.lineSeparator;
    }
    if (typeof pretty !== "boolean") {
      pretty = false;
    }
    if (typeof styled !== "boolean") {
      styled = false;
    }
    if (typeof precision !== "number") {
      precision = -1;
    }
    if (lineSeparator === Format.lineSeparator && precision === -1) {
      if (!pretty && !styled) {
        return OutputSettings.standard();
      } else if (pretty && !styled) {
        return OutputSettings.pretty();
      } else if (!pretty && styled) {
        return OutputSettings.styled();
      } else {
        return OutputSettings.prettyStyled();
      }
    }
    return new OutputSettings(lineSeparator, pretty, styled, precision);
  }

  /**
   * Converts a settings `init` object to an instance of `OutputSettings`.
   */
  static fromInit(init: OutputSettingsInit): OutputSettings {
    return OutputSettings.create(init.lineSeparator, init.isPretty,
                                 init.isStyled, init.precision);
  }

  /**
   * Converts a loosely typed settings `value` to an instance of `OutputSettings`.
   */
  static fromAny(value: AnyOutputSettings | undefined): OutputSettings {
    if (value instanceof OutputSettings) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return OutputSettings.fromInit(value);
    }
    return OutputSettings.standard();
  }
}
