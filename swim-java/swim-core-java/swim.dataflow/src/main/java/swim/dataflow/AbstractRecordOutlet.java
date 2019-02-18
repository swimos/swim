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

package swim.dataflow;

import java.util.Iterator;
import swim.collections.HashTrieMap;
import swim.streamlet.Inlet;
import swim.streamlet.KeyEffect;
import swim.streamlet.KeyOutlet;
import swim.streamlet.MapInlet;
import swim.streamlet.Outlet;
import swim.streamlet.StreamletContext;
import swim.streamlet.StreamletScope;
import swim.structure.Field;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Cursor;

public abstract class AbstractRecordOutlet extends Record implements RecordOutlet {
  protected HashTrieMap<Value, KeyEffect> effects;
  protected HashTrieMap<Value, KeyOutlet<Value, Value>> outlets;
  protected Inlet<? super Record>[] outputs;
  protected int version;

  public AbstractRecordOutlet() {
    this.effects = HashTrieMap.empty();
    this.outlets = HashTrieMap.empty();
    this.outputs = null;
    this.version = -1;
  }

  @Override
  public StreamletScope<? extends Value> streamletScope() {
    return null;
  }

  @Override
  public StreamletContext streamletContext() {
    final StreamletScope<? extends Value> scope = streamletScope();
    if (scope != null) {
      return scope.streamletContext();
    }
    return null;
  }

  public boolean containsOwnKey(Value key) {
    return containsKey(key);
  }

  @Override
  public abstract Iterator<Value> keyIterator();

  @Override
  public Record get() {
    return this;
  }

  @Override
  public Outlet<Value> outlet(Value key) {
    if (!containsOwnKey(key)) {
      final StreamletScope<? extends Value> scope = streamletScope();
      if (scope instanceof RecordOutlet && ((RecordOutlet) scope).containsKey(key)) {
        // TODO: Support dynamic shadowing?
        return ((RecordOutlet) scope).outlet(key);
      }
    }
    KeyOutlet<Value, Value> outlet = this.outlets.get(key);
    if (outlet == null) {
      outlet = new KeyOutlet<Value, Value>(this, key);
      this.outlets = this.outlets.updated(key, outlet);
      invalidateInputKey(key, KeyEffect.UPDATE);
    }
    return outlet;
  }

  @Override
  public Outlet<Value> outlet(String key) {
    return outlet(Text.from(key));
  }

  @Override
  public Iterator<Inlet<? super Record>> outputIterator() {
    return this.outputs != null ? Cursor.array(this.outputs) : Cursor.empty();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindOutput(Inlet<? super Record> output) {
    final Inlet<? super Record>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    final Inlet<? super Record>[] newOutputs = (Inlet<? super Record>[]) new Inlet<?>[n + 1];
    if (n > 0) {
      System.arraycopy(oldOutputs, 0, newOutputs, 0, n);
    }
    newOutputs[n] = output;
    this.outputs = newOutputs;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void unbindOutput(Inlet<? super Record> output) {
    final Inlet<? super Record>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    for (int i = 0; i < n; i += 1) {
      if (oldOutputs[i] == output) {
        if (n > 1) {
          final Inlet<? super Record>[] newOutputs = (Inlet<? super Record>[]) new Inlet<?>[n - 1];
          System.arraycopy(oldOutputs, 0, newOutputs, 0, i);
          System.arraycopy(oldOutputs, i + 1, newOutputs, i, (n - 1) - i);
          this.outputs = newOutputs;
        } else {
          this.outputs = null;
        }
        break;
      }
    }
  }

  @Override
  public void unbindOutputs() {
    final HashTrieMap<Value, KeyOutlet<Value, Value>> outlets = this.outlets;
    if (!outlets.isEmpty()) {
      this.outlets = HashTrieMap.empty();
      final Iterator<KeyOutlet<Value, Value>> keyOutlets = outlets.valueIterator();
      while (keyOutlets.hasNext()) {
        final KeyOutlet<Value, Value> keyOutlet = keyOutlets.next();
        keyOutlet.unbindOutputs();
      }
    }
    final Inlet<? super Record>[] oldOutputs = this.outputs;
    if (oldOutputs != null) {
      this.outputs = null;
      for (int i = 0, n = oldOutputs.length; i < n; i += 1) {
        oldOutputs[i].unbindInput();
      }
    }
  }

  @Override
  public void disconnectOutputs() {
    final HashTrieMap<Value, KeyOutlet<Value, Value>> outlets = this.outlets;
    if (!outlets.isEmpty()) {
      this.outlets = HashTrieMap.empty();
      final Iterator<KeyOutlet<Value, Value>> keyOutlets = outlets.valueIterator();
      while (keyOutlets.hasNext()) {
        final KeyOutlet<Value, Value> keyOutlet = keyOutlets.next();
        keyOutlet.disconnectOutputs();
      }
    }
    final Inlet<? super Record>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super Record> output = outputs[i];
        output.unbindInput();
        output.disconnectOutputs();
      }
    }
    for (Item member : this) {
      if (member instanceof Field) {
        member = member.toValue();
      }
      if (member instanceof RecordOutlet) {
        ((RecordOutlet) member).disconnectOutputs();
      } else if (member instanceof RecordStreamlet) {
        ((RecordStreamlet) member).disconnectOutputs();
      }
    }
  }

