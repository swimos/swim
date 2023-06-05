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

package swim.term;

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.HashTrieSet;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * Term writer configuration options.
 */
@Public
@Since("5.0")
public class TermWriterOptions implements ToSource {

  protected final TermRegistry termRegistry;
  protected final boolean implicitContext;
  protected final boolean whitespace;
  protected final @Nullable String indentation;
  protected final @Nullable String lineSeparator;
  protected final HashTrieSet<String> keywords;

  public TermWriterOptions(TermRegistry termRegistry,
                           boolean implicitContext,
                           boolean whitespace,
                           @Nullable String indentation,
                           @Nullable String lineSeparator,
                           HashTrieSet<String> keywords) {
    this.termRegistry = termRegistry;
    this.implicitContext = implicitContext;
    this.whitespace = whitespace;
    this.indentation = indentation;
    this.lineSeparator = lineSeparator;
    this.keywords = keywords;
  }

  public final TermRegistry termRegistry() {
    return this.termRegistry;
  }

  public TermWriterOptions withTermRegistry(TermRegistry termRegistry) {
    return this.copy(termRegistry, this.implicitContext, this.whitespace, this.indentation,
                     this.lineSeparator, this.keywords);
  }

  public final boolean implicitContext() {
    return this.implicitContext;
  }

  public TermWriterOptions withImplicitContext(boolean implicitContext) {
    return this.copy(this.termRegistry, implicitContext, this.whitespace, this.indentation,
                     this.lineSeparator, this.keywords);
  }

  public final boolean whitespace() {
    return this.whitespace;
  }

  public TermWriterOptions withWhitespace(boolean whitespace) {
    return this.copy(this.termRegistry, this.implicitContext, whitespace, this.indentation,
                     this.lineSeparator, this.keywords);
  }

  public final @Nullable String indentation() {
    return this.indentation;
  }

  public TermWriterOptions withIndentation(@Nullable String indentation) {
    return this.copy(this.termRegistry, this.implicitContext, this.whitespace, indentation,
                     this.lineSeparator, this.keywords);
  }

  public final @Nullable String lineSeparator() {
    return this.lineSeparator;
  }

  public TermWriterOptions withLineSeparator(@Nullable String lineSeparator) {
    return this.copy(this.termRegistry, this.implicitContext, this.whitespace, this.indentation,
                     lineSeparator, this.keywords);
  }

  public final HashTrieSet<String> keywords() {
    return this.keywords;
  }

  public TermWriterOptions withKeywords(HashTrieSet<String> keywords) {
    return this.copy(this.termRegistry, this.implicitContext, this.whitespace, this.indentation,
                     this.lineSeparator, keywords);
  }

  /**
   * Returns a copy of these options with the specified parameters.
   * Subclasses may override this method to ensure the proper class
   * is instantiated when updating options.
   */
  @SuppressWarnings("ReferenceEquality")
  protected TermWriterOptions copy(TermRegistry termRegistry,
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
    return new TermWriterOptions(termRegistry, implicitContext, whitespace,
                                 indentation, lineSeparator, keywords);
  }

  /**
   * Returns {@code true} if these options can possibly equal
   * some {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof TermWriterOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TermWriterOptions that) {
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

  private static final int HASH_SEED = Murmur3.seed(TermWriterOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HASH_SEED, this.termRegistry.hashCode()), Murmur3.hash(this.whitespace)),
        Murmur3.hash(this.implicitContext)), Murmur3.hash(this.indentation)),
        Murmur3.hash(this.lineSeparator)), this.keywords.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.equals(COMPACT)) {
      notation.beginInvoke("TermWriterOptions", "compact").endInvoke();
    } else if (this.equals(READABLE)) {
      notation.beginInvoke("TermWriterOptions", "readable").endInvoke();
    } else if (this.equals(PRETTY)) {
      notation.beginInvoke("TermWriterOptions", "pretty").endInvoke();
    } else {
      notation.beginInvokeNew("TermWriterOptions")
              .appendArgument(this.termRegistry)
              .appendArgument(this.implicitContext)
              .appendArgument(this.whitespace)
              .appendArgument(this.indentation)
              .appendArgument(this.lineSeparator)
              .appendArgument(this.keywords)
              .endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final HashTrieSet<String> KEYWORDS =
      HashTrieSet.<String>empty().added("undefined")
                                 .added("null")
                                 .added("false")
                                 .added("true");

  private static final TermWriterOptions COMPACT =
      new TermWriterOptions(Term.registry(), true, false, null, null, KEYWORDS);

  public static TermWriterOptions compact() {
    return COMPACT;
  }

  private static final TermWriterOptions READABLE =
      new TermWriterOptions(Term.registry(), true, true, null, null, KEYWORDS);

  public static TermWriterOptions readable() {
    return READABLE;
  }

  private static final TermWriterOptions PRETTY =
      new TermWriterOptions(Term.registry(), true, true, "  ", System.lineSeparator(), KEYWORDS);

  public static TermWriterOptions pretty() {
    return PRETTY;
  }

}
