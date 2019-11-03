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

package swim.avro.reflection;

import java.lang.reflect.Field;
import swim.avro.AvroException;
import swim.avro.schema.AvroFieldType;
import swim.avro.schema.AvroOrder;
import swim.avro.schema.AvroType;
import swim.collections.FingerTrieSeq;

final class FieldReflection<R, V> extends AvroFieldType<R, V> {
  final Field field;
  final String doc;
  final AvroType<? extends V> valueType;
  final V defaultValue;
  final AvroOrder order;
  final FingerTrieSeq<String> aliases;

  FieldReflection(Field field, String doc, AvroType<? extends V> valueType,
                  V defaultValue, AvroOrder order, FingerTrieSeq<String> aliases) {
    this.field = field;
    this.doc = doc;
    this.valueType = valueType;
    this.defaultValue = defaultValue;
    this.order = order;
    this.aliases = aliases;
  }

  FieldReflection(Field field, AvroType<? extends V> valueType) {
    this(field, null, valueType, null, AvroOrder.ASCENDING, FingerTrieSeq.empty());
  }

  @Override
  public String name() {
    return this.field.getName();
  }

  @Override
  public String doc() {
    return this.doc;
  }

  @Override
  public AvroFieldType<R, V> doc(String doc) {
    return new FieldReflection<R, V>(this.field, doc, this.valueType, this.defaultValue,
                                     this.order, this.aliases);
  }

  @Override
  public AvroType<? extends V> valueType() {
    return this.valueType;
  }

  @Override
  public V defaultValue() {
    return this.defaultValue;
  }

  @Override
  public AvroOrder order() {
    return this.order;
  }

  @Override
  public int aliasCount() {
    return this.aliases.size();
  }

  @Override
  public String getAlias(int index) {
    return this.aliases.get(index);
  }

  @Override
  public AvroFieldType<R, V> alias(String alias) {
    return new FieldReflection<R, V>(this.field, this.doc, this.valueType, this.defaultValue,
                                     this.order, this.aliases.appended(alias));
  }

  @Override
  public R updated(R record, V value) {
    try {
      field.set(record, value);
      return record;
    } catch (IllegalAccessException cause) {
      throw new AvroException(cause);
    }
  }
}
