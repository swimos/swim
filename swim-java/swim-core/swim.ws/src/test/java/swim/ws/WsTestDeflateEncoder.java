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

final class WsTestDeflateEncoder extends WsDeflateEncoder {

  final int maskingKey;

  WsTestDeflateEncoder(boolean masked, int maskingKey, WsOptions options) {
    super(masked, options);
    this.maskingKey = maskingKey;
  }

  @Override
  public int maskingKey() {
    return this.maskingKey != 0 ? this.maskingKey : super.maskingKey();
  }

  @Override
  public int minPayloadCapacity() {
    return 0;
  }

  static WsTestDeflateEncoder client(int maskingKey, WsOptions options) {
    return new WsTestDeflateEncoder(true, maskingKey, options);
  }

  static WsTestDeflateEncoder client(WsOptions options) {
    return new WsTestDeflateEncoder(true, 0, options);
  }

  static WsTestDeflateEncoder server(WsOptions options) {
    return new WsTestDeflateEncoder(false, 0, options);
  }

}
