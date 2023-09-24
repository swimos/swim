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

package swim.ws.header;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.concurrent.ThreadLocalRandom;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base64;
import swim.codec.ByteArrayOutput;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpStatus;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class SecWebSocketKeyHeader extends HttpHeader {

  byte @Nullable [] key;
  byte @Nullable [] digest;

  SecWebSocketKeyHeader(String name, String value, byte @Nullable [] key) {
    super(name, value);
    this.key = key;
  }

  public byte[] key() throws HttpException {
    if (this.key == null) {
      this.key = SecWebSocketKeyHeader.parseValue(this.value);
    }
    return this.key;
  }

  public byte[] digest() throws HttpException {
    if (this.digest == null) {
      final ByteArrayOutput output = ByteArrayOutput.ofCapacity(60);
      Base64.standard().writeByteArray(output, this.key());
      final String seed = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
      for (int i = 0; i < seed.length(); i += 1) {
        output.write((byte) seed.charAt(i));
      }
      try {
        this.digest = MessageDigest.getInstance("SHA-1").digest(output.get());
      } catch (NoSuchAlgorithmException cause) {
        throw new UnsupportedOperationException(cause);
      }
    }
    return this.digest;
  }

  public SecWebSocketAcceptHeader accept() throws HttpException {
    return SecWebSocketAcceptHeader.of(this.digest());
  }

  public boolean validate(byte[] digest) throws HttpException {
    return Arrays.equals(this.digest(), digest);
  }

  @Override
  public SecWebSocketKeyHeader withValue(String newValue) {
    return SecWebSocketKeyHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("SecWebSocketKeyHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Sec-WebSocket-Key";

  public static final HttpHeaderType<SecWebSocketKeyHeader, byte[]> TYPE = new SecWebSocketKeyHeaderType();

  public static SecWebSocketKeyHeader of(String name, String value) {
    return new SecWebSocketKeyHeader(name, value, null);
  }

  public static SecWebSocketKeyHeader of(String name, byte[] key) {
    final String value = SecWebSocketKeyHeader.writeValue(key);
    return new SecWebSocketKeyHeader(name, value, key);
  }

  public static SecWebSocketKeyHeader of(byte[] key) {
    return SecWebSocketKeyHeader.of(NAME, key);
  }

  public static SecWebSocketKeyHeader of(String value) {
    return SecWebSocketKeyHeader.of(NAME, value);
  }

  public static SecWebSocketKeyHeader generate() {
    final byte[] key = new byte[16];
    ThreadLocalRandom.current().nextBytes(key);
    return SecWebSocketKeyHeader.of(NAME, key);
  }

  static byte[] parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    final Parse<byte[]> parseKey = Base64.standard().parseByteArray(input);
    if (parseKey.isDone()) {
      return parseKey.getNonNullUnchecked();
    } else if (parseKey.isError()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Sec-WebSocket-Key: " + value, parseKey.getError());
    } else {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Sec-WebSocket-Key: " + value);
    }
  }

  static String writeValue(byte[] key) {
    final StringOutput output = new StringOutput();
    Base64.standard().writeByteArray(output, key).assertDone();
    return output.get();
  }

}

final class SecWebSocketKeyHeaderType implements HttpHeaderType<SecWebSocketKeyHeader, byte[]>, WriteSource {

  @Override
  public String name() {
    return SecWebSocketKeyHeader.NAME;
  }

  @Override
  public byte[] getValue(SecWebSocketKeyHeader header) throws HttpException {
    return header.key();
  }

  @Override
  public SecWebSocketKeyHeader of(String name, String value) {
    return SecWebSocketKeyHeader.of(name, value);
  }

  @Override
  public SecWebSocketKeyHeader of(String name, byte[] key) {
    return SecWebSocketKeyHeader.of(name, key);
  }

  @Override
  public @Nullable SecWebSocketKeyHeader cast(HttpHeader header) {
    if (header instanceof SecWebSocketKeyHeader) {
      return (SecWebSocketKeyHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("SecWebSocketKeyHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
