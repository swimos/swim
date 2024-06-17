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

import {Murmur3} from "./Murmur3";
import type {HashCode} from "./HashCode";
import type {Compare} from "./Compare";
import {Numbers} from "./Numbers";
import {Strings} from "./Strings";
import {Constructors} from "./Constructors";

/**
 * Level of importance. Used for log levels and diagnostic classifications.
 * @public
 */
export class Severity implements HashCode, Compare {
  /** @internal */
  constructor(level: number, label: string) {
    this.level = level;
    this.label = label;
  }

  /**
   * The integer level of importance of this `Severity`, with higher  levels
   * signifying greater importance. An integer between `0` and `7`, inclusive.
   * One of `TraceLevel`, `DebugLevel`, `InfoLevel`, `NoteLevel`,
   * `WarningLevel`, `ErrorLevel`, `AlertLevel`, `FatalLevel`.
   */
  readonly level: number;

  /**
   * A descriptive label for this `Severity`.
   */
  readonly label: string;

  /**
   * Returns `true` if this `Severity` has `TraceLevel` of importance.
   */
  isTrace(): boolean {
    return this.level === Severity.TraceLevel;
  }

  /**
   * Returns `true` if this `Severity` has `DebugLevel` of importance.
   */
  isDebug(): boolean {
    return this.level === Severity.DebugLevel;
  }

  /**
   * Returns `true` if this `Severity` has `InfoLevel` of importance.
   */
  isInfo(): boolean {
    return this.level === Severity.InfoLevel;
  }

  /**
   * Returns `true` if this `Severity` has `NoteLevel` of importance.
   */
  isNote(): boolean {
    return this.level === Severity.NoteLevel;
  }

  /**
   * Returns `true` if this `Severity` has `WarningLevel` of importance.
   */
  isWarning(): boolean {
    return this.level === Severity.WarningLevel;
  }

  /**
   * Returns `true` if this `Severity` has `ErrorLevel` of importance.
   */
  isError(): boolean {
    return this.level === Severity.ErrorLevel;
  }

  /**
   * Returns `true` if this `Severity` has `AlertLevel` of importance.
   */
  isAlert(): boolean {
    return this.level === Severity.AlertLevel;
  }

  /**
   * Returns `true` if this `Severity` has `FatalLevel` of importance.
   */
  isFatal(): boolean {
    return this.level === Severity.FatalLevel;
  }

