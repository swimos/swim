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

import java.util.concurrent.ThreadLocalRandom;
import swim.deflate.Deflate;

final class WsDeflateEncoderMasked extends WsDeflateEncoder {

  WsDeflateEncoderMasked(Deflate<?> deflate, int flush) {
    super(deflate, flush);
  }

  @Override
  public boolean isMasked() {
    return true;
  }

  @Override
  public void maskingKey(byte[] maskingKey) {
    ThreadLocalRandom.current().nextBytes(maskingKey);
  }

}
