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

import swim.codec.Debug;
import swim.codec.Output;

public enum WsOpcode implements Debug {

  CONTINUATION(0x0),
  TEXT(0x1),
  BINARY(0x2),
  RESERVED_3(0x3),
  RESERVED_4(0x4),
  RESERVED_5(0x5),
  RESERVED_6(0x6),
  RESERVED_7(0x7),
  CLOSE(0x8),
  PING(0x9),
  PONG(0xa),
  RESERVED_B(0xb),
  RESERVED_C(0xc),
  RESERVED_D(0xd),
  RESERVED_E(0xe),
  RESERVED_F(0xf);

  public final int code;

  WsOpcode(int code) {
    this.code = code;
  }

  public boolean isData() {
    return this.code >= 0x1 && this.code <= 0x2;
  }

  public boolean isControl() {
    return this.code >= 0x8;
  }

  public boolean isReserved() {
    return this.code >= 0x3 && this.code <= 0x7 || this.code >= 0xb && this.code <= 0xf;
  }

  public boolean isContinuation() {
    return this.code == 0x0;
  }

  public boolean isText() {
    return this.code == 0x1;
  }

  public boolean isBinary() {
    return this.code == 0x2;
  }

  public boolean isClose() {
    return this.code == 0x8;
  }

  public boolean isPing() {
    return this.code == 0x9;
  }

  public boolean isPong() {
    return this.code == 0xa;
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WsOpcode").write('.').write(this.name());
    return output;
  }

  public static WsOpcode from(int code) {
    switch (code) {
      case 0x0: return WsOpcode.CONTINUATION;
      case 0x1: return WsOpcode.TEXT;
      case 0x2: return WsOpcode.BINARY;
      case 0x3: return WsOpcode.RESERVED_3;
      case 0x4: return WsOpcode.RESERVED_4;
      case 0x5: return WsOpcode.RESERVED_5;
      case 0x6: return WsOpcode.RESERVED_6;
      case 0x7: return WsOpcode.RESERVED_7;
      case 0x8: return WsOpcode.CLOSE;
      case 0x9: return WsOpcode.PING;
      case 0xa: return WsOpcode.PONG;
      case 0xb: return WsOpcode.RESERVED_B;
      case 0xc: return WsOpcode.RESERVED_C;
      case 0xd: return WsOpcode.RESERVED_D;
      case 0xe: return WsOpcode.RESERVED_E;
      case 0xf: return WsOpcode.RESERVED_F;
      default: throw new IllegalArgumentException(Integer.toString(code));
    }
  }

}
