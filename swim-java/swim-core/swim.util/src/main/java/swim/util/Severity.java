// Copyright 2015-2022 Swim.inc
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

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.decl.Marshal;
import swim.decl.Unmarshal;

/**
 * Discrete severity scale used for logging and diagnostic classification.
 */
@Public
@Since("5.0")
public final class Severity implements Comparable<Severity>, ToMarkup, ToSource {

  final int value;
  final String label;

  private Severity(int value, String label) {
    this.value = value;
    this.label = label;
  }

  /**
   * Returns the ordinal severity value, with higher integral values
   * signifying increased severity.
   *
   * @return an integer between {@code 0} and {@code 8}, inclusive.
   *         One of {@code ALL_VALUE}, {@code TRACE_VALUE}, {@code DEBUG_VALUE},
   *         {@code INFO_VALUE}, {@code NOTICE_VALUE}, {@code WARNING_VALUE},
   *         {@code ERROR_VALUE}, {@code FATAL_VALUE}, or {@code OFF_VALUE}
   */
  public int value() {
    return this.value;
  }

  /**
   * Returns {@code true} if the {@linkplain #value() severity value}
   * is equal to {@link #ALL_VALUE}.
   */
  public boolean isAll() {
    return this.value == ALL_VALUE;
  }

  /**
   * Returns {@code true} if the {@linkplain #value() severity value}
   * is equal to {@link #TRACE_VALUE}.
   */
  public boolean isTrace() {
    return this.value == TRACE_VALUE;
  }

  /**
   * Returns {@code true} if the {@linkplain #value() severity value}
   * is equal to {@link #DEBUG_VALUE}.
   */
  public boolean isDebug() {
    return this.value == DEBUG_VALUE;
  }

  /**
   * Returns {@code true} if the {@linkplain #value() severity value}
   * is equal to {@link #INFO_VALUE}.
   */
  public boolean isInfo() {
    return this.value == INFO_VALUE;
  }

  /**
   * Returns {@code true} if the {@linkplain #value() severity value}
   * is equal to {@link #NOTICE_VALUE}.
   */
  public boolean isNotice() {
    return this.value == NOTICE_VALUE;
  }

  /**
   * Returns {@code true} if the {@linkplain #value() severity value}
   * is equal to {@link #WARNING_VALUE}.
   */
  public boolean isWarning() {
    return this.value == WARNING_VALUE;
  }

  /**
   * Returns {@code true} if the {@linkplain #value() severity value}
   * is equal to {@link #ERROR_VALUE}.
   */
  public boolean isError() {
    return this.value == ERROR_VALUE;
  }

  /**
   * Returns {@code true} if the {@linkplain #value() severity value}
   * is equal to {@link #FATAL_VALUE}.
   */
  public boolean isFatal() {
    return this.value == FATAL_VALUE;
  }

  /**
   * Returns {@code true} if the {@linkplain #value() severity value}
   * is equal to {@link #OFF_VALUE}.
   */
  public boolean isOff() {
    return this.value == OFF_VALUE;
  }

  /**
   * Returns a descriptive label for this severity.
   */
  public String label() {
    return this.label;
  }

  /**
   * Returns a new {@code Severity} with the same severity value,
   * but with a new descriptive {@code label}.
   */
  public Severity withLabel(String label) {
    if (this.label.equals(label)) {
      return this;
    }
    return Severity.of(this.value, label);
  }

  public boolean filter(Severity that) {
    return this.value <= that.value;
  }

  public Severity min(Severity that) {
    if (this.value <= that.value) {
      return this;
    } else {
      return that;
    }
  }

  public Severity max(Severity that) {
    if (this.value >= that.value) {
      return this;
    } else {
      return that;
    }
  }

