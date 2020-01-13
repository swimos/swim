// Copyright 2015-2020 SWIM.AI inc.
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

package swim.avro.schema;

public abstract class AvroFieldType<R, V> {

  public abstract String name();

  public abstract String doc();

  public abstract AvroFieldType<R, V> doc(String doc);

  public abstract AvroType<? extends V> valueType();

  public abstract V defaultValue();

  public abstract AvroOrder order();

  public abstract int aliasCount();

  public abstract String getAlias(int index);

  public abstract AvroFieldType<R, V> alias(String alias);

  public abstract R updated(R record, V value);

}
