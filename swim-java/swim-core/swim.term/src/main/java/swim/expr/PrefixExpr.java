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
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.term.Term;
import swim.term.TermException;
import swim.term.TermParser;
import swim.term.TermParserOptions;
import swim.term.TermWriter;
import swim.term.TermWriterOptions;

@Public
@Since("5.0")
public abstract class PrefixExpr extends OperatorExpr {

  final Term rhs;

  PrefixExpr(Term rhs) {
    this.rhs = rhs.commit();
  }

  public abstract String operator();

  public final Term rhs() {
    return this.rhs;
  }

  @Override
  public Write<?> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options) {
    return WritePrefixExpr.write(output, writer, options, this.operator(), this.rhs,
                                 this.precedence(), null, 0, 1);
  }

  public static Parse<Object> parse(Input input, TermParser<?> parser,
                                    TermParserOptions options) {
    return ParsePrefixExpr.parse(input, parser, options, null, null, 1);
  }

}

final class ParsePrefixExpr extends Parse<Object> {

  final TermParser<?> parser;
  final TermParserOptions options;
  final @Nullable String operator;
  final @Nullable Parse<Object> parseRhs;
  final int step;

  ParsePrefixExpr(TermParser<?> parser, TermParserOptions options,
                  @Nullable String operator,
                  @Nullable Parse<Object> parseRhs, int step) {
    this.parser = parser;
    this.options = options;
    this.operator = operator;
    this.parseRhs = parseRhs;
    this.step = step;
  }

  @Override
  public Parse<Object> consume(Input input) {
    return ParsePrefixExpr.parse(input, this.parser, this.options,
                                 this.operator, this.parseRhs, this.step);
  }

  static Parse<Object> parse(Input input, TermParser<?> parser, TermParserOptions options,
                             @Nullable String operator,
                             @Nullable Parse<Object> parseRhs, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont() && Term.isSpace(c = input.head())) {
        input.step();
      }
      if (input.isCont()) {
        if (c == '!') {
          operator = "!";
          input.step();
          step = 2;
        } else if (c == '~') {
          operator = "~";
          input.step();
          step = 2;
        } else if (c == '-') {
          operator = "-";
          input.step();
          step = 2;
        } else if (c == '+') {
          operator = "+";
          input.step();
          step = 2;
        } else {
          return parser.parsePrimary(input, options);
        }
      } else if (input.isDone()) {
        return parser.parsePrimary(input, options);
      }
    }
    if (step == 2) {
      if (parseRhs == null) {
        parseRhs = PrefixExpr.parse(input, parser, options);
      } else {
        parseRhs = parseRhs.consume(input);
      }
      if (parseRhs.isDone()) {
        final Term rhs;
        try {
          rhs = options.termRegistry().intoTerm(parseRhs.getUnchecked()).flatten();
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
        if ("!".equals(operator)) {
          return Parse.done(new NotExpr(rhs));
        } else if ("~".equals(operator)) {
          return Parse.done(new BitwiseNotExpr(rhs));
        } else if ("-".equals(operator)) {
          if (rhs.isValidNumber()) {
            return Parse.done(rhs.negative());
          } else {
            return Parse.done(new NegativeExpr(rhs));
          }
        } else if ("+".equals(operator)) {
          if (rhs.isValidNumber()) {
            return Parse.done(rhs.positive());
          } else {
            return Parse.done(new PositiveExpr(rhs));
          }
        } else {
          return Parse.error(Diagnostic.message("unexpected operator: " + operator, input));
        }
      } else if (parseRhs.isError()) {
        return parseRhs.asError();
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParsePrefixExpr(parser, options, operator, parseRhs, step);
  }

}

final class WritePrefixExpr extends Write<Object> {

  final TermWriter<?> writer;
  final TermWriterOptions options;
  final String operator;
  final Term rhs;
  final int precedence;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  WritePrefixExpr(TermWriter<?> writer, TermWriterOptions options, String operator, Term rhs,
                  int precedence, @Nullable Write<?> write, int index, int step) {
    this.writer = writer;
    this.options = options;
    this.operator = operator;
    this.rhs = rhs;
    this.precedence = precedence;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WritePrefixExpr.write(output, this.writer, this.options, this.operator, this.rhs,
                                 this.precedence, this.write, this.index, this.step);
  }

  static Write<Object> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options,
                             String operator, Term rhs, int precedence,
                             @Nullable Write<?> write, int index, int step) {
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
        write = writer.writeTerm(output, rhs, options);
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
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WritePrefixExpr(writer, options, operator, rhs, precedence, write, index, step);
  }

}
