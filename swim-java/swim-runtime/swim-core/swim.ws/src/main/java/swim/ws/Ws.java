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

import swim.deflate.Deflate;
import swim.deflate.Inflate;

public final class Ws {

  private Ws() {
    // static
  }

  private static WsDecoder standardDecoder;

  public static WsDecoder standardDecoder() {
    if (Ws.standardDecoder == null) {
      Ws.standardDecoder = new WsStandardDecoder();
    }
    return Ws.standardDecoder;
  }

  private static WsEncoder standardEncoderMasked;

  public static WsEncoder standardEncoderMasked() {
    if (Ws.standardEncoderMasked == null) {
      Ws.standardEncoderMasked = new WsStandardEncoderMasked();
    }
    return Ws.standardEncoderMasked;
  }

  private static WsEncoder standardEncoderUnmasked;

  public static WsEncoder standardEncoderUnmasked() {
    if (Ws.standardEncoderUnmasked == null) {
      Ws.standardEncoderUnmasked = new WsStandardEncoderUnmasked();
    }
    return Ws.standardEncoderUnmasked;
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
