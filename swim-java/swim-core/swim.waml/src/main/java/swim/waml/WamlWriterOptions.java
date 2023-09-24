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

package swim.waml;

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.HashTrieSet;
import swim.term.Term;
import swim.term.TermRegistry;
import swim.term.TermWriterOptions;
import swim.util.Murmur3;
import swim.util.Notation;

/**
 * WAML writer configuration options.
 */
@Public
@Since("5.0")
public class WamlWriterOptions extends TermWriterOptions {

  public WamlWriterOptions(TermRegistry termRegistry,
                           boolean implicitContext,
                           boolean whitespace,
                           @Nullable String indentation,
                           @Nullable String lineSeparator,
                           HashTrieSet<String> keywords) {
    super(termRegistry, implicitContext, whitespace, indentation, lineSeparator, keywords);
  }

  @Override
  public WamlWriterOptions withTermRegistry(TermRegistry termRegistry) {
    return this.copy(termRegistry, this.implicitContext, this.whitespace, this.indentation,
                     this.lineSeparator, this.keywords);
  }

  @Override
  public WamlWriterOptions withImplicitContext(boolean implicitContext) {
    return this.copy(this.termRegistry, implicitContext, this.whitespace, this.indentation,
                     this.lineSeparator, this.keywords);
  }

  @Override
  public WamlWriterOptions withWhitespace(boolean whitespace) {
    return this.copy(this.termRegistry, this.implicitContext, whitespace, this.indentation,
                     this.lineSeparator, this.keywords);
  }

  @Override
  public WamlWriterOptions withIndentation(@Nullable String indentation) {
    return this.copy(this.termRegistry, this.implicitContext, this.whitespace, indentation,
                     this.lineSeparator, this.keywords);
  }

  @Override
  public WamlWriterOptions withLineSeparator(@Nullable String lineSeparator) {
    return this.copy(this.termRegistry, this.implicitContext, this.whitespace, this.indentation,
                     lineSeparator, this.keywords);
  }

  @Override
  public WamlWriterOptions withKeywords(HashTrieSet<String> keywords) {
    return this.copy(this.termRegistry, this.implicitContext, this.whitespace, this.indentation,
                     this.lineSeparator, keywords);
  }

  public WamlWriterOptions withOptions(TermWriterOptions options) {
    if (options instanceof WamlWriterOptions) {
      return (WamlWriterOptions) options;
    }
    return this.copy(options.termRegistry(), options.implicitContext(), options.whitespace(),
                     options.indentation(), options.lineSeparator(), options.keywords());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  protected WamlWriterOptions copy(TermRegistry termRegistry,
                                   boolean implicitContext,
                                   boolean whitespace,
                                   @Nullable String indentation,
                                   @Nullable String lineSeparator,
                                   HashTrieSet<String> keywords) {
    if (termRegistry == this.termRegistry
        && implicitContext == this.implicitContext
        && whitespace == this.whitespace
        && indentation == this.indentation
        && lineSeparator == this.lineSeparator
        && keywords == this.keywords) {
      return this;
    }
    return new WamlWriterOptions(termRegistry, implicitContext, whitespace, indentation,
                                 lineSeparator, keywords);
  }

  @Override
  public boolean canEqual(Object other) {
    return other instanceof WamlWriterOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WamlWriterOptions that) {
      return that.canEqual(this)
          && this.termRegistry.equals(that.termRegistry)
          && this.implicitContext == that.implicitContext
          && this.whitespace == that.whitespace
          && Objects.equals(this.indentation, that.indentation)
          && Objects.equals(this.lineSeparator, that.lineSeparator)
          && this.keywords.equals(that.keywords);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WamlWriterOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HASH_SEED, termRegistry.hashCode()), Murmur3.hash(this.whitespace)),
        Murmur3.hash(this.implicitContext)), Murmur3.hash(this.indentation)),
        Murmur3.hash(this.lineSeparator)), this.keywords.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.equals(COMPACT)) {
      notation.beginInvoke("WamlWriterOptions", "compact").endInvoke();
    } else if (this.equals(READABLE)) {
      notation.beginInvoke("WamlWriterOptions", "readable").endInvoke();
    } else if (this.equals(PRETTY)) {
      notation.beginInvoke("WamlWriterOptions", "pretty").endInvoke();
    } else {
      notation.beginInvokeNew("WamlWriterOptions")
              .appendArgument(this.termRegistry)
              .appendArgument(this.implicitContext)
              .appendArgument(this.whitespace)
              .appendArgument(this.indentation)
              .appendArgument(this.lineSeparator)
              .appendArgument(this.keywords)
              .endInvoke();
    }
  }

  private static final WamlWriterOptions COMPACT =
      new WamlWriterOptions(Term.registry(), true, false, null, null,
                            TermWriterOptions.compact().keywords());

  public static WamlWriterOptions compact() {
    return COMPACT;
  }

  private static final WamlWriterOptions READABLE =
      new WamlWriterOptions(Term.registry(), true, true, null, null,
                            TermWriterOptions.compact().keywords());

  public static WamlWriterOptions readable() {
    return READABLE;
  }

  private static final WamlWriterOptions PRETTY =
      new WamlWriterOptions(Term.registry(), true, true, "  ", System.lineSeparator(),
                            TermWriterOptions.compact().keywords());

  public static WamlWriterOptions pretty() {
    return PRETTY;
  }

}