  @Override
  public void disconnectInputs() {
    // nop
  }

  @SuppressWarnings("unchecked")
  @Override
  public void invalidateInputKey(Value key, KeyEffect effect) {
    final HashTrieMap<Value, KeyEffect> oldEffects = this.effects;
    if (oldEffects.get(key) != effect) {
      willInvalidateInputKey(key, effect);
      this.effects = oldEffects.updated(key, effect);
      this.version = -1;
      onInvalidateInputKey(key, effect);
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        final Inlet<?> output = this.outputs[i];
        if (output instanceof MapInlet<?, ?, ?>) {
          ((MapInlet<Value, Value, ? super Record>) output).invalidateOutputKey(key, effect);
        } else {
          output.invalidateOutput();
        }
      }
      final KeyOutlet<Value, Value> outlet = this.outlets.get(key);
      if (outlet != null) {
        outlet.invalidateInput();
      }
      didInvalidateInputKey(key, effect);
    }
  }

  @Override
  public void invalidateInput() {
    if (this.version >= 0) {
      willInvalidateInput();
      this.version = -1;
      onInvalidateInput();
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].invalidateOutput();
      }
      final Iterator<KeyOutlet<Value, Value>> outlets = this.outlets.valueIterator();
      while (outlets.hasNext()) {
        outlets.next().invalidateInput();
      }
      didInvalidateInput();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void reconcileInputKey(Value key, int version) {
    if (this.version < 0) {
      final HashTrieMap<Value, KeyEffect> oldEffects = this.effects;
      final KeyEffect effect = oldEffects.get(key);
      if (effect != null) {
        willReconcileInputKey(key, effect, version);
        this.effects = oldEffects.removed(key);
        onReconcileInputKey(key, effect, version);
        for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
          final Inlet<?> output = this.outputs[i];
          if (output instanceof MapInlet<?, ?, ?>) {
            ((MapInlet<Value, Value, ? super Record>) output).reconcileOutputKey(key, version);
          }
        }
        final KeyOutlet<Value, Value> outlet = this.outlets.get(key);
        if (outlet != null) {
          outlet.reconcileInput(version);
        }
        didReconcileInputKey(key, effect, version);
      }
    }
  }

  @Override
  public void reconcileInput(int version) {
    if (this.version < 0) {
      willReconcileInput(version);
      final Iterator<Value> keys = this.effects.keyIterator();
      while (keys.hasNext()) {
        reconcileInputKey(keys.next(), version);
      }
      this.version = version;
      onReconcileInput(version);
      for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
        this.outputs[i].reconcileOutput(version);
      }
      for (Item member : this) {
        if (member instanceof Field) {
          member = member.toValue();
        }
        if (member instanceof RecordOutlet) {
          ((RecordOutlet) member).reconcileInput(version);
        } else if (member instanceof RecordStreamlet) {
          ((RecordStreamlet) member).reconcile(version);
        }
      }
      didReconcileInput(version);
    }
  }

  protected void willInvalidateInputKey(Value key, KeyEffect effect) {
    // stub
  }

  protected void onInvalidateInputKey(Value key, KeyEffect effect) {
    // stub
  }

  protected void didInvalidateInputKey(Value key, KeyEffect effect) {
    // stub
  }

  protected void willInvalidateInput() {
    // stub
  }

  protected void onInvalidateInput() {
    // stub
  }

  protected void didInvalidateInput() {
    // stub
  }

  protected void willReconcileInputKey(Value key, KeyEffect effect, int version) {
    // stub
  }

  protected void onReconcileInputKey(Value key, KeyEffect effect, int version) {
    // stub
  }

  protected void didReconcileInputKey(Value key, KeyEffect effect, int version) {
    // stub
  }

  protected void willReconcileInput(int version) {
    // stub
  }

  protected void onReconcileInput(int version) {
    // stub
  }

  protected void didReconcileInput(int version) {
    // stub
  }
}
