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

package swim.http.header;

import swim.codec.Base64;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class SecWebSocketKeyParser extends Parser<SecWebSocketKey> {
  final Parser<byte[]> key;

  SecWebSocketKeyParser(Parser<byte[]> key) {
    this.key = key;
  }

  SecWebSocketKeyParser() {
    this(null);
  }

  @Override
  public Parser<SecWebSocketKey> feed(Input input) {
    return parse(input, key);
  }

  static Parser<SecWebSocketKey> parse(Input input, Parser<byte[]> key) {
    if (key == null) {
      key = Base64.standard().parseByteArray(input);
    } else {
      key = key.feed(input);
    }
    if (key.isDone()) {
      final byte[] data = key.bind();
      if (data.length != 0) {
        return done(SecWebSocketKey.from(data));
      } else {
        return error(Diagnostic.expected("base64 digest", input));
      }
    } else if (key.isError()) {
      return key.asError();
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new SecWebSocketKeyParser(key);
  }

  static Parser<SecWebSocketKey> parse(Input input) {
    return parse(input, null);
  }
}
