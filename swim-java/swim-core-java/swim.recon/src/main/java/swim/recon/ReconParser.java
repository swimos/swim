// Copyright 2015-2019 SWIM.AI inc.
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

package swim.recon;

import java.math.BigInteger;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.util.Builder;

/**
 * Factory for constructing Recon parsers and parse trees.
 */
public abstract class ReconParser<I, V> {
  public abstract boolean isDistinct(V value);

  public abstract I item(V value);

  public abstract V value(I item);

  public abstract I attr(V key, V value);

  public abstract I attr(V key);

  public abstract I slot(V key, V value);

  public abstract I slot(V key);

  public abstract Builder<I, V> valueBuilder();

  public abstract Builder<I, V> recordBuilder();

  public abstract Output<V> dataOutput();

  public abstract Output<V> textOutput();

  public abstract V ident(V value);

  public abstract V num(int value);

  public abstract V num(long value);

  public abstract V num(float value);

  public abstract V num(double value);

  public abstract V num(BigInteger value);

  public abstract V num(String value);

  public abstract V uint32(int value);

  public abstract V uint64(long value);

  public abstract V bool(boolean value);

  public abstract V selector();

  public abstract V extant();

  public abstract V absent();

  public abstract V conditional(V ifTerm, V thenTerm, V elseTerm);

  public abstract V or(V lhs, V rhs);

  public abstract V and(V lhs, V rhs);

  public abstract V bitwiseOr(V lhs, V rhs);

  public abstract V bitwiseXor(V lhs, V rhs);

  public abstract V bitwiseAnd(V lhs, V rhs);

  public abstract V lt(V lhs, V rhs);

  public abstract V le(V lhs, V rhs);

  public abstract V eq(V lhs, V rhs);

  public abstract V ne(V lhs, V rhs);

  public abstract V ge(V lhs, V rhs);

  public abstract V gt(V lhs, V rhs);

  public abstract V plus(V lhs, V rhs);

  public abstract V minus(V lhs, V rhs);

  public abstract V times(V lhs, V rhs);

  public abstract V divide(V lhs, V rhs);

  public abstract V modulo(V lhs, V rhs);

  public abstract V not(V rhs);

  public abstract V bitwiseNot(V rhs);

  public abstract V negative(V rhs);

  public abstract V positive(V rhs);

  public abstract V invoke(V func, V args);

  public abstract V lambda(V bindings, V template);

  public abstract V get(V selector, V key);

  public abstract V getAttr(V selector, V key);

  public abstract I getItem(V selector, V index);

  public abstract V children(V selector);

  public abstract V descendants(V selector);

  public abstract V keys(V selector);

  public abstract V values(V selector);

  public abstract V filter(V selector, V predicate);

  public Parser<V> parseBlock(Input input) {
    return BlockParser.parse(input, this);
  }

  public Parser<I> parseAttr(Input input) {
    return AttrParser.parse(input, this);
  }

  public Parser<V> parseBlockItem(Input input) {
    return BlockItemParser.parse(input, this);
  }

  public Parser<V> parseInlineItem(Input input) {
    return InlineItemParser.parse(input, this);
  }

  public Parser<V> parseRecord(Input input, Builder<I, V> builder) {
    return RecordParser.parse(input, this, builder);
  }

  public Parser<V> parseRecord(Input input) {
    return RecordParser.parse(input, this);
  }

  public Parser<V> parseMarkup(Input input, Builder<I, V> builder) {
    return MarkupParser.parse(input, this, builder);
  }

  public Parser<V> parseMarkup(Input input) {
    return MarkupParser.parse(input, this);
  }

  public Parser<V> parseData(Input input) {
    return DataParser.parse(input, this);
  }

  public Parser<V> parseIdent(Input input) {
    return IdentParser.parse(input, this);
  }

  public Parser<V> parseString(Input input) {
    return StringParser.parse(input, this);
  }

  public Parser<V> parseNumber(Input input) {
    return NumberParser.parse(input, this);
  }

  public Parser<V> parseInteger(Input input) {
    return NumberParser.parseInteger(input, this);
  }

  public Parser<V> parseBlockExpression(Input input, Builder<I, V> builder) {
    return parseLambdaFunc(input, builder);
  }

  public Parser<V> parseBlockExpression(Input input) {
    return parseLambdaFunc(input, null);
  }

  public Parser<V> parseLambdaFunc(Input input, Builder<I, V> builder) {
    return LambdaFuncParser.parse(input, this, builder);
  }

  public Parser<V> parseConditionalOperator(Input input, Builder<I, V> builder) {
    return ConditionalOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parseOrOperator(Input input, Builder<I, V> builder) {
    return OrOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parseAndOperator(Input input, Builder<I, V> builder) {
    return AndOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parseBitwiseOrOperator(Input input, Builder<I, V> builder) {
    return BitwiseOrOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parseBitwiseXorOperator(Input input, Builder<I, V> builder) {
    return BitwiseXorOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parseBitwiseAndOperator(Input input, Builder<I, V> builder) {
    return BitwiseAndOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parseComparisonOperator(Input input, Builder<I, V> builder) {
    return ComparisonOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parseAttrExpression(Input input, Builder<I, V> builder) {
    return AttrExpressionParser.parse(input, this, builder);
  }

  public Parser<V> parseAdditiveOperator(Input input, Builder<I, V> builder) {
    return AdditiveOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parseMultiplicativeOperator(Input input, Builder<I, V> builder) {
    return MultiplicativeOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parsePrefixOperator(Input input, Builder<I, V> builder) {
    return PrefixOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parseInvokeOperator(Input input, Builder<I, V> builder) {
    return InvokeOperatorParser.parse(input, this, builder);
  }

  public Parser<V> parsePrimary(Input input, Builder<I, V> builder) {
    return PrimaryParser.parse(input, this, builder);
  }

  public Parser<V> parseLiteral(Input input, Builder<I, V> builder) {
    return LiteralParser.parse(input, this, builder);
  }

  public Parser<V> parseSelector(Input input, Builder<I, V> builder) {
    return SelectorParser.parse(input, this, builder);
  }

  public Parser<V> parseSelector(Input input) {
    return SelectorParser.parse(input, this, null);
  }

  public Parser<V> blockParser() {
    return new BlockParser<I, V>(this);
  }

  public V parseBlockString(String string) {
    Input input = Unicode.stringInput(string);
    while (input.isCont() && Recon.isWhitespace(input.head())) {
      input = input.step();
    }
    Parser<V> parser = parseBlock(input);
    if (parser.isDone()) {
      while (input.isCont() && Recon.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public V parseNumberString(String string) {
    Input input = Unicode.stringInput(string);
    while (input.isCont() && Recon.isWhitespace(input.head())) {
      input = input.step();
    }
    Parser<V> parser = parseNumber(input);
    if (parser.isDone()) {
      while (input.isCont() && Recon.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }
}
