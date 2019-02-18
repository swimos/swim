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

package swim.codec;

import swim.util.Murmur3;

/**
 * {@link Output} production parameters.  {@code OutputSettings} provide
 * contextual configuration parameters to output producers, such as {@link
 * Writer Writers}.  Uses include enabling pretty printing and styling
 * generated output.  Subclasses can provide additional parameters understood
 * by specialized output producers.
 */
public class OutputSettings implements Debug {
  protected final String lineSeparator;
  protected final boolean isPretty;
  protected final boolean isStyled;

  protected OutputSettings(String lineSeparator, boolean isPretty, boolean isStyled) {
    this.lineSeparator = lineSeparator;
    this.isPretty = isPretty;
    this.isStyled = isStyled;
  }

  /**
   * Returns the code point sequence used to separate lines of text.
   * Defaults to the operating system's line separator.
   */
  public final String lineSeparator() {
    return this.lineSeparator;
  }

  /**
   * Returns a copy of these settings with the given {@code lineSeparator}.
   */
  public OutputSettings lineSeparator(String lineSeparator) {
    return copy(lineSeparator, this.isPretty, this.isStyled);
  }

  /**
   * Returns {@code true} if output producers should pretty print their output,
   * when possible.
   */
  public final boolean isPretty() {
    return this.isPretty;
  }

  /**
   * Returns a copy of these settings with the given {@code isPretty} flag.
   */
  public OutputSettings isPretty(boolean isPretty) {
    return copy(this.lineSeparator, isPretty, this.isStyled);
  }

  /**
   * Returns {@code true} if output producers should style their output,
   * when possible.
   */
  public final boolean isStyled() {
    return this.isStyled;
  }

  /**
   * Returns a copy of these settings with the given {@code isStyled} flag.
   */
  public OutputSettings isStyled(boolean isStyled) {
    return copy(this.lineSeparator, this.isPretty, isStyled);
  }

  protected OutputSettings copy(String lineSeparator, boolean isPretty, boolean isStyled) {
    return create(lineSeparator, isPretty, isStyled);
  }

  protected boolean canEqual(Object other) {
    return other instanceof OutputSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof OutputSettings) {
      final OutputSettings that = (OutputSettings) other;
      return that.canEqual(this) && this.lineSeparator.equals(that.lineSeparator)
          && this.isPretty == that.isPretty && this.isStyled == that.isStyled;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(OutputSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.lineSeparator.hashCode()), Murmur3.hash(this.isPretty)),
        Murmur3.hash(this.isStyled)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("OutputSettings").write('.');
    if (!this.isPretty && !this.isStyled) {
      output = output.write("standard");
    } else if (this.isPretty && !this.isStyled) {
      output = output.write("pretty");
    } else if (!this.isPretty && this.isStyled) {
      output = output.write("styled");
    } else {
      output = output.write("prettyStyled");
    }
    output = output.write('(').write(')');
    if (!Format.lineSeparator().equals(this.lineSeparator)) {
      output = output.write('.').write("lineSeparator").write('(').display(this.lineSeparator).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;
  private static OutputSettings standard;
  private static OutputSettings pretty;
  private static OutputSettings styled;
  private static OutputSettings prettyStyled;

  /**
   * Returns {@code OutputSettings} configured with the system line separator,
   * pretty printing disabled, and styling disabled.
   */
  public static final OutputSettings standard() {
    if (standard == null) {
      standard = new OutputSettings(Format.lineSeparator(), false, false);
    }
    return standard;
  }

  /**
   * Returns {@code OutputSettings} configured with the system line separator,
   * pretty printing enabled, and styling disabled.
   */
  public static final OutputSettings pretty() {
    if (pretty == null) {
      pretty = new OutputSettings(Format.lineSeparator(), true, false);
    }
    return pretty;
  }

  /**
   * Returns {@code OutputSettings} configured with the system line separator,
   * pretty printing disabled, and styling enabled.
   */
  public static final OutputSettings styled() {
    if (styled == null) {
      styled = new OutputSettings(Format.lineSeparator(), false, true);
    }
    return styled;
  }

  /**
   * Returns {@code OutputSettings} configured with the system line separator,
   * pretty printing enabled, and styling enabled.
   */
  public static final OutputSettings prettyStyled() {
    if (prettyStyled == null) {
      prettyStyled = new OutputSettings(Format.lineSeparator(), true, true);
    }
    return prettyStyled;
  }

  /**
   * Returns {@code OutputSettings} configured with the given {@code
   * lineSeparator}, pretty printing enabled if {@code isPretty} is {@code
   * true}, and styling enabled if {@code isStyled} is {@code true}.
   */
  public static final OutputSettings create(String lineSeparator, boolean isPretty, boolean isStyled) {
    if (lineSeparator == null) {
      lineSeparator = Format.lineSeparator();
    }
    if (Format.lineSeparator().equals(lineSeparator)) {
      if (!isPretty && !isStyled) {
        return standard();
      } else if (isPretty && !isStyled) {
        return pretty();
      } else if (!isPretty && isStyled) {
        return styled();
      } else {
        return prettyStyled();
      }
    }
    return new OutputSettings(lineSeparator, isPretty, isStyled);
  }
}
