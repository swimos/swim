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

import {Murmur3} from "../runtime/Murmur3";
import type {HashCode} from "../lang/HashCode";
import type {Compare} from "../lang/Compare";
import {Numbers} from "../runtime/Numbers";
import {Strings} from "../runtime/Strings";
import {Constructors} from "../runtime/Constructors";

/**
 * Level of importance.  Used for log levels and diagnostic classifications.
 */
export class Severity implements HashCode, Compare {
  private constructor(level: number, label: string) {
    this.level = level;
    this.label = label;
  }

  /**
   * The integer level of importance of this `Severity`, with higher  levels
   * signifying greater importance.  An integer between `0` and `7`, inclusive.
   * One of `TRACE_LEVEL`, `DEBUG_LEVEL`, `INFO_LEVEL`, `NOTE_LEVEL`,
   * `WARNING_LEVEL`, `ERROR_LEVEL`, `ALERT_LEVEL`, `FATAL_LEVEL`.
   */
  readonly level: number;

  /**
   * A descriptive label for this `Severity`.
   */
  readonly label: string;

  /**
   * Returns `true` if this `Severity` has `TRACE_LEVEL` of importance.
   */
  isTrace(): boolean {
    return this.level === Severity.TRACE_LEVEL;
  }

  /**
   * Returns `true` if this `Severity` has `DEBUG_LEVEL` of importance.
   */
  isDebug(): boolean {
    return this.level === Severity.DEBUG_LEVEL;
  }

  /**
   * Returns `true` if this `Severity` has `INFO_LEVEL` of importance.
   */
  isInfo(): boolean {
    return this.level === Severity.INFO_LEVEL;
  }

  /**
   * Returns `true` if this `Severity` has `NOTE_LEVEL` of importance.
   */
  isNote(): boolean {
    return this.level === Severity.NOTE_LEVEL;
  }

  /**
   * Returns `true` if this `Severity` has `WARNING_LEVEL` of importance.
   */
  isWarning(): boolean {
    return this.level === Severity.WARNING_LEVEL;
  }

  /**
   * Returns `true` if this `Severity` has `ERROR_LEVEL` of importance.
   */
  isError(): boolean {
    return this.level === Severity.ERROR_LEVEL;
  }

  /**
   * Returns `true` if this `Severity` has `ALERT_LEVEL` of importance.
   */
  isAlert(): boolean {
    return this.level === Severity.ALERT_LEVEL;
  }

  /**
   * Returns `true` if this `Severity` has `FATAL_LEVEL` of importance.
   */
  isFatal(): boolean {
    return this.level === Severity.FATAL_LEVEL;
  }

