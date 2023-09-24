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
public final class InvokeExpr extends SelectorExpr implements WriteSource {

  final Term scope;
  final Term[] args;

  public InvokeExpr(Term scope, Term[] args) {
    this.scope = scope.commit();
    this.args = args;
    for (int i = 0; i < args.length; i += 1) {
      args[i].commit();
    }
  }

  public Term scope() {
    return this.scope;
  }

  public Term[] args() {
    return this.args;
  }

  @Override
  public int precedence() {
    return 11;
  }

  @Override
  public boolean isGenerator() {
    return true;
  }

  @Override
  public TermGenerator generator() {
    return new InvokeExprGenerator(this.scope.generator(), this.args);
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return this.generator().intoTerm(evaluator);
  }

  @Override
  public Write<?> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options) {
    return WriteInvokeExpr.write(output, writer, options, this.scope, this.args,
                                 this.precedence(), null, 0, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof InvokeExpr that) {
      return this.scope.equals(that.scope)
          && Arrays.equals(this.args, that.args);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(InvokeExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.scope.hashCode()), Arrays.hashCode(this.args)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("InvokeExpr", "of")
            .appendArgument(this.scope);
    for (int i = 0; i <  this.args.length; i += 1) {
      notation.appendArgument(this.args[i]);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final Term[] EMPTY_ARGS = new Term[0];

  public static InvokeExpr of(Term scope) {
    return new InvokeExpr(scope, EMPTY_ARGS);
  }

  public static InvokeExpr of(Term scope, Term... args) {
    return new InvokeExpr(scope, args);
  }

}

final class InvokeExprGenerator implements TermGenerator {

  final TermGenerator scope;
  final Term[] args;
  @Nullable TermGenerator results;

  InvokeExprGenerator(TermGenerator scope, Term[] args) {
    this.scope = scope;
    this.args = args;
    this.results = null;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    do {
      if (this.results == null) {
        final Term term = this.scope.evaluateNext(evaluator);
        if (term == null) {
          return null;
        }
        this.results = term.invoke(evaluator, this.args).generator();
      } else {
        final Term result = this.results.evaluateNext(evaluator);
        if (result != null) {
          return result;
        }
        this.results = null;
      }
    } while (true);
  }

}

final class WriteInvokeExpr extends Write<Object> {

  final TermWriter<?> writer;
  final TermWriterOptions options;
  final Term scope;
  final Term[] args;
  final int precedence;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  WriteInvokeExpr(TermWriter<?> writer, TermWriterOptions options, Term scope, Term[] args,
                  int precedence, @Nullable Write<?> write, int index, int step) {
    this.writer = writer;
    this.options = options;
    this.scope = scope;
    this.args = args;
    this.precedence = precedence;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteInvokeExpr.write(output, this.writer, this.options, this.scope, this.args,
                                 this.precedence, this.write, this.index, this.step);
  }

  static Write<Object> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options,
                             Term scope, Term[] args, int precedence, @Nullable Write<?> write,
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
      output.write('(');
      step = 5;
    }
    do {
      if (step == 5) {
        if (write == null) {
          if (index < args.length) {
            write = writer.writeTerm(output, args[index], options);
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
        if (options.whitespace()) {
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
    return new WriteInvokeExpr(writer, options, scope, args, precedence, write, index, step);
  }

}
