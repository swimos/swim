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

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.ExprWriterOptions;
import swim.util.Murmur3;
import swim.util.Notation;

/**
 * JSON writer configuration options.
 */
@Public
@Since("5.0")
public class JsonWriterOptions extends ExprWriterOptions {

  protected final boolean identifierKeys;

  public JsonWriterOptions(boolean whitespace,
                           @Nullable String indentation,
                           @Nullable String lineSeparator,
                           boolean identifierKeys) {
    super(whitespace, indentation, lineSeparator);
    this.identifierKeys = identifierKeys;
  }

  @Override
  public JsonWriterOptions whitespace(boolean whitespace) {
    return this.copy(whitespace, this.indentation, this.lineSeparator, this.identifierKeys);
  }

  @Override
  public JsonWriterOptions indentation(@Nullable String indentation) {
    return this.copy(this.whitespace, indentation, this.lineSeparator, this.identifierKeys);
  }

  @Override
  public JsonWriterOptions lineSeparator(@Nullable String lineSeparator) {
    return this.copy(this.whitespace, this.indentation, lineSeparator, this.identifierKeys);
  }

  public final boolean identifierKeys() {
    return this.identifierKeys;
  }

  public JsonWriterOptions identifierKeys(boolean identifierKeys) {
    return this.copy(this.whitespace, this.indentation, this.lineSeparator, identifierKeys);
  }

  @Override
  protected JsonWriterOptions copy(boolean whitespace,
                                   @Nullable String indentation,
                                   @Nullable String lineSeparator) {
    return this.copy(whitespace, indentation, lineSeparator, this.identifierKeys);
  }

  protected JsonWriterOptions copy(boolean whitespace,
                                   @Nullable String indentation,
                                   @Nullable String lineSeparator,
                                   boolean identifierKeys) {
    return new JsonWriterOptions(whitespace, indentation, lineSeparator, identifierKeys);
  }

  @Override
  public boolean canEqual(Object other) {
    return other instanceof JsonWriterOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsonWriterOptions) {
      final JsonWriterOptions that = (JsonWriterOptions) other;
      return that.canEqual(this)
          && this.whitespace == that.whitespace
          && Objects.equals(this.indentation, that.indentation)
          && Objects.equals(this.lineSeparator, that.lineSeparator)
          && this.identifierKeys == that.identifierKeys;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(JsonWriterOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
        Murmur3.hash(this.whitespace)), Murmur3.hash(this.indentation)),
        Murmur3.hash(this.lineSeparator)), Murmur3.hash(this.identifierKeys)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.equals(COMPACT)) {
      notation.beginInvoke("JsonWriterOptions", "compact").endInvoke();
    } else if (this.equals(READABLE)) {
      notation.beginInvoke("JsonWriterOptions", "readable").endInvoke();
    } else if (this.equals(PRETTY)) {
      notation.beginInvoke("JsonWriterOptions", "pretty").endInvoke();
    } else {
      notation.beginInvokeNew("JsonWriterOptions")
              .appendArgument(this.whitespace)
              .appendArgument(this.indentation)
              .appendArgument(this.lineSeparator)
              .appendArgument(this.identifierKeys)
              .endInvoke();
    }
  }

  private static final JsonWriterOptions COMPACT = new JsonWriterOptions(false, null, null, false);

  public static JsonWriterOptions compact() {
    return COMPACT;
  }

  private static final JsonWriterOptions READABLE = new JsonWriterOptions(true, null, null, true);

  public static JsonWriterOptions readable() {
    return READABLE;
  }

  private static final JsonWriterOptions PRETTY = new JsonWriterOptions(true, "  ", System.lineSeparator(), true);

  public static JsonWriterOptions pretty() {
    return PRETTY;
  }

}
