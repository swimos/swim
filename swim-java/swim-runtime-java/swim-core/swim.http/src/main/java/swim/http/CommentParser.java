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

final class CommentParser extends Parser<String> {

  final StringBuilder commentBuilder;
  final int level;
  final int step;

  CommentParser(StringBuilder commentBuilder, int level, int step) {
    this.commentBuilder = commentBuilder;
    this.level = level;
    this.step = step;
  }

  @Override
  public Parser<String> feed(Input input) {
    return CommentParser.parse(input, this.commentBuilder, this.level, this.step);
  }

  static Parser<String> parse(Input input, StringBuilder commentBuilder, int level, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '(') {
        input = input.step();
        commentBuilder = new StringBuilder();
        level = 1;
        step = 2;
      } else if (!input.isEmpty()) {
        return Parser.done();
      }
    }
    do {
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isCommentChar(c)) {
            input = input.step();
            commentBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '(') {
            input = input.step();
            commentBuilder.append('(');
            level += 1;
          } else if (c == ')') {
            input = input.step();
            level -= 1;
            if (level > 0) {
              commentBuilder.append(')');
            } else {
              return Parser.done(commentBuilder.toString());
            }
          } else if (c == '\\') {
            input = input.step();
            step = 3;
          } else {
            return Parser.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isEscapeChar(c)) {
            input = input.step();
            commentBuilder.appendCodePoint(c);
            step = 2;
            continue;
          } else {
            return Parser.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new CommentParser(commentBuilder, level, step);
  }

  static Parser<String> parse(Input input) {
    return CommentParser.parse(input, null, 0, 1);
  }

}
