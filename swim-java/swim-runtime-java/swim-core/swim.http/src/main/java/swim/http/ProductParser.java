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

package swim.http;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.util.Builder;

final class ProductParser extends Parser<Product> {

  final HttpParser http;
  final StringBuilder nameBuilder;
  final StringBuilder versionBuilder;
  final Parser<String> commentParser;
  final Builder<String, FingerTrieSeq<String>> comments;
  final int step;

  ProductParser(HttpParser http, StringBuilder nameBuilder,
                StringBuilder versionBuilder, Parser<String> commentParser,
                Builder<String, FingerTrieSeq<String>> comments, int step) {
    this.http = http;
    this.nameBuilder = nameBuilder;
    this.versionBuilder = versionBuilder;
    this.commentParser = commentParser;
    this.comments = comments;
    this.step = step;
  }

  ProductParser(HttpParser http) {
    this(http, null, null, null, null, 1);
  }

  @Override
  public Parser<Product> feed(Input input) {
    return ProductParser.parse(input, this.http, this.nameBuilder,
                               this.versionBuilder, this.commentParser,
                               this.comments, this.step);
  }

  static Parser<Product> parse(Input input, HttpParser http, StringBuilder nameBuilder,
                               StringBuilder versionBuilder, Parser<String> commentParser,
                               Builder<String, FingerTrieSeq<String>> comments, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (nameBuilder == null) {
            nameBuilder = new StringBuilder();
          }
          nameBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("product name", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("product name", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          nameBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont() && c == '/') {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        step = 5;
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (versionBuilder == null) {
            versionBuilder = new StringBuilder();
          }
          versionBuilder.appendCodePoint(c);
          step = 4;
        } else {
          return Parser.error(Diagnostic.expected("product version", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("product version", input));
      }
    }
    if (step == 4) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          versionBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 5;
      }
    }
    do {
      if (step == 5) {
        if (input.isCont() && Http.isSpace(input.head())) {
          input = input.step();
          step = 6;
        } else if (!input.isEmpty()) {
          return Parser.done(http.product(nameBuilder.toString(), versionBuilder != null ? versionBuilder.toString() : null,
                                          comments != null ? comments.bind() : FingerTrieSeq.empty()));
        }
      }
      if (step == 6) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '(') {
            step = 7;
          } else {
            step = 5;
            continue;
          }
        } else if (input.isDone()) {
          step = 5;
          continue;
        }
      }
      if (step == 7) {
        if (commentParser == null) {
          commentParser = http.parseComment(input);
        } else {
          commentParser = commentParser.feed(input);
        }
        if (commentParser.isDone()) {
          if (comments == null) {
            comments = FingerTrieSeq.builder();
          }
          comments.add(commentParser.bind());
          commentParser = null;
          step = 5;
          continue;
        } else if (commentParser.isError()) {
          return commentParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new ProductParser(http, nameBuilder, versionBuilder,
                             commentParser, comments, step);
  }

  static Parser<Product> parse(Input input, HttpParser http) {
    return ProductParser.parse(input, http, null, null, null, null, 1);
  }

}
