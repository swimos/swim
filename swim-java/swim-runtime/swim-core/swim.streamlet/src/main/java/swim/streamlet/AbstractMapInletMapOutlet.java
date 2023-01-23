// Copyright 2015-2023 Swim.inc
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

public abstract class AbstractMapInletMapOutlet<KI, KO, VI, VO, I, O> implements MapInletMapOutlet<KI, KO, VI, VO, I, O> {

  protected MapOutlet<KI, VI, ? extends I> input;
  protected HashTrieMap<KI, KeyEffect> outputEffects;
  protected HashTrieMap<KO, KeyEffect> inputEffects;
  protected HashTrieMap<KO, KeyOutlet<KO, VO>> outlets;
  protected Inlet<? super O>[] outputs;
  protected int version;

  public AbstractMapInletMapOutlet() {
    this.input = null;
    this.outputEffects = HashTrieMap.empty();
    this.inputEffects = HashTrieMap.empty();
    this.outlets = HashTrieMap.empty();
    this.outputs = null;
    this.version = -1;
  }

  @Override
  public abstract boolean containsKey(KO key);

  @Override
  public abstract VO get(KO key);

  @Override
  public abstract O get();

  @Override
  public abstract Iterator<KO> keyIterator();

  @Override
  public MapOutlet<KI, VI, ? extends I> input() {
    return this.input;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindInput(Outlet<? extends I> input) {
    if (input instanceof MapOutlet<?, ?, ?>) {
      this.bindInput((MapOutlet<KI, VI, ? extends I>) input);
    } else {
      throw new IllegalArgumentException(input.toString());
    }
  }

  public void bindInput(MapOutlet<KI, VI, ? extends I> input) {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = input;
    if (this.input != null) {
      this.input.bindOutput(this);
    }
  }

  @Override
  public void unbindInput() {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = null;
  }

  @Override
  public void disconnectInputs() {
    if (this.outputs == null && this.outlets.isEmpty()) {
      final MapOutlet<KI, VI, ? extends I> input = this.input;
      if (input != null) {
        input.unbindOutput(this);
        this.input = null;
        input.disconnectInputs();
      }
    }
  }

  @Override
  public Outlet<VO> outlet(KO key) {
    KeyOutlet<KO, VO> outlet = this.outlets.get(key);
    if (outlet == null) {
      outlet = new KeyOutlet<KO, VO>(this, key);
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
    final HashTrieMap<KO, KeyOutlet<KO, VO>> outlets = this.outlets;
    if (!outlets.isEmpty()) {
      this.outlets = HashTrieMap.empty();
      final Iterator<KeyOutlet<KO, VO>> keyOutlets = outlets.valueIterator();
      while (keyOutlets.hasNext()) {
        final KeyOutlet<KO, VO> keyOutlet = keyOutlets.next();
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
    if (this.input == null) {
      final HashTrieMap<KO, KeyOutlet<KO, VO>> outlets = this.outlets;
      if (!outlets.isEmpty()) {
        this.outlets = HashTrieMap.empty();
        final Iterator<KeyOutlet<KO, VO>> keyOutlets = outlets.valueIterator();
        while (keyOutlets.hasNext()) {
          final KeyOutlet<KO, VO> keyOutlet = keyOutlets.next();
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
  }

  @Override
  public void decohereOutputKey(KI key, KeyEffect effect) {
    final HashTrieMap<KI, KeyEffect> oldOutputEffects = this.outputEffects;
    if (oldOutputEffects.get(key) != effect) {
      this.willDecohereOutputKey(key, effect);
      this.outputEffects = oldOutputEffects.updated(key, effect);
      this.version = -1;
      this.onDecohereOutputKey(key, effect);
      this.didDecohereOutputKey(key, effect);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void decohereInputKey(KO key, KeyEffect effect) {
    final HashTrieMap<KO, KeyEffect> oldInputEffects = this.inputEffects;
    if (oldInputEffects.get(key) != effect) {
      this.willDecohereInputKey(key, effect);
      this.inputEffects = oldInputEffects.updated(key, effect);
      this.version = -1;
      this.onDecohereInputKey(key, effect);
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        final Inlet<?> output = this.outputs[i];
        if (output instanceof MapInlet<?, ?, ?>) {
          ((MapInlet<KO, VO, ? super O>) output).decohereOutputKey(key, effect);
        } else {
          output.decohereOutput();
        }
      }
      final KeyOutlet<KO, VO> outlet = this.outlets.get(key);
      if (outlet != null) {
        outlet.decohereInput();
      }
      this.didDecohereInputKey(key, effect);
    }
  }

  @Override
  public void decohereOutput() {
    this.decohere();
  }

  @Override
  public void decohereInput() {
    this.decohere();
  }

  public void decohere() {
    if (this.version >= 0) {
      this.willDecohere();
      this.version = -1;
      this.onDecohere();
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].decohereOutput();
      }
      final Iterator<KeyOutlet<KO, VO>> outlets = this.outlets.valueIterator();
      while (outlets.hasNext()) {
        outlets.next().decohereInput();
      }
      this.didDecohere();
    }
  }

  @Override
  public void recohereOutputKey(KI key, int version) {
    if (this.version < 0) {
      final HashTrieMap<KI, KeyEffect> oldOutputEffects = this.outputEffects;
      final KeyEffect effect = oldOutputEffects.get(key);
      if (effect != null) {
        this.willRecohereOutputKey(key, effect, version);
        this.outputEffects = oldOutputEffects.removed(key);
        if (this.input != null) {
          this.input.recohereInputKey(key, version);
        }
        this.onRecohereOutputKey(key, effect, version);
        this.didRecohereOutputKey(key, effect, version);
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void recohereInputKey(KO key, int version) {
    if (this.version < 0) {
      final HashTrieMap<KO, KeyEffect> oldInputEffects = this.inputEffects;
      final KeyEffect oldEffect = oldInputEffects.get(key);
      if (oldEffect != null) {
        final KeyEffect newEffect = this.willRecohereInputKey(key, oldEffect, version);
        if (oldEffect != newEffect) {
          this.decohereInputKey(key, newEffect);
        }
        this.inputEffects = oldInputEffects.removed(key);
        this.onRecohereInputKey(key, newEffect, version);
        for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
          final Inlet<?> output = this.outputs[i];
          if (output instanceof MapInlet<?, ?, ?>) {
            ((MapInlet<KO, VO, ? super O>) output).recohereOutputKey(key, version);
          }
        }
        final KeyOutlet<KO, VO> outlet = this.outlets.get(key);
        if (outlet != null) {
          outlet.recohereInput(version);
        }
        this.didRecohereInputKey(key, newEffect, version);
      }
    }
  }

  @Override
  public void recohereOutput(int version) {
    this.recohere(version);
  }

  @Override
  public void recohereInput(int version) {
    this.recohere(version);
  }

  public void recohere(int version) {
    if (this.version < 0) {
      this.willRecohere(version);
      final Iterator<KI> outputKeys = this.outputEffects.keyIterator();
      while (outputKeys.hasNext()) {
        this.recohereOutputKey(outputKeys.next(), version);
      }
      final Iterator<KO> inputKeys = this.inputEffects.keyIterator();
      while (inputKeys.hasNext()) {
        this.recohereInputKey(inputKeys.next(), version);
      }
      this.version = version;
      this.onRecohere(version);
      for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
        this.outputs[i].recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected void willDecohereOutputKey(KI key, KeyEffect effect) {
    // hook
  }

  protected void onDecohereOutputKey(KI key, KeyEffect effect) {
    // hook
  }

  protected void didDecohereOutputKey(KI key, KeyEffect effect) {
    // hook
  }

  protected void willDecohereInputKey(KO key, KeyEffect effect) {
    // hook
  }

  protected void onDecohereInputKey(KO key, KeyEffect effect) {
    // hook
  }

  protected void didDecohereInputKey(KO key, KeyEffect effect) {
    // hook
  }

  protected void willDecohere() {
    // hook
  }

  protected void onDecohere() {
    // hook
  }

  protected void didDecohere() {
    // hook
  }

  protected void willRecohereOutputKey(KI key, KeyEffect effect, int version) {
    // hook
  }

  protected void onRecohereOutputKey(KI key, KeyEffect effect, int version) {
    // hook
  }

  protected void didRecohereOutputKey(KI key, KeyEffect effect, int version) {
    // hook
  }

  protected KeyEffect willRecohereInputKey(KO key, KeyEffect effect, int version) {
    return effect;
  }

  protected void onRecohereInputKey(KO key, KeyEffect effect, int version) {
    // hook
  }

  protected void didRecohereInputKey(KO key, KeyEffect effect, int version) {
    // hook
  }

  protected void willRecohere(int version) {
    // hook
  }

  protected void onRecohere(int version) {
    // hook
  }

  protected void didRecohere(int version) {
    // hook
  }

}
