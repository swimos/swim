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

package swim.json;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * JSON parser configuration options.
 */
@Public
@Since("5.0")
public class JsonParserOptions implements ToSource {

  protected final boolean exprsEnabled;

  public JsonParserOptions(boolean exprsEnabled) {
    this.exprsEnabled = exprsEnabled;
  }

  /**
   * Returns {@code true} if JSON expressions should be enabled.
   */
  public final boolean exprsEnabled() {
    return this.exprsEnabled;
  }

  /**
   * Returns a copy of these options configured to enable JSON expressions
   * when {@code exprsEnabled} is {@code true}.
   */
  public JsonParserOptions exprsEnabled(boolean exprsEnabled) {
    return this.copy(exprsEnabled);
  }

  /**
   * Returns a copy of these options with the specified parameters.
   * Subclasses may override this method to ensure the proper class
   * is instantiated when updating options.
   */
  protected JsonParserOptions copy(boolean exprsEnabled) {
    return new JsonParserOptions(exprsEnabled);
  }

  /**
   * Returns {@code true} if these options can possibly equal some
   * {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof JsonParserOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsonParserOptions) {
      final JsonParserOptions that = (JsonParserOptions) other;
      return that.canEqual(this)
          && this.exprsEnabled == that.exprsEnabled;
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(JsonParserOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(JsonParserOptions.hashSeed,
        Murmur3.hash(this.exprsEnabled)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.exprsEnabled) {
      notation.beginInvoke("JsonParserOptions", "expressions").endInvoke();
    } else {
      notation.beginInvoke("JsonParserOptions", "standard").endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final JsonParserOptions STANDARD = new JsonParserOptions(false);

  /**
   * Returns {@code JsonParserOptions} with expressions disabled.
   */
  public static JsonParserOptions standard() {
    return STANDARD;
  }

  private static final JsonParserOptions EXPRESSIONS = new JsonParserOptions(true);

  /**
   * Returns {@code JsonParserOptions} with expressions enabled.
   */
  public static JsonParserOptions expressions() {
    return EXPRESSIONS;
  }

}
