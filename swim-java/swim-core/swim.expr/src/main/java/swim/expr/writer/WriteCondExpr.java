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
public final class WriteCondExpr extends Write<Object> {

  final ExprWriter writer;
  final TermForm<?> form;
  final Term ifTerm;
  final Term thenTerm;
  final Term elseTerm;
  final int precedence;
  final @Nullable Write<?> write;
  final int step;

  public WriteCondExpr(ExprWriter writer, TermForm<?> form, Term ifTerm,
                       Term thenTerm, Term elseTerm, int precedence,
                       @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.form = form;
    this.ifTerm = ifTerm;
    this.thenTerm = thenTerm;
    this.elseTerm = elseTerm;
    this.precedence = precedence;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteCondExpr.write(output, this.writer, this.form, this.ifTerm,
                               this.thenTerm, this.elseTerm, this.precedence,
                               this.write, this.step);
  }

  public static Write<Object> write(Output<?> output, ExprWriter writer,
                                    TermForm<?> form, Term ifTerm, Term thenTerm,
                                    Term elseTerm, int precedence,
                                    @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (ifTerm.precedence() > 0 && ifTerm.precedence() <= precedence) {
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
        write = writer.writeTerm(output, form, ifTerm);
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
      if (ifTerm.precedence() > 0 && ifTerm.precedence() <= precedence) {
        if (output.isCont()) {
          output.write(')');
          step = 4;
        }
      } else {
        step = 4;
      }
    }
    if (step == 4) {
      if (writer.options().whitespace()) {
        if (output.isCont()) {
          output.write(' ');
          step = 5;
        }
      } else {
        step = 5;
      }
    }
    if (step == 5 && output.isCont()) {
      output.write('?');
      step = 6;
    }
    if (step == 6) {
      if (writer.options().whitespace()) {
        if (output.isCont()) {
          output.write(' ');
          step = 7;
        }
      } else {
        step = 7;
      }
    }
    if (step == 7) {
      if (write == null) {
        write = writer.writeTerm(output, form, thenTerm);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 8;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 8) {
      if (writer.options().whitespace()) {
        if (output.isCont()) {
          output.write(' ');
          step = 9;
        }
      } else {
        step = 9;
      }
    }
    if (step == 9 && output.isCont()) {
      output.write(':');
      step = 10;
    }
    if (step == 10) {
      if (writer.options().whitespace()) {
        if (output.isCont()) {
          output.write(' ');
          step = 11;
        }
      } else {
        step = 11;
      }
    }
    if (step == 11) {
      if (write == null) {
        write = writer.writeTerm(output, form, elseTerm);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        return Write.done();
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteCondExpr(writer, form, ifTerm, thenTerm, elseTerm,
                             precedence, write, step);
  }

}
