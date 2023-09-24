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

import java.util.Arrays;
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.BinaryOutputBuffer;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.term.Evaluator;
import swim.term.Term;
import swim.term.TermException;
import swim.term.TermParser;
import swim.term.TermParserOptions;
import swim.term.TermWriter;
import swim.term.TermWriterOptions;
import swim.util.ArrayBuilder;
import swim.util.ArrayIterator;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class FormatExpr implements Expr, WriteSource {

  final Object[] parts; // (String | Term)[]

  public FormatExpr(Object[] parts) {
    this.parts = parts;
    for (int i = 0; i < parts.length; i += 1) {
      final Object part = parts[i];
      if (part instanceof Term) {
        ((Term) part).commit();
      }
    }
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    try {
      final StringOutput output = new StringOutput();
      this.writeFormat(output, evaluator).checkDone();
      return Term.of(output.toString());
    } catch (WriteException cause) {
      return Term.trap();
    }
  }

  public Write<?> writeFormat(Output<?> output, Evaluator evaluator, TermWriterOptions options) {
    return WriteFormat.write(output, evaluator, options, this.iterator(), null, null, 0, 0, 1);
  }

  public Write<?> writeFormat(Output<?> output, Evaluator evaluator) {
    return this.writeFormat(output, evaluator, TermWriterOptions.readable());
  }

  public Write<?> writeFormat(Evaluator evaluator) {
    return this.writeFormat(BinaryOutputBuffer.full(), evaluator, TermWriterOptions.readable());
  }

  @Override
  public Write<?> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options) {
    return WriteFormatExpr.write(output, writer, options, this.iterator(), null, null, 0, 0, 1);
  }

  public Iterator<Object> iterator() {
    return ArrayIterator.of(this.parts);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof FormatExpr that) {
      return Arrays.equals(this.parts, that.parts);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(FormatExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Arrays.hashCode(this.parts)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("FormatExpr", "of");
    for (int i = 0; i < this.parts.length; i += 1) {
      final Object part = this.parts[i];
      if (part instanceof Term && ((Term) part).isValidObject()) {
        notation.appendArgument(((Term) part).objectValue());
      } else {
        notation.appendArgument(part);
      }
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static FormatExpr of(Object/*String | Term*/... parts) {
    for (int i = 0; i < parts.length; i += 1) {
      final Object part = parts[i];
      if (!(part instanceof String) && !(part instanceof Term)) {
        throw new IllegalArgumentException(Notation.of("format part ")
                                                   .append(i)
                                                   .append(" is not a string or term: ")
                                                   .appendSource(part)
                                                   .toString());
      }
    }
    return new FormatExpr(parts);
  }

  public static Parse<FormatExpr> parse(Input input, TermParser<?> parser,
                                        TermParserOptions options) {
    return ParseFormatExpr.parse(input, parser, options, null, null, null, 0, 1);
  }

  public static Parse<FormatExpr> parse(TermParser<?> parser, TermParserOptions options) {
    return FormatExpr.parse(StringInput.empty(), parser, options);
  }

  public static Parse<FormatExpr> parse(String string, TermParser<?> parser,
                                        TermParserOptions options) {
    final StringInput input = new StringInput(string);
    return FormatExpr.parse(input, parser, options).complete(input);
  }

}

final class ParseFormatExpr extends Parse<FormatExpr> {

  final TermParser<?> parser;
  final TermParserOptions options;
  final @Nullable StringBuilder stringBuilder;
  final @Nullable ArrayBuilder<Object, Object[]> partsBuilder;
  final @Nullable Parse<?> parsePart;
  final int escape;
  final int step;

  ParseFormatExpr(TermParser<?> parser, TermParserOptions options,
                  @Nullable StringBuilder stringBuilder,
                  @Nullable ArrayBuilder<Object, Object[]> partsBuilder,
                  @Nullable Parse<?> parsePart, int escape, int step) {
    this.parser = parser;
    this.options = options;
    this.stringBuilder = stringBuilder;
    this.partsBuilder = partsBuilder;
    this.parsePart = parsePart;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Parse<FormatExpr> consume(Input input) {
    return ParseFormatExpr.parse(input, this.parser, this.options, this.stringBuilder,
                                 this.partsBuilder, this.parsePart, this.escape, this.step);
  }

  static Parse<FormatExpr> parse(Input input, TermParser<?> parser, TermParserOptions options,
                                 @Nullable StringBuilder stringBuilder,
                                 @Nullable ArrayBuilder<Object, Object[]> partsBuilder,
                                 @Nullable Parse<?> parsePart, int escape, int step) {
    int c = 0;
    do {
      if (step == 1) {
        while (input.isCont() && (c = input.head()) != '\\' && c != '{' && c != '}') {
          if (stringBuilder == null) {
            stringBuilder = new StringBuilder();
          }
          stringBuilder.appendCodePoint(c);
          input.step();
        }
        if (input.isCont()) {
          if (c == '\\') {
            if (stringBuilder == null) {
              stringBuilder = new StringBuilder();
            }
            input.step();
            step = 2;
          } else if (c == '{') {
            if (stringBuilder != null) {
              if (partsBuilder == null) {
                partsBuilder = new ArrayBuilder<Object, Object[]>(Object.class);
              }
              partsBuilder.add(stringBuilder.toString());
              stringBuilder = null;
            }
            input.step();
            step = 7;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          if (partsBuilder == null) {
            partsBuilder = new ArrayBuilder<Object, Object[]>(Object.class);
          }
          if (stringBuilder != null) {
            partsBuilder.add(stringBuilder.toString());
            stringBuilder = null;
          }
          return Parse.done(new FormatExpr(partsBuilder.build()));
        }
      }
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '<' || c == '>' || c == '@' ||
              c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            Assume.nonNull(stringBuilder).appendCodePoint(c);
            input.step();
            step = 1;
            continue;
          } else if (c == 'b') {
            Assume.nonNull(stringBuilder).append('\b');
            input.step();
            step = 1;
            continue;
          } else if (c == 'f') {
            Assume.nonNull(stringBuilder).append('\f');
            input.step();
            step = 1;
            continue;
          } else if (c == 'n') {
            Assume.nonNull(stringBuilder).append('\n');
            input.step();
            step = 1;
            continue;
          } else if (c == 'r') {
            Assume.nonNull(stringBuilder).append('\r');
            input.step();
            step = 1;
            continue;
          } else if (c == 't') {
            Assume.nonNull(stringBuilder).append('\t');
            input.step();
            step = 1;
            continue;
          } else if (c == 'u') {
            input.step();
            step = 3;
          } else {
            return Parse.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step == 3) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = Base16.decodeDigit(c);
          input.step();
          step = 4;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 4) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 5;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 5) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 6;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 6) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          Assume.nonNull(stringBuilder).appendCodePoint(escape);
          escape = 0;
          input.step();
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 7) {
        if (parsePart == null) {
          parsePart = parser.parse(input, options);
        } else {
          parsePart = parsePart.consume(input);
        }
        if (parsePart.isDone()) {
          step = 8;
        } else if (parsePart.isError()) {
          return parsePart.asError();
        }
      }
      if (step == 8) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == '}') {
          final Term partTerm;
          try {
            partTerm = options.termRegistry().intoTerm(Assume.nonNull(parsePart).getUnchecked()).flatten();
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          if (partsBuilder == null) {
            partsBuilder = new ArrayBuilder<Object, Object[]>(Object.class);
          }
          partsBuilder.add(partTerm);
          parsePart = null;
          input.step();
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseFormatExpr(parser, options, stringBuilder, partsBuilder,
                               parsePart, escape, step);
  }

}

final class WriteFormatExpr extends Write<Object> {

  final TermWriter<?> writer;
  final TermWriterOptions options;
  final Iterator<Object> parts; // Iterator<String | Term>
  final @Nullable Object part; // String | Term | null
  final @Nullable Write<?> write;
  final int index;
  final int escape;
  final int step;

  WriteFormatExpr(TermWriter<?> writer, TermWriterOptions options,
                  Iterator<Object> parts, @Nullable Object part,
                  @Nullable Write<?> write, int index, int escape, int step) {
    this.writer = writer;
    this.options = options;
    this.parts = parts;
    this.part = part;
    this.write = write;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteFormatExpr.write(output, this.writer, this.options, this.parts, this.part,
                                 this.write, this.index, this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options,
                             Iterator<Object> parts, @Nullable Object part,
                             @Nullable Write<?> write, int index, int escape, int step) {
    do {
      if (step == 1) {
        if (parts.hasNext()) {
          part = parts.next();
          if (part instanceof String) {
            step = 2;
          } else if (part instanceof Term) {
            step = 9;
          } else {
            return Write.error(new TermException("unsupported format part: " + part));
          }
        } else {
          return Write.done();
        }
      }
      if (step == 2) {
        part = Assume.nonNull(part);
        while (index < ((String) part).length() && output.isCont()) {
          final int c = ((String) part).codePointAt(index);
          if (c == '{' || c == '}') {
            output.write('\\');
            escape = c;
            step = 3;
            break;
          } else if (c == '\b') {
            output.write('\\');
            escape = 'b';
            step = 3;
            break;
          } else if (c == '\f') {
            output.write('\\');
            escape = 'f';
            step = 3;
            break;
          } else if (c == '\n') {
            output.write('\\');
            escape = 'n';
            step = 3;
            break;
          } else if (c == '\r') {
            output.write('\\');
            escape = 'r';
            step = 3;
            break;
          } else if (c == '\t') {
            output.write('\\');
            escape = 't';
            step = 3;
            break;
          } else if (c < 0x20) {
            output.write('\\');
            escape = c;
            step = 4;
            break;
          } else {
            output.write(c);
            index = ((String) part).offsetByCodePoints(index, 1);
          }
        }
        if (index >= ((String) part).length()) {
          part = null;
          index = 0;
          step = 1;
          continue;
        }
      }
      if (step == 3 && output.isCont()) {
        output.write(escape);
        index = ((String) Assume.nonNull(part)).offsetByCodePoints(index, 1);
        escape = 0;
        step = 2;
        continue;
      }
      if (step == 4 && output.isCont()) {
        output.write('u');
        step = 5;
      }
      if (step == 5 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xF));
        step = 6;
      }
      if (step == 6 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xF));
        step = 7;
      }
      if (step == 7 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xF));
        step = 8;
      }
      if (step == 8 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit(escape & 0xF));
        index = ((String) Assume.nonNull(part)).offsetByCodePoints(index, 1);
        escape = 0;
        step = 2;
        continue;
      }
      if (step == 9 && output.isCont()) {
        output.write('{');
        step = 10;
      }
      if (step == 10) {
        if (write == null) {
          write = writer.writeTerm(output, (Term) Assume.nonNull(part), options);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          step = 11;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 11 && output.isCont()) {
        output.write('}');
        part = null;
        step = 1;
        continue;
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteFormatExpr(writer, options, parts, part, write, index, escape, step);
  }

}

