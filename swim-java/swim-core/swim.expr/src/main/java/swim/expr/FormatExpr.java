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

import java.util.Arrays;
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.BinaryOutputBuffer;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.util.ArrayIterator;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class FormatExpr implements Expr, ToSource {

  final Object[] parts; // (String | Term)[]

  public FormatExpr(Object[] parts) {
    this.parts = parts;
    for (int i = 0; i < parts.length; i += 1) {
      final Object part = parts[i];
      if (part instanceof Term) {
        ((Term) part).commit();
      }
    }
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    try {
      final StringOutput output = new StringOutput();
      this.writeFormat(output, evaluator).checkDone();
      return Term.of(output.toString());
    } catch (WriteException cause) {
      return Term.trap();
    }
  }

  public Write<?> writeFormat(Output<?> output, Evaluator evaluator) {
    return Expr.writer().writeFormat(output, evaluator, this.iterator());
  }

  public Write<?> writeFormat(Evaluator evaluator) {
    return Expr.writer().writeFormat(BinaryOutputBuffer.full(), evaluator, this.iterator());
  }

  public Write<?> write(Output<?> output) {
    return Expr.writer().writeFormatExpr(output, Term.registry(), this.iterator());
  }

  public Write<?> write() {
    return Expr.writer().writeFormatExpr(BinaryOutputBuffer.full(),
                                         Term.registry(), this.iterator());
  }

  public Iterator<Object> iterator() {
    return ArrayIterator.of(this.parts);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof FormatExpr) {
      final FormatExpr that = (FormatExpr) other;
      return Arrays.equals(this.parts, that.parts);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(FormatExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Arrays.hashCode(this.parts)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("FormatExpr", "of");
    for (int i = 0; i < this.parts.length; i += 1) {
      final Object part = this.parts[i];
      if (part instanceof Term && ((Term) part).isValidObject()) {
        notation.appendArgument(((Term) part).objectValue());
      } else {
        notation.appendArgument(part);
      }
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static FormatExpr of(Object/*String | Term*/... parts) {
    for (int i = 0; i < parts.length; i += 1) {
      final Object part = parts[i];
      if (!(part instanceof String) && !(part instanceof Term)) {
        throw new IllegalArgumentException(Notation.of("format part ")
                                                   .append(i)
                                                   .append(" is not a string or term: ")
                                                   .appendSource(part)
                                                   .toString());
      }
    }
    return new FormatExpr(parts);
  }

  public static Parse<FormatExpr> parse(Input input) {
    return Expr.parser().parseFormatExpr(input, Term.registry());
  }

  public static Parse<FormatExpr> parse() {
    return Expr.parser().parseFormatExpr(StringInput.empty(), Term.registry());
  }

  public static Parse<FormatExpr> parse(String string) {
    final StringInput input = new StringInput(string);
    return FormatExpr.parse(input).complete(input);
  }

}
