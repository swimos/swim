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

package swim.runtime.reflect;

import java.util.AbstractMap;
import java.util.Iterator;
import java.util.Map;
import swim.runtime.MeshBinding;
import swim.runtime.PartBinding;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class MeshInfo {
  protected final Uri meshUri;
  protected final Value gatewayPartKey;
  protected final Value ourselfPartKey;

  public MeshInfo(Uri meshUri, Value gatewayPartKey, Value ourselfPartKey) {
    this.meshUri = meshUri;
    this.gatewayPartKey = gatewayPartKey;
    this.ourselfPartKey = ourselfPartKey;
  }

  public final Uri meshUri() {
    return this.meshUri;
  }

  public final Value gatewayPartKey() {
    return this.gatewayPartKey;
  }

  public final Value ourselfPartKey() {
    return this.ourselfPartKey;
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  public static MeshInfo from(MeshBinding meshBinding) {
    final PartBinding gateway = meshBinding.gateway();
    final PartBinding ourself = meshBinding.ourself();
    return new MeshInfo(meshBinding.meshUri(), gateway != null ? gateway.partKey() : Value.absent(),
                        ourself != null ? ourself.partKey() : Value.absent());
  }

  public static Iterator<Map.Entry<Uri, MeshInfo>> iterator(Iterator<Map.Entry<Uri, MeshBinding>> meshBindings) {
    return new MeshBindingInfoIterator(meshBindings);
  }

  private static Form<MeshInfo> form;

  @Kind
  public static Form<MeshInfo> form() {
    if (form == null) {
      form = new MeshInfoForm();
    }
    return form;
  }
}

final class MeshInfoForm extends Form<MeshInfo> {
  @Override
  public Class<?> type() {
    return MeshInfo.class;
  }

  @Override
  public Item mold(MeshInfo info) {
    if (info != null) {
      final Record record = Record.create(3);
      record.slot("meshUri", info.meshUri.toString());
      record.slot("gatewayPartKey", info.gatewayPartKey);
      record.slot("ourselfPartKey", info.ourselfPartKey);
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public MeshInfo cast(Item item) {
    final Value value = item.toValue();
    final Uri meshUri = Uri.form().cast(value.get("meshUri"));
    if (meshUri != null) {
      final Value gatewayPartKey = value.get("gatewayPartKey");
      final Value ourselfPartKey = value.get("ourselfPartKey");
      return new MeshInfo(meshUri, gatewayPartKey, ourselfPartKey);
    }
    return null;
  }
}

final class MeshBindingInfoIterator implements Iterator<Map.Entry<Uri, MeshInfo>> {
  final Iterator<Map.Entry<Uri, MeshBinding>> meshBindings;

  MeshBindingInfoIterator(Iterator<Map.Entry<Uri, MeshBinding>> meshBindings) {
    this.meshBindings = meshBindings;
  }

  @Override
  public boolean hasNext() {
    return meshBindings.hasNext();
  }

  @Override
  public Map.Entry<Uri, MeshInfo> next() {
    final Map.Entry<Uri, MeshBinding> entry = this.meshBindings.next();
    final Uri meshUri = entry.getKey();
    final MeshBinding meshBinding = entry.getValue();
    final MeshInfo meshInfo = MeshInfo.from(meshBinding);
    return new AbstractMap.SimpleImmutableEntry<Uri, MeshInfo>(meshUri, meshInfo);
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
