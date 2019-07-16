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

package swim.http;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.util.Builder;

final class ProductParser extends Parser<Product> {
  final HttpParser http;
  final StringBuilder name;
  final StringBuilder version;
  final Builder<String, FingerTrieSeq<String>> comments;
  final Parser<String> comment;
  final int step;

  ProductParser(HttpParser http, StringBuilder name, StringBuilder version,
                Builder<String, FingerTrieSeq<String>> comments,
                Parser<String> comment, int step) {
    this.http = http;
    this.name = name;
    this.version = version;
    this.comments = comments;
    this.comment = comment;
    this.step = step;
  }

  ProductParser(HttpParser http) {
    this(http, null, null, null, null, 1);
  }

  @Override
  public Parser<Product> feed(Input input) {
    return parse(input, this.http, this.name, this.version, this.comments,
                 this.comment, this.step);
  }

  static Parser<Product> parse(Input input, HttpParser http, StringBuilder name,
                               StringBuilder version,
                               Builder<String, FingerTrieSeq<String>> comments,
                               Parser<String> comment, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (name == null) {
            name = new StringBuilder();
          }
          name.appendCodePoint(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("product name", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("product name", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          name.appendCodePoint(c);
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
          if (version == null) {
            version = new StringBuilder();
          }
          version.appendCodePoint(c);
          step = 4;
        } else {
          return error(Diagnostic.expected("product version", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("product version", input));
      }
    }
    if (step == 4) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          version.appendCodePoint(c);
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
          return done(http.product(name.toString(), version != null ? version.toString() : null,
                                   comments != null ? comments.bind() : FingerTrieSeq.<String>empty()));
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
        if (comment == null) {
          comment = http.parseComment(input);
        } else {
          comment = comment.feed(input);
        }
        if (comment.isDone()) {
          if (comments == null) {
            comments = FingerTrieSeq.builder();
          }
          comments.add(comment.bind());
          comment = null;
          step = 5;
          continue;
        } else if (comment.isError()) {
          return comment.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new ProductParser(http, name, version, comments, comment, step);
  }

  static Parser<Product> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, null, null, 1);
  }
}
