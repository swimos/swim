// Copyright 2015-2021 Swim Inc.
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

import type {Builder} from "@swim/util";
import {Input, Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Recon} from "../Recon";
import {BlockParser} from "./BlockParser";
import {AttrParser} from "./AttrParser";
import {BlockItemParser} from "./BlockItemParser";
import {InlineItemParser} from "./InlineItemParser";
import {RecordParser} from "./RecordParser";
import {MarkupParser} from "./MarkupParser";
import {DataParser} from "./DataParser";
import {IdentParser} from "./IdentParser";
import {StringParser} from "./StringParser";
import {RawStringParser} from "./RawStringParser";
import {NumberParser} from "./NumberParser";
import {LambdaFuncParser} from "./LambdaFuncParser";
import {ConditionalOperatorParser} from "./ConditionalOperatorParser";
import {OrOperatorParser} from "./OrOperatorParser";
import {AndOperatorParser} from "./AndOperatorParser";
import {BitwiseOrOperatorParser} from "./BitwiseOrOperatorParser";
import {BitwiseXorOperatorParser} from "./BitwiseXorOperatorParser";
import {BitwiseAndOperatorParser} from "./BitwiseAndOperatorParser";
import {ComparisonOperatorParser} from "./ComparisonOperatorParser";
import {AttrExpressionParser} from "./AttrExpressionParser";
import {AdditiveOperatorParser} from "./AdditiveOperatorParser";
import {MultiplicativeOperatorParser} from "./MultiplicativeOperatorParser";
import {PrefixOperatorParser} from "./PrefixOperatorParser";
import {InvokeOperatorParser} from "./InvokeOperatorParser";
import {PrimaryParser} from "./PrimaryParser";
import {LiteralParser} from "./LiteralParser";
import {SelectorParser} from "./SelectorParser";

/**
 * Factory for constructing Recon parsers and parse trees.
 * @public
 */
export abstract class ReconParser<I, V> {
  abstract isDistinct(value: V): boolean;

  abstract item(value: V): I;

  abstract value(item: I): V;

  abstract attr(key: V, value: V): I;

  abstract attr(key: V): I;

  abstract slot(key: V, value: V): I;

  abstract slot(key: V): I;

  abstract valueBuilder(): Builder<I, V>;

  abstract recordBuilder(): Builder<I, V>;

  abstract dataOutput(): Output<V>;

  abstract textOutput(): Output<V>;

  abstract ident(value: V): V;

  abstract num(value: number | string): V;

  abstract uint32(value: number): V;

  abstract uint64(value: number): V;

  abstract bool(value: boolean): V;

  abstract selector(): V;

  abstract extant(): V;

  abstract absent(): V;

  abstract conditional(ifTerm: V, thenTerm: V, elseTerm: V): V;

  abstract or(lhs: V, rhs: V): V;

  abstract and(lhs: V, rhs: V): V;

  abstract bitwiseOr(lhs: V, rhs: V): V;

  abstract bitwiseXor(lhs: V, rhs: V): V;

  abstract bitwiseAnd(lhs: V, rhs: V): V;

  abstract lt(lhs: V, rhs: V): V;

  abstract le(lhs: V, rhs: V): V;

  abstract eq(lhs: V, rhs: V): V;

  abstract ne(lhs: V, rhs: V): V;

  abstract ge(lhs: V, rhs: V): V;

  abstract gt(lhs: V, rhs: V): V;

  abstract plus(lhs: V, rhs: V): V;

  abstract minus(lhs: V, rhs: V): V;

  abstract times(lhs: V, rhs: V): V;

  abstract divide(lhs: V, rhs: V): V;

  abstract modulo(lhs: V, rhs: V): V;

  abstract not(rhs: V): V;

  abstract bitwiseNot(rhs: V): V;

  abstract negative(rhs: V): V;

  abstract positive(rhs: V): V;

  abstract invoke(func: V, args: V): V;

