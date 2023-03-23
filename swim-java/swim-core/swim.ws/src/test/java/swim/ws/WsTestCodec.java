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

package swim.ws;

import java.nio.ByteBuffer;
import swim.codec.Binary;
import swim.codec.Text;
import swim.codec.Transcoder;
import swim.util.Notation;
import swim.util.ToSource;

final class WsTestCodec<T> implements WsCodec<T>, ToSource {

  final Transcoder<? extends T> textTranscoder;
  final Transcoder<? extends T> binaryTranscoder;

  WsTestCodec(Transcoder<? extends T> textTranscoder,
              Transcoder<? extends T> binaryTranscoder) {
    this.textTranscoder = textTranscoder;
    this.binaryTranscoder = binaryTranscoder;
  }

  @Override
  public Transcoder<? extends T> getTextPayloadTranscoder() throws WsException {
    return this.textTranscoder;
  }

  @Override
  public Transcoder<? extends T> getBinaryPayloadTranscoder() throws WsException {
    return this.binaryTranscoder;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsTestCodec", "of")
            .appendArgument(this.textTranscoder)
            .appendArgument(this.binaryTranscoder)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static <T> WsCodec<T> of(Transcoder<? extends T> textTranscoder,
                           Transcoder<? extends T> binaryTranscoder) {
    return new WsTestCodec<T>(textTranscoder, binaryTranscoder);
  }

  static final WsCodec<Object> JAVA_CODEC = new WsTestCodec<Object>(Text.transcoder(), Binary.byteBufferTranscoder());

  public static WsCodec<Object> javaCodec() {
    return JAVA_CODEC;
  }

  static final WsCodec<String> STRING_CODEC = new WsTestCodec<String>(Text.transcoder(), Text.transcoder());

  public static WsCodec<String> stringCodec() {
    return STRING_CODEC;
  }

  static final WsCodec<ByteBuffer> BYTE_BUFFER_CODEC = new WsTestCodec<ByteBuffer>(Binary.byteBufferTranscoder(), Binary.byteBufferTranscoder());

  public static WsCodec<ByteBuffer> byteBufferCodec() {
    return BYTE_BUFFER_CODEC;
  }

}
