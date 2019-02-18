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

package swim.structure.form;

import java.nio.ByteBuffer;
import swim.structure.Data;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Value;

/**
 * Transformation between a structurally typed {@link Item} and a {@link
 * ByteBuffer}.
 */
public final class ByteBufferForm extends Form<ByteBuffer> {
  @Override
  public Class<ByteBuffer> type() {
    return ByteBuffer.class;
  }

  @Override
  public Item mold(ByteBuffer value) {
    if (value != null) {
      return Data.from(value);
    } else {
      return Item.extant();
    }
  }

  @Override
  public ByteBuffer cast(Item item) {
    final Value value = item.target();
    if (value instanceof Data) {
      return ((Data) value).toByteBuffer();
    } else {
      return null;
    }
  }
}
