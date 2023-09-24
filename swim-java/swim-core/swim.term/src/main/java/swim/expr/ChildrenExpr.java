// Copyright 2015-2023 Nstream, inc.
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
import swim.term.Evaluator;
import swim.term.Term;
import swim.term.TermGenerator;
import swim.term.TermWriter;
import swim.term.TermWriterOptions;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class ChildrenExpr extends SelectorExpr implements WriteSource {

  final Term scope;

  public ChildrenExpr(Term scope) {
    this.scope = scope.commit();
  }

  public Term scope() {
    return this.scope;
  }

  @Override
  public boolean isGenerator() {
    return true;
  }

  @Override
  public TermGenerator generator() {
    return new ChildrenExprGenerator(this.scope.generator());
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return this.generator().intoTerm(evaluator);
  }

  @Override
  public Write<?> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options) {
    return WriteChildrenExpr.write(output, writer, options, this.scope,
                                   this.precedence(), null, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ChildrenExpr that) {
      return this.scope.equals(that.scope);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(ChildrenExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.scope.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.scope instanceof ContextExpr) {
      notation.beginInvoke("ContextExpr", "children");
    } else if (this.scope instanceof GlobalExpr) {
      notation.beginInvoke("GlobalExpr", "children");
    } else if (this.scope instanceof SelectorExpr) {
      notation.appendSource(this.scope)
              .beginInvoke("children");
    } else {
      notation.beginInvoke("ChildrenExpr", "of")
              .appendArgument(this.scope);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static ChildrenExpr of(Term scope) {
    return new ChildrenExpr(scope);
  }

}

final class ChildrenExprGenerator implements TermGenerator {

  final TermGenerator scope;
  @Nullable TermGenerator children;

  ChildrenExprGenerator(TermGenerator scope) {
    this.scope = scope;
    this.children = null;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    do {
      if (this.children == null) {
        final Term term = this.scope.evaluateNext(evaluator);
        if (term == null) {
          return null;
        }
        this.children = term.getChildren();
      } else {
        final Term child = this.children.evaluateNext(evaluator);
        if (child != null) {
          return child.evaluate(evaluator);
        }
        this.children = null;
      }
    } while (true);
  }

}

final class WriteChildrenExpr extends Write<Object> {

  final TermWriter<?> writer;
  final TermWriterOptions options;
  final Term scope;
  final int precedence;
  final @Nullable Write<?> write;
  final int step;

  WriteChildrenExpr(TermWriter<?> writer, TermWriterOptions options, Term scope,
                    int precedence, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.scope = scope;
    this.precedence = precedence;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteChildrenExpr.write(output, this.writer, this.options, this.scope,
                                   this.precedence, this.write, this.step);
  }

  static Write<Object> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options,
                             Term scope, int precedence, @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (scope instanceof ContextExpr && options.implicitContext()) {
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
        write = writer.writeTerm(output, scope, options);
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
    if (step == 5 && output.isCont()) {
      output.write('*');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteChildrenExpr(writer, options, scope, precedence, write, step);
  }

}
