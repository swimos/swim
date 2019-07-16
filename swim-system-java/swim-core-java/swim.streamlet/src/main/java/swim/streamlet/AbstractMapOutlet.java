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

package swim.streamlet;

import java.util.Iterator;
import swim.collections.HashTrieMap;
import swim.util.Cursor;

public abstract class AbstractMapOutlet<K, V, O> implements MapOutlet<K, V, O> {
  protected HashTrieMap<K, KeyEffect> effects;
  protected HashTrieMap<K, KeyOutlet<K, V>> outlets;
  protected Inlet<? super O>[] outputs;
  protected int version;

  public AbstractMapOutlet() {
    this.effects = HashTrieMap.empty();
    this.outlets = HashTrieMap.empty();
    this.outputs = null;
    this.version = -1;
  }

  @Override
  public abstract boolean containsKey(K key);

  @Override
  public abstract V get(K key);

  @Override
  public abstract O get();

  @Override
  public abstract Iterator<K> keyIterator();

  @Override
  public Outlet<V> outlet(K key) {
    KeyOutlet<K, V> outlet = this.outlets.get(key);
    if (outlet == null) {
      outlet = new KeyOutlet<K, V>(this, key);
      this.outlets = this.outlets.updated(key, outlet);
    }
    return outlet;
  }

  @Override
  public Iterator<Inlet<? super O>> outputIterator() {
    return this.outputs != null ? Cursor.array(this.outputs) : Cursor.empty();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindOutput(Inlet<? super O> output) {
    final Inlet<? super O>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    final Inlet<? super O>[] newOutputs = (Inlet<? super O>[]) new Inlet<?>[n + 1];
    if (n > 0) {
      System.arraycopy(oldOutputs, 0, newOutputs, 0, n);
    }
    newOutputs[n] = output;
    this.outputs = newOutputs;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void unbindOutput(Inlet<? super O> output) {
    final Inlet<? super O>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    for (int i = 0; i < n; i += 1) {
      if (oldOutputs[i] == output) {
        if (n > 1) {
          final Inlet<? super O>[] newOutputs = (Inlet<? super O>[]) new Inlet<?>[n - 1];
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
    final HashTrieMap<K, KeyOutlet<K, V>> outlets = this.outlets;
    if (!outlets.isEmpty()) {
      this.outlets = HashTrieMap.empty();
      final Iterator<KeyOutlet<K, V>> keyOutlets = outlets.valueIterator();
      while (keyOutlets.hasNext()) {
        final KeyOutlet<K, V> keyOutlet = keyOutlets.next();
        keyOutlet.unbindOutputs();
      }
    }
    final Inlet<? super O>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super O> output = outputs[i];
        output.unbindInput();
      }
    }
  }

  @Override
  public void disconnectOutputs() {
    final HashTrieMap<K, KeyOutlet<K, V>> outlets = this.outlets;
    if (!outlets.isEmpty()) {
      this.outlets = HashTrieMap.empty();
      final Iterator<KeyOutlet<K, V>> keyOutlets = outlets.valueIterator();
      while (keyOutlets.hasNext()) {
        final KeyOutlet<K, V> keyOutlet = keyOutlets.next();
        keyOutlet.disconnectOutputs();
      }
    }
    final Inlet<? super O>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super O> output = outputs[i];
        output.unbindInput();
        output.disconnectOutputs();
      }
    }
  }

  @Override
  public void disconnectInputs() {
    // nop
  }

  @SuppressWarnings("unchecked")
  @Override
  public void invalidateInputKey(K key, KeyEffect effect) {
    final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
    if (oldEffects.get(key) != effect) {
      willInvalidateInputKey(key, effect);
      this.effects = oldEffects.updated(key, effect);
      this.version = -1;
      onInvalidateInputKey(key, effect);
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        final Inlet<?> output = this.outputs[i];
        if (output instanceof MapInlet<?, ?, ?>) {
          ((MapInlet<K, V, ? super O>) output).invalidateOutputKey(key, effect);
        } else {
          output.invalidateOutput();
        }
      }
      final KeyOutlet<K, V> outlet = this.outlets.get(key);
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
      final Iterator<KeyOutlet<K, V>> outlets = this.outlets.valueIterator();
      while (outlets.hasNext()) {
        outlets.next().invalidateInput();
      }
      didInvalidateInput();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void reconcileInputKey(K key, int version) {
    if (this.version < 0) {
      final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
      final KeyEffect effect = oldEffects.get(key);
      if (effect != null) {
        willReconcileInputKey(key, effect, version);
        this.effects = oldEffects.removed(key);
        onReconcileInputKey(key, effect, version);
        for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
          final Inlet<?> output = this.outputs[i];
          if (output instanceof MapInlet<?, ?, ?>) {
            ((MapInlet<K, V, ? super O>) output).reconcileOutputKey(key, version);
          }
        }
        final KeyOutlet<K, V> outlet = this.outlets.get(key);
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
      final Iterator<K> keys = this.effects.keyIterator();
      while (keys.hasNext()) {
        reconcileInputKey(keys.next(), version);
      }
      this.version = version;
      onReconcileInput(version);
      for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
        this.outputs[i].reconcileOutput(version);
      }
      didReconcileInput(version);
    }
  }

  protected void willInvalidateInputKey(K key, KeyEffect effect) {
    // stub
  }

  protected void onInvalidateInputKey(K key, KeyEffect effect) {
    // stub
  }

  protected void didInvalidateInputKey(K key, KeyEffect effect) {
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

  protected void willReconcileInputKey(K key, KeyEffect effect, int version) {
    // stub
  }

  protected void onReconcileInputKey(K key, KeyEffect effect, int version) {
    // stub
  }

  protected void didReconcileInputKey(K key, KeyEffect effect, int version) {
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
