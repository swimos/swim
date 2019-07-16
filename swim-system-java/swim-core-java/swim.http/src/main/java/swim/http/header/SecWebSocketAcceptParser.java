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

final class SecWebSocketAcceptParser extends Parser<SecWebSocketAccept> {
  final Parser<byte[]> digest;

  SecWebSocketAcceptParser(Parser<byte[]> digest) {
    this.digest = digest;
  }

  SecWebSocketAcceptParser() {
    this(null);
  }

  @Override
  public Parser<SecWebSocketAccept> feed(Input input) {
    return parse(input, this.digest);
  }

  static Parser<SecWebSocketAccept> parse(Input input, Parser<byte[]> digest) {
    if (digest == null) {
      digest = Base64.standard().parseByteArray(input);
    } else {
      digest = digest.feed(input);
    }
    if (digest.isDone()) {
      final byte[] data = digest.bind();
      if (data.length != 0) {
        return done(SecWebSocketAccept.from(data));
      } else {
        return error(Diagnostic.expected("base64 digest", input));
      }
    } else if (digest.isError()) {
      return digest.asError();
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new SecWebSocketAcceptParser(digest);
  }

  static Parser<SecWebSocketAccept> parse(Input input) {
    return parse(input, null);
  }
}