final class WriteFormat extends Write<Object> {

  final Evaluator evaluator;
  final TermWriterOptions options;
  final Iterator<Object> parts; // Iterator<String | Term>
  final @Nullable Object part; // String | Term | null
  final @Nullable Write<?> write;
  final int index;
  final int escape;
  final int step;

  WriteFormat(Evaluator evaluator, TermWriterOptions options,
              Iterator<Object> parts, @Nullable Object part,
              @Nullable Write<?> write, int index, int escape, int step) {
    this.evaluator = evaluator;
    this.options = options;
    this.parts = parts;
    this.part = part;
    this.write = write;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteFormat.write(output, this.evaluator, this.options, this.parts, this.part,
                             this.write, this.index, this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, Evaluator evaluator, TermWriterOptions options,
                             Iterator<Object> parts, @Nullable Object part,
                             @Nullable Write<?> write, int index, int escape, int step) {
    do {
      if (step == 1) {
        if (parts.hasNext()) {
          part = parts.next();
          if (part instanceof String) {
            step = 2;
          } else if (part instanceof Term) {
            step = 3;
          } else {
            return Write.error(new TermException("unsupported format part: " + part));
          }
        } else {
          return Write.done();
        }
      }
      if (step == 2) {
        part = Assume.nonNull(part);
        while (index < ((String) part).length() && output.isCont()) {
          output.write(((String) part).codePointAt(index));
          index = ((String) part).offsetByCodePoints(index, 1);
        }
        if (index >= ((String) part).length()) {
          index = 0;
          step = 1;
          continue;
        }
      }
      if (step == 3) {
        if (write == null) {
          final Term term = ((Term) Assume.nonNull(part)).evaluate(evaluator);
          write = term.writeFormat(output);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          step = 1;
          continue;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteFormat(evaluator, options, parts, part, write, index, escape, step);
  }

}
