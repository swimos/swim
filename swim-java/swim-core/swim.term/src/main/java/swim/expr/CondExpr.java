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
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.term.Evaluator;
import swim.term.Term;
import swim.term.TermException;
import swim.term.TermParser;
import swim.term.TermParserOptions;
import swim.term.TermWriter;
import swim.term.TermWriterOptions;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class CondExpr extends OperatorExpr implements WriteSource {

  final Term ifTerm;
  final Term thenTerm;
  final Term elseTerm;

  public CondExpr(Term ifTerm, Term thenTerm, Term elseTerm) {
    this.ifTerm = ifTerm.commit();
    this.thenTerm = thenTerm.commit();
    this.elseTerm = elseTerm.commit();
  }

  public Term ifTerm() {
    return this.ifTerm;
  }

  public Term thenTerm() {
    return this.thenTerm;
  }

  public Term elseTerm() {
    return this.elseTerm;
  }

  @Override
  public int precedence() {
    return 2;
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    final Term condition = this.ifTerm.evaluate(evaluator);
    if (condition.isTruthy()) {
      return this.thenTerm.evaluate(evaluator);
    } else {
      return this.elseTerm.evaluate(evaluator);
    }
  }

  @Override
  public Write<?> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options) {
    return WriteCondExpr.write(output, writer, options, this.ifTerm, this.thenTerm,
                               this.elseTerm, this.precedence(), null, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof CondExpr that) {
      return this.ifTerm.equals(that.ifTerm)
          && this.thenTerm.equals(that.thenTerm)
          && this.elseTerm.equals(that.elseTerm);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(CondExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.ifTerm.hashCode()), this.thenTerm.hashCode()), this.elseTerm.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("CondExpr", "of")
            .appendArgument(this.ifTerm)
            .appendArgument(this.thenTerm)
            .appendArgument(this.elseTerm)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static CondExpr of(Term ifTerm, Term thenTerm, Term elseTerm) {
    return new CondExpr(ifTerm, thenTerm, elseTerm);
  }

  public static Parse<Object> parse(Input input, TermParser<?> parser,
                                    TermParserOptions options) {
    return ParseCondExpr.parse(input, parser, options, null, null, null, 1);
  }

}

final class ParseCondExpr extends Parse<Object> {

  final TermParser<?> parser;
  final TermParserOptions options;
  final @Nullable Parse<Object> parseIf;
  final @Nullable Parse<Object> parseThen;
  final @Nullable Parse<Object> parseElse;
  final int step;

  ParseCondExpr(TermParser<?> parser, TermParserOptions options,
                @Nullable Parse<Object> parseIf, @Nullable Parse<Object> parseThen,
                @Nullable Parse<Object> parseElse, int step) {
    this.parser = parser;
    this.options = options;
    this.parseIf = parseIf;
    this.parseThen = parseThen;
    this.parseElse = parseElse;
    this.step = step;
  }

  @Override
  public Parse<Object> consume(Input input) {
    return ParseCondExpr.parse(input, this.parser, this.options, this.parseIf,
                               this.parseThen, this.parseElse, this.step);
  }

  static Parse<Object> parse(Input input, TermParser<?> parser, TermParserOptions options,
                             @Nullable Parse<Object> parseIf, @Nullable Parse<Object> parseThen,
                             @Nullable Parse<Object> parseElse, int step) {
    int c = 0;
    if (step == 1) {
      if (parseIf == null) {
        parseIf = OrExpr.parse(input, parser, options);
      } else {
        parseIf = parseIf.consume(input);
      }
      if (parseIf.isDone()) {
        step = 2;
      } else if (parseIf.isError()) {
        return parseIf.asError();
      }
    }
    if (step == 2) {
      while (input.isCont() && Term.isSpace(c = input.head())) {
        input.step();
      }
      if (input.isCont() && c == '?') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        return Assume.nonNull(parseIf);
      }
    }
    if (step == 3) {
      if (parseThen == null) {
        parseThen = CondExpr.parse(input, parser, options);
      } else {
        parseThen = parseThen.consume(input);
      }
      if (parseThen.isDone()) {
        step = 4;
      } else if (parseThen.isError()) {
        return parseThen.asError();
      }
    }
    if (step == 4) {
      while (input.isCont() && Term.isSpace(c = input.head())) {
        input.step();
      }
      if (input.isCont() && c == ':') {
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected(':', input));
      }
    }
    if (step == 5) {
      if (parseElse == null) {
        parseElse = CondExpr.parse(input, parser, options);
      } else {
        parseElse = parseElse.consume(input);
      }
      if (parseElse.isDone()) {
        final Term ifTerm;
        try {
          ifTerm = options.termRegistry().intoTerm(Assume.nonNull(parseIf).getUnchecked()).flatten();
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
        final Term thenTerm;
        try {
          thenTerm = options.termRegistry().intoTerm(Assume.nonNull(parseThen).getUnchecked()).flatten();
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
        final Term elseTerm;
        try {
          elseTerm = options.termRegistry().intoTerm(parseElse.getUnchecked()).flatten();
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
        return Parse.done(new CondExpr(ifTerm, thenTerm, elseTerm));
      } else if (parseElse.isError()) {
        return parseElse.asError();
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseCondExpr(parser, options, parseIf, parseThen, parseElse, step);
  }

}

final class WriteCondExpr extends Write<Object> {

  final TermWriter<?> writer;
  final TermWriterOptions options;
  final Term ifTerm;
  final Term thenTerm;
  final Term elseTerm;
  final int precedence;
  final @Nullable Write<?> write;
  final int step;

  WriteCondExpr(TermWriter<?> writer, TermWriterOptions options, Term ifTerm, Term thenTerm,
                Term elseTerm, int precedence, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.ifTerm = ifTerm;
    this.thenTerm = thenTerm;
    this.elseTerm = elseTerm;
    this.precedence = precedence;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteCondExpr.write(output, this.writer, this.options, this.ifTerm, this.thenTerm,
                               this.elseTerm, this.precedence, this.write, this.step);
  }

  static Write<Object> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options,
                             Term ifTerm, Term thenTerm, Term elseTerm, int precedence,
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
        write = writer.writeTerm(output, ifTerm, options);
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
      if (options.whitespace()) {
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
      if (write == null) {
        write = writer.writeTerm(output, thenTerm, options);
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
      if (options.whitespace()) {
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
      if (options.whitespace()) {
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
        write = writer.writeTerm(output, elseTerm, options);
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
    return new WriteCondExpr(writer, options, ifTerm, thenTerm, elseTerm,
                             precedence, write, step);
  }

}
