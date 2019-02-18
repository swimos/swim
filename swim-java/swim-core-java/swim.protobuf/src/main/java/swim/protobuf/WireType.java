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

package swim.protobuf;

public enum WireType {
  VARINT(0),
  FIXED64(1),
  SIZED(2),
  START_GROUP(3),
  END_GROUP(4),
  FIXED32(5),
  RESERVED6(6),
  RESERVED7(7);

  public final int code;

  WireType(int code) {
    this.code = code;
  }

  public boolean isVarint() {
    return code == 0;
  }

  public boolean isFixed64() {
    return code == 1;
  }

  public boolean isSized() {
    return code == 2;
  }

  public boolean isStartGroup() {
    return code == 3;
  }

  public boolean isEndGroup() {
    return code == 4;
  }

  public boolean isFixed32() {
    return code == 5;
  }

  public boolean isReserved() {
    return code == 6 || code == 7;
  }

  @Override
  public String toString() {
    return new StringBuilder("WireType").append('.').append(super.toString()).toString();
  }

  public static WireType apply(int code) {
    switch (code) {
      case 0: return VARINT;
      case 1: return FIXED64;
      case 2: return SIZED;
      case 3: return START_GROUP;
      case 4: return END_GROUP;
      case 5: return FIXED32;
      case 6: return RESERVED6;
      case 7: return RESERVED7;
      default: throw new IllegalArgumentException(Integer.toString(code));
    }
  }
}
