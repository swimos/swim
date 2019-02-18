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

import java.util.Arrays;
import swim.codec.Base64;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.codec.Writer;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public final class SecWebSocketAccept extends HttpHeader {
  final byte[] digest;

  SecWebSocketAccept(byte[] digest) {
    this.digest = digest;
  }

  @Override
  public String lowerCaseName() {
    return "sec-websocket-accept";
  }

  @Override
  public String name() {
    return "Sec-WebSocket-Accept";
  }

  public byte[] digest() {
    return this.digest;
  }

  @Override
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return Base64.standard().writeByteArray(this.digest, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SecWebSocketAccept) {
      final SecWebSocketAccept that = (SecWebSocketAccept) other;
      return Arrays.equals(this.digest, that.digest);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(SecWebSocketAccept.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, Arrays.hashCode(this.digest)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("SecWebSocketAccept").write('.').write("from").write('(').write('"');
    Base64.standard().writeByteArray(this.digest, output);
    output = output.write('"').write(')');
  }

  private static int hashSeed;

  public static SecWebSocketAccept from(byte[] digest) {
    return new SecWebSocketAccept(digest);
  }

  public static SecWebSocketAccept from(String digestString) {
    final Input input = Unicode.stringInput(digestString);
    Parser<byte[]> parser = Base64.standard().parseByteArray(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return new SecWebSocketAccept(parser.bind());
  }

  public static Parser<SecWebSocketAccept> parseHttpValue(Input input, HttpParser http) {
    return SecWebSocketAcceptParser.parse(input);
  }
}
