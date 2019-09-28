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
import swim.runtime.HostBinding;
import swim.runtime.PartBinding;
import swim.runtime.PartPredicate;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class PartInfo {
  protected final Value partKey;
  protected final PartPredicate predicate;
  protected final Uri masterHostUri;

  public PartInfo(Value partKey, PartPredicate predicate, Uri masterHostUri) {
    this.partKey = partKey;
    this.predicate = predicate;
    this.masterHostUri = masterHostUri;
  }

  public final Value partKey() {
    return this.partKey;
  }

  public final PartPredicate predicate() {
    return this.predicate;
  }

  public final Uri masterHostUri() {
    return this.masterHostUri;
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  public static PartInfo from(PartBinding partBinding) {
    final HostBinding master = partBinding.master();
    return new PartInfo(partBinding.partKey(), partBinding.predicate(), master != null ? master.hostUri() : Uri.empty());
  }

  public static Iterator<Map.Entry<Value, PartInfo>> iterator(Iterator<PartBinding> partBindings) {
    return new PartBindingInfoIterator(partBindings);
  }

  private static Form<PartInfo> form;

  @Kind
  public static Form<PartInfo> form() {
    if (form == null) {
      form = new PartInfoForm();
    }
    return form;
  }
}

final class PartInfoForm extends Form<PartInfo> {
  @Override
  public Class<?> type() {
    return PartInfo.class;
  }

  @Override
  public Item mold(PartInfo info) {
    if (info != null) {
      final Record record = Record.create(3);
      record.slot("partKey", info.partKey);
      record.slot("predicate", info.predicate.toValue());
      record.slot("masterHostUri", info.masterHostUri.toString());
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public PartInfo cast(Item item) {
    final Value value = item.toValue();
    final Value partKey = value.get("partKey");
    if (partKey.isDefined()) {
      final PartPredicate predicate = PartPredicate.form().cast(value.get("predicate"));
      final Uri masterHostUri = Uri.form().cast(value.get("masterHostUri"));
      return new PartInfo(partKey, predicate, masterHostUri);
    }
    return null;
  }
}

final class PartBindingInfoIterator implements Iterator<Map.Entry<Value, PartInfo>> {
  final Iterator<PartBinding> partBindings;

  PartBindingInfoIterator(Iterator<PartBinding> partBindings) {
    this.partBindings = partBindings;
  }

  @Override
  public boolean hasNext() {
    return partBindings.hasNext();
  }

  @Override
  public Map.Entry<Value, PartInfo> next() {
    final PartBinding partBinding = this.partBindings.next();
    final PartInfo partInfo = PartInfo.from(partBinding);
    return new AbstractMap.SimpleImmutableEntry<Value, PartInfo>(partBinding.partKey(), partInfo);
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
