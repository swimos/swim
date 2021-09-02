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

package swim.http.header;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.concurrent.ThreadLocalRandom;
import swim.codec.Base64;
import swim.codec.Binary;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.codec.Writer;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public final class SecWebSocketKeyHeader extends HttpHeader {

  final byte[] key;

  SecWebSocketKeyHeader(byte[] key) {
    this.key = key;
  }

  @Override
  public String lowerCaseName() {
    return "sec-websocket-key";
  }

  @Override
  public String name() {
    return "Sec-WebSocket-Key";
  }

  public byte[] key() {
    return this.key;
  }

  public SecWebSocketAcceptHeader accept() {
    Output<byte[]> output = Binary.byteArrayOutput(60);
    Base64.standard().writeByteArray(output, this.key);
    final String seed = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    for (int i = 0, n = seed.length(); i < n; i += 1) {
      output = output.write((byte) seed.charAt(i));
    }
    try {
      final byte[] digest = MessageDigest.getInstance("SHA-1").digest(output.bind());
      return new SecWebSocketAcceptHeader(digest);
    } catch (NoSuchAlgorithmException cause) {
      throw new HttpException(cause);
    }
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return Base64.standard().writeByteArray(output, this.key);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SecWebSocketKeyHeader) {
      final SecWebSocketKeyHeader that = (SecWebSocketKeyHeader) other;
      return Arrays.equals(this.key, that.key);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (SecWebSocketKeyHeader.hashSeed == 0) {
      SecWebSocketKeyHeader.hashSeed = Murmur3.seed(SecWebSocketKeyHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(SecWebSocketKeyHeader.hashSeed, Arrays.hashCode(this.key)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("SecWebSocketKeyHeader").write('.').write("create").write('(').write('"');
    Base64.standard().writeByteArray(output, this.key).bind();
    output = output.write('"').write(')');
    return output;
  }

  public static SecWebSocketKeyHeader create(byte[] key) {
    return new SecWebSocketKeyHeader(key);
  }

  public static SecWebSocketKeyHeader create(String keyString) {
    final Input input = Unicode.stringInput(keyString);
    Parser<byte[]> parser = Base64.standard().parseByteArray(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return new SecWebSocketKeyHeader(parser.bind());
  }

  public static SecWebSocketKeyHeader generate() {
    final byte[] key = new byte[16];
    ThreadLocalRandom.current().nextBytes(key);
    return new SecWebSocketKeyHeader(key);
  }

  public static Parser<SecWebSocketKeyHeader> parseHeaderValue(Input input, HttpParser http) {
    return SecWebSocketKeyHeaderParser.parse(input);
  }

}
