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

final class TestWsDeflateEncoder extends WsDeflateEncoder {

  final byte[] maskingKey;

  TestWsDeflateEncoder(byte[] maskingKey, Deflate<?> deflate, int flush) {
    super(deflate, flush);
    this.maskingKey = maskingKey;
  }

  TestWsDeflateEncoder(byte[] maskingKey) {
    this(maskingKey, new Deflate<Object>(), Deflate.Z_SYNC_FLUSH);
  }

  @Override
  public boolean isMasked() {
    return this.maskingKey != null;
  }

  @Override
  public void maskingKey(byte[] maskingKey) {
    if (this.maskingKey != null) {
      System.arraycopy(this.maskingKey, 0, maskingKey, 0, 4);
    }
  }

  @Override
  public int minDataFrameBufferSize() {
    return 0;
  }

}
