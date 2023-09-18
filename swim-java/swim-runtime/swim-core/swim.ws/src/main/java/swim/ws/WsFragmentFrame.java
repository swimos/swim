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

import swim.codec.Debug;
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.Format;
import swim.codec.Output;

public final class WsFragmentFrame<T> extends WsFrame<T> implements Debug {

  final WsOpcode frameType;
  final Decoder<T> payloadDecoder;

  WsFragmentFrame(WsOpcode frameType, Decoder<T> payloadDecoder) {
    this.frameType = frameType;
    this.payloadDecoder = payloadDecoder;
  }

  @Override
  public WsOpcode frameType() {
    return this.frameType;
  }

  @Override
  public T payloadValue() {
    return this.payloadDecoder.bind();
  }

  @Override
  public Encoder<?, ?> payloadEncoder(WsEncoder ws) {
    return Encoder.error(new EncoderException("can't re-encode decoded fragment frame"));
  }

  public Decoder<T> payloadDecoder() {
    return this.payloadDecoder;
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WsFragmentFrame").write('.').write("create").write('(')
                   .debug(this.frameType).write(", ").debug(this.payloadDecoder).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <T> WsFragmentFrame<T> create(WsOpcode frameType, Decoder<T> payloadDecoder) {
    return new WsFragmentFrame<T>(frameType, payloadDecoder);
  }

}
