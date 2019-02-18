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

import swim.codec.Decoder;
import swim.codec.InputBuffer;
import swim.deflate.Inflate;

public class WsDeflateDecoder extends WsDecoder implements Cloneable {
  protected final Inflate<?> inflate;
  protected boolean decompressing;

  public WsDeflateDecoder(Inflate<?> inflate, boolean decompressing) {
    this.inflate = inflate;
    this.decompressing = decompressing;
  }

  public WsDeflateDecoder(Inflate<?> inflate) {
    this(inflate, false);
  }

  public final Inflate<?> inflate() {
    return this.inflate;
  }

  public final boolean decompressing() {
    return this.decompressing;
  }

  @Override
  public <T> Decoder<WsFrame<T>> decodeContinuationFrame(int finRsvOp, Decoder<T> content, InputBuffer input) {
    if (decompressing) { // compressed
      return WsFrameInflater.decode(input, this, content);
    } else { // uncompressed
      return WsFrameDecoder.decode(input, this, content);
    }
  }

  @Override
  public <T> Decoder<WsFrame<T>> decodeTextFrame(int finRsvOp, Decoder<T> content, InputBuffer input) {
    if ((finRsvOp & 0x40) != 0) { // compressed
      this.decompressing = (finRsvOp & 0x80) == 0;
      return WsFrameInflater.decode(input, this, content);
    } else { // uncompressed
      this.decompressing = false;
      return WsFrameDecoder.decode(input, this, content);
    }
  }

  @Override
  public <T> Decoder<WsFrame<T>> decodeBinaryFrame(int finRsvOp, Decoder<T> content, InputBuffer input) {
    if ((finRsvOp & 0x40) != 0) { // compressed
      this.decompressing = (finRsvOp & 0x80) == 0;
      return WsFrameInflater.decode(input, this, content);
    } else { // uncompressed
      this.decompressing = false;
      return WsFrameDecoder.decode(input, this, content);
    }
  }

  @Override
  public WsDeflateDecoder clone() {
    return new WsDeflateDecoder(this.inflate.clone(), this.decompressing);
  }
}
