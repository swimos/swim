// Copyright 2015-2021 Swim Inc.
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

package swim.http2;

public final class Http2 {

  private Http2() {
    // static
  }

  private static Http2Decoder standardDecoder;

  public static Http2Decoder standardDecoder() {
    if (Http2.standardDecoder == null) {
      Http2.standardDecoder = new Http2Decoder();
    }
    return Http2.standardDecoder;
  }

  private static Http2Encoder standardEncoder;

  public static Http2Encoder standardEncoder() {
    if (Http2.standardEncoder == null) {
      Http2.standardEncoder = new Http2Encoder();
    }
    return Http2.standardEncoder;
  }

}
