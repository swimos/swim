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
import swim.term.Term;
import swim.term.TermParserOptions;
import swim.term.TermRegistry;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * WAML parser configuration options.
 */
@Public
@Since("5.0")
public class WamlParserOptions extends TermParserOptions implements ToSource {

  protected final boolean exprsEnabled;

  public WamlParserOptions(TermRegistry termRegistry,
                           boolean exprsEnabled) {
    super(termRegistry);
    this.exprsEnabled = exprsEnabled;
  }

  @Override
  public WamlParserOptions withTermRegistry(TermRegistry termRegistry) {
    return this.copy(termRegistry, this.exprsEnabled);
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
  public WamlParserOptions withExprsEnabled(boolean exprsEnabled) {
    return this.copy(this.termRegistry, exprsEnabled);
  }

  public WamlParserOptions withOptions(TermParserOptions options) {
    if (options instanceof WamlParserOptions) {
      return (WamlParserOptions) options;
    }
    return this.copy(options.termRegistry(), this.exprsEnabled);
  }

  @Override
  protected WamlParserOptions copy(TermRegistry termRegistry) {
    return this.copy(termRegistry, this.exprsEnabled);
  }

  protected WamlParserOptions copy(TermRegistry termRegistry,
                                   boolean exprsEnabled) {
    if (termRegistry == this.termRegistry
        && exprsEnabled == this.exprsEnabled) {
      return this;
    }
    return new WamlParserOptions(termRegistry, exprsEnabled);
  }

  @Override
  public boolean canEqual(Object other) {
    return other instanceof WamlParserOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WamlParserOptions that) {
      return that.canEqual(this)
          && this.termRegistry.equals(that.termRegistry)
          && this.exprsEnabled == that.exprsEnabled;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WamlParserOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.termRegistry.hashCode()), Murmur3.hash(this.exprsEnabled)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.equals(STANDARD)) {
      notation.beginInvoke("WamlParserOptions", "standard").endInvoke();
    } else if (this.equals(EXPRESSIONS)) {
      notation.beginInvoke("WamlParserOptions", "expressions").endInvoke();
    } else {
      notation.beginInvokeNew("WamlParserOptions")
              .appendArgument(this.termRegistry)
              .appendArgument(this.exprsEnabled)
              .endInvoke();
    }
  }

  private static final WamlParserOptions STANDARD =
      new WamlParserOptions(Term.registry(), false);

  /**
   * Returns {@code WamlParserOptions} with expressions disabled.
   */
  public static WamlParserOptions standard() {
    return STANDARD;
  }

  private static final WamlParserOptions EXPRESSIONS =
      new WamlParserOptions(Term.registry(), true);

  /**
   * Returns {@code WamlParserOptions} with expressions enabled.
   */
  public static WamlParserOptions expressions() {
    return EXPRESSIONS;
  }

}
