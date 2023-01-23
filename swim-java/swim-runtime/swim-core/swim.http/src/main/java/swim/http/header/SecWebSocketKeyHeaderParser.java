// Copyright 2015-2023 Swim.inc
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

final class SecWebSocketKeyHeaderParser extends Parser<SecWebSocketKeyHeader> {

  final Parser<byte[]> keyParser;

  SecWebSocketKeyHeaderParser(Parser<byte[]> keyParser) {
    this.keyParser = keyParser;
  }

  SecWebSocketKeyHeaderParser() {
    this(null);
  }

  @Override
  public Parser<SecWebSocketKeyHeader> feed(Input input) {
    return SecWebSocketKeyHeaderParser.parse(input, this.keyParser);
  }

  static Parser<SecWebSocketKeyHeader> parse(Input input, Parser<byte[]> keyParser) {
    if (keyParser == null) {
      keyParser = Base64.standard().parseByteArray(input);
    } else {
      keyParser = keyParser.feed(input);
    }
    if (keyParser.isDone()) {
      final byte[] data = keyParser.bind();
      if (data.length != 0) {
        return Parser.done(SecWebSocketKeyHeader.create(data));
      } else {
        return Parser.error(Diagnostic.expected("base64 key", input));
      }
    } else if (keyParser.isError()) {
      return keyParser.asError();
    } else if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new SecWebSocketKeyHeaderParser(keyParser);
  }

  static Parser<SecWebSocketKeyHeader> parse(Input input) {
    return SecWebSocketKeyHeaderParser.parse(input, null);
  }

}
