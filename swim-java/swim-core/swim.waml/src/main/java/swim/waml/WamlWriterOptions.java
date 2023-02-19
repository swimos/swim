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

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.ExprWriterOptions;
import swim.util.Murmur3;
import swim.util.Notation;

/**
 * WAML writer configuration options.
 */
@Public
@Since("5.0")
public class WamlWriterOptions extends ExprWriterOptions {

  public WamlWriterOptions(boolean whitespace,
                           @Nullable String indentation,
                           @Nullable String lineSeparator) {
    super(whitespace, indentation, lineSeparator);
  }

  @Override
  public WamlWriterOptions whitespace(boolean whitespace) {
    return this.copy(whitespace, this.indentation, this.lineSeparator);
  }

  @Override
  public WamlWriterOptions indentation(@Nullable String indentation) {
    return this.copy(this.whitespace, indentation, this.lineSeparator);
  }

  @Override
  public WamlWriterOptions lineSeparator(@Nullable String lineSeparator) {
    return this.copy(this.whitespace, this.indentation, lineSeparator);
  }

  @Override
  protected WamlWriterOptions copy(boolean whitespace,
                                   @Nullable String indentation,
                                   @Nullable String lineSeparator) {
    return new WamlWriterOptions(whitespace, indentation, lineSeparator);
  }

  @Override
  public boolean canEqual(Object other) {
    return other instanceof WamlWriterOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WamlWriterOptions) {
      final WamlWriterOptions that = (WamlWriterOptions) other;
      return that.canEqual(this)
          && this.whitespace == that.whitespace
          && Objects.equals(this.indentation, that.indentation)
          && Objects.equals(this.lineSeparator, that.lineSeparator);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WamlWriterOptions.class);

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
      notation.beginInvoke("WamlWriterOptions", "compact").endInvoke();
    } else if (this.equals(READABLE)) {
      notation.beginInvoke("WamlWriterOptions", "readable").endInvoke();
    } else if (this.equals(PRETTY)) {
      notation.beginInvoke("WamlWriterOptions", "pretty").endInvoke();
    } else {
      notation.beginInvokeNew("WamlWriterOptions")
              .appendArgument(this.whitespace)
              .appendArgument(this.indentation)
              .appendArgument(this.lineSeparator)
              .endInvoke();
    }
  }

  private static final WamlWriterOptions COMPACT = new WamlWriterOptions(false, null, null);

  public static WamlWriterOptions compact() {
    return COMPACT;
  }

  private static final WamlWriterOptions READABLE = new WamlWriterOptions(true, null, null);

  public static WamlWriterOptions readable() {
    return READABLE;
  }

  private static final WamlWriterOptions PRETTY = new WamlWriterOptions(true, "  ", System.lineSeparator());

  public static WamlWriterOptions pretty() {
    return PRETTY;
  }

}
