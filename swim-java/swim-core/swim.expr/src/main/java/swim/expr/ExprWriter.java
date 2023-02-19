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

import java.util.Iterator;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Text;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.expr.operator.CondExpr;
import swim.expr.operator.InfixExpr;
import swim.expr.operator.OperatorExpr;
import swim.expr.operator.PrefixExpr;
import swim.expr.selector.ChildExpr;
import swim.expr.selector.ChildrenExpr;
import swim.expr.selector.DescendantsExpr;
import swim.expr.selector.InvokeExpr;
import swim.expr.selector.MemberExpr;
import swim.expr.selector.SelectorExpr;
import swim.expr.writer.WriteChildExpr;
import swim.expr.writer.WriteChildrenExpr;
import swim.expr.writer.WriteCondExpr;
import swim.expr.writer.WriteDescendantsExpr;
import swim.expr.writer.WriteFieldExpr;
import swim.expr.writer.WriteFormat;
import swim.expr.writer.WriteFormatExpr;
import swim.expr.writer.WriteIdentifierTerm;
import swim.expr.writer.WriteIndexExpr;
import swim.expr.writer.WriteInfixExpr;
import swim.expr.writer.WriteInvokeExpr;
import swim.expr.writer.WriteMemberExpr;
import swim.expr.writer.WritePrefixExpr;
import swim.expr.writer.WriteStringTerm;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * Factory for constructing expression writers.
 */
@Public
@Since("5.0")
public class ExprWriter extends ExprLexer implements ToSource {

  protected final ExprWriterOptions options;

  protected ExprWriter(ExprWriterOptions options) {
    this.options = options;
  }

  public ExprWriterOptions options() {
    return this.options;
  }

  public Write<?> writeBooleanTerm(Output<?> output, boolean value) {
    return Text.transcoder().write(output, value ? "true" : "false");
  }

  public Write<?> writeNumberTerm(Output<?> output, Number value) {
    return Text.transcoder().write(output, value.toString());
  }

  public Write<?> writeIdentifierTerm(Output<?> output, String value) {
    return WriteIdentifierTerm.write(output, this, value, 0);
  }

  public Write<?> writeStringTerm(Output<?> output, String value) {
    return WriteStringTerm.write(output, value, 0, 0, 1);
  }

  public Write<?> writeTerm(Output<?> output, TermForm<?> form, Term term) {
    if (term instanceof Expr) {
      return this.writeExpr(output, form, (Expr) term);
    } else if (term.isValidBoolean()) {
      return this.writeBooleanTerm(output, term.booleanValue());
    } else if (term.isValidNumber()) {
      return this.writeNumberTerm(output, term.numberValue());
    } else if (term.isValidString()) {
      return this.writeStringTerm(output, term.stringValue());
    } else {
      return Write.error(new WriteException("Unsupported term: " + term));
    }
  }

  public Write<?> writeGlobalExpr(Output<?> output, TermForm<?> form, GlobalExpr expr) {
    return Text.transcoder().write(output, "$");
  }

  public Write<?> writeContextExpr(Output<?> output, TermForm<?> form, ContextExpr expr) {
    return Text.transcoder().write(output, "%");
  }

  public boolean isLiteralDescendantsExpr(TermForm<?> form, Term scope) {
    return scope instanceof ContextExpr;
  }

  public Write<?> writeDescendantsExpr(Output<?> output, TermForm<?> form,
                                       Term scope, int precedence) {
    return WriteDescendantsExpr.write(output, this, form, scope, precedence, null, 1);
  }

  public boolean isLiteralChildrenExpr(TermForm<?> form, Term scope) {
    return scope instanceof ContextExpr;
  }

  public Write<?> writeChildrenExpr(Output<?> output, TermForm<?> form,
                                    Term scope, int precedence) {
    return WriteChildrenExpr.write(output, this, form, scope, precedence, null, 1);
  }

  public boolean isLiteralFieldExpr(TermForm<?> form, Term scope, String key) {
    return scope instanceof ContextExpr;
  }

  public Write<?> writeFieldExpr(Output<?> output, TermForm<?> form,
                                 Term scope, String key, int precedence) {
    return WriteFieldExpr.write(output, this, form, scope, key, precedence, null, 0, 1);
  }

  public Write<?> writeIndexExpr(Output<?> output, TermForm<?> form,
                                 Term scope, int index, int precedence) {
    return WriteIndexExpr.write(output, this, form, scope, index, precedence, null, 1);
  }

  public Write<?> writeChildExpr(Output<?> output, TermForm<?> form,
                                 Term scope, Term key, int precedence) {
    return WriteChildExpr.write(output, this, form, scope, key, precedence, null, 1);
  }

  public Write<?> writeMemberExpr(Output<?> output, TermForm<?> form,
                                  Term scope, String key, int precedence) {
    return WriteMemberExpr.write(output, this, form, scope, key, precedence, null, 0, 1);
  }

  public Write<?> writeInvokeExpr(Output<?> output, TermForm<?> form,
                                  Term scope, Term[] args, int precedence) {
    return WriteInvokeExpr.write(output, this, form, scope, args, precedence, null, 0, 1);
  }

