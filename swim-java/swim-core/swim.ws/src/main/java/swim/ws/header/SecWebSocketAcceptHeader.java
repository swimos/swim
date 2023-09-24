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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base64;
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
public final class SecWebSocketAcceptHeader extends HttpHeader {

  byte @Nullable [] digest;

  SecWebSocketAcceptHeader(String name, String value, byte @Nullable [] digest) {
    super(name, value);
    this.digest = digest;
  }

  public byte[] digest() throws HttpException {
    if (this.digest == null) {
      this.digest = SecWebSocketAcceptHeader.parseValue(this.value);
    }
    return this.digest;
  }

  @Override
  public SecWebSocketAcceptHeader withValue(String newValue) {
    return SecWebSocketAcceptHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("SecWebSocketAcceptHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Sec-WebSocket-Accept";

  public static final HttpHeaderType<SecWebSocketAcceptHeader, byte[]> TYPE = new SecWebSocketAcceptHeaderType();

  public static SecWebSocketAcceptHeader of(String name, String value) {
    return new SecWebSocketAcceptHeader(name, value, null);
  }

  public static SecWebSocketAcceptHeader of(String name, byte[] digest) {
    final String value = SecWebSocketAcceptHeader.writeValue(digest);
    return new SecWebSocketAcceptHeader(name, value, digest);
  }

  public static SecWebSocketAcceptHeader of(byte[] digest) {
    return SecWebSocketAcceptHeader.of(NAME, digest);
  }

  public static SecWebSocketAcceptHeader of(String value) {
    return SecWebSocketAcceptHeader.of(NAME, value);
  }

  static byte[] parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    final Parse<byte[]> parseDigest = Base64.standard().parseByteArray(input);
    if (parseDigest.isDone()) {
      return parseDigest.getNonNullUnchecked();
    } else if (parseDigest.isError()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Sec-WebSocket-Accept: " + value, parseDigest.getError());
    } else {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Sec-WebSocket-Accept: " + value);
    }
  }

  static String writeValue(byte[] digest) {
    final StringOutput output = new StringOutput();
    Base64.standard().writeByteArray(output, digest).assertDone();
    return output.get();
  }

}

final class SecWebSocketAcceptHeaderType implements HttpHeaderType<SecWebSocketAcceptHeader, byte[]>, WriteSource {

  @Override
  public String name() {
    return SecWebSocketAcceptHeader.NAME;
  }

  @Override
  public byte[] getValue(SecWebSocketAcceptHeader header) throws HttpException {
    return header.digest();
  }

  @Override
  public SecWebSocketAcceptHeader of(String name, String value) {
    return SecWebSocketAcceptHeader.of(name, value);
  }

  @Override
  public SecWebSocketAcceptHeader of(String name, byte[] digest) {
    return SecWebSocketAcceptHeader.of(name, digest);
  }

  @Override
  public @Nullable SecWebSocketAcceptHeader cast(HttpHeader header) {
    if (header instanceof SecWebSocketAcceptHeader) {
      return (SecWebSocketAcceptHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("SecWebSocketAcceptHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
