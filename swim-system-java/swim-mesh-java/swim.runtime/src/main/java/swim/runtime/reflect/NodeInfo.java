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

import swim.runtime.NodeBinding;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class NodeInfo {
  protected final Uri nodeUri;
  protected final long created;
  protected final long childCount;

  public NodeInfo(Uri nodeUri, long created, long childCount) {
    this.nodeUri = nodeUri;
    this.created = created;
    this.childCount = childCount;
  }

  public final Uri nodeUri() {
    return this.nodeUri;
  }

  public final long created() {
    return this.created;
  }

  public final long childCount() {
    return this.childCount;
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  public static NodeInfo from(NodeBinding nodeBinding, long childCount) {
    return new NodeInfo(nodeBinding.nodeUri(), nodeBinding.createdTime(), childCount);
  }

  public static NodeInfo from(NodeBinding nodeBinding) {
    return from(nodeBinding, 0L);
  }

  private static Form<NodeInfo> form;

  @Kind
  public static Form<NodeInfo> form() {
    if (form == null) {
      form = new NodeInfoForm();
    }
    return form;
  }
}

final class NodeInfoForm extends Form<NodeInfo> {
  @Override
  public Class<?> type() {
    return NodeInfo.class;
  }

  @Override
  public Item mold(NodeInfo info) {
    if (info != null) {
      final Record record = Record.create(3);
      record.slot("nodeUri", info.nodeUri.toString());
      record.slot("created", info.created);
      if (info.childCount != 0L) {
        record.slot("childCount", info.childCount);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public NodeInfo cast(Item item) {
    final Value value = item.toValue();
    final Uri nodeUri = Uri.form().cast(value.get("nodeUri"));
    if (nodeUri != null) {
      final long created = value.get("created").longValue(0L);
      final long childCount = value.get("childCount").longValue(0L);
      return new NodeInfo(nodeUri, created, childCount);
    }
    return null;
  }
}
