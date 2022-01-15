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

package swim.protobuf.schema;

import swim.util.Builder;

public abstract class ProtobufMapType<K, V, E, M> extends ProtobufRepeatedType<E, M> {

  public ProtobufMapType() {
    // nop
  }

  @Override
  public abstract ProtobufMapEntryType<? extends K, ? extends V, ? extends E> itemType();

  public ProtobufType<? extends K> keyType() {
    return this.itemType().keyField().valueType();
  }

  public ProtobufType<? extends V> valueType() {
    return this.itemType().valueField().valueType();
  }

  @Override
  public abstract Builder<E, M> valueBuilder();

  @Override
  public abstract M appended(M map, E entry);

}