  public Write<?> writeSelectorExpr(Output<?> output, TermForm<?> form,
                                    SelectorExpr selectorExpr) {
    if (selectorExpr instanceof InvokeExpr) {
      final InvokeExpr expr = (InvokeExpr) selectorExpr;
      return this.writeInvokeExpr(output, form, expr.scope(), expr.args(), expr.precedence());
    } else if (selectorExpr instanceof MemberExpr) {
      final MemberExpr expr = (MemberExpr) selectorExpr;
      return this.writeMemberExpr(output, form, expr.scope(), expr.key(), expr.precedence());
    } else if (selectorExpr instanceof ChildExpr) {
      final ChildExpr expr = (ChildExpr) selectorExpr;
      final Term keyExpr = expr.key();
      if (keyExpr.isValidInt()) {
        final int index = keyExpr.intValue();
        if (index >= 0) {
          return this.writeIndexExpr(output, form, expr.scope(), index, expr.precedence());
        }
      } else if (keyExpr.isValidString()) {
        final String key = keyExpr.stringValue();
        if (this.isIdentifier(key) && !this.isKeyword(key)) {
          return this.writeFieldExpr(output, form, expr.scope(), key, expr.precedence());
        }
      }
      return this.writeChildExpr(output, form, expr.scope(), expr.key(), expr.precedence());
    } else if (selectorExpr instanceof ChildrenExpr) {
      final ChildrenExpr expr = (ChildrenExpr) selectorExpr;
      return this.writeChildrenExpr(output, form, expr.scope(), expr.precedence());
    } else if (selectorExpr instanceof DescendantsExpr) {
      final DescendantsExpr expr = (DescendantsExpr) selectorExpr;
      return this.writeDescendantsExpr(output, form, expr.scope(), expr.precedence());
    } else {
      return Write.error(new WriteException("Unsupported selector: " + selectorExpr));
    }
  }

  public Write<?> writePrefixExpr(Output<?> output, TermForm<?> form,
                                  String operator, Term rhs, int precedence) {
    return WritePrefixExpr.write(output, this, form, operator, rhs, precedence, null, 0, 1);
  }

  public Write<?> writeInfixExpr(Output<?> output, TermForm<?> form, Term lhs,
                                 String operator, Term rhs, int precedence) {
    return WriteInfixExpr.write(output, this, form, lhs, operator, rhs, precedence, null, 0, 1);
  }

  public Write<?> writeCondExpr(Output<?> output, TermForm<?> form, Term ifTerm,
                                Term thenTerm, Term elseTerm, int precedence) {
    return WriteCondExpr.write(output, this, form, ifTerm, thenTerm, elseTerm, precedence, null, 1);
  }

  public Write<?> writeOperatorExpr(Output<?> output, TermForm<?> form,
                                    OperatorExpr operatorExpr) {
    if (operatorExpr instanceof CondExpr) {
      final CondExpr expr = (CondExpr) operatorExpr;
      return this.writeCondExpr(output, form, expr.ifTerm(), expr.thenTerm(), expr.elseTerm(), expr.precedence());
    } else if (operatorExpr instanceof InfixExpr) {
      final InfixExpr expr = (InfixExpr) operatorExpr;
      return this.writeInfixExpr(output, form, expr.lhs(), expr.operator(), expr.rhs(), expr.precedence());
    } else if (operatorExpr instanceof PrefixExpr) {
      final PrefixExpr expr = (PrefixExpr) operatorExpr;
      return this.writePrefixExpr(output, form, expr.operator(), expr.rhs(), expr.precedence());
    } else {
      return Write.error(new WriteException("Unsupported operator: " + operatorExpr));
    }
  }

  public Write<?> writeExpr(Output<?> output, TermForm<?> form, Expr expr) {
    if (expr instanceof SelectorExpr) {
      return this.writeSelectorExpr(output, form, (SelectorExpr) expr);
    } else if (expr instanceof OperatorExpr) {
      return this.writeOperatorExpr(output, form, (OperatorExpr) expr);
    } else if (expr instanceof ContextExpr) {
      return this.writeContextExpr(output, form, (ContextExpr) expr);
    } else if (expr instanceof GlobalExpr) {
      return this.writeGlobalExpr(output, form, (GlobalExpr) expr);
    } else {
      return Write.error(new WriteException("Unsupported expression: " + expr));
    }
  }

  public Write<?> writeFormatExpr(Output<?> output, TermForm<?> form, Iterator<Object> parts) {
    return WriteFormatExpr.write(output, this, form, parts, null, null, 0, 0, 1);
  }

  public Write<?> writeFormat(Output<?> output, Evaluator evaluator, Iterator<Object> parts) {
    return WriteFormat.write(output, this, evaluator, parts, null, null, 0, 0, 1);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Expr", "writer")
            .appendArgument(this.options)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final ExprWriter COMPACT = new ExprWriter(ExprWriterOptions.compact());

  static final ExprWriter READABLE = new ExprWriter(ExprWriterOptions.readable());

}
