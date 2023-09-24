// Copyright 2015-2023 Nstream, inc.
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

package swim.term;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

/**
 * Term parser configuration options.
 */
@Public
@Since("5.0")
public class TermParserOptions implements WriteSource {

  protected final TermRegistry termRegistry;

  public TermParserOptions(TermRegistry termRegistry) {
    this.termRegistry = termRegistry;
  }

  public final TermRegistry termRegistry() {
    return this.termRegistry;
  }

  public TermParserOptions withTermRegistry(TermRegistry termRegistry) {
    return this.copy(termRegistry);
  }

  /**
   * Returns a copy of these options with the specified parameters.
   * Subclasses may override this method to ensure the proper class
   * is instantiated when updating options.
   */
  protected TermParserOptions copy(TermRegistry termRegistry) {
    if (termRegistry == this.termRegistry) {
      return this;
    }
    return new TermParserOptions(termRegistry);
  }

  /**
   * Returns {@code true} if these options can possibly equal
   * some {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof TermParserOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TermParserOptions that) {
      return that.canEqual(this)
          && this.termRegistry.equals(that.termRegistry);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(TermParserOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.termRegistry.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.equals(STANDARD)) {
      notation.beginInvoke("TermParserOptions", "standard").endInvoke();
    } else {
      notation.beginInvokeNew("TermParserOptions")
              .appendArgument(this.termRegistry)
              .endInvoke();
    }
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  private static final TermParserOptions STANDARD = new TermParserOptions(Term.registry());

  public static TermParserOptions standard() {
    return STANDARD;
  }

}
