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
import swim.codec.Base10;
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
public final class ChildExpr extends SelectorExpr implements WriteSource {

  final Term scope;
  final Term key;

  public ChildExpr(Term scope, Term key) {
    this.scope = scope.commit();
    this.key = key.commit();
  }

  public Term scope() {
    return this.scope;
  }

  public Term key() {
    return this.key;
  }

  @Override
  public boolean isGenerator() {
    return true;
  }

  @Override
  public TermGenerator generator() {
    return new ChildExprGenerator(this.scope.generator(), this.key);
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return this.generator().intoTerm(evaluator);
  }

  @Override
  public Write<?> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options) {
    final Term keyTerm = this.key;
    if (keyTerm.isValidInt()) {
      final int index = keyTerm.intValue();
      if (index >= 0) {
        return WriteIndexExpr.write(output, writer, options, this.scope, index,
                                    this.precedence(), null, 1);
      }
    } else if (keyTerm.isValidString()) {
      final String key = keyTerm.stringValue();
      if (Term.isIdentifier(key) && !options.keywords().contains(key)) {
        return WriteFieldExpr.write(output, writer, options, this.scope, key,
                                    this.precedence(), null, 0, 1);
      }
    }
    return WriteChildExpr.write(output, writer, options, this.scope, keyTerm,
                                this.precedence(), null, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ChildExpr that) {
      return this.scope.equals(that.scope)
          && this.key.equals(that.key);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(ChildExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.scope.hashCode()), this.key.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.scope instanceof ContextExpr) {
      notation.beginInvoke("ContextExpr", "child");
    } else if (this.scope instanceof GlobalExpr) {
      notation.beginInvoke("GlobalExpr", "child");
    } else if (this.scope instanceof SelectorExpr) {
      notation.appendSource(this.scope)
              .beginInvoke("child");
    } else {
      notation.beginInvoke("ChildExpr", "of")
              .appendArgument(this.scope);
    }
    notation.appendArgument(this.key)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static ChildExpr of(Term scope, Term key) {
    return new ChildExpr(scope, key);
  }

}

final class ChildExprGenerator implements TermGenerator {

  final TermGenerator scope;
  final Term key;

  ChildExprGenerator(TermGenerator scope, Term key) {
    this.scope = scope;
    this.key = key;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    do {
      final Term term = this.scope.evaluateNext(evaluator);
      if (term == null) {
        return null;
      }
      final Term child = term.getChild(evaluator, this.key);
      if (child != null) {
        return child.evaluate(evaluator);
      }
    } while (true);
  }

}

final class WriteFieldExpr extends Write<Object> {

  final TermWriter<?> writer;
  final TermWriterOptions options;
  final Term scope;
  final String key;
  final int precedence;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  WriteFieldExpr(TermWriter<?> writer, TermWriterOptions options, Term scope, String key,
                 int precedence, @Nullable Write<?> write, int index, int step) {
    this.writer = writer;
    this.options = options;
    this.scope = scope;
    this.key = key;
    this.precedence = precedence;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteFieldExpr.write(output, this.writer, this.options, this.scope, this.key,
                                this.precedence, this.write, this.index, this.step);
  }

  static Write<Object> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options,
                             Term scope, String key, int precedence,
                             @Nullable Write<?> write, int index, int step) {
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
    if (step == 5) {
      int c;
      if (key.length() == 0) {
        return Write.error(new WriteException("blank identifier"));
      }
      if (index == 0 && output.isCont()) {
        c = key.codePointAt(0);
        if (Term.isIdentifierStartChar(c)) {
          output.write(c);
          index = key.offsetByCodePoints(0, 1);
        }
      }
      while (index < key.length() && output.isCont()) {
        c = key.codePointAt(index);
        if (Term.isIdentifierChar(c)) {
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
    return new WriteFieldExpr(writer, options, scope, key, precedence, write, index, step);
  }

}

final class WriteIndexExpr extends Write<Object> {

  final TermWriter<?> writer;
  final TermWriterOptions options;
  final Term scope;
  final int index;
  final int precedence;
  final @Nullable Write<?> write;
  final int step;

  WriteIndexExpr(TermWriter<?> writer, TermWriterOptions options, Term scope,
                 int index, int precedence, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.scope = scope;
    this.index = index;
    this.precedence = precedence;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteIndexExpr.write(output, this.writer, this.options, this.scope,
                                this.index, this.precedence, this.write, this.step);
  }

  static Write<Object> write(Output<?> output, TermWriter<?> writer,
                             TermWriterOptions options, Term scope, int index,
                             int precedence, @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (scope instanceof ContextExpr) {
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
    if (step == 5) {
      if (write == null) {
        write = Base10.writeInt(output, index);
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
    return new WriteIndexExpr(writer, options, scope, index, precedence, write, step);
  }

}

final class WriteChildExpr extends Write<Object> {

  final TermWriter<?> writer;
  final TermWriterOptions options;
  final Term scope;
  final Term key;
  final int precedence;
  final @Nullable Write<?> write;
  final int step;

  WriteChildExpr(TermWriter<?> writer, TermWriterOptions options, Term scope,
                 Term key, int precedence, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.scope = scope;
    this.key = key;
    this.precedence = precedence;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteChildExpr.write(output, this.writer, this.options, this.scope,
                                this.key, this.precedence, this.write, this.step);
  }

  static Write<Object> write(Output<?> output, TermWriter<?> writer,
                             TermWriterOptions options, Term scope, Term key,
                             int precedence, @Nullable Write<?> write, int step) {
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
      output.write('[');
      step = 5;
    }
    if (step == 5) {
      if (write == null) {
        write = writer.writeTerm(output, key, options);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 6;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 6 && output.isCont()) {
      output.write(']');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteChildExpr(writer, options, scope, key, precedence, write, step);
  }

}
