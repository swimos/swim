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

import java.util.Iterator;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class TokenListWriter extends Writer<Object, Object> {
  final Iterator<?> tokens;
  final String token;
  final int index;
  final int step;

  TokenListWriter(Iterator<?> tokens, String token, int index, int step) {
    this.tokens = tokens;
    this.token = token;
    this.index = index;
    this.step = step;
  }

  TokenListWriter(Iterator<?> tokens) {
    this(tokens, null, 0, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.tokens, this.token, this.index, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, Iterator<?> tokens,
                                      String token, int index, int step) {
    do {
      if (step == 1) {
        if (token == null) {
          if (!tokens.hasNext()) {
            return done();
          } else {
            token = tokens.next().toString();
          }
        }
        final int length = token.length();
        if (length == 0) {
          return error(new HttpException("empty token"));
        }
        while (index < length && output.isCont()) {
          final int c = token.codePointAt(index);
          if (Http.isTokenChar(c)) {
            output = output.write(c);
          } else {
            return error(new HttpException("invalid token: " + token));
          }
          index = token.offsetByCodePoints(index, 1);
        }
        if (index == length) {
          token = null;
          index = 0;
          if (!tokens.hasNext()) {
            return done();
          } else {
            step = 2;
          }
        }
      }
      if (step == 2 && output.isCont()) {
        output = output.write(',');
        step = 3;
      }
      if (step == 3 && output.isCont()) {
        output = output.write(' ');
        step = 1;
        continue;
      }
      break;
    } while (true);
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new TokenListWriter(tokens, token, index, step);
  }

  static Writer<Object, Object> write(Output<?> output, Iterator<?> tokens) {
    return write(output, tokens, null, 0, 1);
  }
}
