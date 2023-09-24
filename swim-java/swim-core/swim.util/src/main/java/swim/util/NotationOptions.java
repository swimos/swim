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

package swim.util;

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public class NotationOptions implements WriteSource {

  protected final boolean verbose;
  protected final boolean stylize;
  protected final boolean whitespace;
  protected final @Nullable String indentation;
  protected final @Nullable String lineSeparator;

  public NotationOptions(boolean verbose,
                         boolean stylize,
                         boolean whitespace,
                         @Nullable String indentation,
                         @Nullable String lineSeparator) {
    this.verbose = verbose;
    this.stylize = stylize;
    this.whitespace = whitespace;
    this.indentation = indentation;
    this.lineSeparator = lineSeparator;
  }

  public final boolean verbose() {
    return this.verbose;
  }

  public NotationOptions verbose(boolean verbose) {
    return this.copy(verbose, this.stylize, this.whitespace,
                     this.indentation, this.lineSeparator);
  }

  public final boolean stylize() {
    return this.stylize;
  }

  public NotationOptions stylize(boolean stylize) {
    return this.copy(this.verbose, stylize, this.whitespace,
                     this.indentation, this.lineSeparator);
  }

  public final boolean whitespace() {
    return this.whitespace;
  }

  public NotationOptions whitespace(boolean whitespace) {
    return this.copy(this.verbose, this.stylize, whitespace,
                     this.indentation, this.lineSeparator);
  }

  public final @Nullable String indentation() {
    return this.indentation;
  }

  public NotationOptions indentation(@Nullable String indentation) {
    return this.copy(this.verbose, this.stylize, this.whitespace,
                     indentation, this.lineSeparator);
  }

  public final @Nullable String lineSeparator() {
    return this.lineSeparator;
  }

  public NotationOptions lineSeparator(@Nullable String lineSeparator) {
    return this.copy(this.verbose, this.stylize, this.whitespace,
                     this.indentation, lineSeparator);
  }

  protected NotationOptions copy(boolean verbose,
                                 boolean stylize,
                                 boolean whitespace,
                                 @Nullable String indentation,
                                 @Nullable String lineSeparator) {
    return new NotationOptions(verbose, stylize, whitespace,
                               indentation, lineSeparator);
  }

  protected boolean canEqual(java.lang.Object other) {
    return other instanceof NotationOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof NotationOptions that) {
      return that.canEqual(this)
          && this.verbose == that.verbose
          && this.stylize == that.stylize
          && this.whitespace == that.whitespace
          && Objects.equals(this.indentation, that.indentation)
          && Objects.equals(this.lineSeparator, that.lineSeparator);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(NotationOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HASH_SEED, Murmur3.hash(this.verbose)), Murmur3.hash(this.stylize)),
        Murmur3.hash(this.whitespace)), Murmur3.hash(this.indentation)),
        Murmur3.hash(this.lineSeparator)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (COMPACT.equals(this)) {
      notation.beginInvoke("NotationOptions", "compact").endInvoke();
    } else if (READABLE.equals(this)) {
      notation.beginInvoke("NotationOptions", "readable").endInvoke();
    } else if (PRETTY.equals(this)) {
      notation.beginInvoke("NotationOptions", "pretty").endInvoke();
    } else if (STYLED.equals(this)) {
      notation.beginInvoke("NotationOptions", "styled").endInvoke();
    } else if (DEBUG.equals(this)) {
      notation.beginInvoke("NotationOptions", "debug").endInvoke();
    } else {
      notation.beginInvokeNew("NotationOptions")
              .appendArgument(this.verbose)
              .appendArgument(this.stylize)
              .appendArgument(this.whitespace)
              .appendArgument(this.indentation)
              .appendArgument(this.lineSeparator)
              .endInvoke();
    }
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  private static final NotationOptions COMPACT = new NotationOptions(false, false, false, null, null);

  public static NotationOptions compact() {
    return COMPACT;
  }

  private static final NotationOptions READABLE = new NotationOptions(false, false, true, null, null);

  public static NotationOptions readable() {
    return READABLE;
  }

  private static final NotationOptions PRETTY = new NotationOptions(false, false, true, "  ", System.lineSeparator());

  public static NotationOptions pretty() {
    return PRETTY;
  }

  private static final NotationOptions STYLED = new NotationOptions(false, true, true, "  ", System.lineSeparator());

  public static NotationOptions styled() {
    return STYLED;
  }

  private static final NotationOptions DEBUG = new NotationOptions(true, false, true, "  ", System.lineSeparator());

  public static NotationOptions debug() {
    return DEBUG;
  }

}
