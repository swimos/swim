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

package swim.expr;

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * Expression writer configuration options.
 */
@Public
@Since("5.0")
public class ExprWriterOptions implements ToSource {

  protected final boolean whitespace;
  protected final @Nullable String indentation;
  protected final @Nullable String lineSeparator;

  public ExprWriterOptions(boolean whitespace,
                           @Nullable String indentation,
                           @Nullable String lineSeparator) {
    this.whitespace = whitespace;
    this.indentation = indentation;
    this.lineSeparator = lineSeparator;
  }

  public final boolean whitespace() {
    return this.whitespace;
  }

  public ExprWriterOptions whitespace(boolean whitespace) {
    return this.copy(whitespace, this.indentation, this.lineSeparator);
  }

  public final @Nullable String indentation() {
    return this.indentation;
  }

  public ExprWriterOptions indentation(@Nullable String indentation) {
    return this.copy(this.whitespace, indentation, this.lineSeparator);
  }

  public final @Nullable String lineSeparator() {
    return this.lineSeparator;
  }

  public ExprWriterOptions lineSeparator(@Nullable String lineSeparator) {
    return this.copy(this.whitespace, this.indentation, lineSeparator);
  }

  /**
   * Returns a copy of these options with the specified parameters.
   * Subclasses may override this method to ensure the proper class
   * is instantiated when updating options.
   */
  protected ExprWriterOptions copy(boolean whitespace,
                                   @Nullable String indentation,
                                   @Nullable String lineSeparator) {
    return new ExprWriterOptions(whitespace, indentation, lineSeparator);
  }

  /**
   * Returns {@code true} if these options can possibly equal
   * some {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof ExprWriterOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ExprWriterOptions) {
      final ExprWriterOptions that = (ExprWriterOptions) other;
      return that.canEqual(this)
          && this.whitespace == that.whitespace
          && Objects.equals(this.indentation, that.indentation)
          && Objects.equals(this.lineSeparator, that.lineSeparator);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(ExprWriterOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
        Murmur3.hash(this.whitespace)), Murmur3.hash(this.indentation)),
        Murmur3.hash(this.lineSeparator)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.equals(COMPACT)) {
      notation.beginInvoke("ExprWriterOptions", "compact").endInvoke();
    } else if (this.equals(READABLE)) {
      notation.beginInvoke("ExprWriterOptions", "readable").endInvoke();
    } else if (this.equals(PRETTY)) {
      notation.beginInvoke("ExprWriterOptions", "pretty").endInvoke();
    } else {
      notation.beginInvokeNew("ExprWriterOptions")
              .appendArgument(this.whitespace)
              .appendArgument(this.indentation)
              .appendArgument(this.lineSeparator)
              .endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final ExprWriterOptions COMPACT = new ExprWriterOptions(false, null, null);

  public static ExprWriterOptions compact() {
    return COMPACT;
  }

  private static final ExprWriterOptions READABLE = new ExprWriterOptions(true, null, null);

  public static ExprWriterOptions readable() {
    return READABLE;
  }

  private static final ExprWriterOptions PRETTY = new ExprWriterOptions(true, "  ", System.lineSeparator());

  public static ExprWriterOptions pretty() {
    return PRETTY;
  }

}
