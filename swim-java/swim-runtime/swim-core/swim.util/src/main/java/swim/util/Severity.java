// Copyright 2015-2023 Swim.inc
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

package swim.util;

/**
 * Level of importance. Used for log levels and diagnostic classifications.
 */
public final class Severity implements Comparable<Severity> {

  final int level;
  final String label;

  private Severity(int level, String label) {
    this.level = level;
    this.label = label;
  }

  /**
   * Returns the integer level of importance of this {@code Severity}, with
   * higher levels signifying greater importance.
   *
   * @return an integer between {@code 0} and {@code 7}, inclusive. One of
   * {@code TRACE_LEVEL}, {@code DEBUG_LEVEL}, {@code INFO_LEVEL},
   * {@code NOTE_LEVEL}, {@code WARNING_LEVEL}, {@code ERROR_LEVEL},
   * {@code ALERT_LEVEL}, or {@code FATAL_LEVEL}.
   */
  public int level() {
    return this.level;
  }

  /**
   * Returns a descriptive label for this {@code Severity}.
   */
  public String label() {
    return this.label;
  }

  /**
   * Returns a new {@code Severity} with the same level as this {@code
   * Severity}, but with a new descriptive {@code label}.
   */
  public Severity label(String label) {
    if (this.label.equals(label)) {
      return this;
    } else {
      return Severity.create(this.level, label);
    }
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code TRACE_LEVEL}
   * of importance.
   */
  public boolean isTrace() {
    return this.level == Severity.TRACE_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code DEBUG_LEVEL}
   * of importance.
   */
  public boolean isDebug() {
    return this.level == Severity.DEBUG_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code INFO_LEVEL}
   * of importance.
   */
  public boolean isInfo() {
    return this.level == Severity.INFO_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code NOTE_LEVEL}
   * of importance.
   */
  public boolean isNote() {
    return this.level == Severity.NOTE_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code WARNING_LEVEL}
   * of importance.
   */
  public boolean isWarning() {
    return this.level == Severity.WARNING_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code ERROR_LEVEL}
   * of importance.
   */
  public boolean isError() {
    return this.level == Severity.ERROR_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code ALERT_LEVEL}
   * of importance.
   */
  public boolean isAlert() {
    return this.level == Severity.ALERT_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code FATAL_LEVEL}
   * of importance.
   */
  public boolean isFatal() {
    return this.level == Severity.FATAL_LEVEL;
  }

