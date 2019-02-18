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

package swim.ws;

import swim.codec.Encoder;
import swim.codec.OutputBuffer;
import swim.deflate.Deflate;

public abstract class WsDeflateEncoder extends WsEncoder {
  protected final Deflate<?> deflate;
  protected final int flush;

  public WsDeflateEncoder(Deflate<?> deflate, int flush) {
    this.deflate = deflate;
    this.flush = flush;
  }

  public final Deflate<?> deflate() {
    return this.deflate;
  }

  public final int flush() {
    return this.flush;
  }

  @Override
  public <T> Encoder<?, WsFrame<T>> textFrameEncoder(WsFrame<T> frame) {
    return new WsFrameDeflater<T>(this, frame);
  }

  @Override
  public <T> Encoder<?, WsFrame<T>> encodeTextFrame(WsFrame<T> frame, OutputBuffer<?> output) {
    return WsFrameDeflater.encode(output, this, frame);
  }

  @Override
  public <T> Encoder<?, WsFrame<T>> binaryFrameEncoder(WsFrame<T> frame) {
    return new WsFrameDeflater<T>(this, frame);
  }

  @Override
  public <T> Encoder<?, WsFrame<T>> encodeBinaryFrame(WsFrame<T> frame, OutputBuffer<?> output) {
    return WsFrameDeflater.encode(output, this, frame);
  }
}
