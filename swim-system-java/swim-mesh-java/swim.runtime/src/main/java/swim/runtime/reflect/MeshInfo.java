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
  protected final int partCount;

  public MeshInfo(Uri meshUri, Value gatewayPartKey, Value ourselfPartKey, int partCount) {
    this.meshUri = meshUri;
    this.gatewayPartKey = gatewayPartKey;
    this.ourselfPartKey = ourselfPartKey;
    this.partCount = partCount;
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
                        ourself != null ? ourself.partKey() : Value.absent(),
                        meshBinding.parts().size());
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
      final Record record = Record.create(4);
      record.slot("meshUri", info.meshUri.toString());
      if (info.gatewayPartKey.isDefined()) {
        record.slot("gatewayPartKey", info.gatewayPartKey);
      }
      if (info.ourselfPartKey.isDefined()) {
        record.slot("ourselfPartKey", info.ourselfPartKey);
      }
      if (info.partCount != 0) {
        record.slot("partCount", info.partCount);
      }
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
      final int partCount = value.get("partCount").intValue(0);
      return new MeshInfo(meshUri, gatewayPartKey, ourselfPartKey, partCount);
    }
    return null;
  }
}
