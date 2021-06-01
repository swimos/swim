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

package swim.protobuf;

public enum ProtobufWireType {

  VARINT(0),
  FIXED64(1),
  SIZED(2),
  START_GROUP(3),
  END_GROUP(4),
  FIXED32(5),
  RESERVED6(6),
  RESERVED7(7);

  public final int code;

  ProtobufWireType(int code) {
    this.code = code;
  }

  public static ProtobufWireType from(int code) {
    switch (code) {
      case 0:
        return VARINT;
      case 1:
        return FIXED64;
      case 2:
        return SIZED;
      case 3:
        return START_GROUP;
      case 4:
        return END_GROUP;
      case 5:
        return FIXED32;
      case 6:
        return RESERVED6;
      case 7:
        return RESERVED7;
      default:
        throw new IllegalArgumentException(Integer.toString(code));
    }
  }

  public boolean isPrimitive() {
    return this.code == 0 || this.code == 1 || this.code == 5;
  }

  public boolean isVarint() {
    return this.code == 0;
  }

  public boolean isFixed64() {
    return this.code == 1;
  }

  public boolean isSized() {
    return this.code == 2;
  }

  public boolean isStartGroup() {
    return this.code == 3;
  }

  public boolean isEndGroup() {
    return this.code == 4;
  }

  public boolean isFixed32() {
    return this.code == 5;
  }

  public boolean isReserved() {
    return this.code == 6 || this.code == 7;
  }

  @Override
  public String toString() {
    return new StringBuilder("ProtobufWireType").append('.').append(super.toString()).toString();
  }

}
