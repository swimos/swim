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

package swim.http.header;

import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class ContentLengthHeaderParser extends Parser<ContentLengthHeader> {

  final long length;
  final int step;

  ContentLengthHeaderParser(long length, int step) {
    this.length = length;
    this.step = step;
  }

  ContentLengthHeaderParser() {
    this(0L, 1);
  }

  @Override
  public Parser<ContentLengthHeader> feed(Input input) {
    return ContentLengthHeaderParser.parse(input, this.length, this.step);
  }

  static Parser<ContentLengthHeader> parse(Input input, long length, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          length = (long) Base10.decodeDigit(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          length = 10L * length + (long) Base10.decodeDigit(c);
          if (length < 0L) {
            return Parser.error(Diagnostic.message("content length overflow", input));
          }
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return Parser.done(ContentLengthHeader.create(length));
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new ContentLengthHeaderParser(length, step);
  }

  static Parser<ContentLengthHeader> parse(Input input) {
    return ContentLengthHeaderParser.parse(input, 0L, 1);
  }

}
