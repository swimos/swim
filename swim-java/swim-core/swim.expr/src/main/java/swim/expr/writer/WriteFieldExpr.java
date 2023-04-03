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
import swim.expr.ContextExpr;
import swim.expr.ExprWriter;
import swim.expr.GlobalExpr;
import swim.expr.Term;
import swim.expr.TermForm;

@Internal
public final class WriteFieldExpr extends Write<Object> {

  final ExprWriter writer;
  final TermForm<?> form;
  final Term scope;
  final String key;
  final int precedence;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  public WriteFieldExpr(ExprWriter writer, TermForm<?> form, Term scope,
                        String key, int precedence, @Nullable Write<?> write,
                        int index, int step) {
    this.writer = writer;
    this.form = form;
    this.scope = scope;
    this.key = key;
    this.precedence = precedence;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteFieldExpr.write(output, this.writer, this.form, this.scope,
                                this.key, this.precedence, this.write,
                                this.index, this.step);
  }

  public static Write<Object> write(Output<?> output, ExprWriter writer,
                                    TermForm<?> form, Term scope, String key,
                                    int precedence, @Nullable Write<?> write,
                                    int index, int step) {
    if (step == 1) {
      if (writer.isLiteralFieldExpr(form, scope, key)) {
        step = 5;
      } else if (scope instanceof ContextExpr) {
        if (output.isCont()) {
          output.write('%');
          step = 5;
        }
      } else if (scope instanceof GlobalExpr) {
        if (output.isCont()) {
          output.write('$');
          step = 5;
        }
      } else if (scope.precedence() < precedence) {
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
      output.write('.');
      step = 5;
    }
    if (step == 5) {
      int c;
      if (key.length() == 0) {
        return Write.error(new WriteException("blank identifier"));
      }
      if (index == 0 && output.isCont()) {
        c = key.codePointAt(0);
        if (writer.isIdentifierStartChar(c)) {
          output.write(c);
          index = key.offsetByCodePoints(0, 1);
        }
      }
      while (index < key.length() && output.isCont()) {
        c = key.codePointAt(index);
        if (writer.isIdentifierChar(c)) {
          output.write(c);
          index = key.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid identifier"));
        }
      }
      if (index >= key.length()) {
        return Write.done();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteFieldExpr(writer, form, scope, key,
                              precedence, write, index, step);
  }

}
