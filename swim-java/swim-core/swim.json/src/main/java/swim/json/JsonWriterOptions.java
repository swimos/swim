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
import swim.collections.HashTrieSet;
import swim.term.Term;
import swim.term.TermRegistry;
import swim.term.TermWriterOptions;
import swim.util.Murmur3;
import swim.util.Notation;

/**
 * JSON writer configuration options.
 */
@Public
@Since("5.0")
public class JsonWriterOptions extends TermWriterOptions {

  protected final boolean identifierKeys;

  public JsonWriterOptions(TermRegistry termRegistry,
                           boolean implicitContext,
                           boolean whitespace,
                           @Nullable String indentation,
                           @Nullable String lineSeparator,
                           HashTrieSet<String> keywords,
                           boolean identifierKeys) {
    super(termRegistry, implicitContext, whitespace, indentation, lineSeparator, keywords);
    this.identifierKeys = identifierKeys;
  }

  @Override
  public JsonWriterOptions withTermRegistry(TermRegistry termRegistry) {
    return this.copy(termRegistry, this.implicitContext, this.whitespace, this.indentation,
                     this.lineSeparator, this.keywords, this.identifierKeys);
  }

  @Override
  public JsonWriterOptions withImplicitContext(boolean implicitContext) {
    return this.copy(this.termRegistry, implicitContext, this.whitespace, this.indentation,
                     this.lineSeparator, this.keywords, this.identifierKeys);
  }

  @Override
  public JsonWriterOptions withWhitespace(boolean whitespace) {
    return this.copy(this.termRegistry, this.implicitContext, whitespace, this.indentation,
                     this.lineSeparator, this.keywords, this.identifierKeys);
  }

  @Override
  public JsonWriterOptions withIndentation(@Nullable String indentation) {
    return this.copy(this.termRegistry, this.implicitContext, this.whitespace, indentation,
                     this.lineSeparator, this.keywords, this.identifierKeys);
  }

  @Override
  public JsonWriterOptions withLineSeparator(@Nullable String lineSeparator) {
    return this.copy(this.termRegistry, this.implicitContext, this.whitespace, this.indentation,
                     lineSeparator, this.keywords, this.identifierKeys);
  }

  @Override
  public JsonWriterOptions withKeywords(HashTrieSet<String> keywords) {
    return this.copy(this.termRegistry, this.implicitContext, this.whitespace, this.indentation,
                     this.lineSeparator, keywords, this.identifierKeys);
  }

  public final boolean identifierKeys() {
    return this.identifierKeys;
  }

  public JsonWriterOptions withIdentifierKeys(boolean identifierKeys) {
    return this.copy(this.termRegistry, this.implicitContext, this.whitespace, this.indentation,
                     this.lineSeparator, this.keywords, identifierKeys);
  }

  public JsonWriterOptions withOptions(TermWriterOptions options) {
    if (options instanceof JsonWriterOptions) {
      return (JsonWriterOptions) options;
    }
    return this.copy(options.termRegistry(), options.implicitContext(), options.whitespace(),
                     options.indentation(), options.lineSeparator(), options.keywords(),
                     this.identifierKeys);
  }

  @Override
  protected JsonWriterOptions copy(TermRegistry termRegistry,
                                   boolean implicitContext,
                                   boolean whitespace,
                                   @Nullable String indentation,
                                   @Nullable String lineSeparator,
                                   HashTrieSet<String> keywords) {
    return this.copy(termRegistry, implicitContext, whitespace, indentation,
                     lineSeparator, keywords, this.identifierKeys);
  }

  @SuppressWarnings("ReferenceEquality")
  protected JsonWriterOptions copy(TermRegistry termRegistry,
                                   boolean implicitContext,
                                   boolean whitespace,
                                   @Nullable String indentation,
                                   @Nullable String lineSeparator,
                                   HashTrieSet<String> keywords,
                                   boolean identifierKeys) {
    if (termRegistry == this.termRegistry
        && implicitContext == this.implicitContext
        && whitespace == this.whitespace
        && indentation == this.indentation
        && lineSeparator == this.lineSeparator
        && keywords == this.keywords
        && identifierKeys == this.identifierKeys) {
      return this;
    }
    return new JsonWriterOptions(termRegistry, implicitContext, whitespace, indentation,
                                 lineSeparator, keywords, identifierKeys);
  }

  @Override
  public boolean canEqual(Object other) {
    return other instanceof JsonWriterOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsonWriterOptions that) {
      return that.canEqual(this)
          && this.termRegistry.equals(that.termRegistry)
          && this.implicitContext == that.implicitContext
          && this.whitespace == that.whitespace
          && Objects.equals(this.indentation, that.indentation)
          && Objects.equals(this.lineSeparator, that.lineSeparator)
          && this.keywords.equals(that.keywords)
          && this.identifierKeys == that.identifierKeys;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(JsonWriterOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(HASH_SEED, termRegistry.hashCode()), Murmur3.hash(this.whitespace)),
        Murmur3.hash(this.implicitContext)), Murmur3.hash(this.indentation)),
        Murmur3.hash(this.lineSeparator)), this.keywords.hashCode()),
        Murmur3.hash(this.identifierKeys)));
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
              .appendArgument(this.termRegistry)
              .appendArgument(this.implicitContext)
              .appendArgument(this.whitespace)
              .appendArgument(this.indentation)
              .appendArgument(this.lineSeparator)
              .appendArgument(this.keywords)
              .appendArgument(this.identifierKeys)
              .endInvoke();
    }
  }

  private static final JsonWriterOptions STANDARD =
      new JsonWriterOptions(Term.registry(), true, false, null, null,
                            TermWriterOptions.compact().keywords(), false);

  public static JsonWriterOptions standard() {
    return STANDARD;
  }

  private static final JsonWriterOptions COMPACT =
      new JsonWriterOptions(Term.registry(), true, false, null, null,
                            TermWriterOptions.compact().keywords(), true);

  public static JsonWriterOptions compact() {
    return COMPACT;
  }

  private static final JsonWriterOptions READABLE =
      new JsonWriterOptions(Term.registry(), true, true, null, null,
                            TermWriterOptions.readable().keywords(), true);

  public static JsonWriterOptions readable() {
    return READABLE;
  }

  private static final JsonWriterOptions PRETTY =
      new JsonWriterOptions(Term.registry(), true, true, "  ", System.lineSeparator(),
                            TermWriterOptions.pretty().keywords(), true);

  public static JsonWriterOptions pretty() {
    return PRETTY;
  }

}