  @Override
  public int compareTo(Severity that) {
    if (this == that) {
      return 0;
    } else if (this.level < that.level) {
      return -1;
    } else if (this.level > that.level) {
      return 1;
    } else {
      return this.label.compareTo(that.label);
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Severity) {
      final Severity that = (Severity) other;
      return this.level == that.level && this.label.equals(that.label);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Severity.hashSeed == 0) {
      Severity.hashSeed = Murmur3.seed(Severity.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Severity.hashSeed,
        this.level), this.label.hashCode()));
  }

  @Override
  public String toString() {
    return this.label;
  }

  public static final int TRACE_LEVEL = 0;
  public static final int DEBUG_LEVEL = 1;
  public static final int INFO_LEVEL = 2;
  public static final int NOTE_LEVEL = 3;
  public static final int WARNING_LEVEL = 4;
  public static final int ERROR_LEVEL = 5;
  public static final int ALERT_LEVEL = 6;
  public static final int FATAL_LEVEL = 7;

  private static Severity trace;
  private static Severity debug;
  private static Severity info;
  private static Severity note;
  private static Severity warning;
  private static Severity error;
  private static Severity alert;
  private static Severity fatal;

  /**
   * Returns a {@code Severity} with the given importance {@code level},
   * and descriptive {@code label}.
   *
   * @throws IllegalArgumentException if {@code level} is not a valid
   *                                  level of importance.
   */
  public static Severity create(int level, String label) {
    switch (level) {
      case TRACE_LEVEL:
        return Severity.trace(label);
      case DEBUG_LEVEL:
        return Severity.debug(label);
      case INFO_LEVEL:
        return Severity.info(label);
      case NOTE_LEVEL:
        return Severity.note(label);
      case WARNING_LEVEL:
        return Severity.warning(label);
      case ERROR_LEVEL:
        return Severity.error(label);
      case ALERT_LEVEL:
        return Severity.alert(label);
      case FATAL_LEVEL:
        return Severity.fatal(label);
      default:
        throw new IllegalArgumentException(Integer.toString(level));
    }
  }

  /**
   * Returns the {@code Severity} with the given importance {@code level}.
   *
   * @throws IllegalArgumentException if {@code level} is not a valid
   *                                  level of importance.
   */
  public static Severity from(int level) {
    return Severity.create(level, null);
  }

  /**
   * Returns the {@code Severity} with {@code TRACE_LEVEL} of importance.
   */
  public static Severity trace() {
    if (Severity.trace == null) {
      Severity.trace = new Severity(Severity.TRACE_LEVEL, "trace");
    }
    return Severity.trace;
  }

  /**
   * Returns a {@code Severity} with {@code TRACE_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity trace(String label) {
    if (label == null || "trace".equals(label)) {
      return Severity.trace();
    } else {
      return new Severity(Severity.TRACE_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code DEBUG_LEVEL} of importance.
   */
  public static Severity debug() {
    if (Severity.debug == null) {
      Severity.debug = new Severity(Severity.DEBUG_LEVEL, "debug");
    }
    return Severity.debug;
  }

  /**
   * Returns a {@code Severity} with {@code DEBUG_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity debug(String label) {
    if (label == null || "debug".equals(label)) {
      return Severity.debug();
    } else {
      return new Severity(Severity.DEBUG_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code INFO_LEVEL} of importance.
   */
  public static Severity info() {
    if (Severity.info == null) {
      Severity.info = new Severity(Severity.INFO_LEVEL, "info");
    }
    return Severity.info;
  }

  /**
   * Returns a {@code Severity} with {@code INFO_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity info(String label) {
    if (label == null || "info".equals(label)) {
      return Severity.info();
    } else {
      return new Severity(Severity.INFO_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code NOTE_LEVEL} of importance.
   */
  public static Severity note() {
    if (Severity.note == null) {
      Severity.note = new Severity(Severity.NOTE_LEVEL, "note");
    }
    return Severity.note;
  }

  /**
   * Returns a {@code Severity} with {@code NOTE_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity note(String label) {
    if (label == null || "note".equals(label)) {
      return Severity.note();
    } else {
      return new Severity(Severity.NOTE_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code WARNING_LEVEL} of importance.
   */
  public static Severity warning() {
    if (Severity.warning == null) {
      Severity.warning = new Severity(Severity.WARNING_LEVEL, "warning");
    }
    return Severity.warning;
  }

  /**
   * Returns a {@code Severity} with {@code WARNING_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity warning(String label) {
    if (label == null || "warning".equals(label)) {
      return Severity.warning();
    } else {
      return new Severity(Severity.WARNING_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code ERROR_LEVEL} of importance.
   */
  public static Severity error() {
    if (Severity.error == null) {
      Severity.error = new Severity(Severity.ERROR_LEVEL, "error");
    }
    return Severity.error;
  }

  /**
   * Returns a {@code Severity} with {@code ERROR_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity error(String label) {
    if (label == null || "error".equals(label)) {
      return Severity.error();
    } else {
      return new Severity(Severity.ERROR_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code ALERT_LEVEL} of importance.
   */
  public static Severity alert() {
    if (Severity.alert == null) {
      Severity.alert = new Severity(Severity.ALERT_LEVEL, "alert");
    }
    return Severity.alert;
  }

  /**
   * Returns a {@code Severity} with {@code ALERT_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity alert(String label) {
    if (label == null || "alert".equals(label)) {
      return Severity.alert();
    } else {
      return new Severity(Severity.ALERT_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code FATAL_LEVEL} of importance.
   */
  public static Severity fatal() {
    if (Severity.fatal == null) {
      Severity.fatal = new Severity(Severity.FATAL_LEVEL, "fatal");
    }
    return Severity.fatal;
  }

  /**
   * Returns a {@code Severity} with {@code FATAL_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity fatal(String label) {
    if (label == null || "fatal".equals(label)) {
      return Severity.fatal();
    } else {
      return new Severity(Severity.FATAL_LEVEL, label);
    }
  }

}
