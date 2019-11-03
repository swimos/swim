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

import swim.avro.schema.AvroType;
import swim.avro.schema.AvroUnionType;
import swim.collections.FingerTrieSeq;

final class UnionReflection<T> extends AvroUnionType<T> {
  final FingerTrieSeq<AvroType<? extends T>> variants;

  UnionReflection(FingerTrieSeq<AvroType<? extends T>> variants) {
    this.variants = variants;
  }

  @Override
  public int variantCount() {
    return this.variants.size();
  }

  @Override
  public AvroType<? extends T> getVariant(int index) {
    return this.variants.get(index);
  }

  @Override
  public AvroUnionType<T> variant(AvroType<? extends T> variant) {
    return new UnionReflection<T>(this.variants.appended(variant));
  }

  static <T> UnionReflection<T> empty() {
    return new UnionReflection<T>(FingerTrieSeq.empty());
  }
}