  compareTo(that: unknown): number {
    if (this === that) {
      return 0;
    } else if (that instanceof Severity) {
      if (this.level < that.level) {
        return -1;
      } else if (this.level > that.level) {
        return 1;
      } else {
        return this.label.localeCompare(that.label);
      }
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

  static readonly TRACE_LEVEL: number = 0;
  static readonly DEBUG_LEVEL: number = 1;
  static readonly INFO_LEVEL: number = 2;
  static readonly NOTE_LEVEL: number = 3;
  static readonly WARNING_LEVEL: number = 4;
  static readonly ERROR_LEVEL: number = 5;
  static readonly ALERT_LEVEL: number = 6;
  static readonly FATAL_LEVEL: number = 7;

  private static _trace?: Severity;
  private static _debug?: Severity;
  private static _info?: Severity;
  private static _note?: Severity;
  private static _warning?: Severity;
  private static _error?: Severity;
  private static _alert?: Severity;
  private static _fatal?: Severity;

  /**
   * Returns a `Severity` with the given importance `level`, and optional
   * descriptive `label`.
   *
   * @throws `Error` if `level` is not a valid level of importance.
   */
  static create(level: number, label?: string): Severity {
    switch (level) {
      case Severity.TRACE_LEVEL: return Severity.trace(label);
      case Severity.DEBUG_LEVEL: return Severity.debug(label);
      case Severity.INFO_LEVEL: return Severity.info(label);
      case Severity.NOTE_LEVEL: return Severity.note(label);
      case Severity.WARNING_LEVEL: return Severity.warning(label);
      case Severity.ERROR_LEVEL: return Severity.error(label);
      case Severity.ALERT_LEVEL: return Severity.alert(label);
      case Severity.FATAL_LEVEL: return Severity.fatal(label);
      default: throw new Error("" + level);
    }
  }

  /**
   * Returns a `Severity` with `TRACE_LEVEL` of importance, and an optional
   * descriptive `label`.
   */
  static trace(label: string = "trace"): Severity {
    if (label === "trace") {
      if (Severity._trace === void 0) {
        Severity._trace = new Severity(Severity.TRACE_LEVEL, label);
      }
      return Severity._trace;
    } else {
      return new Severity(Severity.TRACE_LEVEL, label);
    }
  }

  /**
   * Returns a `Severity` with `DEBUG_LEVEL` of importance, and an optional
   * descriptive `label`.
   */
  static debug(label: string = "debug"): Severity {
    if (label === "debug") {
      if (Severity._debug === void 0) {
        Severity._debug = new Severity(Severity.DEBUG_LEVEL, label);
      }
      return Severity._debug;
    } else {
      return new Severity(Severity.DEBUG_LEVEL, label);
    }
  }

  /**
   * Returns a `Severity` with `INFO_LEVEL` of importance, and an optional
   * descriptive `label`.
   */
  static info(label: string = "info"): Severity {
    if (label === "info") {
      if (Severity._info === void 0) {
        Severity._info = new Severity(Severity.INFO_LEVEL, label);
      }
      return Severity._info;
    } else {
      return new Severity(Severity.INFO_LEVEL, label);
    }
  }

  /**
   * Returns a `Severity` with `NOTE_LEVEL` of importance, and an optional
   * descriptive `label`.
   */
  static note(label: string = "note"): Severity {
    if (label === "note") {
      if (Severity._note === void 0) {
        Severity._note = new Severity(Severity.NOTE_LEVEL, label);
      }
      return Severity._note;
    } else {
      return new Severity(Severity.NOTE_LEVEL, label);
    }
  }

  /**
   * Returns a `Severity` with `WARNING_LEVEL` of importance, and an optional
   * descriptive `label`.
   */
  static warning(label: string = "warning"): Severity {
    if (label === "warning") {
      if (Severity._warning === void 0) {
        Severity._warning = new Severity(Severity.WARNING_LEVEL, label);
      }
      return Severity._warning;
    } else {
      return new Severity(Severity.WARNING_LEVEL, label);
    }
  }

  /**
   * Returns a `Severity` with `ERROR_LEVEL` of importance, and an optional
   * descriptive `label`.
   */
  static error(label: string = "error"): Severity {
    if (label === "error") {
      if (Severity._error === void 0) {
        Severity._error = new Severity(Severity.ERROR_LEVEL, label);
      }
      return Severity._error;
    } else {
      return new Severity(Severity.ERROR_LEVEL, label);
    }
  }

  /**
   * Returns a `Severity` with `ALERT_LEVEL` of importance, and an optional
   * descriptive `label`.
   */
  static alert(label: string = "alert"): Severity {
    if (label === "alert") {
      if (Severity._alert === void 0) {
        Severity._alert = new Severity(Severity.ALERT_LEVEL, label);
      }
      return Severity._alert;
    } else {
      return new Severity(Severity.ALERT_LEVEL, label);
    }
  }

  /**
   * Returns a `Severity` with `FATAL_LEVEL` of importance, and an optional
   * descriptive `label`.
   */
  static fatal(label: string = "fatal"): Severity {
    if (label === "fatal") {
      if (Severity._fatal === void 0) {
        Severity._fatal = new Severity(Severity.FATAL_LEVEL, label);
      }
      return Severity._fatal;
    } else {
      return new Severity(Severity.FATAL_LEVEL, label);
    }
  }
}
