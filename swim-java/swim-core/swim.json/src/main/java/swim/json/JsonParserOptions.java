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
import swim.term.Term;
import swim.term.TermParserOptions;
import swim.term.TermRegistry;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

/**
 * JSON parser configuration options.
 */
@Public
@Since("5.0")
public class JsonParserOptions extends TermParserOptions implements WriteSource {

  protected final boolean exprsEnabled;

  public JsonParserOptions(TermRegistry termRegistry,
                           boolean exprsEnabled) {
    super(termRegistry);
    this.exprsEnabled = exprsEnabled;
  }

  @Override
  public JsonParserOptions withTermRegistry(TermRegistry termRegistry) {
    return this.copy(termRegistry, this.exprsEnabled);
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
  public JsonParserOptions withExprsEnabled(boolean exprsEnabled) {
    return this.copy(this.termRegistry, exprsEnabled);
  }

  public JsonParserOptions withOptions(TermParserOptions options) {
    if (options instanceof JsonParserOptions) {
      return (JsonParserOptions) options;
    }
    return this.copy(options.termRegistry(), this.exprsEnabled);
  }

  @Override
  protected JsonParserOptions copy(TermRegistry termRegistry) {
    return this.copy(termRegistry, this.exprsEnabled);
  }

  protected JsonParserOptions copy(TermRegistry termRegistry,
                                   boolean exprsEnabled) {
    if (termRegistry == this.termRegistry
        && exprsEnabled == this.exprsEnabled) {
      return this;
    }
    return new JsonParserOptions(termRegistry, exprsEnabled);
  }

  @Override
  public boolean canEqual(Object other) {
    return other instanceof JsonParserOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsonParserOptions that) {
      return that.canEqual(this)
          && this.termRegistry.equals(that.termRegistry)
          && this.exprsEnabled == that.exprsEnabled;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(JsonParserOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.termRegistry.hashCode()), Murmur3.hash(this.exprsEnabled)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.equals(STANDARD)) {
      notation.beginInvoke("JsonParserOptions", "standard").endInvoke();
    } else if (this.equals(EXPRESSIONS)) {
      notation.beginInvoke("JsonParserOptions", "expressions").endInvoke();
    } else {
      notation.beginInvokeNew("JsonParserOptions")
              .appendArgument(this.termRegistry)
              .appendArgument(this.exprsEnabled)
              .endInvoke();
    }
  }

  private static final JsonParserOptions STANDARD =
      new JsonParserOptions(Term.registry(), false);

  /**
   * Returns {@code JsonParserOptions} with expressions disabled.
   */
  public static JsonParserOptions standard() {
    return STANDARD;
  }

  private static final JsonParserOptions EXPRESSIONS =
      new JsonParserOptions(Term.registry(), true);

  /**
   * Returns {@code JsonParserOptions} with expressions enabled.
   */
  public static JsonParserOptions expressions() {
    return EXPRESSIONS;
  }

}
