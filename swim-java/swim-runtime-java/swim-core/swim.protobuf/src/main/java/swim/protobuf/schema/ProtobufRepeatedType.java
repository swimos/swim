// Copyright 2015-2022 Swim.inc
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

package swim.protobuf.schema;

import swim.protobuf.ProtobufWireType;
import swim.util.Builder;

public abstract class ProtobufRepeatedType<I, T> extends ProtobufComplexType<T> {

  public ProtobufRepeatedType() {
    // nop
  }

  @Override
  public final ProtobufWireType wireType() {
    return ProtobufWireType.SIZED;
  }

  public abstract ProtobufType<? extends I> itemType();

  public abstract Builder<I, T> valueBuilder();

  public abstract T appended(T value, I item);

}
