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
 * {@code Input} consumption parameters.  {@code InputSettings} provide
 * contextual configuration parameters to input consumers, such as {@link
 * Parser Parsers}.
 */
public class InputSettings implements Debug {
  protected final boolean isStripped;

  protected InputSettings(boolean isStripped) {
    this.isStripped = isStripped;
  }

  protected boolean canEqual(Object other) {
    return other instanceof InputSettings;
  }

  /**
   * Returns {@code true} if input consumers should not include diagnostic
   * metadata in generated output.
   */
  public final boolean isStripped() {
    return this.isStripped;
  }

  /**
   * Returns a copy of these settings with the given {@code isStripped} flag.
   */
  public InputSettings isStripped(boolean isStripped) {
    return copy(isStripped);
  }

  protected InputSettings copy(boolean isStripped) {
    return create(isStripped);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof InputSettings) {
      final InputSettings that = (InputSettings) other;
      return that.canEqual(this) && this.isStripped == that.isStripped;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(InputSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, Murmur3.hash(this.isStripped)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("InputSettings").write('.');
    if (!this.isStripped) {
      output = output.write("standard");
    } else {
      output = output.write("stripped");
    }
    output = output.write('(').write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;
  private static InputSettings standard;
  private static InputSettings stripped;

  /**
   * Returns {@code InputSettings} configured to include diagnostic metadata
   * in generated output.
   */
  public static final InputSettings standard() {
    if (standard == null) {
      standard = new InputSettings(false);
    }
    return standard;
  }

  /**
   * Returns {@code InputSettings} configured to not include diagnostic
   * metadata in generated output.
   */
  public static final InputSettings stripped() {
    if (stripped == null) {
      stripped = new InputSettings(true);
    }
    return stripped;
  }

  /**
   * Returns {@code InputSettings} configured to not include diagnostic
   * metadata in generated output, if {@code isStripped} is {@code true}.
   */
  public static final InputSettings create(boolean isStripped) {
    if (isStripped) {
      return stripped();
    }
    return standard();
  }
}
