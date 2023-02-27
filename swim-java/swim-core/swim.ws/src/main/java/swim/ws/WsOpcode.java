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

import java.io.IOException;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.ToSource;

@Public
@Since("5.0")
public enum WsOpcode implements ToSource {

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
  PONG(0xA),
  RESERVED_B(0xB),
  RESERVED_C(0xC),
  RESERVED_D(0xD),
  RESERVED_E(0xE),
  RESERVED_F(0xF);

  final int code;

  WsOpcode(int code) {
    this.code = code;
  }

  public int code() {
    return this.code;
  }

  public boolean isData() {
    return this.code >= 0x1 && this.code <= 0x7;
  }

  public boolean isControl() {
    return this.code >= 0x8;
  }

  public boolean isReserved() {
    return (this.code >= 0x3 && this.code <= 0x7)
        || (this.code >= 0xB && this.code <= 0xF);
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
    return this.code == 0xA;
  }

  @Override
  public void writeSource(Appendable output) throws IOException {
    output.append("WsOpcode").append('.').append(this.name());
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static WsOpcode of(int code) {
    switch (code) {
      case 0x0:
        return CONTINUATION;
      case 0x1:
        return TEXT;
      case 0x2:
        return BINARY;
      case 0x3:
        return RESERVED_3;
      case 0x4:
        return RESERVED_4;
      case 0x5:
        return RESERVED_5;
      case 0x6:
        return RESERVED_6;
      case 0x7:
        return RESERVED_7;
      case 0x8:
        return CLOSE;
      case 0x9:
        return PING;
      case 0xA:
        return PONG;
      case 0xB:
        return RESERVED_B;
      case 0xC:
        return RESERVED_C;
      case 0xD:
        return RESERVED_D;
      case 0xE:
        return RESERVED_E;
      case 0xF:
        return RESERVED_F;
      default:
        throw new IllegalArgumentException("Invalid websocket opcode: " + code);
    }
  }

}
