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

import swim.deflate.Deflate;
import swim.deflate.Inflate;

public final class Ws {
  private Ws() {
    // stub
  }

  private static WsDecoder standardDecoder;
  private static WsEncoder standardEncoderMasked;
  private static WsEncoder standardEncoderUnmasked;

  public static WsDecoder standardDecoder() {
    if (standardDecoder == null) {
      standardDecoder = new WsStandardDecoder();
    }
    return standardDecoder;
  }

  public static WsEncoder standardEncoderMasked() {
    if (standardEncoderMasked == null) {
      standardEncoderMasked = new WsStandardEncoderMasked();
    }
    return standardEncoderMasked;
  }

  public static WsEncoder standardEncoderUnmasked() {
    if (standardEncoderUnmasked == null) {
      standardEncoderUnmasked = new WsStandardEncoderUnmasked();
    }
    return standardEncoderUnmasked;
  }

  public static WsDeflateDecoder deflateDecoder(Inflate<?> inflate) {
    return new WsDeflateDecoder(inflate);
  }

  public static WsDeflateDecoder deflateDecoder() {
    return new WsDeflateDecoder(new Inflate<Object>());
  }

  public static WsDeflateEncoder deflateEncoderMasked(Deflate<?> deflate, int flush) {
    return new WsDeflateEncoderMasked(deflate, flush);
  }

  public static WsDeflateEncoder deflateEncoderMasked() {
    return new WsDeflateEncoderMasked(new Deflate<Object>(), Deflate.Z_SYNC_FLUSH);
  }

  public static WsDeflateEncoder deflateEncoderUnmasked(Deflate<?> deflate, int flush) {
    return new WsDeflateEncoderUnmasked(deflate, flush);
  }

  public static WsDeflateEncoder deflateEncoderUnmasked() {
    return new WsDeflateEncoderUnmasked(new Deflate<Object>(), Deflate.Z_SYNC_FLUSH);
  }
}
