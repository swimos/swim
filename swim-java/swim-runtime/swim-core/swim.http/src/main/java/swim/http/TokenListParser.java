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

package swim.http;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.util.Builder;

final class TokenListParser extends Parser<FingerTrieSeq<String>> {

  final StringBuilder tokenBuilder;
  final Builder<String, FingerTrieSeq<String>> tokens;
  final int step;

  TokenListParser(StringBuilder tokenBuilder, Builder<String, FingerTrieSeq<String>> tokens, int step) {
    this.tokenBuilder = tokenBuilder;
    this.tokens = tokens;
    this.step = step;
  }

  @Override
  public Parser<FingerTrieSeq<String>> feed(Input input) {
    return TokenListParser.parse(input, this.tokenBuilder, this.tokens, this.step);
  }

  static Parser<FingerTrieSeq<String>> parse(Input input, StringBuilder tokenBuilder,
                                             Builder<String, FingerTrieSeq<String>> tokens, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          tokenBuilder = new StringBuilder();
          tokenBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parser.done(FingerTrieSeq.<String>empty());
        }
      } else if (input.isDone()) {
        return Parser.done(FingerTrieSeq.<String>empty());
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          tokenBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        if (tokens == null) {
          tokens = FingerTrieSeq.builder();
        }
        tokens.add(tokenBuilder.toString());
        tokenBuilder = null;
        step = 3;
      }
    }
    do {
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && c == ',') {
          input = input.step();
          step = 4;
        } else if (!input.isEmpty()) {
          return Parser.done(tokens.bind());
        }
      }
      if (step == 4) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (Http.isTokenChar(c)) {
            input = input.step();
            tokenBuilder = new StringBuilder();
            tokenBuilder.appendCodePoint(c);
            step = 5;
          } else {
            return Parser.error(Diagnostic.expected("token", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("token", input));
        }
      }
      if (step == 5) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input = input.step();
            tokenBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (!input.isEmpty()) {
          tokens.add(tokenBuilder.toString());
          tokenBuilder = null;
          step = 3;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new TokenListParser(tokenBuilder, tokens, step);
  }

  static Parser<FingerTrieSeq<String>> parse(Input input) {
    return TokenListParser.parse(input, null, null, 1);
  }

}
