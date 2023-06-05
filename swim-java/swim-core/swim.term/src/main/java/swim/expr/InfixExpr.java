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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.term.Term;
import swim.term.TermWriter;
import swim.term.TermWriterOptions;

@Public
@Since("5.0")
public abstract class InfixExpr extends OperatorExpr {

  final Term lhs;
  final Term rhs;

  InfixExpr(Term lhs, Term rhs) {
    this.lhs = lhs.commit();
    this.rhs = rhs.commit();
  }

  public final Term lhs() {
    return this.lhs;
  }

  public abstract String operator();

  public final Term rhs() {
    return this.rhs;
  }

  @Override
  public Write<?> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options) {
    return WriteInfixExpr.write(output, writer, options, this.lhs, this.operator(),
                                this.rhs, this.precedence(), null, 0, 1);
  }

}

final class WriteInfixExpr extends Write<Object> {

  final TermWriter<?> writer;
  final TermWriterOptions options;
  final Term lhs;
  final String operator;
  final Term rhs;
  final int precedence;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  WriteInfixExpr(TermWriter<?> writer, TermWriterOptions options, Term lhs, String operator,
                 Term rhs, int precedence, @Nullable Write<?> write, int index, int step) {
    this.writer = writer;
    this.options = options;
    this.lhs = lhs;
    this.operator = operator;
    this.rhs = rhs;
    this.precedence = precedence;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteInfixExpr.write(output, this.writer, this.options, this.lhs, this.operator,
                                this.rhs, this.precedence, this.write, this.index, this.step);
  }

  static Write<Object> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options,
                             Term lhs, String operator, Term rhs, int precedence,
                             @Nullable Write<?> write, int index, int step) {
    if (step == 1) {
      if (lhs.precedence() < precedence) {
        if (output.isCont()) {
          output.write('(');
          step = 2;
        }
      } else {
        step = 2;
      }
    }
    if (step == 2) {
      if (write == null) {
        write = writer.writeTerm(output, lhs, options);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 3;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 3) {
      if (lhs.precedence() < precedence) {
        if (output.isCont()) {
          output.write(')');
          step = 4;
        }
      } else {
        step = 4;
      }
    }
    if (step == 4) {
      if (options.whitespace()) {
        if (output.isCont()) {
          output.write(' ');
          step = 5;
        }
      } else {
        step = 5;
      }
    }
    if (step == 5) {
      while (index < operator.length() && output.isCont()) {
        output.write(operator.codePointAt(index));
        index = operator.offsetByCodePoints(index, 1);
      }
      if (index == operator.length()) {
        index = 0;
        step = 6;
      }
    }
    if (step == 6) {
      if (options.whitespace()) {
        if (output.isCont()) {
          output.write(' ');
          step = 7;
        }
      } else {
        step = 7;
      }
    }
    if (step == 7) {
      if (rhs.precedence() < precedence) {
        if (output.isCont()) {
          output.write('(');
          step = 8;
        }
      } else {
        step = 8;
      }
    }
    if (step == 8) {
      if (write == null) {
        write = writer.writeTerm(output, rhs, options);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 9;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 9) {
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
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteInfixExpr(writer, options, lhs, operator, rhs,
                              precedence, write, index, step);
  }

}
