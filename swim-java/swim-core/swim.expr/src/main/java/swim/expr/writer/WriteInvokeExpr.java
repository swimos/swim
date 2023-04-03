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
public final class WriteInvokeExpr extends Write<Object> {

  final ExprWriter writer;
  final TermForm<?> form;
  final Term scope;
  final Term[] args;
  final int precedence;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  public WriteInvokeExpr(ExprWriter writer, TermForm<?> form, Term scope,
                         Term[] args, int precedence, @Nullable Write<?> write,
                         int index, int step) {
    this.writer = writer;
    this.form = form;
    this.scope = scope;
    this.args = args;
    this.precedence = precedence;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteInvokeExpr.write(output, this.writer, this.form, this.scope,
                                 this.args, this.precedence, this.write,
                                 this.index, this.step);
  }

  public static Write<Object> write(Output<?> output, ExprWriter writer,
                                    TermForm<?> form, Term scope, Term[] args,
                                    int precedence, @Nullable Write<?> write,
                                    int index, int step) {
    if (step == 1) {
      if (scope.precedence() < precedence) {
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
        write = writer.writeTerm(output, form, scope);
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
      if (scope.precedence() < precedence) {
        if (output.isCont()) {
          output.write(')');
          step = 4;
        }
      } else {
        step = 4;
      }
    }
    if (step == 4 && output.isCont()) {
      output.write('(');
      step = 5;
    }
    do {
      if (step == 5) {
        if (write == null) {
          if (index < args.length) {
            write = writer.writeTerm(output, form, args[index]);
            index += 1;
          } else {
            step = 8;
            break;
          }
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          if (index < args.length) {
            step = 6;
          } else {
            step = 8;
            break;
          }
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 6 && output.isCont()) {
        output.write(',');
        step = 7;
      }
      if (step == 7) {
        if (writer.options().whitespace()) {
          if (output.isCont()) {
            output.write(' ');
            step = 5;
            continue;
          }
        } else {
          step = 5;
          continue;
        }
      }
      break;
    } while (true);
    if (step == 8 && output.isCont()) {
      output.write(')');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteInvokeExpr(writer, form, scope, args,
                               precedence, write, index, step);
  }

}
