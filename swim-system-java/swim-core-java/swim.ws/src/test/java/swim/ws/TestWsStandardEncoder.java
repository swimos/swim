// Copyright 2015-2021 Swim inc.
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

final class TestWsStandardEncoder extends WsEncoder {

  final byte[] maskingKey;

  TestWsStandardEncoder(byte[] maskingKey) {
    this.maskingKey = maskingKey;
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
