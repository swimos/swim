// Copyright 2015-2019 SWIM.AI inc.
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
 * Level of importance.  Used for log levels and diagnostic classifications.
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
   * @return an integer between {@code 0} and {@code 7}, inclusive.  One of
   *         {@code TRACE_LEVEL}, {@code DEBUG_LEVEL}, {@code INFO_LEVEL},
   *         {@code NOTE_LEVEL}, {@code WARNING_LEVEL}, {@code ERROR_LEVEL},
   *         {@code ALERT_LEVEL}, or {@code FATAL_LEVEL}.
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
      return create(this.level, label);
    }
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code TRACE_LEVEL}
   * of importance.
   */
  public boolean isTrace() {
    return this.level == TRACE_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code DEBUG_LEVEL}
   * of importance.
   */
  public boolean isDebug() {
    return this.level == DEBUG_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code INFO_LEVEL}
   * of importance.
   */
  public boolean isInfo() {
    return this.level == INFO_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code NOTE_LEVEL}
   * of importance.
   */
  public boolean isNote() {
    return this.level == NOTE_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code WARNING_LEVEL}
   * of importance.
   */
  public boolean isWarning() {
    return this.level == WARNING_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code ERROR_LEVEL}
   * of importance.
   */
  public boolean isError() {
    return this.level == ERROR_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code ALERT_LEVEL}
   * of importance.
   */
  public boolean isAlert() {
    return this.level == ALERT_LEVEL;
  }

  /**
   * Returns {@code true} if this {@code Severity} has {@code FATAL_LEVEL}
   * of importance.
   */
  public boolean isFatal() {
    return this.level == FATAL_LEVEL;
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

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Severity.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
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

  private static int hashSeed;
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
   *         level of importance.
   */
  public static Severity create(int level, String label) {
    switch (level) {
      case TRACE_LEVEL: return trace(label);
      case DEBUG_LEVEL: return debug(label);
      case INFO_LEVEL: return info(label);
      case NOTE_LEVEL: return note(label);
      case WARNING_LEVEL: return warning(label);
      case ERROR_LEVEL: return error(label);
      case ALERT_LEVEL: return alert(label);
      case FATAL_LEVEL: return fatal(label);
      default: throw new IllegalArgumentException(Integer.toString(level));
    }
  }

  /**
   * Returns the {@code Severity} with the given importance {@code level}.
   *
   * @throws IllegalArgumentException if {@code level} is not a valid
   *         level of importance.
   */
  public static Severity create(int level) {
    return create(level, null);
  }

  /**
   * Returns the {@code Severity} with {@code TRACE_LEVEL} of importance.
   */
  public static Severity trace() {
    if (trace == null) {
      trace = new Severity(TRACE_LEVEL, "trace");
    }
    return trace;
  }

  /**
   * Returns a {@code Severity} with {@code TRACE_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity trace(String label) {
    if (label == null || "trace".equals(label)) {
      return trace();
    } else {
      return new Severity(TRACE_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code DEBUG_LEVEL} of importance.
   */
  public static Severity debug() {
    if (debug == null) {
      debug = new Severity(DEBUG_LEVEL, "debug");
    }
    return debug;
  }

  /**
   * Returns a {@code Severity} with {@code DEBUG_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity debug(String label) {
    if (label == null || "debug".equals(label)) {
      return debug();
    } else {
      return new Severity(DEBUG_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code INFO_LEVEL} of importance.
   */
  public static Severity info() {
    if (info == null) {
      info = new Severity(INFO_LEVEL, "info");
    }
    return info;
  }

  /**
   * Returns a {@code Severity} with {@code INFO_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity info(String label) {
    if (label == null || "info".equals(label)) {
      return info();
    } else {
      return new Severity(INFO_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code NOTE_LEVEL} of importance.
   */
  public static Severity note() {
    if (note == null) {
      note = new Severity(NOTE_LEVEL, "note");
    }
    return note;
  }

  /**
   * Returns a {@code Severity} with {@code NOTE_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity note(String label) {
    if (label == null || "note".equals(label)) {
      return note();
    } else {
      return new Severity(NOTE_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code WARNING_LEVEL} of importance.
   */
  public static Severity warning() {
    if (warning == null) {
      warning = new Severity(WARNING_LEVEL, "warning");
    }
    return warning;
  }

  /**
   * Returns a {@code Severity} with {@code WARNING_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity warning(String label) {
    if (label == null || "warning".equals(label)) {
      return warning();
    } else {
      return new Severity(WARNING_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code ERROR_LEVEL} of importance.
   */
  public static Severity error() {
    if (error == null) {
      error = new Severity(ERROR_LEVEL, "error");
    }
    return error;
  }

  /**
   * Returns a {@code Severity} with {@code ERROR_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity error(String label) {
    if (label == null || "error".equals(label)) {
      return error();
    } else {
      return new Severity(ERROR_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code ALERT_LEVEL} of importance.
   */
  public static Severity alert() {
    if (alert == null) {
      alert = new Severity(ALERT_LEVEL, "alert");
    }
    return alert;
  }

  /**
   * Returns a {@code Severity} with {@code ALERT_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity alert(String label) {
    if (label == null || "alert".equals(label)) {
      return alert();
    } else {
      return new Severity(ALERT_LEVEL, label);
    }
  }

  /**
   * Returns the {@code Severity} with {@code FATAL_LEVEL} of importance.
   */
  public static Severity fatal() {
    if (fatal == null) {
      fatal = new Severity(FATAL_LEVEL, "fatal");
    }
    return fatal;
  }

  /**
   * Returns a {@code Severity} with {@code FATAL_LEVEL} of importance,
   * and the given descriptive {@code label}.
   */
  public static Severity fatal(String label) {
    if (label == null || "fatal".equals(label)) {
      return fatal();
    } else {
      return new Severity(FATAL_LEVEL, label);
    }
  }
}
