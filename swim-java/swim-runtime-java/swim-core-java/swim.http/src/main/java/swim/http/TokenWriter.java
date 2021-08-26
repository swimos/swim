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

package swim.http;

import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class TokenWriter extends Writer<Object, String> {

  final String token;
  final int index;

  TokenWriter(String token, int index) {
    this.token = token;
    this.index = index;
  }

  TokenWriter(String token) {
    this(token, 0);
  }

  @Override
  public Writer<Object, String> pull(Output<?> output) {
    return TokenWriter.write(output, this.token, this.index);
  }

  static Writer<Object, String> write(Output<?> output, String token, int index) {
    final int length = token.length();
    if (length == 0) {
      return Writer.error(new HttpException("empty token"));
    }
    while (index < length && output.isCont()) {
      final int c = token.codePointAt(index);
      if (Http.isTokenChar(c)) {
        output = output.write(c);
        index = token.offsetByCodePoints(index, 1);
      } else {
        return Writer.error(new HttpException("invalid token: " + token));
      }
    }
    if (index >= length) {
      return Writer.done();
    } else if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new TokenWriter(token, index);
  }

  static Writer<Object, String> write(Output<?> output, String token) {
    return TokenWriter.write(output, token, 0);
  }

}
