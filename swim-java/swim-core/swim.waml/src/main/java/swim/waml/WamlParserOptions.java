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

package swim.waml;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * WAML parser configuration options.
 */
@Public
@Since("5.0")
public class WamlParserOptions implements ToSource {

  protected final boolean exprsEnabled;

  public WamlParserOptions(boolean exprsEnabled) {
    this.exprsEnabled = exprsEnabled;
  }

  /**
   * Returns {@code true} if WAML expressions should be enabled.
   */
  public final boolean exprsEnabled() {
    return this.exprsEnabled;
  }

  /**
   * Returns a copy of these options configured to enable WAML expressions
   * when {@code exprsEnabled} is {@code true}.
   */
  public WamlParserOptions exprsEnabled(boolean exprsEnabled) {
    return this.copy(exprsEnabled);
  }

  /**
   * Returns a copy of these options with the specified parameters.
   * Subclasses may override this method to ensure the proper class
   * is instantiated when updating options.
   */
  protected WamlParserOptions copy(boolean exprsEnabled) {
    return new WamlParserOptions(exprsEnabled);
  }

  /**
   * Returns {@code true} if these options can possibly equal some
   * {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof WamlParserOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WamlParserOptions) {
      final WamlParserOptions that = (WamlParserOptions) other;
      return that.canEqual(this)
          && this.exprsEnabled == that.exprsEnabled;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WamlParserOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Murmur3.hash(this.exprsEnabled)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.exprsEnabled) {
      notation.beginInvoke("WamlParserOptions", "expressions").endInvoke();
    } else {
      notation.beginInvoke("WamlParserOptions", "standard").endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final WamlParserOptions STANDARD = new WamlParserOptions(false);

  /**
   * Returns {@code WamlParserOptions} with expressions disabled.
   */
  public static WamlParserOptions standard() {
    return STANDARD;
  }

  private static final WamlParserOptions EXPRESSIONS = new WamlParserOptions(true);

  /**
   * Returns {@code WamlParserOptions} with expressions enabled.
   */
  public static WamlParserOptions expressions() {
    return EXPRESSIONS;
  }

}
