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

package swim.store.db;

import swim.api.data.ValueData;
import swim.db.Page;
import swim.db.Tree;
import swim.db.UTree;
import swim.db.UTreeDelegate;
import swim.db.UTreeValue;
import swim.store.StoreBinding;
import swim.store.ValueDataBinding;
import swim.store.ValueDataContext;
import swim.store.ValueDataView;
import swim.structure.Form;
import swim.structure.Value;

public class ValueDataModel implements ValueDataBinding, UTreeDelegate {
  protected final Value name;
  protected final UTreeValue tree;
  protected ValueDataContext dataContext;
  protected StoreBinding storeBinding;

  public ValueDataModel(Value name, UTreeValue tree) {
    this.name = name;
    this.tree = tree;
    tree.setTreeDelegate(this);
  }

  @Override
  public ValueDataContext dataContext() {
    return this.dataContext;
  }

  @Override
  public void setDataContext(ValueDataContext dataContext) {
    this.dataContext = dataContext;
  }

  @Override
  public StoreBinding storeBinding() {
    return this.storeBinding;
  }

  @Override
  public void setStoreBinding(StoreBinding storeBinding) {
    this.storeBinding = storeBinding;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapData(Class<T> dataClass) {
    if (dataClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public Value name() {
    return this.name;
  }

  @Override
  public long dataSize() {
    return this.tree.tree().treeSize();
  }

  @Override
  public Form<Value> valueForm() {
    return Form.forValue();
  }

  @Override
  public <V2> ValueData<V2> valueForm(Form<V2> valueForm) {
    return new ValueDataView<V2>(this, valueForm);
  }

  @Override
  public <V2> ValueData<V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  @Override
  public boolean isResident() {
    return this.tree.isResident();
  }

  @Override
  public ValueDataBinding isResident(boolean isResident) {
    this.tree.isResident(isResident);
    return this;
  }

  @Override
  public boolean isTransient() {
    return this.tree.isTransient();
  }

  @Override
  public ValueDataBinding isTransient(boolean isTransient) {
    this.tree.isTransient(isTransient);
    return this;
  }

  @Override
  public Value get() {
    return this.tree.get();
  }

  @Override
  public Value set(Value newValue) {
    return this.tree.set(newValue);
  }

  @Override
  public void close() {
    final StoreBinding storeBinding = this.storeBinding;
    if (storeBinding != null) {
      storeBinding.closeData(this.name);
    }
    // TODO: close tree
  }

  @Override
  public void treeDidLoadPage(Page page) {
    // nop
  }

  @Override
  public void treeDidChange(Tree newTree, Tree oldTree) {
    // nop
  }

  @Override
  public void treeDidCommit(Tree newTree, Tree oldTree) {
    // nop
  }

  @Override
  public void treeDidClear(Tree newTree, Tree oldTree) {
    // nop
  }

  @Override
  public void utreeDidUpdate(UTree newTree, UTree oldTree, Value newValue, Value oldValue) {
    final ValueDataContext dataContext = this.dataContext;
    if (dataContext != null) {
      dataContext.didSet(newValue, oldValue);
    }
  }
}
