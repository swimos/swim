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

final class SecWebSocketAcceptHeaderParser extends Parser<SecWebSocketAcceptHeader> {

  final Parser<byte[]> digestParser;

  SecWebSocketAcceptHeaderParser(Parser<byte[]> digestParser) {
    this.digestParser = digestParser;
  }

  SecWebSocketAcceptHeaderParser() {
    this(null);
  }

  @Override
  public Parser<SecWebSocketAcceptHeader> feed(Input input) {
    return SecWebSocketAcceptHeaderParser.parse(input, this.digestParser);
  }

  static Parser<SecWebSocketAcceptHeader> parse(Input input, Parser<byte[]> digestParser) {
    if (digestParser == null) {
      digestParser = Base64.standard().parseByteArray(input);
    } else {
      digestParser = digestParser.feed(input);
    }
    if (digestParser.isDone()) {
      final byte[] data = digestParser.bind();
      if (data.length != 0) {
        return Parser.done(SecWebSocketAcceptHeader.create(data));
      } else {
        return Parser.error(Diagnostic.expected("base64 digest", input));
      }
    } else if (digestParser.isError()) {
      return digestParser.asError();
    } else if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new SecWebSocketAcceptHeaderParser(digestParser);
  }

  static Parser<SecWebSocketAcceptHeader> parse(Input input) {
    return SecWebSocketAcceptHeaderParser.parse(input, null);
  }

}
