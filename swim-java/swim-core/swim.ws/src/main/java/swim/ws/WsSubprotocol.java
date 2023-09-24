// Copyright 2015-2023 Nstream, inc.
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

package swim.ws;

import java.nio.ByteBuffer;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Binary;
import swim.codec.Codec;
import swim.codec.Text;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface WsSubprotocol<T> {

  default Codec<? extends T> textCodec() throws WsException {
    throw new WsException(WsStatus.of(1003), "unsupported text frame");
  }

  default Codec<? extends T> binaryCodec() throws WsException {
    throw new WsException(WsStatus.of(1003), "unsupported binary frame");
  }

  default Codec<?> messageCodec(WsOpcode frameType) throws WsException {
    switch (frameType) {
      case TEXT:
        return this.textCodec();
      case BINARY:
        return this.binaryCodec();
      case CLOSE:
        return WsStatus.codec();
      case PING:
      case PONG:
        return Binary.byteBufferCodec();
      default:
        throw new WsException(WsStatus.of(1003), "unsupported frame type: " + frameType.toString());
    }
  }

  static WsSubprotocol<String> text() {
    return WsTextSubprotocol.DEFAULT;
  }

  static <T> WsSubprotocol<T> text(Codec<? extends T> textCodec) {
    if (textCodec == Text.stringCodec()) {
      return Assume.conforms(WsTextSubprotocol.DEFAULT);
    }
    return new WsTextSubprotocol<T>(textCodec);
  }

  static WsSubprotocol<ByteBuffer> binary() {
    return WsBinarySubprotocol.DEFAULT;
  }

  static <T> WsSubprotocol<T> binary(Codec<? extends T> binaryCodec) {
    if (binaryCodec == Binary.byteBufferCodec()) {
      return Assume.conforms(WsBinarySubprotocol.DEFAULT);
    }
    return new WsBinarySubprotocol<T>(binaryCodec);
  }

  static WsSubprotocol<Object> generic() {
    return WsGenericSubprotocol.DEFAULT;
  }

  static <T> WsSubprotocol<T> generic(Codec<? extends T> textCodec,
                                      Codec<? extends T> binaryCodec) {
    if (textCodec == Text.stringCodec() && binaryCodec == Binary.byteBufferCodec()) {
      return Assume.conforms(WsGenericSubprotocol.DEFAULT);
    }
    return new WsGenericSubprotocol<T>(textCodec, binaryCodec);
  }

}

final class WsTextSubprotocol<T> implements WsSubprotocol<T>, WriteSource {

  final Codec<? extends T> textCodec;

  WsTextSubprotocol(Codec<? extends T> textCodec) {
    this.textCodec = textCodec;
  }

  @Override
  public Codec<? extends T> textCodec() throws WsException {
    return this.textCodec;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsSubprotocol", "text")
            .appendArgument(this.textCodec)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WsTextSubprotocol<String> DEFAULT =
      new WsTextSubprotocol<String>(Text.stringCodec());

}

final class WsBinarySubprotocol<T> implements WsSubprotocol<T>, WriteSource {

  final Codec<? extends T> binaryCodec;

  WsBinarySubprotocol(Codec<? extends T> binaryCodec) {
    this.binaryCodec = binaryCodec;
  }

  @Override
  public Codec<? extends T> binaryCodec() throws WsException {
    return this.binaryCodec;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsSubprotocol", "binary")
            .appendArgument(this.binaryCodec)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WsBinarySubprotocol<ByteBuffer> DEFAULT =
      new WsBinarySubprotocol<ByteBuffer>(Binary.byteBufferCodec());

}

final class WsGenericSubprotocol<T> implements WsSubprotocol<T>, WriteSource {

  final Codec<? extends T> textCodec;
  final Codec<? extends T> binaryCodec;

  WsGenericSubprotocol(Codec<? extends T> textCodec, Codec<? extends T> binaryCodec) {
    this.textCodec = textCodec;
    this.binaryCodec = binaryCodec;
  }

  @Override
  public Codec<? extends T> textCodec() throws WsException {
    return this.textCodec;
  }

  @Override
  public Codec<? extends T> binaryCodec() throws WsException {
    return this.binaryCodec;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsSubprotocol", "generic")
            .appendArgument(this.textCodec)
            .appendArgument(this.binaryCodec)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WsGenericSubprotocol<Object> DEFAULT =
      new WsGenericSubprotocol<Object>(Text.stringCodec(), Binary.byteBufferCodec());

}