  abstract lambda(bindings: V, template: V): V;

  abstract get(selector: V, key: V): V;

  abstract getAttr(selector: V, key: V): V;

  abstract getItem(selector: V, index: V): I;

  abstract children(selector: V): V;

  abstract descendants(selector: V): V;

  abstract keys(selector: V): V;

  abstract values(selector: V): V;

  abstract filter(selector: V, predicate: V): V;

  parseBlock(input: Input): Parser<V> {
    return BlockParser.parse(input, this);
  }

  parseAttr(input: Input): Parser<I> {
    return AttrParser.parse(input, this);
  }

  parseBlockItem(input: Input): Parser<V> {
    return BlockItemParser.parse(input, this);
  }

  parseInlineItem(input: Input): Parser<V> {
    return InlineItemParser.parse(input, this);
  }

  parseRecord(input: Input, builder?: Builder<I, V>): Parser<V> {
    return RecordParser.parse(input, this, builder);
  }

  parseMarkup(input: Input, builder?: Builder<I, V>): Parser<V> {
    return MarkupParser.parse(input, this, builder);
  }

  parseData(input: Input): Parser<V> {
    return DataParser.parse(input, this);
  }

  parseIdent(input: Input): Parser<V> {
    return IdentParser.parse(input, this);
  }

  parseString(input: Input): Parser<V> {
    return StringParser.parse(input, this);
  }

  parseRawString(input: Input): Parser<V> {
    return RawStringParser.parse(input, this);
  }

  parseNumber(input: Input): Parser<V> {
    return NumberParser.parse(input, this);
  }

  parseInteger(input: Input): Parser<V> {
    return NumberParser.parseInteger(input, this);
  }

  parseBlockExpression(input: Input, builder?: Builder<I, V>): Parser<V> {
    return this.parseLambdaFunc(input, builder);
  }

  parseLambdaFunc(input: Input, builder?: Builder<I, V>): Parser<V> {
    return LambdaFuncParser.parse(input, this, builder);
  }

  parseConditionalOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return ConditionalOperatorParser.parse(input, this, builder);
  }

  parseOrOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return OrOperatorParser.parse(input, this, builder);
  }

  parseAndOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return AndOperatorParser.parse(input, this, builder);
  }

  parseBitwiseOrOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return BitwiseOrOperatorParser.parse(input, this, builder);
  }

  parseBitwiseXorOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return BitwiseXorOperatorParser.parse(input, this, builder);
  }

  parseBitwiseAndOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return BitwiseAndOperatorParser.parse(input, this, builder);
  }

  parseComparisonOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return ComparisonOperatorParser.parse(input, this, builder);
  }

  parseAttrExpression(input: Input, builder?: Builder<I, V>): Parser<V> {
    return AttrExpressionParser.parse(input, this, builder);
  }

  parseAdditiveOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return AdditiveOperatorParser.parse(input, this, builder);
  }

  parseMultiplicativeOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return MultiplicativeOperatorParser.parse(input, this, builder);
  }

  parsePrefixOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return PrefixOperatorParser.parse(input, this, builder);
  }

  parseInvokeOperator(input: Input, builder?: Builder<I, V>): Parser<V> {
    return InvokeOperatorParser.parse(input, this, builder);
  }

  parsePrimary(input: Input, builder?: Builder<I, V>): Parser<V> {
    return PrimaryParser.parse(input, this, builder);
  }

  parseLiteral(input: Input, builder?: Builder<I, V>): Parser<V> {
    return LiteralParser.parse(input, this, builder);
  }

  parseSelector(input: Input, builder?: Builder<I, V>): Parser<V> {
    return SelectorParser.parse(input, this, builder);
  }

  blockParser(): Parser<V> {
    return new BlockParser<I, V>(this);
  }

  parseBlockString(string: string): V {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Recon.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = this.parseBlock(input);
    if (parser.isDone()) {
      while (input.isCont() && Recon.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }
}