  compareTo(that: unknown): number {
    if (this === that) {
      return 0;
    } else if (that instanceof Severity) {
      if (this.level < that.level) {
        return -1;
      } else if (this.level > that.level) {
        return 1;
      }
      return this.label.localeCompare(that.label);
    }
    return NaN;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Severity) {
      return this.level === that.level && this.label === that.label;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(Severity),
        Numbers.hash(this.level)), Strings.hash(this.label)));
  }

  toString(): string {
    return this.label;
  }

  static readonly TraceLevel: number = 0;
  static readonly DebugLevel: number = 1;
  static readonly InfoLevel: number = 2;
  static readonly NoteLevel: number = 3;
  static readonly WarningLevel: number = 4;
  static readonly ErrorLevel: number = 5;
  static readonly AlertLevel: number = 6;
  static readonly FatalLevel: number = 7;

  static readonly TraceLabel: string = "trace";
  static readonly DebugLabel: string = "debug";
  static readonly InfoLabel: string = "info";
  static readonly NoteLabel: string = "note";
  static readonly WarningLabel: string = "warning";
  static readonly ErrorLabel: string = "error";
  static readonly AlertLabel: string = "alert";
  static readonly FatalLabel: string = "fatal";

  /** @internal */
  static Trace: Severity | null = null;
  /** @internal */
  static Debug: Severity | null = null;
  /** @internal */
  static Info: Severity | null = null;
  /** @internal */
  static Note: Severity | null = null;
  /** @internal */
  static Warning: Severity | null = null;
  /** @internal */
  static Error: Severity | null = null;
  /** @internal */
  static Alert: Severity | null = null;
  /** @internal */
  static Fatal: Severity | null = null;

  /**
   * Returns a `Severity` with the given importance `level`, and optional
   * descriptive `label`.
   *
   * @throws `Error` if `level` is not a valid level of importance.
   */
  static create(level: number, label?: string): Severity {
    switch (level) {
      case this.TraceLevel:
        return this.trace(label);
      case this.DebugLevel:
        return this.debug(label);
      case this.InfoLevel:
        return this.info(label);
      case this.NoteLevel:
        return this.note(label);
      case this.WarningLevel:
        return this.warning(label);
      case this.ErrorLevel:
        return this.error(label);
      case this.AlertLevel:
        return this.alert(label);
      case this.FatalLevel:
        return this.fatal(label);
      default:
        throw new Error("" + level);
    }
  }

  /**
   * Returns a `Severity` with `TraceLevel` of importance, and an optional
   * descriptive `label`.
   */
  static trace(label?: string): Severity {
    if (label === void 0 || label === this.TraceLabel) {
      if (this.Trace === null) {
        this.Trace = new Severity(this.TraceLevel, this.TraceLabel);
      }
      return this.Trace;
    }
    return new Severity(this.TraceLevel, label);
  }

  /**
   * Returns a `Severity` with `DebugLevel` of importance, and an optional
   * descriptive `label`.
   */
  static debug(label?: string): Severity {
    if (label === void 0 || label === this.DebugLabel) {
      if (this.Debug === null) {
        this.Debug = new Severity(this.DebugLevel, this.DebugLabel);
      }
      return this.Debug;
    }
    return new Severity(this.DebugLevel, label);
  }

  /**
   * Returns a `Severity` with `InfoLevel` of importance, and an optional
   * descriptive `label`.
   */
  static info(label?: string): Severity {
    if (label === void 0 || label === this.InfoLabel) {
      if (this.Info === null) {
        this.Info = new Severity(this.InfoLevel, this.InfoLabel);
      }
      return this.Info;
    }
    return new Severity(this.InfoLevel, label);
  }

  /**
   * Returns a `Severity` with `NoteLevel` of importance, and an optional
   * descriptive `label`.
   */
  static note(label?: string): Severity {
    if (label === void 0 || label === this.NoteLabel) {
      if (this.Note === null) {
        this.Note = new Severity(this.NoteLevel, this.NoteLabel);
      }
      return this.Note;
    }
    return new Severity(this.NoteLevel, label);
  }

  /**
   * Returns a `Severity` with `WarningLevel` of importance, and an optional
   * descriptive `label`.
   */
  static warning(label?: string): Severity {
    if (label === void 0 || label === this.WarningLabel) {
      if (this.Warning === null) {
        this.Warning = new Severity(this.WarningLevel, this.WarningLabel);
      }
      return this.Warning;
    }
    return new Severity(this.WarningLevel, label);
  }

  /**
   * Returns a `Severity` with `ErrorLevel` of importance, and an optional
   * descriptive `label`.
   */
  static error(label?: string): Severity {
    if (label === void 0 || label === this.ErrorLabel) {
      if (this.Error === null) {
        this.Error = new Severity(this.ErrorLevel, this.ErrorLabel);
      }
      return this.Error;
    }
    return new Severity(this.ErrorLevel, label);
  }

  /**
   * Returns a `Severity` with `AlertLevel` of importance, and an optional
   * descriptive `label`.
   */
  static alert(label?: string): Severity {
    if (label === void 0 || label === this.AlertLabel) {
      if (this.Alert === null) {
        this.Alert = new Severity(this.AlertLevel, this.AlertLabel);
      }
      return this.Alert;
    }
    return new Severity(this.AlertLevel, label);
  }

  /**
   * Returns a `Severity` with `FatalLevel` of importance, and an optional
   * descriptive `label`.
   */
  static fatal(label?: string): Severity {
    if (label === void 0 || label === this.FatalLabel) {
      if (this.Fatal === null) {
        this.Fatal = new Severity(this.FatalLevel, this.FatalLabel);
      }
      return this.Fatal;
    }
    return new Severity(this.FatalLevel, label);
  }
}
