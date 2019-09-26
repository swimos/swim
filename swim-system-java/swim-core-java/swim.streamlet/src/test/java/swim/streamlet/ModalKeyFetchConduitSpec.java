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

import java.util.ArrayList;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import swim.collections.HashTrieMap;
import swim.streamlet.persistence.TrivialPersistenceProvider;
import swim.streamlet.persistence.ValuePersister;
import swim.structure.Form;
import swim.util.Deferred;

public class ModalKeyFetchConduitSpec {

  @DataProvider(name = "withState")
  public Object[][] withOrWithoutState() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "withState")
  public void selectNothingInitially(final boolean withState) {
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

      final ValuePersister<Integer> modePersister = provider.forValue("mode",
          Form.forInteger(), null);
      final ModalKeyFetchConduit<Integer, String> selector = new ModalKeyFetchConduit<>(modePersister);

      selectNothingInitially(selector);

      Assert.assertNull(modePersister.get());
    } else {
      final ModalKeyFetchConduit<Integer, String> selector = new ModalKeyFetchConduit<>();

      selectNothingInitially(selector);
    }
  }

  private void selectNothingInitially(final ModalKeyFetchConduit<Integer, String> selector) {
    final ArrayList<String> results = new ArrayList<>();

    final Receptacle<String> receptacle = value -> results.add(value.get());

    selector.subscribe(receptacle);
    selector.mapInput().notifyChange(1, Deferred.value("a"),
        Deferred.value(MapView.wrap(HashTrieMap.<Integer, String>empty().updated(1, "a"))));

    Assert.assertTrue(results.isEmpty());
  }

  @Test(dataProvider = "withState")
  public void outputForSelectedKey(final boolean withState) {

    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

      final ValuePersister<Integer> modePersister = provider.forValue("mode",
          Form.forInteger(), null);
      final ModalKeyFetchConduit<Integer, String> selector = new ModalKeyFetchConduit<>(modePersister);

      outputForSelectedKey(selector);

      Assert.assertEquals(modePersister.get().intValue(), 2);
    } else {
      final ModalKeyFetchConduit<Integer, String> selector = new ModalKeyFetchConduit<>();

      outputForSelectedKey(selector);
    }

  }

  private void outputForSelectedKey(final ModalKeyFetchConduit<Integer, String> selector) {
    final ArrayList<String> results = new ArrayList<>();

    final Receptacle<String> receptacle = value -> results.add(value.get());

    selector.subscribe(receptacle);
    selector.keySelector().notifyChange(Deferred.value(2));
    selector.mapInput().notifyChange(1, Deferred.value("a"),
        Deferred.value(MapView.wrap(HashTrieMap.<Integer, String>empty().updated(1, "a"))));
    selector.mapInput().notifyChange(2, Deferred.value("b"),
        Deferred.value(MapView.wrap(HashTrieMap.<Integer, String>empty().updated(1, "a").updated(2, "b"))));
    selector.mapInput().notifyChange(3, Deferred.value("c"),
        Deferred.value(MapView.wrap(HashTrieMap.<Integer, String>empty().updated(1, "a").updated(2, "b").updated(3, "c"))));

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0), "b");
  }

  @Test(dataProvider = "withState")
  public void alterSelectedKey(final boolean withState) {
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

      final ValuePersister<Integer> modePersister = provider.forValue("mode",
          Form.forInteger(), null);
      final ModalKeyFetchConduit<Integer, String> selector = new ModalKeyFetchConduit<>(modePersister);

      alterSelectedKey(selector);
      Assert.assertEquals(modePersister.get().intValue(), 2);
    } else {
      final ModalKeyFetchConduit<Integer, String> selector = new ModalKeyFetchConduit<>();

      alterSelectedKey(selector);
    }

  }

  private void alterSelectedKey(final ModalKeyFetchConduit<Integer, String> selector) {
    final ArrayList<String> results = new ArrayList<>();

    final Receptacle<String> receptacle = value -> results.add(value.get());

    selector.subscribe(receptacle);
    selector.keySelector().notifyChange(Deferred.value(1));
    selector.mapInput().notifyChange(1, Deferred.value("a"),
        Deferred.value(MapView.wrap(HashTrieMap.<Integer, String>empty().updated(1, "a"))));

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0), "a");

    results.clear();

    selector.keySelector().notifyChange(Deferred.value(2));

    selector.mapInput().notifyChange(1, Deferred.value("b"),
        Deferred.value(MapView.wrap(HashTrieMap.<Integer, String>empty().updated(1, "b"))));
    selector.mapInput().notifyChange(2, Deferred.value("c"),
        Deferred.value(MapView.wrap(HashTrieMap.<Integer, String>empty().updated(1, "b").updated(2, "c"))));

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0), "c");
  }

}
