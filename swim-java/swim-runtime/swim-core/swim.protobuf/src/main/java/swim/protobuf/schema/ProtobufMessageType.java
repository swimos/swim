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

package swim.protobuf.schema;

import swim.protobuf.ProtobufWireType;

public abstract class ProtobufMessageType<T, M> extends ProtobufComplexType<T> {

  public ProtobufMessageType() {
    // nop
  }

  @Override
  public final ProtobufWireType wireType() {
    return ProtobufWireType.SIZED;
  }

  public abstract ProtobufFieldType<?, M> getField(long fieldNumber);

  public abstract ProtobufMessageType<T, M> field(ProtobufFieldType<?, M> field);

  public abstract M create();

  public abstract T cast(M message);

}
