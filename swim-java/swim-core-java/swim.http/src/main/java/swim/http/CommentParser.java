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

final class CommentParser extends Parser<String> {
  final StringBuilder comment;
  final int level;
  final int step;

  CommentParser(StringBuilder comment, int level, int step) {
    this.comment = comment;
    this.level = level;
    this.step = step;
  }

  @Override
  public Parser<String> feed(Input input) {
    return parse(input, this.comment, this.level, this.step);
  }

  static Parser<String> parse(Input input, StringBuilder comment, int level, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '(') {
        input = input.step();
        comment = new StringBuilder();
        level = 1;
        step = 2;
      } else if (!input.isEmpty()) {
        return done();
      }
    }
    do {
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isCommentChar(c)) {
            input = input.step();
            comment.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '(') {
            input = input.step();
            comment.append('(');
            level += 1;
          } else if (c == ')') {
            input = input.step();
            level -= 1;
            if (level > 0) {
              comment.append(')');
            } else {
              return done(comment.toString());
            }
          } else if (c == '\\') {
            input = input.step();
            step = 3;
          } else {
            return error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isEscapeChar(c)) {
            input = input.step();
            comment.appendCodePoint(c);
            step = 2;
            continue;
          } else {
            return error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new CommentParser(comment, level, step);
  }

  static Parser<String> parse(Input input) {
    return parse(input, null, 0, 1);
  }
}