  @Override
  public int compareTo(Severity that) {
    if (this == that) {
      return 0;
    } else if (this.value < that.value) {
      return -1;
    } else if (this.value > that.value) {
      return 1;
    }
    return this.label.compareTo(that.label);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Severity that) {
      return this.value == that.value && this.label.equals(that.label);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(Severity.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.value), this.label.hashCode()));
  }

  public void stylize(Notation notation) {
    switch (this.value) {
      case FATAL_VALUE:
        notation.boldMagenta();
        break;
      case ERROR_VALUE:
        notation.boldRed();
        break;
      case WARNING_VALUE:
        notation.boldYellow();
        break;
      case NOTICE_VALUE:
        notation.boldGreen();
        break;
      case INFO_VALUE:
        notation.boldBlue();
        break;
      case DEBUG_VALUE:
        notation.boldCyan();
        break;
      case TRACE_VALUE:
      default:
        notation.boldGray();
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("Severity").append('.');
    final boolean withLabel;
    switch (this.value) {
      case ALL_VALUE:
        notation.append("ALL");
        withLabel = !ALL_LABEL.equals(this.label);
        break;
      case TRACE_VALUE:
        notation.append("TRACE");
        withLabel = !TRACE_LABEL.equals(this.label);
        break;
      case DEBUG_VALUE:
        notation.append("DEBUG");
        withLabel = !DEBUG_LABEL.equals(this.label);
        break;
      case INFO_VALUE:
        notation.append("INFO");
        withLabel = !INFO_LABEL.equals(this.label);
        break;
      case NOTICE_VALUE:
        notation.append("NOTICE");
        withLabel = !NOTICE_LABEL.equals(this.label);
        break;
      case WARNING_VALUE:
        notation.append("WARNING");
        withLabel = !WARNING_LABEL.equals(this.label);
        break;
      case ERROR_VALUE:
        notation.append("ERROR");
        withLabel = !ERROR_LABEL.equals(this.label);
        break;
      case FATAL_VALUE:
        notation.append("FATAL");
        withLabel = !FATAL_LABEL.equals(this.label);
        break;
      case OFF_VALUE:
        notation.append("OFF");
        withLabel = !OFF_LABEL.equals(this.label);
        break;
      default:
        throw new AssertionError(Integer.toString(this.value));
    }
    if (withLabel) {
      notation.beginInvoke("withLabel").appendArgument(this.label).endInvoke();
    }
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    this.stylize(notation);
    notation.appendMarkup(this.label);
    notation.reset();
  }

  @Override
  @Marshal
  public String toString() {
    return this.label;
  }

  public static final int ALL_VALUE = 0;
  public static final int TRACE_VALUE = 1;
  public static final int DEBUG_VALUE = 2;
  public static final int INFO_VALUE = 3;
  public static final int NOTICE_VALUE = 4;
  public static final int WARNING_VALUE = 5;
  public static final int ERROR_VALUE = 6;
  public static final int FATAL_VALUE = 7;
  public static final int OFF_VALUE = 8;

  static final String ALL_LABEL = "all";
  static final String TRACE_LABEL = "trace";
  static final String DEBUG_LABEL = "debug";
  static final String INFO_LABEL = "info";
  static final String NOTICE_LABEL = "notice";
  static final String WARNING_LABEL = "warning";
  static final String ERROR_LABEL = "error";
  static final String FATAL_LABEL = "fatal";
  static final String OFF_LABEL = "off";

  public static final Severity ALL = new Severity(ALL_VALUE, ALL_LABEL);
  public static final Severity TRACE = new Severity(TRACE_VALUE, TRACE_LABEL);
  public static final Severity DEBUG = new Severity(DEBUG_VALUE, DEBUG_LABEL);
  public static final Severity INFO = new Severity(INFO_VALUE, INFO_LABEL);
  public static final Severity NOTICE = new Severity(NOTICE_VALUE, NOTICE_LABEL);
  public static final Severity WARNING = new Severity(WARNING_VALUE, WARNING_LABEL);
  public static final Severity ERROR = new Severity(ERROR_VALUE, ERROR_LABEL);
  public static final Severity FATAL = new Severity(FATAL_VALUE, FATAL_LABEL);
  public static final Severity OFF = new Severity(OFF_VALUE, OFF_LABEL);

  /**
   * Returns a {@code Severity} with the given {@code value}
   * and descriptive {@code label}.
   *
   * @throws IllegalArgumentException if {@code value} is not
   *         a valid severity value.
   */
  public static Severity of(int value, @Nullable String label) {
    switch (value) {
      case ALL_VALUE:
        if (label == null || ALL_LABEL.equals(label)) {
          return ALL;
        }
        break;
      case TRACE_VALUE:
        if (label == null || TRACE_LABEL.equals(label)) {
          return TRACE;
        }
        break;
      case DEBUG_VALUE:
        if (label == null || DEBUG_LABEL.equals(label)) {
          return DEBUG;
        }
        break;
      case INFO_VALUE:
        if (label == null || INFO_LABEL.equals(label)) {
          return INFO;
        }
        break;
      case NOTICE_VALUE:
        if (label == null || NOTICE_LABEL.equals(label)) {
          return NOTICE;
        }
        break;
      case WARNING_VALUE:
        if (label == null || WARNING_LABEL.equals(label)) {
          return WARNING;
        }
        break;
      case ERROR_VALUE:
        if (label == null || ERROR_LABEL.equals(label)) {
          return ERROR;
        }
        break;
      case FATAL_VALUE:
        if (label == null || FATAL_LABEL.equals(label)) {
          return FATAL;
        }
        break;
      case OFF_VALUE:
        if (label == null || OFF_LABEL.equals(label)) {
          return OFF;
        }
        break;
      default:
        throw new IllegalArgumentException("invalid severity value: " + value);
    }
    return new Severity(value, label);
  }

  /**
   * Returns a {@code Severity} with the given {@code value}.
   *
   * @throws IllegalArgumentException if {@code value} is not
   *         a valid severity value.
   */
  public static Severity of(int value) {
    switch (value) {
      case ALL_VALUE:
        return ALL;
      case TRACE_VALUE:
        return TRACE;
      case DEBUG_VALUE:
        return DEBUG;
      case INFO_VALUE:
        return INFO;
      case NOTICE_VALUE:
        return NOTICE;
      case WARNING_VALUE:
        return WARNING;
      case ERROR_VALUE:
        return ERROR;
      case FATAL_VALUE:
        return FATAL;
      case OFF_VALUE:
        return OFF;
      default:
        throw new IllegalArgumentException("invalid severity value: " + value);
    }
  }

  /**
   * Returns the {@code Severity} corresponding to the the given {@code label}.
   *
   * @throws IllegalArgumentException if {@code label} is not
   *         a standard severity label.
   */
  @Unmarshal
  public static Severity parse(String label) {
    Objects.requireNonNull(label);
    if (ALL_LABEL.equalsIgnoreCase(label)) {
      return ALL;
    } else if (TRACE_LABEL.equalsIgnoreCase(label)) {
      return TRACE;
    } else if (DEBUG_LABEL.equalsIgnoreCase(label)) {
      return DEBUG;
    } else if (INFO_LABEL.equalsIgnoreCase(label)) {
      return INFO;
    } else if (NOTICE_LABEL.equalsIgnoreCase(label)) {
      return NOTICE;
    } else if (WARNING_LABEL.equalsIgnoreCase(label)) {
      return WARNING;
    } else if (ERROR_LABEL.equalsIgnoreCase(label)) {
      return ERROR;
    } else if (FATAL_LABEL.equalsIgnoreCase(label)) {
      return FATAL;
    } else if (OFF_LABEL.equalsIgnoreCase(label)) {
      return OFF;
    }
    throw new IllegalArgumentException("unknown severity label: " + label);
  }

}
