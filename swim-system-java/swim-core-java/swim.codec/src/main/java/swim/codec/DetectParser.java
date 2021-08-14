// Copyright 2015-2021 Swim inc.
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

package swim.codec;

final class DetectParser<O> extends Parser<O> {

  final Parser<O>[] parsers;

  DetectParser(Parser<O>[] parsers) {
    this.parsers = parsers;
  }

  @Override
  public Parser<O> feed(Input input) {
    return DetectParser.parse(input, this.parsers);
  }

  @SuppressWarnings("unchecked")
  static <O> Parser<O> parse(Input input, Parser<O>[] oldParsers) {
    int i = 0;
    final int n = oldParsers.length;
    Parser<O>[] newParsers = (Parser<O>[]) new Parser<?>[n];
    int firstCont = -1;
    int contCount = 0;
    int trapCount = 0;

    while (i < n) {
      Parser<O> parser = oldParsers[i];
      final Input parserInput = input.clone();
      parser = parser.feed(parserInput);
      if (parser.isDone() && parserInput.isDone()) {
        return parser;
      }
      newParsers[i] = parser;
      if (parser.isError()) {
        trapCount += 1;
      } else {
        contCount += 1;
        if (firstCont == -1) {
          firstCont = i;
        }
      }
      i += 1;
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }

    if (contCount == 1) {
      return newParsers[firstCont];
    } else if (trapCount != 0) {
      oldParsers = newParsers;
      newParsers = (Parser<O>[]) new Parser<?>[contCount];
      i = firstCont;
      int j = 0;
      while (i < n) {
        final Parser<O> parser = oldParsers[i];
        if (!parser.isError()) {
          newParsers[j] = parser;
          j += 1;
        }
        i += 1;
      }
    }
    return new DetectParser<O>(newParsers);
  }

}
