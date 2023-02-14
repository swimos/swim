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

package swim.expr.writer;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.expr.ExprWriter;
import swim.expr.Term;
import swim.expr.TermForm;

@Internal
public final class WritePrefixExpr extends Write<Object> {

  final ExprWriter writer;
  final TermForm<?> form;
  final String operator;
  final Term rhs;
  final int precedence;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  public WritePrefixExpr(ExprWriter writer, TermForm<?> form, String operator,
                         Term rhs, int precedence, @Nullable Write<?> write,
                         int index, int step) {
    this.writer = writer;
    this.form = form;
    this.operator = operator;
    this.rhs = rhs;
    this.precedence = precedence;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WritePrefixExpr.write(output, this.writer, this.form,
                                 this.operator, this.rhs, this.precedence,
                                 this.write, this.index, this.step);
  }

  public static Write<Object> write(Output<?> output, ExprWriter writer,
                                    TermForm<?> form, String operator, Term rhs,
                                    int precedence, @Nullable Write<?> write,
                                    int index, int step) {
    if (step == 1) {
      while (index < operator.length() && output.isCont()) {
        output.write(operator.codePointAt(index));
        index = operator.offsetByCodePoints(index, 1);
      }
      if (index == operator.length()) {
        index = 0;
        step = 2;
      }
    }
    if (step == 2) {
      if (rhs.precedence() < precedence) {
        if (output.isCont()) {
          output.write('(');
          step = 3;
        }
      } else {
        step = 3;
      }
    }
    if (step == 3) {
      if (write == null) {
        write = writer.writeTerm(output, form, rhs);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 4;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 4) {
      if (rhs.precedence() < precedence) {
        if (output.isCont()) {
          output.write(')');
          return Write.done();
        }
      } else {
        return Write.done();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WritePrefixExpr(writer, form, operator, rhs,
                               precedence, write, index, step);
  }

}
